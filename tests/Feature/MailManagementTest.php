<?php

use App\Models\User;
use App\Models\Letter;
use App\Models\LetterType;
use App\Models\Staff;
use App\Models\Jabatan;
use App\Models\UnitKerja;
use App\Models\Pangkat;
use App\Models\StatusKeanggotaan;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Setup roles and permissions
    $role = Role::firstOrCreate(['name' => 'super-admin']);
    $user = User::factory()->verified()->create();
    $user->assignRole($role);
    $this->actingAs($user);

    // Setup Master Data for Staff
    $this->jabatan = Jabatan::factory()->create();
    $this->unit = UnitKerja::factory()->create();
    $this->pangkat = Pangkat::firstOrCreate(['nama' => 'Juru', 'kode' => 'I/a', 'tingkat' => 1]);
    $this->status = StatusKeanggotaan::firstOrCreate(['nama' => 'Tetap']);

    // Create Staff for the user
    Staff::factory()->create([
        'user_id' => $user->id,
        'jabatan_id' => $this->jabatan->id,
        'unit_kerja_id' => $this->unit->id,
        'pangkat_id' => $this->pangkat->id,
        'status_keanggotaan_id' => $this->status->id,
    ]);
});

test('can list letters', function () {
    Letter::factory()->count(3)->create(['created_by' => auth()->id()]);

    $response = $this->get(route('letters.index'));

    $response->assertStatus(200);
});

test('can create a letter', function () {
    $recipient = User::factory()->create();
    $letterType = LetterType::factory()->create();

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
        'approver_id' => auth()->id(),
        'action_type' => 'approve',
    ]);

    $response = $this->post(route('letters.store'), [
        'subject' => 'Test Letter',
        'priority' => 'normal',
        'category' => 'internal',
        'mail_type' => 'out',
        'letter_type_id' => $letterType->id,
        'content' => 'Content of the letter',
        'recipients' => [
            ['type' => 'user', 'id' => $recipient->id]
        ],
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('letters', ['subject' => 'Test Letter']);
    $this->assertDatabaseHas('letter_recipients', ['recipient_id' => $recipient->id]);
});

test('can view a letter', function () {
    $letter = Letter::factory()->create(['created_by' => auth()->id()]);

    $response = $this->get(route('letters.show', $letter));

    $response->assertStatus(200);
});

test('can update letter status (approve)', function () {
    $letter = Letter::factory()->create(['status' => 'pending']);
    
    // Create an approver that matches the user's jabatan
    \App\Models\LetterApprover::create([
        'letter_id' => $letter->id,
        'approver_id' => $this->jabatan->nama, // Match user's position
        'order' => 1,
        'status' => 'pending',
    ]);
    
    $response = $this->put(route('letters.update-status', $letter), [
        'status' => 'approved',
        'remarks' => 'Approved',
    ]);

    $response->assertRedirect();
});

test('can archive a letter', function () {
    $letter = Letter::factory()->create(['created_by' => auth()->id()]);

    $response = $this->put(route('letters.archive', $letter));

    $response->assertRedirect();
    $this->assertDatabaseHas('letters', ['id' => $letter->id, 'status' => 'archived']);
});

test('can star a letter', function () {
    $letter = Letter::factory()->create(['created_by' => auth()->id(), 'is_starred' => false]);

    $response = $this->put(route('letters.toggle-star', $letter));

    $response->assertRedirect();
    $this->assertDatabaseHas('letters', ['id' => $letter->id, 'is_starred' => true]);
});
