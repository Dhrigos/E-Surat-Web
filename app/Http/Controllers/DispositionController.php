<?php

namespace App\Http\Controllers;

use App\Models\Disposition;
use App\Models\Letter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DispositionController extends Controller
{
    public function index()
    {
        $dispositions = Disposition::where('recipient_id', Auth::id())
            ->with([
                // 'letter.approvers.user.detail.jabatanRole', // Load approval/role info for Timeline (Removed from view)
                // 'letter.sender.detail.jabatanRole', // Load original sender info (Load via API)
                // 'letter.attachments', // Load attachments (Load via API)
                // 'letter.recipients', // Load recipients (Load via API)
                'letter', // Load letter basic info
                'sender' // Disposition sender
            ])
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total' => Disposition::where('recipient_id', Auth::id())->count(),
            'pending' => Disposition::where('recipient_id', Auth::id())->where('status', 'pending')->count(),
            'process' => Disposition::where('recipient_id', Auth::id())->where('status', 'read')->count(),
            'completed' => Disposition::where('recipient_id', Auth::id())->where('status', 'completed')->count(),
        ];

        return Inertia::render('Dispositions/Index', [
            'dispositions' => $dispositions,
            'stats' => $stats
        ]);
    }

    public function store(Request $request, Letter $letter)
    {
        $validated = $request->validate([
            'recipient_id' => 'required', // Can be user_id, unit_id (formatted as 'unit_ID'), mako_id, or region_id
            'disposition_type' => 'nullable|in:personal,unit,wilayah,mako',
            'instruction' => 'required|string',
            'note' => 'nullable|string',
            'due_date' => 'nullable|date',
            'priority' => 'nullable|in:urgent,normal,low',
            'province_id' => 'nullable', // For Mako cascading
        ]);

        $recipientId = $validated['recipient_id'];
        $dispositionType = $validated['disposition_type'] ?? 'personal';

        // Resolve Recipient ID if type is not personal
        if ($dispositionType === 'unit') {
            // recipient_id is Jabatan ID (Struktural)
            // Find User holding this Jabatan
             $user = \App\Models\User::whereHas('detail', function ($q) use ($recipientId) {
                $q->where('jabatan_id', $recipientId);
            })->first(); // TODO: If multiple, ideally pick active/main one.
             
            if ($user) $recipientId = $user->id;
            else return redirect()->back()->withErrors(['recipient_id' => 'Pejabat untuk unit ini tidak ditemukan.']);

        } elseif ($dispositionType === 'wilayah') {
            // Recipient ID is Province ID
            $user = \App\Models\User::whereHas('detail', function ($q) use ($recipientId) {
                 $q->where('office_province_id', $recipientId); // Assuming we map to office_province
            })->first();

            if ($user) $recipientId = $user->id;
             else return redirect()->back()->withErrors(['recipient_id' => 'Pejabat wilayah ini tidak ditemukan.']);

        } elseif ($dispositionType === 'mako') {
             // recipient_id is Mako ID
             // User selected Province -> Mako
             $user = \App\Models\User::whereHas('detail', function ($q) use ($recipientId) {
                $q->where('mako_id', $recipientId);
             })->first();

             if ($user) $recipientId = $user->id;
             else return redirect()->back()->withErrors(['recipient_id' => 'Pejabat Mako ini tidak ditemukan.']);
        }

        Disposition::create([
            'letter_id' => $letter->id,
            'sender_id' => Auth::id(),
            'recipient_id' => $recipientId,
            'instruction' => $validated['instruction'],
            'note' => $validated['note'],
            'due_date' => $validated['due_date'],
            'status' => 'pending',
            'priority' => $validated['priority'] ?? 'normal',
        ]);

        return redirect()->back()->with('success', 'Disposisi berhasil dikirim.');
    }

    public function getRecipients(Request $request)
    {
        $type = $request->query('type', 'personal');
        $provinceCode = $request->query('province_code');

        if ($type === 'province') {
             $provinces = \Illuminate\Support\Facades\DB::table('indonesia_provinces')
                ->select('id', 'code', 'name')
                ->orderBy('name')
                ->get()
                ->map(function ($prov) {
                    return [
                        'id' => $prov->code, // Use Code for relations if needed
                        'name' => $prov->name,
                        'type' => 'province'
                    ];
                });
            return response()->json($provinces);
        }

        if ($type === 'mako') {
            // Use province_code to filter Makos if provided
            $query = \App\Models\Mako::select('id', 'name', 'code', 'province_code')->orderBy('name');
            
            if ($provinceCode) {
                $query->where('province_code', $provinceCode);
            }

            $makos = $query->get()->map(function ($mako) {
                return [
                    'id' => $mako->id,
                    'name' => $mako->name,
                    'jabatan' => $mako->code,
                    'type' => 'mako'
                ];
            });
            return response()->json($makos);
        }

        if ($type === 'unit') {
            // List Structural Jabatans under current user
            $currentUserJabatanId = Auth::user()->detail?->jabatan_id;

            if (!$currentUserJabatanId) {
                return response()->json([]);
            }

            $units = \App\Models\Jabatan::where('kategori', 'struktural')
                ->where('parent_id', $currentUserJabatanId)
                ->with('parent')
                ->orderBy('level')
                ->orderBy('nama')
                ->get()
                ->map(function ($jabatan) {
                    return [
                        'id' => $jabatan->id,
                        'name' => $jabatan->nama,
                        'jabatan' => 'Unit Bawahan', // Context info
                        'type' => 'unit'
                    ];
                });
            return response()->json($units);
        } 
        
        if ($type === 'wilayah') {
             // List Provinces for Wilayah selection
             $provinces = \Illuminate\Support\Facades\DB::table('indonesia_provinces')
                ->select('id', 'code', 'name')
                ->orderBy('name')
                ->get()
                ->map(function ($prov) {
                    return [
                        'id' => $prov->code, 
                        'name' => $prov->name,
                        'jabatan' => 'Provinsi',
                        'type' => 'wilayah'
                    ];
                });
            return response()->json($provinces);
        }

        // Default: Personal (Users)
        $users = \App\Models\User::where('id', '!=', Auth::id())
            ->with('detail.jabatan')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'jabatan' => $user->detail?->jabatan?->nama ?? 'Staff',
                    'type' => 'personal'
                ];
            });

        return response()->json($users);
    }

    public function updateStatus(Request $request, Disposition $disposition)
    {
        $validated = $request->validate([
            'status' => 'required|in:read,completed',
        ]);

        // Ensure current user is the recipient
        if ($disposition->recipient_id !== Auth::id()) {
            abort(403);
        }

        $disposition->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Status disposisi diperbarui.');
    }

    public function markAsCompleted(Disposition $disposition)
    {
        // Assuming a policy is set up for 'update' on Disposition
        // $this->authorize('update', $disposition); // Uncomment if using policies

        // Ensure current user is the recipient
        if ($disposition->recipient_id !== Auth::id()) {
            abort(403);
        }

        $disposition->update(['status' => 'completed']);

        return redirect()->back()->with('success', 'Disposisi berhasil ditandai selesai.');
    }

    public function showLetter(Disposition $disposition)
    {
        // Assuming a policy is set up for 'view' on Disposition
        // $this->authorize('view', $disposition); // Uncomment if using policies

        // Ensure current user is the recipient
        if ($disposition->recipient_id !== Auth::id()) {
            abort(403);
        }

        if ($disposition->status === 'pending') {
            $disposition->update(['status' => 'read']);
        }

        $letter = $disposition->letter;
        $letter->load([
            'approvers.user.detail.jabatanRole',
            'approvers.user.detail.jabatan',
            'approvers.user.detail.pangkat',
            'approvers.user.roles', // For showing role badge
            'sender.detail.jabatanRole',
            'sender.detail.jabatan',
            'sender.detail.pangkat',
            'sender.roles',
            'attachments',
            'recipients.recipient.detail.jabatanRole',
            'recipients.recipient.detail.jabatan',
            'recipients.recipient.detail.pangkat',
            'recipients.recipient.roles',
            'recipients'
        ]);

        return response()->json($letter);
    }
    public function destroy(Disposition $disposition)
    {
        if ($disposition->sender_id !== Auth::id()) {
            abort(403);
        }

        $disposition->delete();

        return redirect()->back()->with('success', 'Disposisi berhasil dihapus.');
    }
}
