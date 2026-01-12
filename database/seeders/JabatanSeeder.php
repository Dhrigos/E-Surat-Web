<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Truncate
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Jabatan::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. ANGGOTA
        Jabatan::create([
            'nama' => 'ANGGOTA',
            'level' => 1,
            'kategori' => 'ANGGOTA',
            'parent_id' => null,
            'is_active' => true,
        ]);

        // 2. FUNGSIONAL
        $fungsionalRoot = Jabatan::create([
            'nama' => 'FUNGSIONAL',
            'level' => 1,
            'kategori' => 'FUNGSIONAL',
            'parent_id' => null,
            'is_active' => true,
        ]);
        
        // Define Fungsional Tree
        $fungsionalTree = [
            'DIREKTORAT JENDERAL POTENSI PERTAHANAN' => [ 
                'SEKRETARIAT' => [],
                'DIREKTORAT BELA NEGARA' => [],
                'DIREKTORAT SUMBER DAYA PERTAHANAN' => [],
                'DIREKTORAT TEKNOLOGI DAN INDUSTRI PERTAHANAN' => [],
                'DIREKTORAT VETERAN' => []
            ]
        ];

        $this->createRecursive($fungsionalRoot, $fungsionalTree, 'FUNGSIONAL');


        // 2. STRUKTURAL
        $strukturalRoot = Jabatan::create([
            'nama' => 'STRUKTURAL',
            'level' => 1,
            'kategori' => 'STRUKTURAL',
            'parent_id' => null,
            'is_active' => true,
        ]);

        // STRUKTURAL Tree (Units Only)
        $strukturalTree = [
            'DIREKTORAT JENDERAL POTENSI PERTAHANAN' => [
                'SEKRETARIAT' => [ 
                    'BAGIAN PROGRAM & LAPORAN' => [ 
                        'SUBBAGIAN PROGRAM KERJA & ANGGARAN' => [],
                        'SUBBAGIAN PERBENDAHARAAN' => [],
                        'SUBBAGIAN EVALUASI DAN LAPORAN' => []
                    ],
                    'BAGIAN DATA & INFORMASI' => [ 
                        'SUBBAGIAN SIMAK BARANG MILIK NEGARA' => [],
                        'SUBBAGIAN PENGOLAHAN DATA DAN INFORMASI' => [],
                        'SUBBAGIAN DOKUMENTASI, ARSIP DAN PERPUSTAKAAN' => []
                    ],
                    'BAGIAN UMUM' => [
                        'SUBBAGIAN RUMAH TANGGA' => [],
                        'SUBBAGIAN TATA USAHA' => [],
                        'SUBBAGIAN KEPEGAWAIAN' => []
                    ]
                ],
                'DIREKTORAT BELA NEGARA' => [
                    'SUB BAGIAN TATA USAHA' => [ 
                         // No roles
                    ],
                    'SUBDIREKTORAT LINGKUNGAN PENDIDIKAN' => [
                        'SEKSI MATERI DAN METODE' => [],
                        'SEKSI ANALISA DAN EVALUASI' => []
                    ],
                    'SUBDIREKTORAT LINGKUNGAN PEKERJAAN' => [
                        'SEKSI MATERI DAN METODE' => [],
                        'SEKSI ANALISA DAN EVALUASI' => []
                    ],
                    'SUBDIREKTORAT LINGKUNGAN PEMUKIMAN' => [
                        'SEKSI MATERI DAN METODE' => [],
                        'SEKSI ANALISA DAN EVALUASI' => []
                    ]
                ]
            ]
        ];

        $this->createRecursive($strukturalRoot, $strukturalTree, 'STRUKTURAL');
    }

    private function createRecursive($parent, $children, $category)
    {
        foreach ($children as $name => $subChildren) {
            // Handle numeric keys if just a list of strings
            if (is_int($name)) {
                $name = $subChildren;
                $subChildren = [];
            }

            $jabatan = Jabatan::create([
                'nama' => $name,
                'level' => $parent->level + 1,
                'kategori' => $category,
                'parent_id' => $parent->id,
                'is_active' => true,
            ]);

            if (!empty($subChildren)) {
                $this->createRecursive($jabatan, $subChildren, $category);
            }
        }
    }
}
