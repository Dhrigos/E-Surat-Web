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
        Schema::table('pangkat', function (Blueprint $table) {
            // Check if column exists to avoid error if re-running
            if (!Schema::hasColumn('pangkat', 'golongan_id')) {
                $table->foreignId('golongan_id')->nullable()->constrained('golongans')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pangkat', function (Blueprint $table) {
             $table->dropForeign(['golongan_id']);
             $table->dropColumn('golongan_id');
        });
    }
};
