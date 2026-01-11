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
        Schema::table('user_details', function (Blueprint $table) {
            $table->char('province_id', 2)->nullable()->after('alamat_domisili_lengkap');
            $table->char('city_id', 4)->nullable()->after('province_id');
            $table->char('district_id', 7)->nullable()->after('city_id');
            $table->char('village_id', 10)->nullable()->after('district_id');
            $table->string('jalan')->nullable()->after('village_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropColumn(['province_id', 'city_id', 'district_id', 'village_id', 'jalan']);
        });
    }
};
