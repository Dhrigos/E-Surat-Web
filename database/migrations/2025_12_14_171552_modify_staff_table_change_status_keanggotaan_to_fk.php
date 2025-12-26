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
        Schema::table('staff', function (Blueprint $table) {
            // Drop the enum column
            $table->dropColumn('status_keanggotaan');
        });

        Schema::table('staff', function (Blueprint $table) {
            // Add the new foreign key column
            $table->foreignId('status_keanggotaan_id')->nullable()->after('unit_kerja_id')->constrained('status_keanggotaans')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->dropForeign(['status_keanggotaan_id']);
            $table->dropColumn('status_keanggotaan_id');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->enum('status_keanggotaan', ['Aktif', 'TNI', 'PNS', 'Purnawirawan'])->after('unit_kerja_id');
        });
    }
};
