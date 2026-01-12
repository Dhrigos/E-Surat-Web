<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LocationSession>
 */
class LocationSessionFactory extends Factory
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
            'started_at' => now(),
            'ended_at' => null,
            'purpose' => $this->faker->sentence(),
            'metadata' => ['task_id' => $this->faker->randomNumber()],
        ];
    }
}
