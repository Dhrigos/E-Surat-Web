<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Jabatan;
use App\Models\Pangkat;
use App\Models\UnitKerja;

class MasterDataSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Seeding Jabatan...');
        // 1. Jabatan
        $jabatan = [
            ['nama' => 'Kepala Dinas', 'keterangan' => 'Eselon II'],
            ['nama' => 'Sekretaris Dinas', 'keterangan' => 'Eselon III'],
            ['nama' => 'Kepala Bidang', 'keterangan' => 'Eselon III'],
            ['nama' => 'Kepala Sub Bagian', 'keterangan' => 'Eselon IV'],
            ['nama' => 'Staf Pelaksana', 'keterangan' => 'Staf'],
        ];
        foreach ($jabatan as $j) {
            Jabatan::firstOrCreate(['nama' => $j['nama']], $j);
        }

        $this->command->info('Seeding Pangkat...');
        // 2. Pangkat
        $pangkat = [
            ['nama' => 'Juru Muda', 'kode' => 'I/a', 'tingkat' => 1],
            ['nama' => 'Juru Muda Tingkat I', 'kode' => 'I/b', 'tingkat' => 2],
            ['nama' => 'Pengatur Muda', 'kode' => 'II/a', 'tingkat' => 3],
            ['nama' => 'Penata Muda', 'kode' => 'III/a', 'tingkat' => 4],
            ['nama' => 'Pembina', 'kode' => 'IV/a', 'tingkat' => 5],
        ];
        foreach ($pangkat as $p) {
            Pangkat::firstOrCreate(['kode' => $p['kode']], $p);
        }

        $this->command->info('Seeding Status Keanggotaan...');
        // 3. Status Keanggotaan
        $status = [
            ['nama' => 'Tetap', 'keterangan' => 'Pegawai Tetap'],
            ['nama' => 'Kontrak', 'keterangan' => 'Pegawai Kontrak'],
            ['nama' => 'Honorer', 'keterangan' => 'Tenaga Honorer'],
        ];
        foreach ($status as $s) {
            \App\Models\StatusKeanggotaan::firstOrCreate(['nama' => $s['nama']], $s);
        }

        $this->command->info('Seeding Unit Kerja...');
        // 4. Unit Kerja with hierarchy
        $sekretariat = UnitKerja::firstOrCreate(
            ['nama' => 'Sekretariat'],
            ['kode' => 'SEKR', 'is_active' => true]
        );
        
        $bidangKeuangan = UnitKerja::firstOrCreate(
            ['nama' => 'Bidang Keuangan'],
            ['kode' => 'KEUANGAN', 'is_active' => true]
        );
        
        $bidangUmum = UnitKerja::firstOrCreate(
            ['nama' => 'Bidang Umum'],
            ['kode' => 'UMUM', 'is_active' => true]
        );

        // Create subunits
        $subBagKeuangan = UnitKerja::firstOrCreate(
            ['nama' => 'Sub Bagian Keuangan', 'parent_id' => $sekretariat->id],
            ['kode' => 'SUBBAG-KEU', 'is_active' => true]
        );

        $subBagKepegawaian = UnitKerja::firstOrCreate(
            ['nama' => 'Sub Bagian Kepegawaian', 'parent_id' => $sekretariat->id],
            ['kode' => 'SUBBAG-KEP', 'is_active' => true]
        );

        $this->command->info('Seeding Pivot: Jabatan <-> Unit Kerja...');
        // 5. Pivot: Jabatan <-> Unit Kerja
        $kepalaDinas = Jabatan::where('nama', 'Kepala Dinas')->first();
        $sekretarisDinas = Jabatan::where('nama', 'Sekretaris Dinas')->first();
        $kepalaBidang = Jabatan::where('nama', 'Kepala Bidang')->first();
        $kepalaSubBag = Jabatan::where('nama', 'Kepala Sub Bagian')->first();
        $stafPelaksana = Jabatan::where('nama', 'Staf Pelaksana')->first();

        // Attach jabatan to units (many-to-many)
        if ($sekretariat && $sekretarisDinas) {
            $sekretariat->jabatans()->syncWithoutDetaching([
                $sekretarisDinas->id => ['is_active' => true],
                $stafPelaksana->id => ['is_active' => true],
            ]);
        }

        if ($bidangKeuangan && $kepalaBidang) {
            $bidangKeuangan->jabatans()->syncWithoutDetaching([
                $kepalaBidang->id => ['is_active' => true],
                $stafPelaksana->id => ['is_active' => true],
            ]);
        }

        if ($bidangUmum && $kepalaBidang) {
            $bidangUmum->jabatans()->syncWithoutDetaching([
                $kepalaBidang->id => ['is_active' => true],
                $stafPelaksana->id => ['is_active' => true],
            ]);
        }

        if ($subBagKeuangan && $kepalaSubBag) {
            $subBagKeuangan->jabatans()->syncWithoutDetaching([
                $kepalaSubBag->id => ['is_active' => true],
                $stafPelaksana->id => ['is_active' => true],
            ]);
        }

        if ($subBagKepegawaian && $kepalaSubBag) {
            $subBagKepegawaian->jabatans()->syncWithoutDetaching([
                $kepalaSubBag->id => ['is_active' => true],
                $stafPelaksana->id => ['is_active' => true],
            ]);
        }

        $this->command->info('Seeding Pivot: Jabatan <-> Status Keanggotaan...');
        // 6. Pivot: Jabatan <-> Status Keanggotaan
        $statusTetap = \App\Models\StatusKeanggotaan::where('nama', 'Tetap')->first();
        $statusKontrak = \App\Models\StatusKeanggotaan::where('nama', 'Kontrak')->first();
        $statusHonorer = \App\Models\StatusKeanggotaan::where('nama', 'Honorer')->first();

        // Kepala Dinas - only Tetap
        if ($kepalaDinas && $statusTetap) {
            $kepalaDinas->statusKeanggotaans()->syncWithoutDetaching([
                $statusTetap->id => ['is_active' => true],
            ]);
        }

        // Sekretaris Dinas - only Tetap
        if ($sekretarisDinas && $statusTetap) {
            $sekretarisDinas->statusKeanggotaans()->syncWithoutDetaching([
                $statusTetap->id => ['is_active' => true],
            ]);
        }

        // Kepala Bidang - only Tetap
        if ($kepalaBidang && $statusTetap) {
            $kepalaBidang->statusKeanggotaans()->syncWithoutDetaching([
                $statusTetap->id => ['is_active' => true],
            ]);
        }

        // Kepala Sub Bagian - Tetap and Kontrak
        if ($kepalaSubBag && $statusTetap && $statusKontrak) {
            $kepalaSubBag->statusKeanggotaans()->syncWithoutDetaching([
                $statusTetap->id => ['is_active' => true],
                $statusKontrak->id => ['is_active' => true],
            ]);
        }

        // Staf Pelaksana - all status
        if ($stafPelaksana && $statusTetap && $statusKontrak && $statusHonorer) {
            $stafPelaksana->statusKeanggotaans()->syncWithoutDetaching([
                $statusTetap->id => ['is_active' => true],
                $statusKontrak->id => ['is_active' => true],
                $statusHonorer->id => ['is_active' => true],
            ]);
        }

        $this->command->info('Seeding Pivot: Status Keanggotaan <-> Pangkat...');
        // 7. Pivot: Status Keanggotaan <-> Pangkat
        $allPangkat = Pangkat::all();

        // Tetap - all PNS ranks
        if ($statusTetap) {
            foreach ($allPangkat as $pangkat) {
                $statusTetap->pangkats()->syncWithoutDetaching([
                    $pangkat->id => [
                        'is_active' => true,
                        'min_tingkat' => $pangkat->tingkat,
                        'max_tingkat' => null,
                    ],
                ]);
            }
        }

        // Kontrak - limited ranks (only lower levels)
        if ($statusKontrak) {
            $kontrakPangkat = Pangkat::where('tingkat', '<=', 3)->get();
            foreach ($kontrakPangkat as $pangkat) {
                $statusKontrak->pangkats()->syncWithoutDetaching([
                    $pangkat->id => [
                        'is_active' => true,
                        'min_tingkat' => $pangkat->tingkat,
                        'max_tingkat' => 3,
                    ],
                ]);
            }
        }

        // Honorer - only lowest rank
        if ($statusHonorer) {
            $honorerPangkat = Pangkat::where('tingkat', '<=', 2)->get();
            foreach ($honorerPangkat as $pangkat) {
                $statusHonorer->pangkats()->syncWithoutDetaching([
                    $pangkat->id => [
                        'is_active' => true,
                        'min_tingkat' => $pangkat->tingkat,
                        'max_tingkat' => 2,
                    ],
                ]);
            }
        }

    }
}
