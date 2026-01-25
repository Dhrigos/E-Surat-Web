<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class CalonAnggotaExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    private $rowNumber = 0;

    public function query()
    {
        return User::query()
            ->where('member_type', 'calon_anggota')
            ->where('verifikasi', true)
            ->whereDoesntHave('roles', function ($q) {
                $q->where('name', 'super-admin');
            })
            ->with([
                'calon.agama', 
                'calon.suku', 
                'calon.bangsa', 
                'calon.statusPernikahan', 
                'calon.golongan', 
                'calon.pangkat',
                'calon.pendidikan',
                'calon.pekerjaan',
                'calon.golonganDarah',
                'calon.provinsi',
                'calon.kabupaten',
                'calon.kecamatan',
                'calon.desa',
                'prestasi',
                'organisasis'
            ]);
    }

    public function map($user): array
    {
        $calon = $user->calon;
        $tanggalMasuk = $user->created_at ? date('d-m-Y', strtotime($user->created_at)) : '-';
        
        // Format Prestasi
        $prestasiString = $user->prestasi->map(function($p) {
            return "- {$p->nama_kegiatan} ({$p->pencapaian}, {$p->tingkat}, {$p->tahun})";
        })->implode("\n");

        // Format Organisasi
        $organisasiString = $user->organisasis->map(function($o) {
            $year = $o->tanggal_mulai ? $o->tanggal_mulai->format('Y') : '-';
            return "- {$o->nama_organisasi} ({$o->posisi}, {$year})";
        })->implode("\n");

        return [
            ++$this->rowNumber,
            $user->name,
            $user->email,
            "'" . ($calon?->nik ?? $user->nik ?? '-'),
            "'" . ($calon?->nomor_kk ?? '-'),
            $user->phone_number ?? '-',
            $calon?->matra ?? '-',
            $calon?->golongan?->nama ?? '-',                        
            $user->status === 'active' ? 'Terverifikasi' : 'Belum Terverifikasi',
            $tanggalMasuk,
            $calon?->tempat_lahir ?? '-',
            $calon?->tanggal_lahir ? date('d-m-Y', strtotime($calon->tanggal_lahir)) : '-',
            $calon?->jenis_kelamin ?? '-',
            $calon?->golonganDarah?->nama ?? '-',
            $calon?->agama?->nama ?? '-',
            $calon?->suku?->nama ?? '-',
            $calon?->bangsa?->nama ?? '-',
            $calon?->statusPernikahan?->nama ?? '-',
            $calon?->nama_ibu_kandung ?? '-',
            
            // Physical
            $calon?->tinggi_badan ?? '-',
            $calon?->berat_badan ?? '-',
            $calon?->warna_kulit ?? '-',
            $calon?->warna_rambut ?? '-',
            $calon?->bentuk_rambut ?? '-',
            
            // Sizes
            $calon?->ukuran_pakaian ?? '-',
            $calon?->ukuran_sepatu ?? '-',
            $calon?->ukuran_topi ?? '-',
            $calon?->ukuran_kaos_olahraga ?? '-',
            $calon?->ukuran_sepatu_olahraga ?? '-',
            
            // Address
            $calon?->jalan . '-' . $calon?->alamat_domisili_lengkap ?? '-',
            $calon?->provinsi?->name ?? '-',
            $calon?->kabupaten?->name ?? '-',
            $calon?->kecamatan?->name ?? '-',
            $calon?->desa?->name ?? '-',
            
            // Education
            $calon?->pendidikan?->nama ?? '-',
            $calon?->nama_sekolah ?? '-',
            $calon?->nama_prodi ?? '-',
            $calon?->nilai_akhir ?? '-',
            $calon?->status_lulus ?? '-',
            
            // Job
            $calon?->is_bekerja ? 'Bekerja' : 'Tidak Bekerja',
            $calon?->pekerjaan?->name ?? '-',
            $calon?->nama_perusahaan ?? '-',
            $calon?->nama_profesi ?? '-',            
                        
            
            // Additional Lists
            $prestasiString ?: '-',
            $organisasiString ?: '-'
        ];
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama Lengkap',
            'Email',
            'NIK',
            'Nomor KK',
            'Nomor HP',
            'Matra',
            'Golongan',                        
            'Status Akun',
            'Tanggal Daftar',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Jenis Kelamin',
            'Golongan Darah',
            'Agama',
            'Suku',
            'Bangsa',
            'Status Pernikahan',
            'Nama Ibu Kandung',
            
            'Tinggi Badan (cm)',
            'Berat Badan (kg)',
            'Warna Kulit',
            'Warna Rambut',
            'Bentuk Rambut',
            
            'Ukuran Pakaian',
            'Ukuran Sepatu',
            'Ukuran Topi',
            'Ukuran Kaos Olahraga',
            'Ukuran Sepatu Olahraga',
            
            'Alamat Domisili',
            'Provinsi',
            'Kabupaten/Kota',
            'Kecamatan',
            'Desa/Kelurahan',
            
            'Pendidikan Terakhir',
            'Nama Sekolah/Kampus',
            'Prodi/Jurusan',
            'Nilai Akhir',
            'Status Lulus',
            
            'Status Bekerja',
            'Bidang Pekerjaan',
            'Nama Perusahaan',
            'Profesi',
                        
            'Riwayat Prestasi',
            'Riwayat Organisasi'
        ];
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('AT:AU')->getAlignment()->setWrapText(true); // Updated column letters approximately
        
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
