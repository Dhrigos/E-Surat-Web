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
            $table->string('matra')->nullable()->after('user_id');
            $table->foreignId('golongan_id')->nullable()->after('matra')->constrained('golongans')->onDelete('set null');
            $table->foreignId('pangkat_id')->nullable()->after('golongan_id')->constrained('pangkat')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_calon', function (Blueprint $table) {
            $table->dropForeign(['golongan_id']);
            $table->dropForeign(['pangkat_id']);
            $table->dropColumn(['matra', 'golongan_id', 'pangkat_id']);
        });
    }
};
