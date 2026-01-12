<?php

namespace Database\Seeders;

use App\Models\JabatanRole;
use Illuminate\Database\Seeder;

class JabatanRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            'ANGGOTA',
            'KETUA',
            'WAKIL KETUA',
            'SEKRETARIS',
            'STAFF',
            'WAKIL',
            'STAFF AHLI',
            'STAFF KHUSUS',
        ];

        foreach ($roles as $role) {
            JabatanRole::firstOrCreate(
                ['nama' => $role],
                ['is_active' => true]
            );
        }
    }
}
