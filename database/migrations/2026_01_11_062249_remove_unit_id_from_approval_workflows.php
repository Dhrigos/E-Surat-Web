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
        Schema::table('approval_workflows', function (Blueprint $table) {
            // Drop foreign key constraint first if it exists
            if (Schema::hasColumn('approval_workflows', 'unit_id')) {
                // Try to drop the foreign key - name may vary
                try {
                    $table->dropForeign(['unit_id']);
                } catch (\Exception $e) {
                    // Foreign key might not exist or have different name
                }

                // Now drop the column
                $table->dropColumn('unit_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('approval_workflows', function (Blueprint $table) {
            $table->unsignedBigInteger('unit_id')->nullable()->after('letter_type_id');
        });
    }
};
