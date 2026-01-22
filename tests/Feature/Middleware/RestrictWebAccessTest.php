<?php

use App\Http\Middleware\RestrictWebAccess;
use Illuminate\Support\Facades\Route;

beforeEach(function () {
    // Define a test route that is protected by the middleware
    Route::middleware([RestrictWebAccess::class])->get('/test-middleware', function () {
        return 'Accessed Web';
    });

    // Define the download app route to handle the redirect
    Route::get('/download-app', function () {
        return 'Download App Page';
    })->name('download-app');
});

test('android tablet accesses web', function () {
    // Android Tablet UA (no "Mobile" keyword usually, or specific tablet UA)
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
    ])->get('/test-middleware');

    $response->assertStatus(200);
    $response->assertSee('Accessed Web');
});

test('android phone redirects to download app', function () {
    // Android Phone UA (includes "Mobile")
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36',
    ])->get('/test-middleware');

    // It should redirect
    $response->assertRedirect(route('download-app'));
});

test('ipad accesses web', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    ])->get('/test-middleware');

    // iPad often has 'Mobile' in UA but we treat it as tablet/web usually
    // or specifically exclude 'iPad' from the block.
    $response->assertStatus(200);
    $response->assertSee('Accessed Web');
});

test('iphone redirects to download app', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    ])->get('/test-middleware');

    $response->assertRedirect(route('download-app'));
});

test('desktop accesses web', function () {
    $response = $this->withHeaders([
        'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    ])->get('/test-middleware');

    $response->assertStatus(200);
    $response->assertSee('Accessed Web');
});
