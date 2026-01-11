<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Ensure Super Admin exists for root manager
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@bacadnas.kemhan.go.id'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password'),
                'is_active' => true,
                'verifikasi' => true,
            ]
        );
        $superAdmin->syncRoles(['super-admin']);

        // Create Super Admin Jabatan if not exists
        $superAdminJabatan = Jabatan::firstOrCreate(['nama' => 'Super Administrator'], ['is_active' => true]);
    }
}
