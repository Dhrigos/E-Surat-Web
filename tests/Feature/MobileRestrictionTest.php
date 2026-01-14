<?php

test('mobile device user agent is redirected to download app', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    ])->get('/');

    $response->assertRedirect(route('download-app'));
});

test('android device user agent is redirected to download app', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36',
    ])->get('/');

    $response->assertRedirect(route('download-app'));
});

test('desktop user agent is allowed', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Safari/537.36',
    ])->get('/login'); // Redirect to login is expected for unauthenticated users, meaning access to the app is allowed (not blocked by middleware)
    
    // It might redirect to login, but crucially it should NOT redirect to download-app
    $response->assertStatus(200); // Because /login is the destination for unauthenticated users on root '/' is redirect to login
});

test('download app page is accessible by anyone', function () {
    $response = $this->get(route('download-app'));
    $response->assertStatus(200);
});

test('api requests are allowed even with mobile user agent', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept' => 'application/json',
    ])->postJson('/api/validate/register', []); // Simulating an API call

    // Should not be redirect (302), likely 422 validation error or 200 ok
    $response->assertStatus(422); 
});

test('android webview user agent is allowed', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Linux; Android 10; SM-A205U; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/88.0.4324.181 Mobile Safari/537.36',
    ])->get('/login');

    $response->assertStatus(200);
});

test('custom app user agent is allowed', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'E-Surat/1.0 Mobile',
    ])->get('/login');

    $response->assertStatus(200);
});
