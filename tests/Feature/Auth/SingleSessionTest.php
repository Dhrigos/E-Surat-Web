<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SingleSessionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Use database driver
        config(['session.driver' => 'database']);
        config(['session.lifetime' => 120]);
        config(['session.expire_on_close' => false]);
        config(['session.encrypt' => false]);
        config(['session.files' => storage_path('framework/sessions')]);
        config(['session.connection' => null]);
        config(['session.table' => 'sessions']);
        config(['session.store' => null]);
        config(['session.cookie' => 'laravel_session']);
        config(['session.path' => '/']);
        config(['session.domain' => null]);
        config(['session.secure' => null]);
        config(['session.http_only' => true]);
        config(['session.same_site' => 'lax']);
    }

    public function test_double_login_resets_ekyc_and_logs_out_both_devices()
    {
        $user = User::factory()->create([
            'password' => bcrypt('password'),
            'ekyc_verified_at' => now(), // User starts as verified
        ]);

        // 1. First Login (Device A)
        $response1 = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);
        
        $response1->assertRedirect();
        $this->assertAuthenticatedAs($user);
        
        // Verify first session exists
        $this->assertEquals(1, DB::table('sessions')->where('user_id', $user->id)->count());

        // 2. Second Login (Device B) - Simulate by flushing cookies
        $this->flushSession(); 
        
        $response2 = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        // Expect Validation Error (Double Login Detected)
        $response2->assertSessionHasErrors(['login_error']);
        
        // Verify User is NOT Authenticated (Login blocked)
        $this->assertGuest();

        // 3. Verify Constraints
        $user->refresh();
        
        // A. eKYC should be reset to null
        $this->assertNull($user->ekyc_verified_at, 'eKYC status should be reset to NULL.');

        // B. ALL sessions should be deleted from database (Both Device A and B are out)
        $this->assertEquals(0, DB::table('sessions')->where('user_id', $user->id)->count(), 'All sessions should be destroyed.');
    }
}
