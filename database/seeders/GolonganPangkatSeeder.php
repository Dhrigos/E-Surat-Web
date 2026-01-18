<?php

namespace Database\Seeders;

use App\Models\Golongan;
use App\Models\Pangkat;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GolonganPangkatSeeder extends Seeder
{
    public function run()
    {
        // Disable foreign key checks to allow truncation
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Pangkat::truncate();
        Golongan::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Define Golongan first map to IDs (optional, but good for structure)
        // Based on the image, ID 1 is Perwira, 2 is Bintara, 3 is Tamtama
        $golongans = [
            1 => 'Perwira',
            2 => 'Bintara',
            3 => 'Tamtama',
        ];

        foreach ($golongans as $id => $nama) {
            Golongan::create([
                'id' => $id,
                'nama' => $nama,
                'keterangan' => $nama
            ]);
        }

        $data = [
            // GOLONGAN 1: PERWIRA (ID 1)
            // Tingkat 22
            ['nama' => 'Jenderal Besar (TNI)', 'kode' => 'JENDERAL BESAR', 'tingkat' => 22, 'golongan_id' => 1, 'is_active' => 1],
            
            // Tingkat 21
            ['nama' => 'Jenderal', 'kode' => 'JENDERAL', 'tingkat' => 21, 'golongan_id' => 1, 'is_active' => 1],
            ['nama' => 'Laksamana', 'kode' => 'LAKSAMANA', 'tingkat' => 21, 'golongan_id' => 1, 'is_active' => 1],
            ['nama' => 'Marsekal', 'kode' => 'MARSEKAL', 'tingkat' => 21, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 20
            ['nama' => 'Letnan Jenderal', 'kode' => 'LETJEN', 'tingkat' => 20, 'golongan_id' => 1, 'is_active' => 1],
            ['nama' => 'Laksamana Madya', 'kode' => 'LAKSDYA', 'tingkat' => 20, 'golongan_id' => 1, 'is_active' => 1],
            ['nama' => 'Marsekal Madya', 'kode' => 'MARSDYA', 'tingkat' => 20, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 19
            ['nama' => 'Mayor Jenderal', 'kode' => 'MAYJEN', 'tingkat' => 19, 'golongan_id' => 1, 'is_active' => 1],
            ['nama' => 'Laksamana Muda', 'kode' => 'LAKSDA', 'tingkat' => 19, 'golongan_id' => 1, 'is_active' => 1],
            ['nama' => 'Marsekal Muda', 'kode' => 'MARSDA', 'tingkat' => 19, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 18
            ['nama' => 'Brigadir Jenderal', 'kode' => 'BRIGJEN', 'tingkat' => 18, 'golongan_id' => 1, 'is_active' => 1],
            ['nama' => 'Laksamana Pertama', 'kode' => 'LAKSMA', 'tingkat' => 18, 'golongan_id' => 1, 'is_active' => 1],
            ['nama' => 'Marsekal Pertama', 'kode' => 'MARSMA', 'tingkat' => 18, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 17
            ['nama' => 'Kolonel', 'kode' => 'KOL', 'tingkat' => 17, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 16
            ['nama' => 'Letnan Kolonel', 'kode' => 'LETKOL', 'tingkat' => 16, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 15
            ['nama' => 'Mayor', 'kode' => 'MAY', 'tingkat' => 15, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 14
            ['nama' => 'Kapten', 'kode' => 'KAPT', 'tingkat' => 14, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 13
            ['nama' => 'Letnan Satu', 'kode' => 'LETTU', 'tingkat' => 13, 'golongan_id' => 1, 'is_active' => 1],

            // Tingkat 12
            ['nama' => 'Letnan Dua', 'kode' => 'LETDA', 'tingkat' => 12, 'golongan_id' => 1, 'is_active' => 1],


            // GOLONGAN 2: BINTARA (ID 2)
            // Tingkat 11
            ['nama' => 'Pembantu Letnan Satu', 'kode' => 'PELTU', 'tingkat' => 11, 'golongan_id' => 2, 'is_active' => 1],

            // Tingkat 10
            ['nama' => 'Pembantu Letnan Dua', 'kode' => 'PELDA', 'tingkat' => 10, 'golongan_id' => 2, 'is_active' => 1],

            // Tingkat 9
            ['nama' => 'Sersan Mayor', 'kode' => 'SERMA', 'tingkat' => 9, 'golongan_id' => 2, 'is_active' => 1],

            // Tingkat 8
            ['nama' => 'Sersan Kepala', 'kode' => 'SERKA', 'tingkat' => 8, 'golongan_id' => 2, 'is_active' => 1],

            // Tingkat 7
            ['nama' => 'Sersan Satu', 'kode' => 'SERTU', 'tingkat' => 7, 'golongan_id' => 2, 'is_active' => 1],

            // Tingkat 6
            ['nama' => 'Sersan Dua', 'kode' => 'SERDA', 'tingkat' => 6, 'golongan_id' => 2, 'is_active' => 1],


            // GOLONGAN 3: TAMTAMA (ID 3)
            // Tingkat 5
            ['nama' => 'Kopral Kepala', 'kode' => 'KOPKA', 'tingkat' => 5, 'golongan_id' => 3, 'is_active' => 1],

            // Tingkat 4
            ['nama' => 'Kopral Satu', 'kode' => 'KOPTU', 'tingkat' => 4, 'golongan_id' => 3, 'is_active' => 1],

            // Tingkat 3
            ['nama' => 'Kopral Dua', 'kode' => 'KOPDA', 'tingkat' => 3, 'golongan_id' => 3, 'is_active' => 1],

            // Tingkat 2
            ['nama' => 'Prajurit Kepala', 'kode' => 'PRAKA', 'tingkat' => 2, 'golongan_id' => 3, 'is_active' => 1],
            ['nama' => 'Kelasi Kepala', 'kode' => 'KLK', 'tingkat' => 2, 'golongan_id' => 3, 'is_active' => 1],

            // Tingkat 1
            ['nama' => 'Prajurit Satu', 'kode' => 'PRATU', 'tingkat' => 1, 'golongan_id' => 3, 'is_active' => 1],
            ['nama' => 'Kelasi Satu', 'kode' => 'KLS', 'tingkat' => 1, 'golongan_id' => 3, 'is_active' => 1],

             // Tingkat 0
            ['nama' => 'Prajurit Dua', 'kode' => 'PRADA', 'tingkat' => 0, 'golongan_id' => 3, 'is_active' => 1],
            ['nama' => 'Kelasi Dua', 'kode' => 'KLD', 'tingkat' => 0, 'golongan_id' => 3, 'is_active' => 1],
        ];

        foreach ($data as $item) {
            Pangkat::create($item);
        }
    }
}
