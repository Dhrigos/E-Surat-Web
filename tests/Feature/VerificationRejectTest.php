<?php

namespace Tests\Feature;

use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Mail;
use App\Mail\VerificationRejectedMail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VerificationRejectTest extends TestCase
{
    // use RefreshDatabase; // Use if available, otherwise manual cleanup

    public function test_admin_can_reject_user()
    {
        Mail::fake();

        // Ensure roles exist
        if (!Role::where('name', 'admin')->exists()) {
            Role::create(['name' => 'admin']);
        }

        // Create Admin
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Create Applicant
        $applicant = User::factory()->create([
            'verifikasi' => false,
            'rejection_reason' => null,
        ]);

        // Login as Admin
        $this->actingAs($admin);

        // Perform Reject Action
        $response = $this->post(route('verification-queue.reject', $applicant->id), [
            'reason' => 'Foto tidak jelas',
        ]);

        // Assert response
        if ($response->status() === 404) {
            dump('404 Error encountered');
            // Check if user exists
            dump('Applicant exists:', User::find($applicant->id) !== null);
        }

        $response->assertStatus(302); // Should redirect back
        $response->assertSessionHas('success');

        // Assert Mail Sent
        Mail::assertSent(VerificationRejectedMail::class, function ($mail) use ($applicant) {
            return $mail->hasTo($applicant->email) &&
                   $mail->reason === 'Foto tidak jelas';
        });

        // Assert User Updated
        $this->assertEquals('Foto tidak jelas', $applicant->fresh()->rejection_reason);
    }
}
