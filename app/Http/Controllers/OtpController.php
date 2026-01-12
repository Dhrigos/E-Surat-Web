<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class OtpController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'phone_number' => 'required|string',
        ]);

        $otp = rand(100000, 999999);
        $email = $request->email;
        $phone = $request->phone_number;

        // Store OTP in cache for 5 minutes
        // We use the email as the key for simplicity, or a combination
        // Use 'otp_reg_' prefix to distinguish from reset OTP
        Cache::put('otp_reg_' . $email, $otp, 300);

        // Log for debugging/SMS placeholder
        Log::info("OTP Reg for {$email} / {$phone}: {$otp}");

        try {
            Mail::to($email)->send(new OtpMail($otp));

            // Kirim SMS (Jika ada provider)
            $this->sendSms($phone, $otp);

        } catch (\Exception $e) {
            Log::error("Failed to send OTP email: " . $e->getMessage());
            return response()->json(['message' => 'Gagal mengirim email OTP, namun OTP tercatat di log (dev mode).'], 500);
        }

        return response()->json(['message' => 'OTP sent successfully']);
    }

    public function sendResetOtp(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string', // username or email
            'phone_number' => 'required|string',
        ]);

        $keyword = $request->keyword;
        $phoneInput = $request->phone_number;

        // Find user by email or username
        $user = User::where('email', $keyword)
                    ->orWhere('username', $keyword)
                    ->first();

        if (!$user) {
            return response()->json(['message' => 'Username atau Email tidak ditemukan.'], 404);
        }

        // Verify phone number
        $dbPhone = $user->phone_number;
        
        $normalize = function($p) {
            $p = preg_replace('/[^0-9]/', '', $p);
            if (str_starts_with($p, '62')) $p = '0' . substr($p, 2);
            return $p;
        };

        if ($normalize($dbPhone) !== $normalize($phoneInput)) {
             return response()->json(['message' => 'Nomor telepon tidak cocok dengan data pengguna.'], 400);
        }
        
        // Generate and Send OTP
        $otp = rand(100000, 999999);
        
        // Cache uses KEYWORD as key with 'otp_reset_' prefix
        Cache::put('otp_reset_' . $keyword, $otp, 300);
        
        // Log for debugging
        Log::info("OTP Reset for {$user->email} / {$keyword}: {$otp}");

        try {
            Mail::to($user->email)->send(new OtpMail($otp));
            // $this->sendSms($phoneInput, $otp); 
        } catch (\Exception $e) {
            Log::error("Failed to send OTP email: " . $e->getMessage());
            return response()->json(['message' => 'Gagal mengirim email OTP.'], 500);
        }

        return response()->json(['message' => 'Kode OTP telah dikirim ke email terdaftar Anda.']);
    }

    public function checkOtp(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string',
            'otp' => 'required|string',
        ]);

        $keyword = $request->keyword;
        $otp = $request->otp;

        // Check against 'otp_reset_' prefix
        $cachedOtp = Cache::get('otp_reset_' . $keyword);

        if (! $cachedOtp || $cachedOtp != $otp) {
            return response()->json(['message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'], 422);
        }

        return response()->json(['message' => 'OTP valid. Silakan atur password baru.']);
    }

    public function verifyAndReset(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string', // changed from email to keyword
            'phone_number' => 'required|string',
            'otp' => 'required|string', // still require OTP for security token
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $keyword = $request->keyword;
        $otp = $request->otp;

        // Use 'otp_reset_' prefix
        $cachedOtp = Cache::get('otp_reset_' . $keyword);

        if (! $cachedOtp || $cachedOtp != $otp) {
            return response()->json(['message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'], 422);
        }

        // Find user 
        $user = User::where(function($query) use ($keyword) {
                        $query->where('email', $keyword)
                              ->orWhere('username', $keyword);
                    })->first(); 
        
        if (!$user) {
             return response()->json(['message' => 'User tidak ditemukan.'], 404);
        }

        // Update the user's password
        $user->password = Hash::make($request->password);
        
        // RESET E-KYC STATUS
        $user->ekyc_verified_at = null;
        $user->verifikasi = '0'; 
        
        $user->save();

        // Clear the OTP from cache
        Cache::forget('otp_reset_' . $keyword);

        return response()->json(['message' => 'Password berhasil diubah. Silakan login dan lakukan verifikasi ulang.']);
    }



    /**
     * Placeholder untuk mengirim SMS.
     * Anda perlu mendaftar ke penyedia SMS Gateway (contoh: Twilio, Zenziva, Wablas, dll)
     */
    private function sendSms($phoneNumber, $otp)
    {
        // Contoh implementasi generik menggunakan Http Client Laravel
        // Silakan sesuaikan dengan dokumentasi API provider Anda.

        /*
        try {
            \Illuminate\Support\Facades\Http::post('https://api.provider-sms.com/send', [
                'api_key' => env('SMS_API_KEY'),
                'phone' => $phoneNumber,
                'message' => "Kode OTP Anda adalah: {$otp}",
            ]);
        } catch (\Exception $e) {
            Log::error("Gagal mengirim SMS: " . $e->getMessage());
        }
        */

        // Untuk saat ini, kita hanya log saja
        Log::info("SMS dikirim ke {$phoneNumber}: Kode OTP Anda adalah {$otp}");
    }
}
