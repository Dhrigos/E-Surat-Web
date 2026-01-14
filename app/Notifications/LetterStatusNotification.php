<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LetterStatusNotification extends Notification
{
    use Queueable;

    public $letter;
    public $status;
    public $approverName;

    /**
     * Create a new notification instance.
     */
    public function __construct($letter, $status, $approverName = null)
    {
        $this->letter = $letter;
        $this->status = $status;
        $this->approverName = $approverName;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
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
        $message = '';
        if ($this->status === 'approved') {
            $message = "Surat '{$this->letter->subject}' telah disetujui oleh {$this->approverName}.";
        } elseif ($this->status === 'rejected') {
            $message = "Surat '{$this->letter->subject}' ditolak oleh {$this->approverName}.";
        } else {
            $message = "Status surat '{$this->letter->subject}' berubah menjadi {$this->status}.";
        }

        return [
            'letter_id' => $this->letter->id,
            'subject' => $this->letter->subject,
            'status' => $this->status,
            'approver_name' => $this->approverName,
            'type' => 'status_update',
            'url' => route('letters.show', $this->letter->id),
            'message' => $message,
        ];
    }
}
