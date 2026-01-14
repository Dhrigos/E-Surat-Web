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
        Schema::create('letter_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('approval_workflows', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('letter_type_id')->constrained('letter_types')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('approval_workflow_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('approval_workflows')->onDelete('cascade');
            $table->integer('order');
            $table->string('approver_type'); // 'role', 'jabatan', 'user'
            $table->string('approver_id'); // ID of the role/jabatan/user
            $table->timestamps();
        });

        Schema::table('letters', function (Blueprint $table) {
            $table->foreignId('letter_type_id')->nullable()->after('id')->constrained('letter_types')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('letters', function (Blueprint $table) {
            $table->dropForeign(['letter_type_id']);
            $table->dropColumn('letter_type_id');
        });

        Schema::dropIfExists('approval_workflow_steps');
        Schema::dropIfExists('approval_workflows');
        Schema::dropIfExists('letter_types');
    }
};
