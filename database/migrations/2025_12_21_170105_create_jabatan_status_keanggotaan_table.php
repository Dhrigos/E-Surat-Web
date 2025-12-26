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
        Schema::create('jabatan_status_keanggotaan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jabatan_id')->constrained('jabatan')->onDelete('cascade');
            $table->foreignId('status_keanggotaan_id')->constrained('status_keanggotaans')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Prevent duplicate combinations
            $table->unique(['jabatan_id', 'status_keanggotaan_id'], 'jabatan_status_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jabatan_status_keanggotaan');
    }
};
