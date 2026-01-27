<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;

use Tests\TestCase;

class StaffVerificationTest extends TestCase
{


    public function test_verifying_user_records_admin_and_timestamp()
    {
        // 1. Create a Super Admin who will verify
        $admin = User::factory()->verified()->create();
        $adminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $admin->assignRole($adminRole);
        
        // 2. Create a User to be verified
        $user = User::factory()->create([
            'verifikasi' => '0',
            'is_active' => false,
        ]);
        
        // 3. Act as Admin and toggle status
        $response = $this->actingAs($admin)
            ->put(route('staff.toggle-status', $user->id));
            
        // 4. Assert
        $response->assertRedirect();
        
        $user->refresh();
        $this->assertTrue((bool)$user->verifikasi);
        $this->assertTrue($user->is_active);
        
        // 5. Verify Timestamp and Verifier are recorded
        $this->assertNotNull($user->verified_at, 'verified_at should be set');
        $this->assertEquals($admin->id, $user->verified_by, 'verified_by should be set to admin id');
        $this->assertNotNull($user->verification_duration, 'verification_duration should be set');
    }
}
