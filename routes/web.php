<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/home', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::post('/send-otp', [\App\Http\Controllers\OtpController::class, 'send'])->name('otp.send');
Route::post('/verify-otp-reset', [\App\Http\Controllers\OtpController::class, 'verifyAndReset'])->name('otp.verify-reset');
Route::post('/register', [\App\Http\Controllers\Auth\RegisterController::class, 'store'])->name('register.store');

Route::get('/regions/provinces', [\App\Http\Controllers\RegionController::class, 'provinces'])->name('regions.provinces');
Route::get('/regions/cities', [\App\Http\Controllers\RegionController::class, 'cities'])->name('regions.cities');
Route::get('/regions/districts', [\App\Http\Controllers\RegionController::class, 'districts'])->name('regions.districts');
Route::get('/regions/villages', [\App\Http\Controllers\RegionController::class, 'villages'])->name('regions.villages');

Route::middleware(['auth'])->group(function () {
    Route::get('/complete-profile', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'create'])->name('complete-profile.create');
    Route::post('/complete-profile', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'store'])->name('complete-profile.store');

    // E-KYC Routes
    Route::get('/ekyc', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'ekyc'])->name('verification.ekyc');
    Route::post('/ekyc/approve', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'approveEkyc'])->name('verification.approve-ekyc');
    Route::get('/pending-verification', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'pending'])->name('verification.pending');

    Route::get('/complete-profile/verification-status', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'verificationStatus'])->name('complete-profile.verification-status');

    // API Routes for Letter Creation / Workflow
    Route::get('/api/workflow', [\App\Http\Controllers\MasterDataController::class, 'getWorkflow'])->name('api.workflow');
    Route::get('/api/users-by-jabatan', [\App\Http\Controllers\MasterDataController::class, 'getUsersByJabatan'])->name('api.users-by-jabatan');

    Route::get('/api/jabatan', [\App\Http\Controllers\MasterDataController::class, 'getJabatan'])->name('api.jabatan');

    // Validation API Routes
    Route::post('/api/validate/nik', [\App\Http\Controllers\Api\ValidationController::class, 'checkNik'])->name('api.validate.nik');
    Route::post('/api/validate/nia-nrp', [\App\Http\Controllers\Api\ValidationController::class, 'checkNiaNrp'])->name('api.validate.nia-nrp');
    Route::post('/api/validate/nomor-kta', [\App\Http\Controllers\Api\ValidationController::class, 'checkNomorKta'])->name('api.validate.nomor-kta');

    Route::middleware([\App\Http\Middleware\EnsureUserIsVerified::class])->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\MailDashboardController::class, 'index'])->name('dashboard');

        // Data Master Routes - Super Admin Only
        Route::middleware(['role:super-admin'])->group(function () {
            Route::resource('jabatan', \App\Http\Controllers\JabatanController::class);
            Route::resource('jenis-surat', \App\Http\Controllers\JenisSuratController::class)->except(['create', 'show', 'edit']);

            // Master Data Approval Routes
            Route::get('master-data', [\App\Http\Controllers\MasterDataController::class, 'index'])->name('master-data.index');
            Route::post('master-data', [\App\Http\Controllers\MasterDataController::class, 'store'])->name('master-data.store');
            Route::put('master-data/{letterType}', [\App\Http\Controllers\MasterDataController::class, 'update'])->name('master-data.update');
            Route::delete('master-data/{letterType}', [\App\Http\Controllers\MasterDataController::class, 'destroy'])->name('master-data.destroy');
        });

        // Staff Mapping Routes
        Route::middleware(['role:manager|cs|super-admin'])->group(function () {
            Route::get('staff-mapping', [\App\Http\Controllers\StaffController::class, 'index'])->name('staff-mapping');
            Route::resource('staff', \App\Http\Controllers\StaffController::class)->except(['create', 'edit', 'show']);
            Route::put('staff/{staff}/toggle-status', [\App\Http\Controllers\StaffController::class, 'toggleStatus'])->name('staff.toggle-status');
            Route::resource('roles', \App\Http\Controllers\RoleController::class)->except(['create', 'edit', 'show']);
            Route::resource('permissions', \App\Http\Controllers\PermissionController::class)->except(['create', 'edit', 'show']);

            // Verification Queue
            Route::get('verification-queue', [\App\Http\Controllers\VerificationQueueController::class, 'index'])->name('verification-queue.index');
            Route::post('verification-queue/{user}/verify', [\App\Http\Controllers\VerificationQueueController::class, 'verify'])->name('verification-queue.verify');
            Route::post('verification-queue/{user}/lock', [\App\Http\Controllers\VerificationQueueController::class, 'lock'])->name('verification-queue.lock');
            Route::post('verification-queue/{user}/unlock', [\App\Http\Controllers\VerificationQueueController::class, 'unlock'])->name('verification-queue.unlock');
            Route::post('verification-queue/{user}/reject', [\App\Http\Controllers\VerificationQueueController::class, 'reject'])->name('verification-queue.reject');
        });

        // Mail Management Routes
        Route::get('list-surat', [\App\Http\Controllers\LetterController::class, 'index'])->name('letters.index');
        Route::get('starred-mails', [\App\Http\Controllers\LetterController::class, 'starred'])->name('letters.starred');
        Route::get('archived-mails', [\App\Http\Controllers\LetterController::class, 'archived'])->name('letters.archived');
        Route::get('buat-surat', [\App\Http\Controllers\LetterController::class, 'create'])->name('letters.create');
        Route::get('letters/{letter}/attachments/{attachment}', [\App\Http\Controllers\LetterController::class, 'downloadAttachment'])->name('letters.download-attachment');
        Route::get('letters/{letter}/export-pdf', [\App\Http\Controllers\LetterController::class, 'exportPdf'])->name('letters.export-pdf');
        Route::put('letters/{letter}/status', [\App\Http\Controllers\LetterController::class, 'updateStatus'])->name('letters.update-status');
        Route::put('letters/{letter}/archive', [\App\Http\Controllers\LetterController::class, 'archive'])->name('letters.archive');
        Route::put('letters/{letter}/star', [\App\Http\Controllers\LetterController::class, 'toggleStar'])->name('letters.toggle-star');
        Route::post('letters/{letter}/comments', [\App\Http\Controllers\LetterCommentController::class, 'store'])->name('letters.comments.store');
        Route::post('letters/external', [\App\Http\Controllers\LetterController::class, 'storeExternal'])->name('letters.store-external');

        // Messages
        Route::get('messages', [\App\Http\Controllers\ChatController::class, 'index'])->name('messages.index');
        Route::get('messages/{conversation}', [\App\Http\Controllers\ChatController::class, 'show'])->name('messages.show');
        Route::get('/api/users/search', [\App\Http\Controllers\ChatController::class, 'searchUsers'])->name('api.users.search');
        Route::post('conversations', [\App\Http\Controllers\ChatController::class, 'storeConversation'])->name('conversations.store');
        Route::patch('conversations/{conversation}', [\App\Http\Controllers\ChatController::class, 'update'])->name('conversations.update');
        Route::post('messages/{conversation}', [\App\Http\Controllers\ChatController::class, 'store'])->name('messages.store');
        Route::post('messages/{conversation}/read', [\App\Http\Controllers\ChatController::class, 'markRead'])->name('messages.read');

        Route::resource('letters', \App\Http\Controllers\LetterController::class)->except(['index', 'edit', 'create']);

        // Disposition Routes
        Route::get('/dispositions', [\App\Http\Controllers\DispositionController::class, 'index'])->name('dispositions.index');
        Route::post('/letters/{letter}/dispositions', [\App\Http\Controllers\DispositionController::class, 'store'])->name('dispositions.store');
        Route::put('/dispositions/{disposition}/status', [\App\Http\Controllers\DispositionController::class, 'updateStatus'])->name('dispositions.update-status');
        Route::delete('/dispositions/{disposition}', [\App\Http\Controllers\DispositionController::class, 'destroy'])->name('dispositions.destroy');
        Route::get('/api/disposition-recipients', [\App\Http\Controllers\DispositionController::class, 'getRecipients'])->name('dispositions.recipients');

        // Notification Routes
        Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/clear-all', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('notifications.clear-all');
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');

        // Audit Log
        Route::get('/audit-logs', [\App\Http\Controllers\AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/profile/activity/download', [\App\Http\Controllers\Settings\ProfileController::class, 'downloadActivity'])->name('profile.download-activity');
    });
});

require __DIR__.'/settings.php';
