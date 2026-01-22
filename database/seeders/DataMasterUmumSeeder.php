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
            ['name' => 'Pegawai negeri (pns)'],
            ['name' => 'Tni/polri'],
            ['name' => 'Pegawai swasta'],
            ['name' => 'Wiraswasta/usahawan'],
            ['name' => 'Buruh/karyawan lepas'],
            ['name' => 'Petani/perkebunan'],
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
            ['name' => 'Tidak bekerja'],
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
    }
}
