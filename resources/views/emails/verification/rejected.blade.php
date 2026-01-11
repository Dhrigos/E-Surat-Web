<!DOCTYPE html>
<html>
<head>
    <title>Verifikasi Ditolak</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #dc2626;">Verifikasi Akun Ditolak</h2>
        <p>Halo <strong>{{ $user->name }}</strong>,</p>
        <p>Mohon maaf, proses verifikasi data E-KYC Anda belum dapat kami setujui saat ini.</p>
        
        <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <strong>Alasan Penolakan:</strong>
            <p style="margin-top: 5px; font-style: italic;">"{{ $reason }}"</p>
        </div>

        <p>Silakan perbaiki data Anda sesuai dengan alasan di atas dan lakukan pengajuan ulang melalui aplikasi.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ route('login') }}" style="background-color: #374151; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login untuk Perbaiki Data</a>
        </div>

        <p>Terima kasih,<br>Tim Admin E-Surat</p>
    </div>
</body>
</html>
