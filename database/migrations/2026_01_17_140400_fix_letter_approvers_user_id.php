<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration fixes the bug where user_id and approver_id were swapped
     * in the letter_approvers table. The bug caused approvals to not appear
     * in the Approval menu.
     */
    public function up(): void
    {
        // Fix records where user_id is NULL but approver_id contains a numeric user ID
        // This happens when the bug put user ID in approver_id field instead of user_id
        
        DB::statement("
            UPDATE letter_approvers 
            SET 
                user_id = CAST(approver_id AS UNSIGNED),
                approver_id = NULL
            WHERE 
                user_id IS NULL 
                AND approver_id IS NOT NULL
                AND approver_id REGEXP '^[0-9]+$'
                AND CAST(approver_id AS UNSIGNED) IN (SELECT id FROM users)
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Cannot reliably reverse this migration as we don't know the original approver_id values
        \Log::warning('Cannot reverse letter_approvers fix migration - original approver_id values are lost');
    }
};
