<?php

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertStatus(200);
});

test('new users can register', function () {
    $this->withoutExceptionHandling();
    \Illuminate\Support\Facades\Cache::shouldReceive('get')
        ->with('otp_test@example.com')
        ->andReturn('123456');

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'username' => 'testuser',
        'email' => 'test@example.com',
        'phone_number' => '08123456789',
        'password' => 'password',
        'password_confirmation' => 'password',
        'otp' => '123456',
    ]);

    // $this->assertAuthenticated();
    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    $response->assertRedirect(route('dashboard', absolute: false));
});