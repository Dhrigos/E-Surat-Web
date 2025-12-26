<?php

use App\Models\User;
use App\Models\Letter;
use App\Models\Disposition;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Setup roles and permissions
    $role = Role::firstOrCreate(['name' => 'super-admin']);
    $user = User::factory()->verified()->create();
    $user->assignRole($role);
    $this->actingAs($user);
});

test('can list dispositions', function () {
    $response = $this->get(route('dispositions.index'));

    $response->assertStatus(200);
});

test('can create a disposition', function () {
    $letter = Letter::factory()->create(['created_by' => auth()->id()]);
    $recipient = User::factory()->create();

    $response = $this->post(route('dispositions.store', $letter), [
        'recipient_id' => $recipient->id,
        'instruction' => 'Follow up',
        'note' => 'Please check this immediately',
        'due_date' => now()->addDays(3)->format('Y-m-d'),
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('dispositions', [
        'letter_id' => $letter->id,
        'recipient_id' => $recipient->id,
        'instruction' => 'Follow up',
    ]);
});
