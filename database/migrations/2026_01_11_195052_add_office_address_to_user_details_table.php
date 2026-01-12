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
            $table->string('office_province_id')->nullable()->after('village_id');
            $table->string('office_city_id')->nullable()->after('office_province_id');
            $table->string('office_district_id')->nullable()->after('office_city_id');
            $table->string('office_village_id')->nullable()->after('office_district_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropColumn(['office_province_id', 'office_city_id', 'office_district_id', 'office_village_id']);
        });
    }
};
