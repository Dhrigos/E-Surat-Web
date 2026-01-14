<?php

namespace App\Http\Controllers;

use App\Models\Letter;
use App\Models\LetterApprover;
use App\Models\LetterAttachment;
use App\Models\LetterRecipient;
use App\Models\User;
use App\Notifications\NewLetterNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LetterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    protected $workflowService;

    public function __construct(\App\Services\WorkflowService $workflowService)
    {
        $this->workflowService = $workflowService;
    }

    private function transformLetter($letter)
    {
        return [
            'id' => $letter->id,
            'subject' => $letter->subject,
            'recipient' => $letter->recipients->map(function ($r) {
                return $r->recipient_type === 'division' ? $r->recipient_id : User::find($r->recipient_id)?->name;
            })->join(', '),
            'sender' => [
                'name' => $letter->creator->name,
                'position' => $letter->creator->staff?->jabatan?->nama ?? 'Unknown Position',
                'profile_photo_url' => $letter->creator->profile_photo_url,
            ],
            'status' => $letter->status,
            'priority' => $letter->priority,
            'category' => $letter->category,
            'date' => $letter->created_at->format('Y-m-d'),
            'description' => $letter->description,
            'content' => $letter->content,
            'letter_type' => $letter->letterType?->name,
            'is_starred' => (bool) $letter->is_starred,
            'attachments' => $letter->attachments->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->file_name,
                'url' => Storage::url($a->file_path),
                'size' => $a->file_size,
                'type' => $a->mime_type,
            ]),
            'approvers' => $letter->approvers->map(fn ($a) => [
                'user_id' => $a->user_id,
                'approver_id' => $a->approver_id, // Add this line
                'position' => $a->user?->staff?->jabatan?->nama ?? 'Pejabat',
                'unit' => $a->user?->staff?->jabatan?->parent?->nama ?? 'Instansi',
                'rank' => $a->user?->detail?->pangkat?->nama,
                'status' => $a->status,
                'order' => $a->order,
                'remarks' => $a->remarks,
                'user_name' => $a->user ? $a->user->name : null,
                'signature_url' => $a->user?->detail?->tanda_tangan ? Storage::url($a->user->detail->tanda_tangan) : null,
            ]),
            'recipients_list' => $letter->recipients->map(fn ($r) => [
                'type' => $r->recipient_type,
                'id' => $r->recipient_id,
                'name' => $r->recipient_type === 'division' ? $r->recipient_id : User::find($r->recipient_id)?->name,
                'position' => $r->recipient_type === 'user' ? (User::find($r->recipient_id)?->staff?->jabatan?->nama ?? 'Unknown Position') : 'Division',
                'profile_photo_url' => $r->recipient_type === 'user' ? User::find($r->recipient_id)?->profile_photo_url : null,
            ]),
            'dispositions' => $letter->dispositions
                ->filter(fn ($d) => $d->sender_id == Auth::id() || $d->recipient_id == Auth::id())
                ->values()
                ->map(fn ($d) => [
                'id' => $d->id,
                'sender' => ['name' => $d->sender->name],
                'recipient' => ['name' => $d->recipient->name],
                'instruction' => $d->instruction,
                'note' => $d->note,
                'due_date' => $d->due_date,
                'status' => $d->status,
                'created_at' => $d->created_at->format('Y-m-d H:i'),
            ]),
            'signature_positions' => $letter->signature_positions,
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $search = $request->input('search');
        $category = $request->input('category');

        $letterTypeFilter = $request->input('letter_type');

        // Sent mails query
        $sentQuery = Letter::with(['recipients', 'approvers.user.staff.jabatan', 'approvers.user.detail', 'attachments', 'creator', 'letterType', 'dispositions.sender', 'dispositions.recipient'])
            ->where('created_by', $user->id);

        if ($search) {
            $sentQuery->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $sentQuery->where('category', $category);
        }

        if ($letterTypeFilter && $letterTypeFilter !== 'all') {
            $sentQuery->where('letter_type_id', $letterTypeFilter);
        }

        // Filter by status (e.g., for Archive)
        if ($request->has('status')) {
            if ($request->input('status') === 'starred') {
                $sentQuery->where('is_starred', true);
            } else {
                $sentQuery->where('status', $request->input('status'));
            }
        } else {
            // Default: exclude archived unless explicitly requested
            $sentQuery->where('status', '!=', 'archived');
        }

        $sentMails = $sentQuery->orderBy('created_at', 'desc')
            ->paginate(10, ['*'], 'sent_page')
            ->through(fn ($l) => $this->transformLetter($l))
            ->withQueryString();

        // Inbox mails query
        // Inbox mails query
        $inboxQuery = LetterRecipient::where('recipient_type', 'user')
            ->where('recipient_id', $user->id)
            ->with(['letter.creator', 'letter.attachments', 'letter.approvers.user.staff.jabatan', 'letter.approvers.user.detail', 'letter.recipients', 'letter.letterType', 'letter.dispositions.sender', 'letter.dispositions.recipient']);

        if ($search) {
            $inboxQuery->whereHas('letter', function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('creator', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($category && $category !== 'all') {
            $inboxQuery->whereHas('letter', function ($q) use ($category) {
                $q->where('category', $category);
            });
        }

        if ($letterTypeFilter && $letterTypeFilter !== 'all') {
            $inboxQuery->whereHas('letter', function ($q) use ($letterTypeFilter) {
                $q->where('letter_type_id', $letterTypeFilter);
            });
        }

        // Filter Inbox by status if needed (though usually status is on Letter, not Recipient, but we can filter via relation)
        if ($request->has('status')) {
            if ($request->input('status') === 'archived') {
                $inboxQuery->whereHas('letter', function ($q) {
                    $q->where('status', 'archived');
                });
            } elseif ($request->input('status') === 'starred') {
                $inboxQuery->whereHas('letter', function ($q) {
                    $q->where('is_starred', true);
                });
            }
        } else {
            $inboxQuery->whereHas('letter', function ($q) {
                $q->where('status', '!=', 'archived');
            });
        }

        $inboxMails = $inboxQuery->latest()
            ->paginate(10, ['*'], 'inbox_page')
            ->through(function ($recipient) {
                $data = $this->transformLetter($recipient->letter);
                $data['status'] = $recipient->is_read ? 'read' : 'new';

                return $data;
            })
            ->withQueryString();

        // Incoming Approvals Query
        $approvalsQuery = LetterApprover::where('user_id', $user->id)
            ->where('status', 'pending')
            ->whereHas('letter', function ($q) {
                $q->where('status', '!=', 'archived')
                    ->where('status', '!=', 'rejected');
            })
            // Enforce sequential approval: No approvers with lower order should be pending/rejected
            ->whereRaw('NOT EXISTS (
                SELECT 1 FROM letter_approvers as prev 
                WHERE prev.letter_id = letter_approvers.letter_id 
                AND prev.order < letter_approvers.order 
                AND prev.status != "approved"
            )')
            ->with(['letter.creator', 'letter.attachments', 'letter.approvers.user.staff.jabatan', 'letter.approvers.user.detail', 'letter.recipients', 'letter.letterType', 'letter.dispositions.sender', 'letter.dispositions.recipient']);

        if ($search) {
            $approvalsQuery->whereHas('letter', function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('creator', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($letterTypeFilter && $letterTypeFilter !== 'all') {
            $approvalsQuery->whereHas('letter', function ($q) use ($letterTypeFilter) {
                $q->where('letter_type_id', $letterTypeFilter);
            });
        }

        $incomingApprovals = $approvalsQuery->orderBy('id', 'desc') // Order by latest
            ->paginate(10, ['*'], 'approval_page')
            ->through(function ($approver) {
                return $this->transformLetter($approver->letter);
            })
            ->withQueryString();

        // Already Approved Query
        $alreadyApprovedQuery = LetterApprover::where('user_id', $user->id)
            ->where('status', 'approved')
            ->with(['letter.creator', 'letter.attachments', 'letter.approvers.user.staff.jabatan', 'letter.approvers.user.detail', 'letter.recipients', 'letter.letterType', 'letter.dispositions.sender', 'letter.dispositions.recipient']);

        if ($search) {
            $alreadyApprovedQuery->whereHas('letter', function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('creator', function ($cq) use ($search) {
                        $cq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if ($letterTypeFilter && $letterTypeFilter !== 'all') {
            $alreadyApprovedQuery->whereHas('letter', function ($q) use ($letterTypeFilter) {
                $q->where('letter_type_id', $letterTypeFilter);
            });
        }

        $alreadyApprovedMails = $alreadyApprovedQuery->orderBy('updated_at', 'desc') // Order by approval time (updated_at)
            ->paginate(10, ['*'], 'approved_page')
            ->through(function ($approver) {
                return $this->transformLetter($approver->letter);
            })
            ->withQueryString();

        $openedMail = null;
        if ($request->has('open_mail_id')) {
            $mail = Letter::with(['recipients', 'approvers.user.staff.jabatan', 'approvers.user.detail', 'attachments', 'creator', 'letterType', 'dispositions.sender', 'dispositions.recipient'])
                ->find($request->input('open_mail_id'));

            if ($mail) {
                $this->authorize('view', $mail);
                $openedMail = $this->transformLetter($mail);

                // If it's an inbox mail, check read status
                $recipient = $mail->recipients()->where('recipient_type', 'user')->where('recipient_id', $user->id)->first();
                if ($recipient) {
                    $recipient->update(['is_read' => true, 'read_at' => now()]); // Fix: actually mark as read
                    $openedMail['status'] = 'read';
                }
            }
        }

        $letterTypes = \App\Models\LetterType::select('id', 'name')->get();

        return Inertia::render('MailManagement/MailList', [
            'sentMails' => $sentMails,
            'inboxMails' => $inboxMails,
            'incomingApprovals' => $incomingApprovals,
            'alreadyApprovedMails' => $alreadyApprovedMails, // Pass to view
            'filters' => $request->only(['search', 'category', 'status', 'letter_type']),
            'openedMail' => $openedMail,
            'letterTypes' => $letterTypes,
        ]);
    }

    public function create(Request $request)
    {
        $users = User::with(['staff.jabatan.parent', 'detail.pangkat'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'position_name' => $user->staff?->jabatan?->nama,
                    'rank' => $user->detail?->pangkat?->nama,
                    'unit' => $user->staff?->jabatan?->parent?->nama,
                    // Allow nested access if frontend expects it
                    'staff' => $user->staff ? [
                        'jabatan' => $user->staff->jabatan ? [
                            'nama' => $user->staff->jabatan->nama
                        ] : null
                    ] : null
                ];
            });
        // Fetch Letter Types for dropdown
        $letterTypes = \App\Models\LetterType::select('id', 'name', 'code')->get();

        $referenceLetter = null;
        if ($request->has('reply_to')) {
            $referenceLetter = Letter::with('creator')->find($request->input('reply_to'));
        }

        return Inertia::render('MailManagement/CreateSurat', [
            'users' => $users,
            'letterTypes' => $letterTypes,
            'referenceLetter' => $referenceLetter ? [
                'id' => $referenceLetter->id,
                'subject' => $referenceLetter->subject,
                'sender' => $referenceLetter->creator,
                'code' => 'SRT/'.date('Y').'/'.str_pad($referenceLetter->id, 4, '0', STR_PAD_LEFT), // Example code
            ] : null,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'priority' => 'required|in:low,normal,high,urgent',
            'category' => 'required|string',
            'mail_type' => 'required|string',
            'letter_type_id' => 'required|exists:letter_types,id', // Mandatory validation
            // 'approvers' => 'required|array', // Removed manual approvers
            'content' => 'nullable|string',
            'recipients' => 'required|array',
            'recipients.*.type' => 'required|in:user,division',
            'recipients.*.id' => 'required|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
            'signature_positions' => 'nullable|array', // Validate signature positions
            'reference_letter_id' => 'nullable|exists:letters,id',
            'workflow_steps' => 'nullable|array', // Allow dynamic workflow
        ]);

        // Prevent self-sending
        foreach ($validated['recipients'] as $recipient) {
            if ($recipient['type'] === 'user' && $recipient['id'] == $request->user()->id) {
                return back()->withErrors(['recipient' => 'Anda tidak dapat mengirim surat kepada diri sendiri.']);
            }
        }

        $letter = Letter::create([
            'subject' => $validated['subject'],
            'priority' => $validated['priority'],
            'category' => $validated['category'],
            'mail_type' => $validated['mail_type'],
            'letter_type_id' => $validated['letter_type_id'] ?? null,
            'description' => $validated['subject'],
            'content' => $validated['content'] ?? '',
            'status' => $validated['letter_type_id'] ? 'pending' : 'archived', // Auto-archive if no workflow
            'created_by' => Auth::id(),
            'signature_positions' => $validated['signature_positions'] ?? null,
            'reference_letter_id' => $validated['reference_letter_id'] ?? null,
        ]);

        // Start Workflow only if letter type is selected
        if ($validated['letter_type_id']) {
            try {
                $customApprovers = $request->input('custom_approvers', []);
                $dynamicSteps = $request->input('workflow_steps', []);
                $this->workflowService->startWorkflow($letter, $customApprovers, $dynamicSteps);
            } catch (\Exception $e) {
                // Rollback if workflow fails
                $letter->delete();

                return redirect()->back()->with('error', 'Gagal memulai workflow approval: '.$e->getMessage());
            }
        }

        // Handle Recipients
        foreach ($validated['recipients'] as $recipient) {
            LetterRecipient::create([
                'letter_id' => $letter->id,
                'recipient_type' => $recipient['type'],
                'recipient_id' => $recipient['id'],
            ]);
        }

        // Handle Attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('letters', 'local');
                LetterAttachment::create([
                    'letter_id' => $letter->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        // Notify Recipients
        foreach ($validated['recipients'] as $recipientData) {
            if ($recipientData['type'] === 'user') {
                $recipientUser = User::find($recipientData['id']);
                if ($recipientUser) {
                    $recipientUser->notify(new NewLetterNotification($letter, 'new_mail'));
                }
            }
        }

        // Log Activity
        \App\Services\ActivityLogger::log('create', 'Created new letter: '.$letter->subject, $letter);

        return redirect()->route('letters.index')->with('success', 'Surat berhasil dikirim.');
    }

    public function downloadAttachment(Letter $letter, LetterAttachment $attachment)
    {
        // Check authorization to view the letter
        $this->authorize('view', $letter);

        // Ensure attachment belongs to letter
        if ($attachment->letter_id !== $letter->id) {
            abort(404);
        }

        // Serve file from local storage
        if (! Storage::disk('local')->exists($attachment->file_path)) {
            abort(404, 'File not found.');
        }

        // Log Activity
        \App\Services\ActivityLogger::log('download', 'Downloaded attachment: '.$attachment->file_name, $letter);

        return Storage::disk('local')->download($attachment->file_path, $attachment->file_name);
    }

    public function updateStatus(Request $request, Letter $letter)
    {
        $this->authorize('approve', $letter);

        $validated = $request->validate([
            'status' => 'required|in:approved,rejected,returned', // Added returned
            'remarks' => 'nullable|string',
            'signature_position' => 'nullable|array', // New validation
            'step_id' => 'nullable|integer', // New validation
        ]);

        $user = Auth::user();

        try {
            // Update signature position if provided
            // Update signature position if provided
            if (isset($validated['signature_position'])) {
                $approver = $letter->approvers()->where('user_id', $user->id)->first();
                if ($approver) {
                    $positions = $letter->signature_positions ?? [];
                    $positions[$approver->order] = $validated['signature_position'];
                    $letter->update(['signature_positions' => $positions]);
                }
            }

            // Use WorkflowService to process approval
            $action = $validated['status'] === 'approved' ? 'approve' : ($validated['status'] === 'rejected' ? 'reject' : 'return');
            $this->workflowService->processApproval($letter, $user, $action, $validated['remarks']);
        } catch (\Exception $e) {
            \Log::error('Approval Error: '.$e->getMessage());
            \Log::error($e->getTraceAsString());

            return redirect()->back()->with('error', 'Gagal memproses approval: '.$e->getMessage());
        }

        // Log Activity
        \App\Services\ActivityLogger::log('approve', 'Updated status to '.$validated['status'].' for letter: '.$letter->subject, $letter);

        return redirect()->back()->with('success', 'Status surat berhasil diperbarui.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Letter $letter)
    {
        // Check authorization using Policy
        $this->authorize('view', $letter);

        return redirect()->route('letters.index', ['open_mail_id' => $letter->id]);
    }



    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Letter $letter)
    {
        $this->authorize('update', $letter);

        if ($letter->status !== 'draft' && $letter->status !== 'revision') {
            return redirect()->back()->with('error', 'Surat tidak dapat diedit.');
        }

        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'content' => 'nullable|string',
        ]);

        $letter->update($validated);

        // Log Activity
        \App\Services\ActivityLogger::log('update', 'Updated letter: '.$letter->subject, $letter);

        return redirect()->back()->with('success', 'Surat berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Letter $letter)
    {
        $this->authorize('delete', $letter);

        // Log Activity
        \App\Services\ActivityLogger::log('delete', 'Deleted letter: '.$letter->subject, $letter);

        $letter->delete();

        return redirect()->back()->with('success', 'Surat berhasil dihapus.');
    }

    public function exportPdf(Letter $letter)
    {
        $this->authorize('view', $letter);

        $letter->load(['creator', 'recipients', 'approvers', 'attachments']);

        $htmlContent = view('pdf.letter', ['letter' => $letter])->render();

        $pdf = Pdf::loadHTML($htmlContent);

        // Log Activity
        \App\Services\ActivityLogger::log('download', 'Exported PDF for letter: '.$letter->subject, $letter);

        return $pdf->download('Surat-'.$letter->id.'.pdf');
    }

    public function archive(Letter $letter)
    {
        $this->authorize('update', $letter); // Or a specific 'archive' policy

        $letter->update(['status' => 'archived']);

        // Log Activity
        \App\Services\ActivityLogger::log('archive', 'Archived letter: '.$letter->subject, $letter);

        return redirect()->back()->with('success', 'Surat berhasil diarsipkan.');
    }

    public function toggleStar(Letter $letter)
    {
        // Allow any user who can view the letter to star it?
        // Or should starring be personal?
        // The current implementation puts is_starred on the Letter model, which means it's GLOBAL.
        // If User A stars it, User B sees it starred.
        // Given the request "buatkna 1 lagi di ada starr surat", and the simple schema, we'll assume global for now or personal if we had a pivot table.
        // But wait, usually starring is personal.
        // However, I added `is_starred` to `letters` table, which implies it's a property of the letter itself (like "Important").
        // If it was personal, I would need a `letter_user_stars` table.
        // Let's assume it's a "Mark as Important" feature visible to everyone for now, or just stick to the requested schema.
        // Actually, for a proper "Star" feature like Gmail, it should be personal.
        // But I already migrated `letters` table.
        // Let's proceed with Global Star (Mark as Important) as per the schema I just made.

        $this->authorize('view', $letter);

        $letter->update(['is_starred' => ! $letter->is_starred]);

        return redirect()->back()->with('success', $letter->is_starred ? 'Surat ditandai bintang.' : 'Bintang dihapus dari surat.');
    }

    public function starred(Request $request)
    {
        $user = Auth::user();
        $search = $request->input('search');
        $category = $request->input('category');

        // Helper for transforming letter data
        $transformLetter = function ($letter) {
            return [
                'id' => $letter->id,
                'subject' => $letter->subject,
                'recipient' => $letter->recipients->map(function ($r) {
                    return $r->recipient_type === 'division' ? $r->recipient_id : User::find($r->recipient_id)?->name;
                })->join(', '),
                'sender' => $letter->creator->name,
                'status' => $letter->status,
                'priority' => $letter->priority,
                'category' => $letter->category,
                'date' => $letter->created_at->format('Y-m-d'),
                'description' => $letter->description,
                'is_starred' => (bool) $letter->is_starred,
            ];
        };

        // Query for starred mails (both sent and received)
        $starredQuery = Letter::with(['recipients', 'creator'])
            ->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                    ->orWhereHas('recipients', function ($rq) use ($user) {
                        $rq->where('recipient_type', 'user')
                            ->where('recipient_id', $user->id);
                    });
            })
            ->where('is_starred', true)
            ->where('status', '!=', 'archived');

        if ($search) {
            $starredQuery->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $starredQuery->where('category', $category);
        }

        $starredMails = $starredQuery->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through($transformLetter)
            ->withQueryString();

        return Inertia::render('MailManagement/StarredMails', [
            'starredMails' => $starredMails,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function archived(Request $request)
    {
        $user = Auth::user();
        $search = $request->input('search');
        $category = $request->input('category');

        // Helper for transforming letter data
        $transformLetter = function ($letter) {
            return [
                'id' => $letter->id,
                'subject' => $letter->subject,
                'recipient' => $letter->recipients->map(function ($r) {
                    return $r->recipient_type === 'division' ? $r->recipient_id : User::find($r->recipient_id)?->name;
                })->join(', '),
                'sender' => $letter->creator->name,
                'status' => $letter->status,
                'priority' => $letter->priority,
                'category' => $letter->category,
                'date' => $letter->created_at->format('Y-m-d'),
                'description' => $letter->description,
                'is_starred' => (bool) $letter->is_starred,
            ];
        };

        // Query for archived mails (both sent and received)
        $archivedQuery = Letter::with(['recipients', 'creator'])
            ->where(function ($q) use ($user) {
                $q->where('created_by', $user->id)
                    ->orWhereHas('recipients', function ($rq) use ($user) {
                        $rq->where('recipient_type', 'user')
                            ->where('recipient_id', $user->id);
                    });
            })
            ->whereIn('status', ['sent', 'received', 'read', 'disposed', 'in_progress', 'pending', 'approved', 'rejected', 'returned', 'archived', 'revision'])
            ->where('status', '!=', 'draft');

        if ($search) {
            $archivedQuery->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category && $category !== 'all') {
            $archivedQuery->where('category', $category);
        }

        $archivedMails = $archivedQuery->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through($transformLetter)
            ->withQueryString();

        return Inertia::render('MailManagement/ArchivedMails', [
            'archivedMails' => $archivedMails,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function storeExternal(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'recipient' => 'nullable|string', // Free text recipient
            'priority' => 'required|in:low,normal,high,urgent',
            'category' => 'required|string',
            'letter_type_id' => 'nullable|exists:letter_types,id',
            'content' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
            // Fallback for simple upload tab which uses single 'attachment'
            'attachment' => 'nullable|file|max:10240',
        ]);

        // Merge single attachment into array if present
        if ($request->hasFile('attachment')) {
            $files = $request->file('attachments') ?? [];
            $files[] = $request->file('attachment');
            $request->merge(['attachments' => $files]);
        }

        $letter = Letter::create([
            'subject' => $validated['subject'],
            'priority' => $validated['priority'],
            'category' => $validated['category'],
            'mail_type' => 'incoming', // Default
            'letter_type_id' => $validated['letter_type_id'] ?? null,
            'description' => $validated['recipient'] ?? 'Arsip Eksternal', // Store recipient in description for now
            'content' => $validated['content'] ?? '',
            'status' => 'archived',
            'created_by' => Auth::id(),
        ]);

        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('letters/external', 'local');
                LetterAttachment::create([
                    'letter_id' => $letter->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ]);
            }
        }

        // Log Activity
        \App\Services\ActivityLogger::log('archive', 'Created external archive: '.$letter->subject, $letter);

        return redirect()->back()->with('success', 'Arsip eksternal berhasil ditambahkan.');
    }
}
