<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Anggota / Fungsional Layout
        // Root: DIREKTORAT JENDRAL POTENSI PERTAHANAN (FUNGSIONAL)
        // User asked for "uppercase semua".

        $dirjenPothan = Jabatan::firstOrCreate([
            'nama' => 'DIREKTORAT JENDRAL POTENSI PERTAHANAN',
            'level' => 1,
            'kategori' => Jabatan::KATEGORI_FUNGSIONAL,
        ], [
            'parent_id' => null,
        ]);

        $tier2Funcs = [
            'SEKRETARIAT',
            'DIREKTORAT BELA NEGARA',
            'DIREKTORAT SUMBER DAYA PERTAHANAN',
            'DIREKTORAT TEKNOLOGI DAN INDUSTRI PERTAHANAN',
            'DIREKTORAT VETERAN',
        ];

        foreach ($tier2Funcs as $name) {
            // $name is already uppercase in the array
            $t2 = Jabatan::firstOrCreate([
                'nama' => strtoupper($name),
                'level' => 2,
                'parent_id' => $dirjenPothan->id,
            ], [
                'kategori' => Jabatan::KATEGORI_FUNGSIONAL,
            ]);

            // Tier 3: STAFF KHUSUS, STAFF AHLI
            Jabatan::firstOrCreate([
                'nama' => 'STAFF KHUSUS',
                'level' => 3,
                'parent_id' => $t2->id,
            ], [
                'kategori' => Jabatan::KATEGORI_FUNGSIONAL,
            ]);

            Jabatan::firstOrCreate([
                'nama' => 'STAFF AHLI',
                'level' => 3,
                'parent_id' => $t2->id,
            ], [
                'kategori' => Jabatan::KATEGORI_FUNGSIONAL,
            ]);
        }

        // 2. Struktural Layout
        $rootStruktural = Jabatan::firstOrCreate([
            'nama' => 'DIREKTORAT JENDERAL POTENSI PERTAHANAN', // Already uppercase in prev code, verified
            'level' => 1,
            'kategori' => Jabatan::KATEGORI_STRUKTURAL,
        ], [
            'parent_id' => null,
        ]);

        // Tier 2: SEKRETARIAT
        $sekretariat = Jabatan::firstOrCreate([
            'nama' => 'SEKRETARIAT',
            'level' => 2,
            'parent_id' => $rootStruktural->id,
        ], [
            'kategori' => Jabatan::KATEGORI_STRUKTURAL,
        ]);

        // Tier 3 Under Sekretariat
        $this->createBranch($sekretariat, [
            [
                'nama' => 'BAGIAN PROGRAM & LAPORAN',
                'level' => 3,
                'children' => [
                    [
                        'nama' => 'SUBBAGIAN PROGRAM KERJA & ANGGARAN',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SUBBAGIAN PERBENDAHARAAN',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SUBBAGIAN EVALUASI DAN LAPORAN',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                ],
            ],
            [
                'nama' => 'BAGIAN DATA & INFORMASI',
                'level' => 3,
                'children' => [
                    [
                        'nama' => 'SUBBAGIAN SIMAK BARANG MILIK NEGARA',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SUBBAGIAN PENGOLAHAN DATA DAN INFORMASI',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SUBBAGIAN DOKUMENTASI, ARSIP DAN PERPUSTAKAAN',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                ],
            ],
            [
                'nama' => 'BAGIAN UMUM',
                'level' => 3,
                'children' => [
                    [
                        'nama' => 'SUBBAGIAN RUMAH TANGGA',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SUBBAGIAN TATA USAHA',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SUBBAGIAN KEPEGAWAIAN',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                ],
            ],
        ]);

        // Tier 2: DIREKTORAT BELA NEGARA
        $dirBelaNegara = Jabatan::firstOrCreate([
            'nama' => 'DIREKTORAT BELA NEGARA',
            'level' => 2,
            'parent_id' => $rootStruktural->id,
        ], [
            'kategori' => Jabatan::KATEGORI_STRUKTURAL,
        ]);

        $this->createBranch($dirBelaNegara, [
            [
                'nama' => 'SUB BAGIAN TATA USAHA',
                'level' => 3,
                'children' => [
                    'KETUA', 'WAKIL KETUA', 'ANGGOTA',
                    [
                        'nama' => 'SEKSI ANALISA DAN EVALUASI',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                ],
            ],
            [
                'nama' => 'SUBDIREKTORAT LINGKUNGAN PENDIDIKAN',
                'level' => 3,
                'children' => [
                    [
                        'nama' => 'SEKSI MATERI DAN METODE',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SEKSI ANALISA DAN EVALUASI',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                ],
            ],
            [
                'nama' => 'SUBDIREKTORAT LINGKUNGAN PEKERJAAN',
                'level' => 3,
                'children' => [
                    [
                        'nama' => 'SEKSI MATERI DAN METODE',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SEKSI ANALISA DAN EVALUASI',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                ],
            ],
            [
                'nama' => 'SUBDIREKTORAT LINGKUNGAN PEMUKIMAN',
                'level' => 3,
                'children' => [
                    [
                        'nama' => 'SEKSI MATERI DAN METODE',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                    [
                        'nama' => 'SEKSI ANALISA DAN EVALUASI',
                        'level' => 4,
                        'children' => ['KETUA', 'WAKIL KETUA', 'ANGGOTA'],
                    ],
                ],
            ],
        ]);

        // Placeholders for other Directorates
        Jabatan::firstOrCreate(['nama' => 'DIREKTORAT SUMBER DAYA PERTAHANAN', 'level' => 2, 'parent_id' => $rootStruktural->id], ['kategori' => Jabatan::KATEGORI_STRUKTURAL]);
        Jabatan::firstOrCreate(['nama' => 'DIREKTORAT TEKNOLOGI DAN INDUSTRI PERTAHANAN', 'level' => 2, 'parent_id' => $rootStruktural->id], ['kategori' => Jabatan::KATEGORI_STRUKTURAL]);
        Jabatan::firstOrCreate(['nama' => 'DIREKTORAT VETERAN', 'level' => 2, 'parent_id' => $rootStruktural->id], ['kategori' => Jabatan::KATEGORI_STRUKTURAL]);
    }

    private function createBranch($parent, $children)
    {
        foreach ($children as $child) {
            if (is_string($child)) {
                Jabatan::firstOrCreate([
                    'nama' => strtoupper($child),
                    'level' => $parent->level + 1,
                    'parent_id' => $parent->id,
                ], [
                    'kategori' => $parent->kategori,
                ]);
            } else {
                $node = Jabatan::firstOrCreate([
                    'nama' => strtoupper($child['nama']),
                    'level' => $child['level'],
                    'parent_id' => $parent->id,
                ], [
                    'kategori' => $parent->kategori,
                ]);

                if (isset($child['children'])) {
                    foreach ($child['children'] as $grandChild) {
                        if (is_string($grandChild)) {
                            Jabatan::firstOrCreate([
                                'nama' => strtoupper($grandChild),
                                'level' => $node->level + 1,
                                'parent_id' => $node->id,
                            ], [
                                'kategori' => $node->kategori,
                            ]);
                        } else {
                            // Note: Recursion logic assumes only 1 level deeper structure or same structure.
                            // For 'grandChild' being an array, we pass it as a single-item array to createBranch
                            $this->createBranch($node, [$grandChild]);
                        }
                    }
                }
            }
        }
    }
}
