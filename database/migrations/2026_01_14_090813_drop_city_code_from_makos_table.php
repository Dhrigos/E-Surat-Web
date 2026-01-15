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
            $table->dropColumn('city_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('makos', function (Blueprint $table) {
            $table->char('city_code', 4)->nullable();
        });
    }
};
