<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $role = Role::firstOrCreate(['name' => 'manager']);
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
