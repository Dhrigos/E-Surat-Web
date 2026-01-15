<?php

namespace Database\Seeders;

use App\Models\LetterType;
use Illuminate\Database\Seeder;

class LetterTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Surat Keputusan',
                'code' => 'SK',
                'description' => 'Surat yang berisi keputusan pejabat yang berwenang.',
            ],
            [
                'name' => 'Surat Tugas',
                'code' => 'ST',
                'description' => 'Surat yang berisi penugasan dari pejabat kepada bawahan.',
            ],
            [
                'name' => 'Surat Perintah',
                'code' => 'SPRIN',
                'description' => 'Surat yang berisi perintah untuk melaksanakan tugas tertentu.',
            ],
            [
                'name' => 'Nota Dinas',
                'code' => 'ND',
                'description' => 'Surat dinas internal antar pejabat di lingkungan instansi.',
            ],
            [
                'name' => 'Surat Edaran',
                'code' => 'SE',
                'description' => 'Surat yang berisi pemberitahuan atau penjelasan.',
            ],
            [
                'name' => 'Surat Undangan',
                'code' => 'UND',
                'description' => 'Surat yang berisi undangan untuk menghadiri acara atau kegiatan.',
            ],
            [
                'name' => 'Berita Acara',
                'code' => 'BA',
                'description' => 'Surat yang berisi laporan tentang suatu kejadian atau peristiwa.',
            ],
            [
                'name' => 'Pengumuman',
                'code' => 'PENG',
                'description' => 'Surat yang berisi pemberitahuan yang ditujukan kepada umum.',
            ],
            [
                'name' => 'Laporan',
                'code' => 'LAP',
                'description' => 'Surat yang berisi laporan pelaksanaan tugas.',
            ],
            [
                'name' => 'Telaahan Staf',
                'code' => 'TS',
                'description' => 'Tulisan dinas yang memuat analisis singkat dan jelas mengenai persoalan.',
            ],
        ];

        foreach ($types as $type) {
            LetterType::firstOrCreate(
                ['code' => $type['code']],
                [
                    'name' => $type['name'],
                    'description' => $type['description'],
                ]
            );
        }
    }
}
