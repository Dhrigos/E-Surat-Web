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

    $response = $this->post(route('verification-queue.verify', $userToVerify));

    $response->assertRedirect();
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
