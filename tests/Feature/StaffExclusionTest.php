<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffExclusionTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_is_excluded_from_staff_list()
    {
        // Create a super-admin user
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        $superAdmin = User::factory()->create();
        $superAdmin->assignRole($superAdminRole);

        // Create a normal staff user
        $staffRole = Role::firstOrCreate(['name' => 'staff']);
        $staffUser = User::factory()->create();
        $staffUser->assignRole($staffRole);

        // Authenticate as a user who can view the staff list (e.g., another super-admin or authorized user)
        // Adjust this if there are specific permissions needed to view the list
        $this->actingAs($superAdmin);

        $response = $this->get(route('staff.index'));

        $response->assertStatus(200);

        // Assert that the super-admin is NOT in the staff list
        // Note: The staff list is passed as 'staff' prop to the Inertia page
        // We need to check the props
        $staffList = $response->viewData('page')['props']['staff'];

        $superAdminFound = collect($staffList)->contains('id', $superAdmin->id);
        $staffFound = collect($staffList)->contains('id', $staffUser->id);

        $this->assertFalse($superAdminFound, 'Super Admin should be excluded from staff list');
        $this->assertTrue($staffFound, 'Regular staff should be included in staff list');
    }

    public function test_pending_verification_users_are_excluded_from_staff_list()
    {
        // 1. User Pending Verification (In Queue)
        // verifikasi = false, rejection_reason = null
        $pendingUser = User::factory()->create([
            'verifikasi' => false,
            'rejection_reason' => null,
            'name' => 'Pending User'
        ]);
        // Ideally should have detail too as controller might depend on it, 
        // but current controller query only checks user table columns for exclusion, 
        // although it eager loads detail. Let's make it robust.
        // The controller didn't enforce detail existence for the query itself, only relationships.
        
        // 2. User User Verified (Active)
        $verifiedUser = User::factory()->create([
            'verifikasi' => true,
            'rejection_reason' => null,
            'name' => 'Verified User'
        ]);

        // 3. User Rejected (Not in Queue, handled)
        $rejectedUser = User::factory()->create([
            'verifikasi' => false,
            'rejection_reason' => 'Bad photo',
            'name' => 'Rejected User'
        ]);

        // Admin to view
        $admin = User::factory()->create();
        $admin->assignRole(Role::firstOrCreate(['name' => 'admin']));

        $this->actingAs($admin);

        $response = $this->get(route('staff.index'));

        $response->assertStatus(200);

        $staffList = $response->viewData('page')['props']['staff'];
        $staffCollection = collect($staffList);

        $this->assertFalse($staffCollection->contains('id', $pendingUser->id), 'Pending user should be excluded');
        $this->assertTrue($staffCollection->contains('id', $verifiedUser->id), 'Verified user should be included');
        $this->assertTrue($staffCollection->contains('id', $rejectedUser->id), 'Rejected user should be included (handled)');
    }
}
