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
            $table->dropColumn('jabatan_role');
            $table->foreignId('jabatan_role_id')->nullable()->after('jabatan_id')->constrained('jabatan_roles')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropForeign(['jabatan_role_id']);
            $table->dropColumn('jabatan_role_id');
            $table->string('jabatan_role')->nullable()->after('jabatan_id');
        });
    }
};
