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
            ->with(['letter', 'sender'])
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
    public function destroy(Disposition $disposition)
    {
        if ($disposition->sender_id !== Auth::id()) {
            abort(403);
        }

        $disposition->delete();

        return redirect()->back()->with('success', 'Disposisi berhasil dihapus.');
    }
}
