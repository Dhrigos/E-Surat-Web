<?php

namespace App\Http\Controllers;

use App\Mail\VerificationApprovedMail;
use App\Mail\VerificationRejectedMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class VerificationQueueController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'staff'); // Default to staff queue

        // Counts for tabs
        $staffQueueCount = User::where('member_type', 'anggota')
            ->where('verifikasi', false)
            ->whereNull('rejection_reason')
            ->doesntHave('staff')
            ->whereHas('member', function ($q) {
                $q->whereNotNull('nia_nrp')->where('nia_nrp', '!=', '');
            })
            ->count();

        $calonQueueCount = User::where('member_type', 'calon_anggota')
            ->where('verifikasi', false)
            ->whereNull('rejection_reason')
            ->doesntHave('staff')
            ->whereHas('calon', function ($q) {
                $q->whereNotNull('nik')->where('nik', '!=', '');
            })
            ->count();

        // Build base query
        $query = User::query()
            ->where('verifikasi', false)
            ->whereNull('rejection_reason') // Only show pending queues (not rejected ones)
            ->doesntHave('staff') // Exclude users who are already mapped as Staff
            ->with(['locker'])
            ->orderBy('created_at', 'asc'); // FIFO by registration time (Stable)

        // Filter by type and load appropriate relationships
        if ($type === 'calon') {
            $query->where('member_type', 'calon_anggota')
                ->whereHas('calon', function ($q) {
                    $q->whereNotNull('nik')->where('nik', '!=', '');
                })
                ->with([
                    'calon.suku',
                    'calon.bangsa',
                    'calon.agama',
                    'calon.statusPernikahan',
                    'calon.golonganDarah',
                    'calon.birthplace',
                    'calon.pendidikan',
                    'calon.pekerjaan',
                    'calon.provinsi',
                    'calon.kabupaten',
                    'calon.kecamatan',
                    'calon.desa',
                    'organisasis',
                    'prestasi',
                ]);
        } else {
            $query->where('member_type', 'anggota')
                ->with([
                    'member.jabatan',
                    'member.jabatanRole',
                    'member.pangkat',
                    'member.mako',
                ])
                ->whereHas('member', function ($q) {
                    $q->whereNotNull('nia_nrp')->where('nia_nrp', '!=', '');
                });
        }

        $users = $query->get();

        return Inertia::render('StaffMapping/VerificationQueue', [
            'users' => $users,
            'currentUserId' => auth()->id(),
            'activeType' => $type,
            'staffQueueCount' => $staffQueueCount,
            'calonQueueCount' => $calonQueueCount,
        ]);
    }

    public function verify(User $user)
    {
        $user->update([
            'verifikasi' => true,
            'verification_duration' => $user->verification_locked_at 
                ? $user->verification_locked_at->diffInSeconds(now()) 
                : ($user->created_at ? $user->created_at->diffInSeconds(now()) : 0),
            'verification_locked_at' => null,
            'verification_locked_by' => null,
            'rejection_reason' => null, // Clear any previous rejection
            'verified_at' => now(),
            'verified_by' => auth()->id(),
        ]);

        // Automatically create or update Staff record (Only for Anggota)
        $detail = $user->detail;
        if ($detail && $user->member_type === 'anggota') {
            \App\Models\Staff::updateOrCreate(
                [
                    'email' => $user->email, // Use email as unique identifier
                ],
                [
                    'user_id' => $user->id,
                    'manager_id' => auth()->id() ?? 1, // Default to auth user or Super Admin (ID 1)
                    'name' => $user->name,
                    'phone' => $user->phone_number ?? '0000000000',
                    'nip' => $detail->nik,
                    'nia' => $detail->nia_nrp,
                    'jabatan_id' => $detail->jabatan_id,
                    'pangkat_id' => $detail->pangkat_id, // Add this
                    'status_keanggotaan_id' => $detail->status_keanggotaan_id, // Add this just in case
                    'tanggal_masuk' => $detail->tanggal_pengangkatan ?? now(),
                    'role' => 'staff',
                    'status' => 'active',
                ]
            );
        }

        // Send Approved Email
        try {
            Mail::to($user)->send(new VerificationApprovedMail($user));
        } catch (\Exception $e) {
            // Log error or ignore if mail fails, but continue flow
        }

        return redirect()->back()->with('success', 'User berhasil diverifikasi dan email notifikasi telah dikirim.');
    }

    public function lock(User $user)
    {
        if ($user->verification_locked_by && $user->verification_locked_by !== auth()->id()) {
            return redirect()->back()->with('error', 'User sedang diverifikasi oleh admin lain.');
        }

        $user->update([
            'verification_locked_at' => now(),
            'verification_locked_by' => auth()->id(),
        ]);

        return redirect()->back();
    }

    public function unlock(User $user)
    {
        if ($user->verification_locked_by === auth()->id()) {
            $user->update([
                'verification_locked_at' => null,
                'verification_locked_by' => null,
            ]);
        }

        return redirect()->back();
    }

    public function reject(Request $request, User $user)
    {
        Log::info("Rejecting User ID: " . $user->id);

        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $request) {
            $user->update([
                'verification_duration' => $user->verification_locked_at
                    ? $user->verification_locked_at->diffInSeconds(now())
                    : ($user->created_at ? $user->created_at->diffInSeconds(now()) : 0),
                'verification_locked_at' => null,
                'verification_locked_by' => null,
                'rejection_reason' => $request->reason,
                'verified_at' => now(), // Track when rejection happened
                'verified_by' => auth()->id(), // Track who rejected
                'ekyc_verified_at' => null, // Reset E-KYC verification status
            ]);
        });

        // Send Rejected Email
        try {
            if (file_exists(public_path('/images/KEMENTERIAN-PERTAHANAN.png'))) {
                Log::info("Image found, sending rejection email to {$user->email} via PHPMailer");
                
                // PHPMailer Implementation
                $mail = new PHPMailer(true);

                // Server settings
                $mail->isSMTP();
                $mail->Host       = config('mail.mailers.smtp.host');
                $mail->SMTPAuth   = true;
                $mail->Username   = config('mail.mailers.smtp.username');
                $mail->Password   = config('mail.mailers.smtp.password');
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL (Port 465)
                $mail->Port       = config('mail.mailers.smtp.port');

                // Recipients
                $mail->setFrom(config('mail.from.address'), config('mail.from.name'));
                $mail->addAddress($user->email, $user->name);

                // Embed Image
                $mail->addEmbeddedImage(public_path('/images/KEMENTERIAN-PERTAHANAN.png'), 'logo_kemhan');

                // Content
                $mail->isHTML(true);
                $mail->Subject = 'Verifikasi Akun E-Surat Ditolak';
                
                // Render the existing Blade view to HTML
                $bodyRequest = view('emails.verification.rejected', [
                    'user' => $user,
                    'reason' => $request->reason
                ])->render();
                
                $mail->Body = $bodyRequest;
                $mail->AltBody = 'Verifikasi akun Anda ditolak. Alasan: ' . $request->reason;

                $mail->send();
                Log::info("PHPMailer: Message has been sent to {$user->email}");
            } else {
                Log::warning("Skipping email for User ID {$user->id}: Image invalid/missing at " . public_path('/images/KEMENTERIAN-PERTAHANAN.png'));
            }
        } catch (\Exception $e) {
            Log::error("Failed to send rejection email to User ID {$user->id} via PHPMailer: " . $e->getMessage());
        }

        return redirect()->back()->with('success', 'User berhasil ditolak dan email notifikasi telah dikirim.');
    }
    
    public function disqualify(Request $request, User $user)
    {
        $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        // Send Email BEFORE deleting data (otherwise user object is gone)
        try {
            Mail::to($user)->send(new \App\Mail\VerificationDisqualifiedMail($user, $request->reason));
        } catch (\Exception $e) {
            // Log error but continue with deletion
            \Illuminate\Support\Facades\Log::error('Failed to send disqualification email: ' . $e->getMessage());
        }

        // Use transaction to ensure all data is deleted or none
        \Illuminate\Support\Facades\DB::transaction(function () use ($user) {
            // Force delete related models
            $user->member()->forceDelete();
            $user->calon()->forceDelete();
            $user->prestasi()->forceDelete();
            $user->organisasis()->forceDelete();
            
            
            // Force delete the user
            $user->forceDelete();
        });

        return redirect()->back()->with('success', 'User dinyatakan tidak lulus, notifikasi dikirim, dan data telah dihapus permanen.');
    }

    public function download(User $user)
    {
        // Increase time limit for large ZIPs
        set_time_limit(300);

        // Load relationships
        $user->load([
            'calon.suku', 'calon.bangsa', 'calon.agama', 
            'calon.statusPernikahan', 'calon.golonganDarah',
            'calon.birthplace',
            'calon.golongan',
            'calon.provinsi', 'calon.kabupaten', 'calon.kecamatan', 'calon.desa',
            'calon.pekerjaan',
            'organisasis',
            'prestasi'
        ]);

        $detail = $user->calon;
        
        // 1. Generate PDF
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdfs.verification-data', [
            'user' => $user,
            'detail' => $detail
        ]);
        $pdfContent = $pdf->output();

        // 2. Prepare ZIP
        $zipFileName = 'Verifikasi_' . str_replace(' ', '_', $user->name) . '_' . ($detail->nik ?? 'NoNIK') . '.zip';
        $zipPath = storage_path('app/public/' . $zipFileName);
        
        $zip = new \ZipArchive;
        if ($zip->open($zipPath, \ZipArchive::CREATE) === TRUE) {
            
            // Add PDF
            $zip->addFromString('Data_Verifikasi.pdf', $pdfContent);

            // Add Documents
            $documents = [
                'Berkas_Foto_Profil' => $detail->foto_profil ?? null,
                'Berkas_KTP' => $detail->doc_ktp ?? null, // Also scan_ktp? use doc prefix for calon
                'Berkas_KK' => $detail->doc_kk ?? null,
                'Berkas_Surat_Lamaran' => $detail->doc_surat_lamaran ?? null,
                'Berkas_Surat_Keterangan_Lurah' => $detail->doc_sk_lurah ?? null,
                'Berkas_SKCK' => $detail->doc_skck ?? null,
                'Berkas_Ijazah' => $detail->doc_ijazah ?? null,
                'Berkas_Surat_Keterangan_Sehat' => $detail->doc_sk_sehat ?? null,
                'Berkas_Data_Riwayat_Hidup' => $detail->doc_drh ?? null,
                'Berkas_Latsarmil' => $detail->doc_latsarmil ?? null,
                'Berkas_Izin_Instansi_Perusahaan_Universitas' => $detail->doc_izin_instansi ?? null,
                'Berkas_Izin_Ortu_Istri' => $detail->doc_izin_ortu ?? null,
                'Scan_KTP_Verifikasi' => $detail->scan_ktp ?? null,
                'Scan_Selfie_Verifikasi' => $detail->scan_selfie ?? null,
            ];

            foreach ($documents as $name => $path) {
                if ($path && \Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                    $extension = pathinfo($path, PATHINFO_EXTENSION);
                    $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($path);
                    $zip->addFile($fullPath, "Dokumen/{$name}.{$extension}");
                }
            }

            $zip->close();
        }

        // Return download response and delete after send
        return response()->download($zipPath)->deleteFileAfterSend(true);
    }
}
