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
        Schema::table('jabatan_roles', function (Blueprint $table) {
            if (!Schema::hasColumn('jabatan_roles', 'parent_id')) {
                $table->unsignedBigInteger('parent_id')->nullable()->after('id');
                $table->foreign('parent_id')->references('id')->on('jabatan_roles')->onDelete('cascade');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('jabatan_roles', function (Blueprint $table) {
            $table->dropForeign(['parent_id']);
            $table->dropColumn(['parent_id']);
        });
    }
};
