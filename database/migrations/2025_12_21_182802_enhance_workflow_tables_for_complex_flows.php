<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 2. Create workflow_step_groups table for parallel approval
        Schema::create('workflow_step_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained('approval_workflows')->onDelete('cascade');
            $table->integer('group_order'); // Order of this group in the workflow
            $table->enum('approval_type', ['all', 'any', 'majority'])->default('all');
            // 'all' = all approvers must approve
            // 'any' = any one approver can approve
            // 'majority' = more than 50% must approve
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 1. Add new columns to approval_workflow_steps for complex workflows
        Schema::table('approval_workflow_steps', function (Blueprint $table) {
            $table->enum('step_type', ['sequential', 'parallel', 'conditional'])->default('sequential');
            $table->foreignId('group_id')->nullable()->constrained('workflow_step_groups')->onDelete('cascade');
            $table->foreignId('parent_step_id')->nullable()->constrained('approval_workflow_steps')->onDelete('cascade');
            
            // Conditional routing fields
            $table->string('condition_field')->nullable()->after('parent_step_id'); // e.g., 'priority', 'category'
            $table->enum('condition_operator', ['=', '!=', '>', '<', '>=', '<=', 'in', 'not_in'])->nullable()->after('condition_field');
            $table->text('condition_value')->nullable()->after('condition_operator'); // JSON for 'in' operator
            
            // Additional metadata
            $table->boolean('is_required')->default(true)->after('condition_value');
            $table->integer('timeout_hours')->nullable()->after('is_required'); // Optional deadline
        });

        // 3. Create workflow_delegations table
        Schema::create('workflow_delegations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('letter_approver_id')->constrained('letter_approvers')->onDelete('cascade');
            $table->foreignId('delegated_from_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('delegated_to_user_id')->constrained('users')->onDelete('cascade');
            $table->text('reason')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Add columns to letter_approvers for tracking delegation
        Schema::table('letter_approvers', function (Blueprint $table) {
            $table->foreignId('original_user_id')->nullable()->after('user_id')->constrained('users')->onDelete('set null');
            $table->boolean('is_delegated')->default(false)->after('original_user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Drop in reverse order
        Schema::table('letter_approvers', function (Blueprint $table) {
            $table->dropForeign(['original_user_id']);
            $table->dropColumn(['original_user_id', 'is_delegated']);
        });

        Schema::dropIfExists('workflow_delegations');
        Schema::dropIfExists('workflow_step_groups');

        Schema::table('approval_workflow_steps', function (Blueprint $table) {
            $table->dropForeign(['group_id']);
            $table->dropForeign(['parent_step_id']);
            $table->dropColumn([
                'step_type',
                'group_id',
                'parent_step_id',
                'condition_field',
                'condition_operator',
                'condition_value',
                'is_required',
                'timeout_hours'
            ]);
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
