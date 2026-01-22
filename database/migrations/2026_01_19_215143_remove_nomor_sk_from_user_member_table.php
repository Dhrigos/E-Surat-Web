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
        Schema::table('user_member', function (Blueprint $table) {
            $table->dropColumn('nomor_sk');
            $table->dropColumn('ekyc_score');
            $table->dropColumn('office_city_id');
            $table->dropColumn('office_district_id');
            $table->dropColumn('office_village_id');            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_member', function (Blueprint $table) {
            $table->string('nomor_sk')->nullable()->after('tanggal_pengangkatan');
        });
    }
};
