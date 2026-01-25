<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome/Index');
})->name('welcome');

Route::get('/news', function () {
    return Inertia::render('News/Index');
})->name('news.index');

Route::get('/news/{id}', function ($id) {
    return Inertia::render('News/Show', ['id' => $id]);
})->name('news.show');

Route::get('/about', function () {
    return Inertia::render('About/Index');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('Contact/Index');
})->name('contact');

Route::get('/download-app', function () {
    return Inertia::render('DownloadApp');
})->name('download-app');

Route::get('/home', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::post('/send-otp', [\App\Http\Controllers\OtpController::class, 'send'])->name('otp.send');
Route::post('/send-otp-reset', [\App\Http\Controllers\OtpController::class, 'sendResetOtp'])->name('otp.send-reset');
Route::post('/check-otp', [\App\Http\Controllers\OtpController::class, 'checkOtp'])->name('otp.check'); // New step 2 verification
Route::post('/verify-otp-reset', [\App\Http\Controllers\OtpController::class, 'verifyAndReset'])->name('otp.verify-reset');
Route::post('/register', [\App\Http\Controllers\Auth\RegisterController::class, 'store'])->name('register.store');
Route::post('/api/validate/register', [\App\Http\Controllers\Api\ValidationController::class, 'checkRegisterInput'])->name('api.validate.register');

Route::get('/regions/provinces', [\App\Http\Controllers\RegionController::class, 'provinces'])->name('regions.provinces');
Route::get('/regions/cities', [\App\Http\Controllers\RegionController::class, 'cities'])->name('regions.cities');
Route::get('/regions/districts', [\App\Http\Controllers\RegionController::class, 'districts'])->name('regions.districts');
Route::get('/regions/villages', [\App\Http\Controllers\RegionController::class, 'villages'])->name('regions.villages');
Route::get('/regions/makos', [\App\Http\Controllers\RegionController::class, 'makos'])->name('regions.makos');

Route::middleware(['auth'])->group(function () {
    Route::get('/complete-profile', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'create'])->name('complete-profile.create');
    Route::get('/complete-profile-anggota', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'create'])->name('complete-profile-anggota.create');
    Route::post('/complete-profile', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'store'])->name('complete-profile.store');

    // E-KYC Routes
    Route::get('/ekyc', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'ekyc'])->name('verification.ekyc');
    Route::post('/ekyc/approve', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'approveEkyc'])->name('verification.approve-ekyc');
    Route::get('/pending-verification', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'pending'])->name('verification.pending');

    Route::get('/complete-profile/verification-status', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'verificationStatus'])->name('complete-profile.verification-status');
    Route::get('/complete-profile/download-templates', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'downloadTemplates'])->name('complete-profile.download-templates');

    // API Routes for Letter Creation
    Route::get('/api/users-by-jabatan', [\App\Http\Controllers\MasterDataController::class, 'getUsersByJabatan'])->name('api.users-by-jabatan');

    Route::get('/api/jabatan', [\App\Http\Controllers\MasterDataController::class, 'getJabatan'])->name('api.jabatan');
    Route::get('/api/users/superior', [\App\Http\Controllers\MasterDataController::class, 'getSuperior'])->name('api.users.superior');
    Route::get('jenis-surat/{id}/workflow', [\App\Http\Controllers\JenisSuratController::class, 'getWorkflow'])->name('jenis-surat.workflow.get');

    // Validation API Routes
    Route::post('/api/validate/nik', [\App\Http\Controllers\Api\ValidationController::class, 'checkNik'])->name('api.validate.nik');
    Route::post('/api/validate/nia-nrp', [\App\Http\Controllers\Api\ValidationController::class, 'checkNiaNrp'])->name('api.validate.nia-nrp');
    Route::post('/api/validate/nomor-kta', [\App\Http\Controllers\Api\ValidationController::class, 'checkNomorKta'])->name('api.validate.nomor-kta');

    Route::middleware([\App\Http\Middleware\EnsureUserIsVerified::class])->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\MailDashboardController::class, 'index'])->name('dashboard');

        // Data Master Routes - Super Admin Only
        Route::middleware(['role:super-admin'])->group(function () {
            Route::resource('jabatan', \App\Http\Controllers\JabatanController::class);
            Route::post('jabatan-roles/reorder', [\App\Http\Controllers\DataMaster\JabatanRoleController::class, 'reorder'])->name('jabatan-roles.reorder');
            Route::resource('jabatan-roles', \App\Http\Controllers\DataMaster\JabatanRoleController::class)->except(['create', 'show', 'edit']);
            Route::resource('jenis-surat', \App\Http\Controllers\JenisSuratController::class)->except(['create', 'show', 'edit']);

            Route::post('jenis-surat/{id}/workflow', [\App\Http\Controllers\JenisSuratController::class, 'updateWorkflow'])->name('jenis-surat.workflow.update');

            // Master Data Routes


            Route::prefix('master-data')->name('master-data.')->group(function () {
                Route::get('/', [\App\Http\Controllers\MasterDataController::class, 'index'])->name('index');


                // Golongan
                Route::post('/golongan', [\App\Http\Controllers\MasterDataController::class, 'storeGolongan'])->name('golongan.store');
                Route::put('/golongan/{id}', [\App\Http\Controllers\MasterDataController::class, 'updateGolongan'])->name('golongan.update');
                Route::delete('/golongan/{id}', [\App\Http\Controllers\MasterDataController::class, 'destroyGolongan'])->name('golongan.destroy');

                // Pangkat
                Route::post('/pangkat', [\App\Http\Controllers\MasterDataController::class, 'storePangkat'])->name('pangkat.store');
                Route::put('/pangkat/{id}', [\App\Http\Controllers\MasterDataController::class, 'updatePangkat'])->name('pangkat.update');
                Route::delete('/pangkat/{id}', [\App\Http\Controllers\MasterDataController::class, 'destroyPangkat'])->name('pangkat.destroy');
                
                // Legacy Workflow Update (Placeholder)
                Route::put('/{id}', function () {
                     return back()->with('error', 'Please update workflow via Jenis Surat menu.');
                })->name('update');
            });

        });

        // Staff Mapping Routes
        Route::middleware(['role:admin|super-admin'])->group(function () {
            Route::get('data-master', [\App\Http\Controllers\DataMaster\DataMasterController::class, 'index'])->name('data-master.index');
            Route::get('export/calon-anggota', [\App\Http\Controllers\ExportController::class, 'exportCalonAnggota'])->name('export.calon-anggota');
            Route::get('staff-mapping', [\App\Http\Controllers\StaffController::class, 'index'])->name('staff-mapping');
            Route::get('calon-mapping', [\App\Http\Controllers\StaffController::class, 'calonIndex'])->name('calon-mapping');
            Route::resource('staff', \App\Http\Controllers\StaffController::class)->except(['create', 'edit', 'show']);
            Route::put('staff/{staff}/toggle-status', [\App\Http\Controllers\StaffController::class, 'toggleStatus'])->name('staff.toggle-status');
            Route::put('staff/{staff}/promote', [\App\Http\Controllers\StaffController::class, 'promoteToMember'])->name('staff.promote');
            Route::put('staff/{staff}/role', [\App\Http\Controllers\StaffController::class, 'updateRole'])->name('staff.update-role');
            Route::resource('roles', \App\Http\Controllers\RoleController::class)->except(['create', 'edit', 'show']);

            // System Settings
            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/registration', [\App\Http\Controllers\SystemSettingController::class, 'registration'])->name('registration');
                Route::post('/update', [\App\Http\Controllers\SystemSettingController::class, 'update'])->name('update');
            });

            // Verification Queue
            Route::get('verification-queue', [\App\Http\Controllers\VerificationQueueController::class, 'index'])->name('verification-queue.index');
            Route::post('verification-queue/{user}/verify', [\App\Http\Controllers\VerificationQueueController::class, 'verify'])->name('verification-queue.verify');
            Route::post('verification-queue/{user}/lock', [\App\Http\Controllers\VerificationQueueController::class, 'lock'])->name('verification-queue.lock');
            Route::post('verification-queue/{user}/unlock', [\App\Http\Controllers\VerificationQueueController::class, 'unlock'])->name('verification-queue.unlock');
            Route::post('verification-queue/{user}/reject', [\App\Http\Controllers\VerificationQueueController::class, 'reject'])->name('verification-queue.reject')->withTrashed();
            Route::delete('verification-queue/{user}/disqualify', [\App\Http\Controllers\VerificationQueueController::class, 'disqualify'])->name('verification-queue.disqualify')->withTrashed();
            Route::get('verification-queue/{user}/download', [\App\Http\Controllers\VerificationQueueController::class, 'download'])->name('verification-queue.download');

            // Approval Tracking (Super Admin Only)
            Route::get('approval-tracking', [\App\Http\Controllers\ApprovalTrackingController::class, 'index'])->name('approval-tracking.index');
        });

        // Mail Management Routes
        Route::get('letters/next-number', [\App\Http\Controllers\LetterController::class, 'getNextNumber'])->name('letters.next-number');
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
        Route::get('/api/conversations', [\App\Http\Controllers\ChatController::class, 'listConversations'])->name('api.conversations.index');
        Route::get('messages/{conversation}', [\App\Http\Controllers\ChatController::class, 'show'])->name('messages.show');
        Route::get('/api/users/search', [\App\Http\Controllers\ChatController::class, 'searchUsers'])->name('api.users.search');
        Route::post('conversations', [\App\Http\Controllers\ChatController::class, 'storeConversation'])->name('conversations.store');
        Route::patch('conversations/{conversation}', [\App\Http\Controllers\ChatController::class, 'update'])->name('conversations.update');
        Route::post('messages/{conversation}', [\App\Http\Controllers\ChatController::class, 'store'])->name('messages.store');
        Route::post('messages/{conversation}/read', [\App\Http\Controllers\ChatController::class, 'markRead'])->name('messages.read');
        Route::post('conversations/{conversation}/participants', [\App\Http\Controllers\ChatController::class, 'addParticipants'])->name('conversations.participants.add');
        Route::delete('conversations/{conversation}/participants/{user}', [\App\Http\Controllers\ChatController::class, 'removeParticipant'])->name('conversations.participants.remove');

        Route::resource('letters', \App\Http\Controllers\LetterController::class)->except(['index', 'edit', 'create']);

        // Disposition Routes
        Route::get('/dispositions', [\App\Http\Controllers\DispositionController::class, 'index'])->name('dispositions.index');
        Route::get('/dispositions/{disposition}/letter-details', [\App\Http\Controllers\DispositionController::class, 'showLetter'])->name('dispositions.show-letter');
        Route::post('/letters/{letter}/dispositions', [\App\Http\Controllers\DispositionController::class, 'store'])->name('dispositions.store');
        Route::put('/dispositions/{disposition}/status', [\App\Http\Controllers\DispositionController::class, 'updateStatus'])->name('dispositions.update-status');
        Route::delete('/dispositions/{disposition}', [\App\Http\Controllers\DispositionController::class, 'destroy'])->name('dispositions.destroy');
        Route::get('/api/disposition-recipients', [\App\Http\Controllers\DispositionController::class, 'getRecipients'])->name('dispositions.recipients');

        // Notification Routes
        Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/clear-all', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('notifications.clear-all');
        Route::delete('/notifications/delete-all', [\App\Http\Controllers\NotificationController::class, 'deleteAll'])->name('notifications.delete-all');
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::delete('/notifications/{id}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');

        // Audit Log
        Route::get('/audit-logs', [\App\Http\Controllers\AuditLogController::class, 'index'])->name('audit-logs.index');
        Route::get('/profile/activity/download', [\App\Http\Controllers\Settings\ProfileController::class, 'downloadActivity'])->name('profile.download-activity');

        // Location Tracking Routes
        Route::prefix('location')->name('location.')->group(function () {
            Route::get('/', [\App\Http\Controllers\LocationController::class, 'index'])->name('index');
            Route::post('/', [\App\Http\Controllers\LocationController::class, 'store'])->name('store');
            Route::get('/current', [\App\Http\Controllers\LocationController::class, 'current'])->name('current');
            Route::get('/history', [\App\Http\Controllers\LocationController::class, 'history'])->name('history');
            Route::post('/session/start', [\App\Http\Controllers\LocationController::class, 'startSession'])->name('session.start');
            Route::post('/session/{sessionId}/end', [\App\Http\Controllers\LocationController::class, 'endSession'])->name('session.end');
            Route::get('/session/active', [\App\Http\Controllers\LocationController::class, 'activeSession'])->name('session.active');
        });
    });
});

require __DIR__.'/settings.php';
