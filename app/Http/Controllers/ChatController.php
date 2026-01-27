<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $initialConversationId = request()->query('conversation_id');

        // Fetch conversations ordered by latest message
        $conversations = Conversation::whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->where(function ($query) use ($initialConversationId) {
                $query->whereHas('messages');
                
                if ($initialConversationId) {
                    $query->orWhere('id', $initialConversationId);
                }
            })
            ->with(['lastMessage.sender', 'participants'])
            ->get()
            ->sortByDesc(function ($conversation) {
                return $conversation->lastMessage ? $conversation->lastMessage->created_at : $conversation->created_at;
            })
            ->values();

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
            'initialConversationId' => request()->query('conversation_id'),
        ]);
    }

    public function listConversations()
    {
        $user = Auth::user();
        $limit = request()->query('limit', 20); // Optional limit

        $conversations = Conversation::whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->whereHas('messages') // Only show active conversations in drawer initially
            ->with(['lastMessage.sender', 'participants.roles'])
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('user_id', '!=', $user->id)
                      ->whereNull('read_at');
            }])
            ->get()
            ->sortByDesc(function ($conversation) {
                return $conversation->lastMessage ? $conversation->lastMessage->created_at : $conversation->created_at;
            })
            ->values();

        $conversations->transform(function ($conversation) use ($user) {
            $conversation->can_manage = $user->hasRole(['admin', 'super-admin']) || $conversation->created_by === $user->id;
            return $conversation;
        });

        return response()->json($conversations);
    }

    public function show(Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $conversation->load(['participants', 'messages.sender']);

        // Mark unread messages as delivered for the current user (if they are not the sender)
        $userId = Auth::id();
        $undeliveredMessages = $conversation->messages()
            ->where('user_id', '!=', $userId)
            ->whereNull('delivered_at')
            ->get();

        if ($undeliveredMessages->isNotEmpty()) {
            $now = now();
            // Bulk update
            $conversation->messages()
                ->whereIn('id', $undeliveredMessages->pluck('id'))
                ->update(['delivered_at' => $now]);

            // Broadcast updates
            foreach ($undeliveredMessages as $message) {
                $message->delivered_at = $now;
                broadcast(new \App\Events\MessageStatusUpdated($message))->toOthers();
            }
        }

        $conversation->can_manage = Auth::user()->hasRole(['admin', 'super-admin']) || $conversation->created_by === Auth::id();

        return response()->json([
            'conversation' => $conversation,
            'messages' => $conversation->messages,
        ]);
    }

    public function markRead(Conversation $conversation)
    {
        $this->authorize('view', $conversation);
        $userId = Auth::id();

        $unreadMessages = $conversation->messages()
            ->where('user_id', '!=', $userId)
            ->whereNull('read_at')
            ->get();

        if ($unreadMessages->isNotEmpty()) {
            $now = now();
            $conversation->messages()
                ->whereIn('id', $unreadMessages->pluck('id'))
                ->update(['read_at' => $now, 'delivered_at' => \DB::raw('COALESCE(delivered_at, NOW())')]);

            foreach ($unreadMessages as $message) {
                $message->read_at = $now;
                if (! $message->delivered_at) {
                    $message->delivered_at = $now;
                }
                broadcast(new \App\Events\MessageStatusUpdated($message))->toOthers();
            }
        }

        // Mark related notifications as read
        Auth::user()->unreadNotifications()
            ->where('data->conversation_id', $conversation->id)
            ->where('data->type', 'message')
            ->update(['read_at' => now()]);

        return response()->json(['status' => 'success']);
    }

    // ... (rest of methods)

    public function store(Request $request, Conversation $conversation)
    {
        $this->authorize('update', $conversation);

        $validated = $request->validate([
            'body' => 'required_without:attachments|nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
        ]);

        $attachmentData = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('attachments', 'public');
                $url = asset('storage/'.$path);

                $attachmentData[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'url' => $url,
                    'mime_type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ];
            }
        }

        $type = 'text';
        if (! empty($attachmentData)) {
            $firstMime = $attachmentData[0]['mime_type'] ?? '';
            $type = str_starts_with($firstMime, 'image/') ? 'image' : 'file';
        }

        $message = $conversation->messages()->create([
            'user_id' => Auth::id(),
            'body' => $validated['body'] ?? null,
            'type' => $type,
            'attachments' => ! empty($attachmentData) ? $attachmentData : null,
        ]);

        // Load sender relationship
        $message->load('sender');

        // Touch conversation updated_at for sorting
        $conversation->touch();

        // Broadcast the message to all participants
        broadcast(new MessageSent($message))->toOthers();

        // Send notification to other participants
        $otherParticipants = $conversation->participants()->where('user_id', '!=', Auth::id())->get();
        \Illuminate\Support\Facades\Notification::send($otherParticipants, new \App\Notifications\NewMessageReceived($message));

        return response()->json([
            'message' => $message,
        ]);
    }

    public function storeConversation(Request $request)
    {
        $validated = $request->validate([
            'users' => 'required|array|min:1',
            'users.*' => 'exists:users,id',
            'is_group' => 'boolean',
            'name' => 'required_if:is_group,true|nullable|string|max:255',
        ]);

        $otherUsers = $validated['users'];
        $isGroup = $request->boolean('is_group');

        // Logic for Direct Message (1-on-1)
        if (! $isGroup && count($otherUsers) === 1) {
            $otherUserId = $otherUsers[0];
            $authId = Auth::id();

            // Check if conversation already exists
            $conversation = Conversation::where('is_group', false)
                ->whereHas('participants', function ($q) use ($authId) {
                    $q->where('user_id', $authId);
                })
                ->whereHas('participants', function ($q) use ($otherUserId) {
                    $q->where('user_id', $otherUserId);
                })
                ->first();

            if ($conversation) {
                return response()->json([
                    'conversation' => $conversation->load(['participants', 'messages.sender']),
                ]);
            }
        }

        // Logic for Group Chat
        if ($isGroup) {
            // Automatically add all Admins and Super Admins
            $adminIds = \App\Models\User::role(['admin', 'super-admin'])->pluck('id')->toArray();
            $otherUsers = array_unique(array_merge($otherUsers, $adminIds));
        }

        // Create new conversation
        $conversation = Conversation::create([
            'name' => $isGroup ? $validated['name'] : null,
            'is_group' => $isGroup,
            'created_by' => $isGroup ? Auth::id() : null,
        ]);

        // Attach participants (Auth user + selected users)
        // Ensure we don't duplicate the auth user if they are also an admin
        $allParticipants = array_unique(array_merge([Auth::id()], $otherUsers));
        $conversation->participants()->attach($allParticipants);

        return response()->json([
            'conversation' => $conversation->load(['participants.roles', 'messages.sender']),
        ]);
    }

    public function update(Request $request, Conversation $conversation)
    {
        $this->authorize('update', $conversation); // Ensure user is a participant

        // Additional check: Only creator, admin, or super-admin knows the way
        if ($conversation->is_group && 
            $conversation->created_by !== Auth::id() && 
            ! Auth::user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Only the group admin or system administrators can update group settings.');
        }

        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:15360',
        ]);

        $updateData = [];

        if ($request->has('name')) {
            $updateData['name'] = $validated['name'];
        }

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($conversation->avatar) {
                $oldPath = str_replace(asset('storage/'), '', $conversation->avatar);
                \Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('avatar')->store('conversation-avatars', 'public');
            $updateData['avatar'] = asset('storage/'.$path);
        }

        $conversation->update($updateData);

        return response()->json([
            'conversation' => $conversation,
            'message' => 'Group updated successfully',
        ]);
    }

    public function searchUsers(Request $request)
    {
        $query = $request->get('query');
        
        $users = \App\Models\User::with(['staff.jabatan'])
            ->where('id', '!=', Auth::id())
            ->when($query, function ($q) use ($query) {
                $q->where(function ($sub) use ($query) {
                    $sub->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                });
            })
            ->orderBy('name', 'asc')
            ->take(50)
            ->get(['id', 'name', 'email']); // Removed jabatan_id

        // Map jabatan from staff to user object for frontend compatibility
        $users->transform(function ($user) {
            $user->jabatan = $user->staff?->jabatan;
            unset($user->staff); // Optional: clean up if not needed
            return $user;
        });

        return response()->json($users);
    }
    public function addParticipants(Request $request, Conversation $conversation)
    {
        $this->authorize('update', $conversation);

        if ($conversation->is_group && 
            $conversation->created_by !== Auth::id() && 
            ! Auth::user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'users' => 'required|array',
            'users.*' => 'exists:users,id',
        ]);

        $conversation->participants()->syncWithoutDetaching($validated['users']);
        
        // Notify?
        
        return response()->json(['message' => 'Participants added']);
    }

    public function removeParticipant(Conversation $conversation, \App\Models\User $user)
    {
        $this->authorize('update', $conversation);

        if ($conversation->is_group && 
            $conversation->created_by !== Auth::id() && 
            ! Auth::user()->hasRole(['admin', 'super-admin'])) {
            abort(403, 'Unauthorized');
        }

        // Prevent removing self if creator? Or standard logic.
        // Protected users: Admin, Super Admin, and Group Creator
        if ($user->hasRole(['admin', 'super-admin']) || $conversation->created_by === $user->id) {
             return response()->json(['message' => 'Tidak dapat mengeluarkan Admin atau Pembuat Grup'], 403);
        }
        
        $conversation->participants()->detach($user->id);

        return response()->json(['message' => 'Participant removed']);
    }
}
