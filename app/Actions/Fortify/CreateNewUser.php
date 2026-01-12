<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', Rule::unique(User::class)],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'phone_number' => ['required', 'string', 'max:255'],
            'password' => $this->passwordRules(),
            'otp' => ['required', 'string', function ($attribute, $value, $fail) use ($input) {
                if (!isset($input['email'])) {
                    return;
                }
                $cachedOtp = \Illuminate\Support\Facades\Cache::get('otp_reg_' . $input['email']);
                if (!$cachedOtp || $cachedOtp != $value) {
                    $fail('Kode OTP tidak valid atau sudah kadaluarsa.');
                }
            }],
        ])->validate();

        // Clear OTP after successful validation
        if (isset($input['email'])) {
            \Illuminate\Support\Facades\Cache::forget('otp_reg_' . $input['email']);
        }

        return User::create([
            'name' => $input['name'],
            'username' => $input['username'],
            'email' => $input['email'],
            'phone_number' => $input['phone_number'],
            'password' => Hash::make($input['password']),
            'is_active' => true,
        ]);
    }
}
