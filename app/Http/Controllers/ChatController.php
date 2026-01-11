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

        // Fetch conversations ordered by latest message
        $conversations = Conversation::whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })
            ->with(['lastMessage', 'participants'])
            ->get()
            ->sortByDesc(function ($conversation) {
                return $conversation->lastMessage ? $conversation->lastMessage->created_at : $conversation->created_at;
            })
            ->values();

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function show(Conversation $conversation)
    {
        $this->authorize('view', $conversation);

        $conversation->load(['participants', 'messages.sender']);

        return response()->json([
            'conversation' => $conversation,
            'messages' => $conversation->messages,
        ]);
    }

    public function store(Request $request, Conversation $conversation)
    {
        $this->authorize('update', $conversation);

        $validated = $request->validate([
            'body' => 'required_without:attachments|nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|max:10240',
        ]);

        $message = $conversation->messages()->create([
            'user_id' => Auth::id(),
            'body' => $validated['body'],
            'type' => $request->has('attachments') ? 'file' : 'text',
        ]);

        // Load sender relationship
        $message->load('sender');

        // Touch conversation updated_at for sorting
        $conversation->touch();

        // Broadcast the message to all participants
        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'message' => $message,
        ]);
    }
}
