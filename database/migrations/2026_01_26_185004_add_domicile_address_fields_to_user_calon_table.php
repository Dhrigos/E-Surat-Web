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
        Schema::table('user_calon', function (Blueprint $table) {
            $table->text('domisili_jalan')->nullable()->after('jalan');
            $table->char('domisili_province_id', 2)->nullable()->after('domisili_jalan');
            $table->char('domisili_city_id', 4)->nullable()->after('domisili_province_id');
            $table->char('domisili_district_id', 7)->nullable()->after('domisili_city_id');
            $table->char('domisili_village_id', 10)->nullable()->after('domisili_district_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_calon', function (Blueprint $table) {
            $table->dropColumn([
                'domisili_jalan',
                'domisili_province_id',
                'domisili_city_id',
                'domisili_district_id',
                'domisili_village_id',
            ]);
        });
    }
};
