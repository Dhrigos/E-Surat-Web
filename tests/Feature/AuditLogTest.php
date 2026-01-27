<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ActivityLog;

use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Spatie\Permission\Models\Role;

class AuditLogTest extends TestCase
{


    public function setUp(): void
    {
        parent::setUp();
        // Create a role to assign to user to avoid permission errors if any
        Role::firstOrCreate(['name' => 'admin']);
    }

    public function test_activity_is_logged_when_model_is_created()
    {
        $admin = User::factory()->create();
        $this->actingAs($admin);

        $user = User::factory()->create();

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'create',
            'subject_type' => get_class($user),
            'subject_id' => $user->id,
            'user_id' => $admin->id,
        ]);
    }

    public function test_activity_is_logged_when_model_is_updated()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $user->update(['name' => 'New Name']);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'update',
            'subject_type' => get_class($user),
            'subject_id' => $user->id,
            'user_id' => $user->id,
            'description' => 'Updated User',
        ]);
    }

    public function test_activity_is_logged_when_model_is_deleted()
    {
        $admin = User::factory()->create();
        $this->actingAs($admin);

        $user = User::factory()->create();
        $user->delete();

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'delete',
            'subject_type' => get_class($user),
            'subject_id' => $user->id,
            'user_id' => $admin->id,
            'description' => 'Deleted User',
        ]);
    }
}
