<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,

            \Laravolt\Indonesia\Seeds\DatabaseSeeder::class,
            JabatanSeeder::class,
            JabatanRoleSeeder::class,
            GolonganPangkatSeeder::class,
            LetterTypeSeeder::class,
            MakoSeeder::class,
            DataMasterUmumSeeder::class,
            SystemSettingSeeder::class,
        ]);
    }
}
