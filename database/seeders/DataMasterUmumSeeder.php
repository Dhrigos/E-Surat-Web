<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DataMasterUmumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Agama
        DB::table('agamas')->insert([
            ['nama' => 'Islam'],
            ['nama' => 'Kristen protestan'],
            ['nama' => 'Kristen Katolik'],
            ['nama' => 'Hindu'],
            ['nama' => 'Buddha'],
            ['nama' => 'Konghucu'],
            ['nama' => 'Lainnya/tidak diketahui'],
        ]);
        
         // Bangsa
        DB::table('bangsas')->insert([
            ['nama' => 'Indonesia'],
            ['nama' => 'Asing'],
        ]);

        
        // Golongan Darah
        DB::table('goldars')->insert([
            ['nama' => 'A', 'rhesus' => '-'],
            ['nama' => 'A', 'rhesus' => '+'],
            ['nama' => 'A', 'rhesus' => ''],
            ['nama' => 'B', 'rhesus' => '-'],
            ['nama' => 'B', 'rhesus' => '+'],
            ['nama' => 'B', 'rhesus' => ''],
            ['nama' => 'AB', 'rhesus' => '+'],
            ['nama' => 'AB', 'rhesus' => '-'],
            ['nama' => 'AB', 'rhesus' => ''],
            ['nama' => 'O', 'rhesus' => '+'],
            ['nama' => 'O', 'rhesus' => '-'],
            ['nama' => 'O', 'rhesus' => ''],
            ['nama' => '-', 'rhesus' => '-'],
        ]);

        // Pekerjaan
        DB::table('pekerjaans')->insert([
            ['name' => 'Pegawai Negeri Sipil'],
            ['name' => 'PPPK'],
            ['name' => 'TNI/Polri'],
            ['name' => 'Pegawai Swasta'],
            ['name' => 'Wiraswasta/Usahawan'],
            ['name' => 'Buruh/Karyawan Lepas'],
            ['name' => 'Petani/Perkebunan'],
            ['name' => 'Nelayan'],
            ['name' => 'Pelajar/mahasiswa'],
            ['name' => 'Ibu rumah tangga'],
            ['name' => 'Pensiunan'],
            ['name' => 'Tenaga kesehatan/medis'],
            ['name' => 'Guru/dosen'],
            ['name' => 'Sopir/ojek/transportasi'],
            ['name' => 'Pekerja konstruksi'],
            ['name' => 'Teknisi/operator'],
            ['name' => 'Pedagang/umkm'],
            ['name' => 'Pekerja pabrik'],
            ['name' => 'Asisten rumah tangga'],
            ['name' => 'Kepala Desa'],
            ['name' => 'Kepala Desa'],
            ['name' => 'Lainnya'],
        ]);  

        // Status Pernikahan
        DB::table('pernikahans')->insert([
            ['nama' => 'Belum Menikah'],
            ['nama' => 'Menikah'],
            ['nama' => 'Cerai Hidup'],
            ['nama' => 'Cerai Mati'],
            ['nama' => 'Duda'],
            ['nama' => 'Janda'],
        ]);

        // Suku
        DB::table('sukus')->insert([
            ['nama' => 'Sunda'],
            ['nama' => 'Jawa'],
            ['nama' => 'Batak'],
            ['nama' => 'Ambon'],
            ['nama' => 'Melayu'],
            ['nama' => 'Betawi'],
            ['nama' => 'Minangkabau'],
            ['nama' => 'Bugis'],
            ['nama' => 'Makassar'],
            ['nama' => 'Dayak'],
            ['nama' => 'Banjar'],
            ['nama' => 'Bali'],
            ['nama' => 'Sasak'],
            ['nama' => 'Madura'],
            ['nama' => 'Papua'],
            ['nama' => 'Ambon/maluku'],
            ['nama' => 'Toraja'],
            ['nama' => 'Nias'],
            ['nama' => 'Manado/minahasa'],
            ['nama' => 'Aceh'],
            ['nama' => 'Lainnya / campuran / tidak diketahui'],
        ]);

        // Pendidikan
        DB::table('pendidikans')->insert([
            ['nama' => 'Sekolah Dasar', 'singkatan' => 'SD'],
            ['nama' => 'Sekolah Menengah Pertama', 'singkatan' => 'SMP'],
            ['nama' => 'Sekolah Menengah Atas / Kejuruan', 'singkatan' => 'SMA/K'],
            ['nama' => 'Diploma 3', 'singkatan' => 'D3'],
            ['nama' => 'Diploma 4', 'singkatan' => 'D4'],
            ['nama' => 'Sarjana', 'singkatan' => 'S1'],
            ['nama' => 'Magister', 'singkatan' => 'S2'],
            ['nama' => 'Doktor', 'singkatan' => 'S3'],
        ]);
    }
}
