<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\LetterType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Letter>
 */
class LetterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'created_by' => User::factory(),
            'letter_type_id' => LetterType::factory(),
            'subject' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'content' => $this->faker->text(),
            'status' => 'pending',
            'priority' => 'normal',
            'category' => 'internal',
            'mail_type' => 'in',
        ];
    }
}
