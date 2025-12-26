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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('verifikasi')->default(0)->after('is_active');
        });

        Schema::table('user_details', function (Blueprint $table) {
            $table->date('tanggal_pengangkatan')->nullable()->after('status_keanggotaan');
            $table->string('nomor_sk')->nullable()->after('tanggal_pengangkatan');
            $table->string('nomor_kta')->nullable()->after('nomor_sk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('verifikasi');
        });

        Schema::table('user_details', function (Blueprint $table) {
            $table->dropColumn(['tanggal_pengangkatan', 'nomor_sk', 'nomor_kta']);
        });
    }
};
