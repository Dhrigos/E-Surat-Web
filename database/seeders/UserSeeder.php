<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UnitKerja;
use App\Models\Jabatan;
use App\Models\Staff;
use App\Models\Pangkat;
use App\Models\StatusKeanggotaan;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('Seeding Users and Staff...');

        // 1. Create Specific Units for Testing (if not exists)
        $units = [
            'Sekretariat' => 'SEK',
            'Bidang Perencanaan' => 'REN',
            'Bidang Keuangan' => 'KEU',
        ];

        $unitModels = [];
        foreach ($units as $name => $code) {
            $unitModels[$code] = UnitKerja::firstOrCreate(
                ['nama' => $name],
                ['kode' => $code, 'is_active' => true]
            );
        }

        // Fetch Master Data for Staff
        $pangkat = Pangkat::first();
        $statusKeanggotaan = StatusKeanggotaan::first();
        
        // Ensure Super Admin exists for root manager
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@bacadnas.kemhan.go.id'],
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'password' => Hash::make('password'),
                'is_active' => true,
                'verifikasi' => true,
                'nip_nik' => '12345678',
                'nia_nrp' => '12345678',
            ]
        );
        $superAdmin->syncRoles(['super-admin']);

        // Create Super Admin Jabatan if not exists
        $superAdminJabatan = Jabatan::firstOrCreate(['nama' => 'Super Administrator'], ['kode' => 'SA', 'is_active' => true]);
        
        // Create Detail for Super Admin to ensure Jabatan is displayed
        \App\Models\UserDetail::updateOrCreate(
            ['user_id' => $superAdmin->id],
            [
                'jabatan_id' => $superAdminJabatan->id,
                'unit_kerja_id' => $unitModels['SEK']->id, // Default to Sekretariat
                'pangkat_id' => $pangkat->id,
                'status_keanggotaan_id' => $statusKeanggotaan->id,
                'nik' => '1234567890123456',
                'nia_nrp' => '12345678',
                'tempat_lahir' => 'Jakarta',
                'tanggal_lahir' => '1980-01-01',
                'jenis_kelamin' => 'Laki-laki',
                'alamat_domisili_lengkap' => 'Kantor Pusat',
            ]
        );

        // 2. Create Users with Staff Records (Crucial for Approval)
        // We need a hierarchy: Staff -> Kasubag -> Kabid -> Sekdin -> Kadis

        // A. Kepala Dinas (Top Level) - Managed by Super Admin
        $kadisJabatan = Jabatan::where('nama', 'Kepala Dinas')->first();
        $kadis = $this->createUser('kadis', 'Kepala Dinas', $kadisJabatan, $unitModels['SEK'], $pangkat, $statusKeanggotaan, $superAdmin->id);

        // B. Sekretaris Dinas - Managed by Kadis
        $sekdinJabatan = Jabatan::where('nama', 'Sekretaris Dinas')->first();
        $sekdin = $this->createUser('sekdin', 'Sekretaris Dinas', $sekdinJabatan, $unitModels['SEK'], $pangkat, $statusKeanggotaan, $kadis->id);

        // C. Kepala Bidang Perencanaan - Managed by Sekdin
        $kabidRenJabatan = Jabatan::where('nama', 'Kepala Bidang')->first();
        $kabidRen = $this->createUser('kabid.ren', 'Kabid Perencanaan', $kabidRenJabatan, $unitModels['REN'], $pangkat, $statusKeanggotaan, $sekdin->id);

        // D. Kepala Sub Bagian (in Perencanaan) - Managed by Kabid
        $kasubagRenJabatan = Jabatan::where('nama', 'Kepala Sub Bagian')->first();
        $kasubagRen = $this->createUser('kasubag.ren', 'Kasubag Perencanaan', $kasubagRenJabatan, $unitModels['REN'], $pangkat, $statusKeanggotaan, $kabidRen->id);

        // E. Staff (Drafter) - Managed by Kasubag
        $staffJabatan = Jabatan::where('nama', 'Staf Pelaksana')->first();
        $staffRen = $this->createUser('staff.ren', 'Staf Perencanaan', $staffJabatan, $unitModels['REN'], $pangkat, $statusKeanggotaan, $kasubagRen->id);

        $this->command->info('Users and Staff created.');
    }

    private function createUser($username, $name, $jabatan, $unit, $pangkat, $statusKeanggotaan, $managerId)
    {
        $user = User::firstOrCreate(
            ['email' => $username . '@example.com'],
            [
                'name' => $name,
                'username' => $username,
                'password' => Hash::make('password'),
                'is_active' => true,
                'verifikasi' => true,
                'nip_nik' => rand(10000000, 99999999),
                'nia_nrp' => rand(10000000, 99999999),
            ]
        );
        
        // Determine role based on Jabatan
        $role = 'staff';
        if ($jabatan) {
            if (str_contains(strtolower($jabatan->nama), 'kepala dinas') || str_contains(strtolower($jabatan->nama), 'sekretaris')) {
                $role = 'manager';
            } elseif (str_contains(strtolower($jabatan->nama), 'kepala bidang') || str_contains(strtolower($jabatan->nama), 'kepala sub')) {
                $role = 'supervisor';
            }
        }

        $user->syncRoles([$role]);

        // Create Staff Record (Crucial)
        if ($jabatan && $unit && $pangkat && $statusKeanggotaan) {
            Staff::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $name,
                    'email' => $user->email,
                    'jabatan_id' => $jabatan->id,
                    'unit_kerja_id' => $unit->id,
                    'pangkat_id' => $pangkat->id,
                    'status_keanggotaan_id' => $statusKeanggotaan->id,
                    'manager_id' => $managerId,
                    'status' => 'active',
                    'nip' => rand(10000000, 99999999),
                    'tanggal_masuk' => now(),
                ]
            );

            \App\Models\UserDetail::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nia_nrp' => rand(10000000, 99999999),
                    'nik' => rand(1000000000000000, 9999999999999999),
                    'tempat_lahir' => 'Jakarta',
                    'tanggal_lahir' => '1990-01-01',
                    'jenis_kelamin' => 'Laki-laki',
                    'alamat_domisili_lengkap' => 'Jl. Merdeka No. 1',
                    'unit_kerja_id' => $unit->id,
                    'jabatan_id' => $jabatan->id,
                    'status_keanggotaan_id' => $statusKeanggotaan->id,
                    'pangkat_id' => $pangkat->id,
                ]
            );
        }

        return $user;
    }
}
