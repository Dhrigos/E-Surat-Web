<?php

namespace Tests\Feature;

use App\Models\ApprovalWorkflow;
use App\Models\ApprovalWorkflowStep;
use App\Models\Jabatan;
use App\Models\Letter;
use App\Models\LetterApprover;
use App\Models\Staff;
use App\Models\User;
use App\Services\WorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class WorkflowServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $workflowService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->workflowService = new WorkflowService();
    }

    public function test_start_workflow_creates_approvers()
    {
        // 1. Setup Data
        $creator = User::factory()->create();
        
        $jabatan = Jabatan::create([
            'nama' => 'Kepala Dinas',
            'kode' => 'KADIS',
        ]);

        $approverUser = User::factory()->create();
        
        // Assign approverUser to the jabatan
        // Assign approverUser to the jabatan
        Staff::create([
            'user_id' => $approverUser->id,
            'jabatan_id' => $jabatan->id,
            'name' => 'Budi', // Changed 'nama' to 'name' based on factory
            'email' => 'budi@example.com', // Required field
            'nip' => '1234567890',
            'status' => 'active',
            'manager_id' => $creator->id, // Required field
            // Add other required fields from factory if needed, e.g. unit_kerja_id, pangkat_id, status_keanggotaan_id
            'unit_kerja_id' => \App\Models\UnitKerja::factory()->create()->id,
            'pangkat_id' => \App\Models\Pangkat::factory()->create()->id,
            'status_keanggotaan_id' => \App\Models\StatusKeanggotaan::factory()->create()->id,
            'tanggal_masuk' => now(),
        ]);

        // Create Workflow
        $letterType = \App\Models\LetterType::factory()->create();
        $workflow = ApprovalWorkflow::create([
            'entity_type' => 'App\Models\Letter',
            'name' => 'Test Workflow',
            'description' => 'Test',
            'letter_type_id' => $letterType->id,
        ]);

        // Create Workflow Step
        ApprovalWorkflowStep::create([
            'workflow_id' => $workflow->id,
            'order' => 1,
            'approver_type' => 'jabatan',
            'approver_id' => $jabatan->id,
            'action_type' => 'approve',
        ]);

        // Create Letter
        // Create Letter
        $letter = \App\Models\Letter::factory()->create([
            'status' => 'draft',
            'letter_number' => '123/TEST/2025',
            'subject' => 'Test Letter',
            'description' => 'Test Description',
            'content' => 'Content',
            'created_by' => $creator->id,
            'date' => now(),
        ]);

        // 2. Execute
        $this->workflowService->startWorkflow($letter);

        // 3. Assert
        $this->assertDatabaseHas('letters', [
            'id' => $letter->id,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('letter_approvers', [
            'letter_id' => $letter->id,
            'approver_id' => $jabatan->id, // Stored as string ID
            'user_id' => $approverUser->id, // Should be resolved
            'status' => 'pending',
            'order' => 1,
        ]);
    }
}
