<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Log::info('routes/channels.php loaded');

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);

    if (! $conversation) {
        return false;
    }

    // Check if user is a participant in this conversation
    return $conversation->participants()->where('user_id', $user->id)->exists();
});

// Location tracking channels
Broadcast::channel('location.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('presence-location.online', function ($user) {
    \Illuminate\Support\Facades\Log::info('Broadcasting auth presence-location.online hit (explicit prefix)', ['user_id' => $user->id]);
    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar,
    ];
});

// Chat online presence channel
Broadcast::channel('chat.online', function ($user) {
    return [
        'id' => $user->id,
        'name' => $user->name,
        'avatar' => $user->avatar,
    ];
});
