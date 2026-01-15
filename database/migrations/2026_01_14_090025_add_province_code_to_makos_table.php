<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('makos', function (Blueprint $table) {
            $table->char('province_code', 2)->nullable()->after('city_code');
        });

        // Backend population of existing data
        \Illuminate\Support\Facades\DB::statement("
            UPDATE makos
            JOIN indonesia_cities ON makos.city_code = indonesia_cities.code
            SET makos.province_code = indonesia_cities.province_code
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('makos', function (Blueprint $table) {
            $table->dropColumn('province_code');
        });
    }
};
