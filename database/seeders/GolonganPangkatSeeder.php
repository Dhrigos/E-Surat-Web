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

        $data = [
            // PERWIRA TINGGI (PATI) - BINTANG 5
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Jenderal Besar (TNI)',
                'kode' => 'JB',
                'tingkat' => 22
            ],

            // PERWIRA TINGGI (PATI) - BINTANG 4
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Jenderal (TNI AD)',
                'kode' => 'JEND_AD',
                'tingkat' => 21
            ],
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Laksamana (TNI AL)',
                'kode' => 'LAKS_AL',
                'tingkat' => 21
            ],
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Marsekal (TNI AU)',
                'kode' => 'MARS_AU',
                'tingkat' => 21
            ],

            // PERWIRA TINGGI (PATI) - BINTANG 3
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Letnan Jenderal (TNI AD)',
                'kode' => 'LETJEN_AD',
                'tingkat' => 20
            ],
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Laksamana Madya (TNI AL)',
                'kode' => 'LAKSDYA_AL',
                'tingkat' => 20
            ],
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Marsekal Madya (TNI AU)',
                'kode' => 'MARSDYA_AU',
                'tingkat' => 20
            ],

            // PERWIRA TINGGI (PATI) - BINTANG 2
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Mayor Jenderal (TNI AD)',
                'kode' => 'MAYJEN_AD',
                'tingkat' => 19
            ],
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Laksamana Muda (TNI AL)',
                'kode' => 'LAKSTA_AL', // Commonly Laksda
                'tingkat' => 19
            ],
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Marsekal Muda (TNI AU)',
                'kode' => 'MARSDA_AU',
                'tingkat' => 19
            ],

            // PERWIRA TINGGI (PATI) - BINTANG 1
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Brigadir Jenderal (TNI AD)',
                'kode' => 'BRIGJEN_AD',
                'tingkat' => 18
            ],
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Laksamana Pertama (TNI AL)',
                'kode' => 'LAKSMA_AL',
                'tingkat' => 18
            ],
            [
                'golongan' => 'Perwira Tinggi',
                'pangkat' => 'Marsekal Pertama (TNI AU)',
                'kode' => 'MARSMA_AU',
                'tingkat' => 18
            ],

            // PERWIRA MENENGAH (PAMEN)
            [
                'golongan' => 'Perwira Menengah',
                'pangkat' => 'Kolonel',
                'kode' => 'KOL',
                'tingkat' => 17
            ],
            [
                'golongan' => 'Perwira Menengah',
                'pangkat' => 'Letnan Kolonel',
                'kode' => 'LETKOL',
                'tingkat' => 16
            ],
            [
                'golongan' => 'Perwira Menengah',
                'pangkat' => 'Mayor',
                'kode' => 'MAY',
                'tingkat' => 15
            ],

            // PERWIRA PERTAMA (PAMA)
            [
                'golongan' => 'Perwira Pertama',
                'pangkat' => 'Kapten',
                'kode' => 'KAPT',
                'tingkat' => 14
            ],
            [
                'golongan' => 'Perwira Pertama',
                'pangkat' => 'Letnan Satu',
                'kode' => 'LETTU',
                'tingkat' => 13
            ],
            [
                'golongan' => 'Perwira Pertama',
                'pangkat' => 'Letnan Dua',
                'kode' => 'LETDA',
                'tingkat' => 12
            ],

            // BINTARA TINGGI
            [
                'golongan' => 'Bintara Tinggi',
                'pangkat' => 'Pembantu Letnan Satu',
                'kode' => 'PELTU',
                'tingkat' => 11
            ],
            [
                'golongan' => 'Bintara Tinggi',
                'pangkat' => 'Pembantu Letnan Dua',
                'kode' => 'PELDA',
                'tingkat' => 10
            ],

            // BINTARA
            [
                'golongan' => 'Bintara',
                'pangkat' => 'Sersan Mayor',
                'kode' => 'SERMA',
                'tingkat' => 9
            ],
            [
                'golongan' => 'Bintara',
                'pangkat' => 'Sersan Kepala',
                'kode' => 'SERKA',
                'tingkat' => 8
            ],
            [
                'golongan' => 'Bintara',
                'pangkat' => 'Sersan Satu',
                'kode' => 'SERTU',
                'tingkat' => 7
            ],
            [
                'golongan' => 'Bintara',
                'pangkat' => 'Sersan Dua',
                'kode' => 'SERDA',
                'tingkat' => 6
            ],

            // TAMTAMA KEPALA
            [
                'golongan' => 'Tamtama Kepala',
                'pangkat' => 'Kopral Kepala',
                'kode' => 'KOPKA',
                'tingkat' => 5
            ],
            [
                'golongan' => 'Tamtama Kepala',
                'pangkat' => 'Kopral Satu',
                'kode' => 'KOPTU',
                'tingkat' => 4
            ],
            [
                'golongan' => 'Tamtama Kepala',
                'pangkat' => 'Kopral Dua',
                'kode' => 'KOPDA',
                'tingkat' => 3
            ],

            // TAMTAMA
            [
                'golongan' => 'Tamtama',
                'pangkat' => 'Prajurit Kepala (TNI AD)',
                'kode' => 'PRAKA_AD',
                'tingkat' => 2
            ],
             [
                'golongan' => 'Tamtama',
                'pangkat' => 'Prajurit Kepala (TNI AU)',
                'kode' => 'PRAKA_AU',
                'tingkat' => 2
            ],
            [
                'golongan' => 'Tamtama',
                'pangkat' => 'Kelasi Kepala (TNI AL)',
                'kode' => 'KLK_AL',
                'tingkat' => 2
            ],
            [
                'golongan' => 'Tamtama',
                'pangkat' => 'Prajurit Satu (TNI AD)',
                'kode' => 'PRATU_AD',
                'tingkat' => 1
            ],
            [
                'golongan' => 'Tamtama',
                'pangkat' => 'Prajurit Satu (TNI AU)',
                'kode' => 'PRATU_AU',
                'tingkat' => 1
            ],
            [
                'golongan' => 'Tamtama',
                'pangkat' => 'Kelasi Satu (TNI AL)',
                'kode' => 'KLS_AL',
                'tingkat' => 1
            ],
            [
                'golongan' => 'Tamtama',
                'pangkat' => 'Prajurit Dua (TNI AD)',
                'kode' => 'PRADA_AD',
                'tingkat' => 0
            ],
            [
                'golongan' => 'Tamtama',
                'pangkat' => 'Prajurit Dua (TNI AU)',
                'kode' => 'PRADA_AU',
                'tingkat' => 0
            ],
             [
                'golongan' => 'Tamtama',
                'pangkat' => 'Kelasi Dua (TNI AL)',
                'kode' => 'KLD_AL',
                'tingkat' => 0
            ],
        ];

        foreach ($data as $item) {
            // Create or update Golongan (Category of Rank)
            $golongan = Golongan::firstOrCreate(
                ['nama' => $item['golongan']],
                ['keterangan' => $item['golongan']]
            );

            // Create or update Pangkat linked to Golongan
            Pangkat::updateOrCreate(
                ['nama' => $item['pangkat']],
                [
                    'kode' => $item['kode'],
                    'tingkat' => $item['tingkat'],
                    'golongan_id' => $golongan->id,
                    'is_active' => true,
                ]
            );
        }
    }
}
