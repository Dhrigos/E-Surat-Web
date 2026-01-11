<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Jabatan;
use App\Models\Pangkat;
use App\Models\StatusKeanggotaan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Staff>
 */
class StaffFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'jabatan_id' => Jabatan::factory(),
            // UnitKerja removed
            'pangkat_id' => Pangkat::first()?->id ?? Pangkat::create(['nama' => 'Juru', 'kode' => 'I/a', 'tingkat' => 1])->id,
            'status_keanggotaan_id' => StatusKeanggotaan::first()?->id ?? StatusKeanggotaan::create(['nama' => 'Tetap'])->id,
            'status' => 'active',
            'nip' => $this->faker->numerify('##########'),
            'tanggal_masuk' => now(),
            'manager_id' => User::factory(),
        ];
    }
}
