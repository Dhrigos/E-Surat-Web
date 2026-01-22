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
            'member_type' => ['required', 'string', 'max:255', Rule::in(['anggota', 'calon_anggota'])],
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

        $user = User::create([
            'name' => $input['name'],
            'member_type' => $input['member_type'],
            'username' => $input['username'],
            'email' => $input['email'],
            'phone_number' => $input['phone_number'],
            'password' => Hash::make($input['password']),
            'is_active' => true,
        ]);

        // Assign Role based on member_type
        // Anggota -> Staff
        // Calon Anggota -> Calon
        $roleName = match ($input['member_type']) {
            'anggota' => 'staff',
            'calon_anggota' => 'calon',
            default => 'user',
        };

        // Ensure role exists (safe guard)
        $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        $user->assignRole($role);

        return $user;
    }
}
