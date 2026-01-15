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
}
