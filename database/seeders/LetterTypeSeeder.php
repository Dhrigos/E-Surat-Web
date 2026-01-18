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
                'description' => 'Penetapan resmi pimpinan BACADNAS (pengangkatan, kebijakan, penugasan strategis).',
            ],
            [
                'name' => 'Surat Perintah',
                'code' => 'SPRIN',
                'description' => 'Perintah resmi pimpinan kepada personel atau satuan.',
            ],
            [
                'name' => 'Instruksi',
                'code' => 'INSTR',
                'description' => 'Arahan teknis atau operasional yang wajib dilaksanakan.',
            ],
            [
                'name' => 'Kebijakan',
                'code' => 'KEB',
                'description' => 'Dokumen kebijakan strategis BACADNAS.',
            ],
            [
                'name' => 'Surat Edaran',
                'code' => 'SE',
                'description' => 'Edaran resmi pimpinan untuk internal organisasi.',
            ],
            [
                'name' => 'Surat Penugasan',
                'code' => 'SPT',
                'description' => 'Penugasan personel dalam kegiatan, operasi, atau tugas khusus.',
            ],
            [
                'name' => 'Surat Mutasi',
                'code' => 'SPM',
                'description' => 'Mutasi jabatan, satuan, atau wilayah penugasan.',
            ],
            [
                'name' => 'Surat Pengangkatan',
                'code' => 'SPP',
                'description' => 'Pengangkatan jabatan atau keanggotaan.',
            ],
            [
                'name' => 'Surat Pemberhentian',
                'code' => 'SPH',
                'description' => 'Pemberhentian dari jabatan atau keanggotaan.',
            ],
            [
                'name' => 'Surat Izin',
                'code' => 'SI',
                'description' => 'Izin dinas, cuti, atau keperluan resmi.',
            ],
            [
                'name' => 'Surat Rekomendasi Personel',
                'code' => 'SRP',
                'description' => 'Rekomendasi resmi terkait personel.',
            ],
            [
                'name' => 'Rencana Operasi',
                'code' => 'RO',
                'description' => 'Dokumen rencana kegiatan atau operasi.',
            ],
            [
                'name' => 'Pelaksanaan Kegiatan',
                'code' => 'PK',
                'description' => 'Penetapan pelaksanaan kegiatan atau operasi.',
            ],
            [
                'name' => 'Laporan',
                'code' => 'LAP',
                'description' => 'Laporan hasil kegiatan atau operasi.',
            ],
            [
                'name' => 'Evaluasi',
                'code' => 'EV',
                'description' => 'Evaluasi internal kegiatan atau operasi.',
            ],
            [
                'name' => 'Undangan',
                'code' => 'UND',
                'description' => 'Undangan rapat, apel, atau kegiatan resmi.',
            ],
            [
                'name' => 'Nota Dinas',
                'code' => 'ND',
                'description' => 'Komunikasi resmi internal antar unit.',
            ],
            [
                'name' => 'Permohonan',
                'code' => 'PMH',
                'description' => 'Permohonan resmi internal atau eksternal.',
            ],
            [
                'name' => 'Pemberitahuan',
                'code' => 'PBR',
                'description' => 'Pemberitahuan resmi organisasi.',
            ],
            [
                'name' => 'Surat Keterangan',
                'code' => 'KET',
                'description' => 'Keterangan resmi dari BACADNAS.',
            ],
            [
                'name' => 'Surat Balasan',
                'code' => 'BLS',
                'description' => 'Balasan resmi atas surat masuk.',
            ],
            [
                'name' => 'Memorandum of Understanding',
                'code' => 'MoU',
                'description' => 'Kesepakatan awal kerja sama dengan instansi lain.',
            ],
            [
                'name' => 'Perjanjian Kerja Sama',
                'code' => 'PKS',
                'description' => 'Perjanjian teknis lanjutan kerja sama.',
            ],
            [
                'name' => 'Surat Koordinasi',
                'code' => 'KOORD',
                'description' => 'Koordinasi antar instansi.',
            ],
            [
                'name' => 'Permintaan Data / Informasi',
                'code' => 'REQ',
                'description' => 'Permintaan resmi data atau informasi.',
            ],
            [
                'name' => 'Surat Eksternal Resmi',
                'code' => 'EKST',
                'description' => 'Surat keluar ke instansi luar.',
            ],
            [
                'name' => 'Surat Rahasia',
                'code' => 'RHS',
                'description' => 'Dokumen dengan informasi sensitif terbatas.',
            ],
            [
                'name' => 'Surat Sangat Rahasia',
                'code' => 'SRHS',
                'description' => 'Dokumen dengan informasi strategis tingkat tinggi.',
            ],
            [
                'name' => 'Keamanan Internal',
                'code' => 'KAM',
                'description' => 'Keamanan personel, data, atau aset.',
            ],
            [
                'name' => 'Intelijen / Analisis',
                'code' => 'INTEL',
                'description' => 'Analisis situasi dan potensi ancaman.',
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
