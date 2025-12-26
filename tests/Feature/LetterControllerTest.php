<?php

namespace Tests\Feature;

use App\Models\Letter;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class LetterControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_store_creates_letter()
    {
        $user = User::factory()->create();
        $letterType = \App\Models\LetterType::factory()->create();
        
        // Create Workflow for the letter type
        $workflow = \App\Models\ApprovalWorkflow::create([
            'letter_type_id' => $letterType->id,
            'name' => 'Test Workflow',
            'description' => 'Test',
            'entity_type' => 'App\Models\Letter',
        ]);

        \App\Models\ApprovalWorkflowStep::create([
            'workflow_id' => $workflow->id,
            'order' => 1,
            'approver_type' => 'user',
            'approver_id' => $user->id, // Self approval for simplicity or another user
            'action_type' => 'approve',
        ]);

        $response = $this->actingAs($user)->post(route('letters.store'), [
            'subject' => 'Test Letter',
            'priority' => 'normal',
            'category' => 'internal',
            'mail_type' => 'out',
            'letter_type_id' => $letterType->id,
            'content' => 'Content',
            'recipients' => [
                ['type' => 'user', 'id' => User::factory()->create()->id]
            ],
        ]);

        if (session('error')) {
            dump(session('error'));
        }
        if (session('errors')) {
            dump(session('errors')->all());
        }
        $response->assertRedirect();
        $this->assertDatabaseHas('letters', [
            'subject' => 'Test Letter',
            'created_by' => $user->id,
        ]);
    }
}
