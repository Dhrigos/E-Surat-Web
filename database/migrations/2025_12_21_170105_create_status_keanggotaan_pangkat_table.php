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
        Schema::create('status_keanggotaan_pangkat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('status_keanggotaan_id')->constrained('status_keanggotaans')->onDelete('cascade');
            $table->foreignId('pangkat_id')->constrained('pangkat')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->integer('min_tingkat')->nullable()->comment('Minimum rank level for this status');
            $table->integer('max_tingkat')->nullable()->comment('Maximum rank level for this status');
            $table->timestamps();

            // Prevent duplicate combinations
            $table->unique(['status_keanggotaan_id', 'pangkat_id'], 'status_pangkat_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status_keanggotaan_pangkat');
    }
};
