<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = auth()->user()->notifications()->latest()->paginate(20);
        return inertia('Notifications/Index', [
            'notifications' => $notifications
        ]);
    }

    public function markAsRead($id)
    {
        \Illuminate\Support\Facades\Log::info('Marking notification as read: ' . $id);
        
        if (!$id) {
            return back();
        }

        $notification = auth()->user()->notifications()->find($id);
        
        if ($notification) {
            $notification->markAsRead();
        }
        
        return back();
    }

    public function clearAll()
    {
        \Illuminate\Support\Facades\Log::info('Clearing all notifications');
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    }
    public function destroy($id)
    {
        $notification = auth()->user()->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->delete();
        }
        return back();
    }
}
