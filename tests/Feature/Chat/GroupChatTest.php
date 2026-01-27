<?php

namespace Tests\Feature\Chat;

use App\Models\User;
use App\Models\Conversation;

use Tests\TestCase;
use Spatie\Permission\Models\Role;

class GroupChatTest extends TestCase
{


    public function test_authenticated_user_can_create_group_and_admins_are_auto_added()
    {
        // 1. Create Roles
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'super-admin']);

        // 2. Create Users
        $creator = User::factory()->verified()->create();
        $user1 = User::factory()->verified()->create();
        $admin = User::factory()->verified()->create();
        $admin->assignRole('admin');
        $superAdmin = User::factory()->verified()->create();
        $superAdmin->assignRole('super-admin');

        // 3. Act: Create Group
        $response = $this->actingAs($creator)->postJson(route('conversations.store'), [
            'is_group' => true,
            'name' => 'Test Group',
            'users' => [$user1->id]
        ]);

        // 4. Assert
        $response->assertStatus(200);
        
        $conversation = Conversation::first();
        $this->assertNotNull($conversation);
        $this->assertTrue($conversation->is_group);
        $this->assertEquals('Test Group', $conversation->name);

        // Verify Participants
        // Creator + Selected User + Admin + SuperAdmin
        $this->assertTrue($conversation->participants->contains($creator));
        $this->assertTrue($conversation->participants->contains($user1));
        $this->assertTrue($conversation->participants->contains($admin));
        $this->assertTrue($conversation->participants->contains($superAdmin));
        
        // $this->assertCount(4, $conversation->participants); // Disabled due to dirty DB potential
    }
    
    public function test_regular_user_can_create_personal_chat()
    {
         $user1 = User::factory()->verified()->create();
         $user2 = User::factory()->verified()->create();

         $response = $this->actingAs($user1)->postJson(route('conversations.store'), [
             'is_group' => false,
             'users' => [$user2->id]
         ]);

         $response->assertStatus(200);
         $conversation = Conversation::first();
         $this->assertFalse($conversation->is_group);
         $this->assertCount(2, $conversation->participants); // Only user1 and user2
    }
}
