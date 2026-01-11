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
            $table->string('scan_selfie')->nullable()->after('scan_sk');
            $table->decimal('ekyc_score', 5, 4)->nullable()->after('scan_selfie'); // Store score (e.g., 0.9854)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropColumn(['scan_selfie', 'ekyc_score']);
        });
    }
};
