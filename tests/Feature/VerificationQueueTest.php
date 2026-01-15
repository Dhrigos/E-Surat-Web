<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $role = Role::firstOrCreate(['name' => 'admin']);
    $user = User::factory()->verified()->create();
    $user->assignRole($role);
    $this->actingAs($user);
});

test('can list verification queue', function () {
    $response = $this->get(route('verification-queue.index'));
    $response->assertStatus(200);
});

test('can verify user', function () {
    $userToVerify = User::factory()->create();
    
    // Create Detail for the user to trigger Staff creation logic
    $jabatan = \App\Models\Jabatan::firstOrCreate(['nama' => 'Test Jabatan', 'is_active' => true]);
    $pangkat = \App\Models\Pangkat::firstOrCreate(['nama' => 'Test Pangkat', 'tingkat' => 1]);
    
    $userToVerify->detail()->create([
       'nia_nrp' => '123456',
       'nik' => '987654',
       'jabatan_id' => $jabatan->id,
       'pangkat_id' => $pangkat->id,
    ]);

    $response = $this->post(route('verification-queue.verify', $userToVerify));

    $response->assertRedirect();
    
    // Assert staff was created
    $this->assertDatabaseHas('staff', [
        'user_id' => $userToVerify->id,
        'email' => $userToVerify->email,
        'pangkat_id' => $pangkat->id,
    ]);
});

test('it records verification duration', function () {
    // 1. Create user
    $userToVerify = User::factory()->create();

    // 2. Lock the user
    $response = $this->post(route('verification-queue.lock', $userToVerify));
    $response->assertRedirect();

    // 3. Fast forward time by 1 hour (3600 seconds)
    $this->travel(1)->hour();

    // 4. Refresh user to get updated lock timestamp
    $userToVerify->refresh();

    expect($userToVerify->verification_locked_at)->not->toBeNull();

    // 5. Verify the user
    $response = $this->post(route('verification-queue.verify', $userToVerify));
    $response->assertRedirect();

    // 6. Refresh and assert duration was recorded
    $userToVerify->refresh();
    expect($userToVerify->verification_duration)->toBe(3600);
    expect($userToVerify->verification_locked_at)->toBeNull();
});
