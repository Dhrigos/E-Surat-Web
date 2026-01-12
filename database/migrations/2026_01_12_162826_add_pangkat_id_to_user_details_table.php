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
        if (Schema::hasColumn('user_details', 'pangkat_id')) {
            Schema::table('user_details', function (Blueprint $table) {
                // Drop it to ensure we add it correctly with the constraint
                // Note: might need to drop FK first if it exists, but likely it failed before adding FK
                // If FK exists, dropColumn might fail depending on DB, but usually Laravel handles it or throws.
                // Given the error was "Constraint incorrectly formed", the FK likely doesn't exist.
                 $table->dropColumn('pangkat_id');
            });
        }

        Schema::table('user_details', function (Blueprint $table) {
            $table->foreignId('pangkat_id')->nullable()->constrained('pangkat')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropForeign(['pangkat_id']);
            $table->dropColumn('pangkat_id');
        });
    }
};
