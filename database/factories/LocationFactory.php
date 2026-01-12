<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Location>
 */
class LocationFactory extends Factory
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
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            'accuracy' => $this->faker->randomFloat(2, 5, 20),
            'altitude' => $this->faker->randomFloat(2, 0, 100),
            'speed' => $this->faker->randomFloat(2, 0, 30),
            'heading' => $this->faker->randomFloat(2, 0, 360),
            'captured_at' => now(),
            'metadata' => ['device' => 'test-device'],
        ];
    }
}
