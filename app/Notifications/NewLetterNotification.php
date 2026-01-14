<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewLetterNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $letter;
    public $type; // 'approval_needed' or 'new_mail'

    /**
     * Create a new notification instance.
     */
    public function __construct($letter, $type = 'new_mail')
    {
        $this->letter = $letter;
        $this->type = $type;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'letter_id' => $this->letter->id,
            'subject' => $this->letter->subject,
            'sender_name' => $this->letter->creator->name,
            'type' => $this->type,
            'url' => route('letters.show', $this->letter->id),
            'message' => $this->type === 'approval_needed' 
                ? 'Surat baru menunggu persetujuan Anda: ' . $this->letter->subject 
                : 'Anda menerima surat baru: ' . $this->letter->subject,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'letter_id' => $this->letter->id,
            'subject' => $this->letter->subject,
            'sender_name' => $this->letter->creator->name,
            'type' => $this->type,
            'message' => $this->type === 'approval_needed' 
                ? 'Surat baru menunggu persetujuan Anda: ' . $this->letter->subject 
                : 'Anda menerima surat baru: ' . $this->letter->subject,
        ]);
    }
}
