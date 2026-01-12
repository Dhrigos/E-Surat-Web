<?php

use App\Models\Location;
use App\Models\LocationSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class)->beforeEach(function () {
    config(['inertia.testing.ensure_pages_exist' => false]);
});

test('authenticated user can view location map', function () {
    $user = User::factory()->verified()->create();

    $response = $this->actingAs($user)
        ->get(route('location.index'));

    $response->assertStatus(200)
        ->assertInertia(fn ($page) => $page
            ->component('Location/LocationMap')
            ->has('activeUsers')
        );
});

test('user can store location', function () {
    $user = User::factory()->verified()->create();

    $response = $this->actingAs($user)
        ->postJson(route('location.store'), [
            'latitude' => -6.2088,
            'longitude' => 106.8456,
            'accuracy' => 10.5,
            'altitude' => 50.0,
            'speed' => 5.5,
            'heading' => 180.0,
            'metadata' => ['device' => 'test-device'],
        ]);

    $response->assertCreated()
        ->assertJson(['success' => true]);

    $this->assertDatabaseHas('user_locations', [
        'user_id' => $user->id,
        'latitude' => -6.2088,
        'longitude' => 106.8456,
    ]);
});

test('user cannot store invalid location', function () {
    $user = User::factory()->verified()->create();

    $response = $this->actingAs($user)
        ->postJson(route('location.store'), [
            'latitude' => 900.0, // Invalid
            'longitude' => 106.8456,
        ]);

    $response->assertUnprocessable();
});

test('user can get current location', function () {
    $user = User::factory()->verified()->create();
    Location::factory()->create([
        'user_id' => $user->id,
        'latitude' => -6.2000,
        'longitude' => 106.8000,
    ]);

    $response = $this->actingAs($user)
        ->getJson(route('location.current'));

    $response->assertOk()
        ->assertJsonPath('data.latitude', '-6.20000000') // Decimal:8 cast returns string
        ->assertJsonPath('data.longitude', '106.80000000');
});

test('user can start tracking session', function () {
    $user = User::factory()->verified()->create();

    $response = $this->actingAs($user)
        ->postJson(route('location.session.start'), [
            'purpose' => 'Test Session',
        ]);

    $response->assertCreated()
        ->assertJsonPath('data.purpose', 'Test Session');

    $this->assertDatabaseHas('location_sessions', [
        'user_id' => $user->id,
        'purpose' => 'Test Session',
        'ended_at' => null,
    ]);
});

test('user can end tracking session', function () {
    $user = User::factory()->verified()->create();
    $session = LocationSession::create([
        'user_id' => $user->id,
        'started_at' => now(),
    ]);

    $response = $this->actingAs($user)
        ->postJson(route('location.session.end', $session->id));

    $response->assertOk();

    $this->assertNotNull($session->fresh()->ended_at);
});

test('user can view location history', function () {
    $user = User::factory()->verified()->create();
    Location::factory()->count(5)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)
        ->getJson(route('location.history'));

    $response->assertOk()
        ->assertJsonCount(5, 'data');
});
