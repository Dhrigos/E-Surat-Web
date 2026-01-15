<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiValidationTest extends TestCase
{
    use RefreshDatabase;

    public function test_nik_validation_returns_exists_true_for_duplicate()
    {
        // Create user A with specific NIK
        $userA = User::factory()->create();
        UserDetail::create([
             'user_id' => $userA->id,
             'nik' => '1234567890123456',
             // Add other required fields if necessary, assuming nullable or default
             'jabatan_id' => 1, 
             'jabatan_role_id' => 1,
             'golongan_id' => 1,
             'pangkat_id' => 1,
             'status_keanggotaan_id' => 1,
             'mako_id' => 1,
             'nomor_kta' => 'KTA001',
             'nia_nrp' => 'NRP001',
        ]);

        // Create user B (current user)
        $userB = User::factory()->create();

        // Act as user B and check if user A's NIK exists
        $response = $this->actingAs($userB)
                         ->postJson(route('api.validate.nik'), [
                             'nik' => '1234567890123456'
                         ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'exists' => true,
                     'message' => 'NIK sudah terdaftar'
                 ]);
    }

    public function test_nrp_validation_returns_exists_true_for_duplicate()
    {
        // Create user A with specific NRP
        $userA = User::factory()->create();
        UserDetail::create([
             'user_id' => $userA->id,
             'nik' => '9999999999999999',
             'nia_nrp' => '12345678901234',
             'jabatan_id' => 1, 
             'jabatan_role_id' => 1,
             'golongan_id' => 1,
             'pangkat_id' => 1,
             'status_keanggotaan_id' => 1,
             'mako_id' => 1,
             'nomor_kta' => 'KTA001',
        ]);

        // Create user B
        $userB = User::factory()->create();

        // Act as user B and check validation
        $response = $this->actingAs($userB)
                         ->postJson(route('api.validate.nia-nrp'), [
                             'nia_nrp' => '12345678901234'
                         ]);

        $response->assertStatus(200)
                 ->assertJson([
                     'exists' => true,
                     'message' => 'NRP sudah terdaftar'
                 ]);
    }

    public function test_validation_returns_false_for_own_data()
    {
        $user = User::factory()->create();
        UserDetail::create([
             'user_id' => $user->id,
             'nik' => '1234567890123456',
             'nia_nrp' => '12345678901234',
             'jabatan_id' => 1, 
             'jabatan_role_id' => 1,
             'golongan_id' => 1,
             'pangkat_id' => 1,
             'status_keanggotaan_id' => 1,
             'mako_id' => 1,
             'nomor_kta' => 'KTA001',
        ]);

        // User checks their own NIK/NRP (e.g. while editing)
        $response = $this->actingAs($user)
                         ->postJson(route('api.validate.nik'), [
                             'nik' => '1234567890123456'
                         ]);

        $response->assertStatus(200)
                 ->assertJson(['exists' => false]);
    }
}
