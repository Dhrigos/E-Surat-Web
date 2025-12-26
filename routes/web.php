<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

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
    Route::get('/complete-profile/video-call', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'videoCall'])->name('complete-profile.video-call');
    Route::get('/complete-profile/verification-status', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'verificationStatus'])->name('complete-profile.verification-status');
    
    // API endpoints for cascading dropdowns
    Route::get('/api/jabatan-by-unit', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'getJabatanByUnit']);
    Route::get('/api/status-by-jabatan', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'getStatusByJabatan']);
    Route::get('/api/pangkat-by-status', [\App\Http\Controllers\Auth\CompleteProfileController::class, 'getPangkatByStatus']);

    Route::middleware([\App\Http\Middleware\EnsureUserIsVerified::class])->group(function () {
        Route::get('dashboard', [\App\Http\Controllers\MailDashboardController::class, 'index'])->name('dashboard');

        // Data Master Routes - Super Admin Only
        Route::middleware(['role:super-admin'])->group(function () {
            Route::resource('jabatan', \App\Http\Controllers\JabatanController::class);
            Route::resource('pangkat', \App\Http\Controllers\PangkatController::class);
            Route::resource('unit-kerja', \App\Http\Controllers\UnitKerjaController::class);
            Route::resource('status-keanggotaan', \App\Http\Controllers\StatusKeanggotaanController::class);
            
            // Master Data Approval Routes
            Route::get('master-data', [\App\Http\Controllers\MasterDataController::class, 'index'])->name('master-data.index');
            Route::post('master-data', [\App\Http\Controllers\MasterDataController::class, 'store'])->name('master-data.store');
            Route::put('master-data/{letterType}', [\App\Http\Controllers\MasterDataController::class, 'update'])->name('master-data.update');
            Route::delete('master-data/{letterType}', [\App\Http\Controllers\MasterDataController::class, 'destroy'])->name('master-data.destroy');

            // Letter Templates
            Route::resource('letter-templates', \App\Http\Controllers\LetterTemplateController::class);
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
        Route::resource('letters', \App\Http\Controllers\LetterController::class)->except(['index', 'edit']);

        // Notification Routes
        Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.read');
        Route::post('/notifications/clear-all', [\App\Http\Controllers\NotificationController::class, 'clearAll'])->name('notifications.clear-all');
        
        // Audit Log
        Route::get('/audit-logs', [\App\Http\Controllers\AuditLogController::class, 'index'])->name('audit-logs.index');
    });
});

require __DIR__.'/settings.php';
