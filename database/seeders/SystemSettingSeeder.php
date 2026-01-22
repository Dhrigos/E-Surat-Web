<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key' => 'registration_open',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'registration',
                'label' => 'Buka Pendaftaran',
                'description' => 'Apakah pendaftaran calon anggota dibuka?',
            ],
            [
                'key' => 'registration_start_date',
                'value' => null,
                'type' => 'datetime',
                'group' => 'registration',
                'label' => 'Tanggal Mulai Pendaftaran',
                'description' => 'Tanggal dimulainya pendaftaran.',
            ],
            [
                'key' => 'registration_end_date',
                'value' => null,
                'type' => 'datetime',
                'group' => 'registration',
                'label' => 'Tanggal Akhir Pendaftaran',
                'description' => 'Batas akhir pendaftaran.',
            ],
        ];

        foreach ($settings as $setting) {
            \App\Models\SystemSetting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
