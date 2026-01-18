<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class MobileAccessTest extends TestCase
{
    /**
     * Test desktop users are not restricted.
     */
    public function test_desktop_users_can_access_home()
    {
        $response = $this->get('/');

        // Should redirect to login (or dashboard), but NOT download-app
        $response->assertStatus(302);
        $response->assertRedirect('login');
    }

    /**
     * Test mobile users are restricted.
     */
    public function test_mobile_users_are_redirected_to_download_app()
    {
        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        ])->get('/');

        $response->assertRedirect(route('download-app'));
    }

    /**
     * Test mobile bypass route works.
     */
    public function test_bypass_route_sets_cookie_and_redirects()
    {
        $response = $this->get(route('mobile.bypass'));

        $response->assertRedirect(route('login'));
        $response->assertCookie('mobile_access_bypass', 'true');
    }

    /**
     * Test mobile users with bypass cookie are NOT restricted.
     */
    public function test_mobile_users_with_cookie_can_access()
    {
        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        ])->withCookie('mobile_access_bypass', 'true')
          ->get('/');

        $response->assertStatus(302);
        $response->assertRedirect('login');
    }

    /**
     * Test mobile users with X-Capacitor-App header can access.
     */
    public function test_mobile_users_with_app_header_can_access()
    {
        $response = $this->withHeaders([
            'User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
            'X-Capacitor-App' => 'true',
        ])->get('/');

        $response->assertStatus(302);
        $response->assertRedirect('login');
    }
}
