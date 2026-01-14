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

        return Inertia::render('Dispositions/Index', [
            'dispositions' => $dispositions
        ]);
    }

    public function store(Request $request, Letter $letter)
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'instruction' => 'required|string',
            'note' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        Disposition::create([
            'letter_id' => $letter->id,
            'sender_id' => Auth::id(),
            'recipient_id' => $validated['recipient_id'],
            'instruction' => $validated['instruction'],
            'note' => $validated['note'],
            'due_date' => $validated['due_date'],
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Disposisi berhasil dikirim.');
    }

    public function getRecipients()
    {
        // For now, return all users except current user
        // In future, filter by subordinates or unit
        $users = \App\Models\User::where('id', '!=', Auth::id())
            ->with('detail.jabatan')
            ->orderBy('name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'jabatan' => $user->detail?->jabatan?->nama ?? 'Staff',
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
