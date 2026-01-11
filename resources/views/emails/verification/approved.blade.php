<!DOCTYPE html>
<html>
<head>
    <title>Verifikasi Berhasil</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #059669;">Selamat! Akun Anda Telah Diverifikasi</h2>
        <p>Halo <strong>{{ $user->name }}</strong>,</p>
        <p>Kami ingin memberitahukan bahwa proses verifikasi data dan wawancara E-KYC Anda telah <strong>BERHASIL</strong>.</p>
        <p>Sekarang akun E-Surat Anda sudah aktif dan dapat digunakan sepenuhnya untuk keperluan administrasi.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ route('login') }}" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Login ke Aplikasi</a>
        </div>

        <p>Terima kasih,<br>Tim Admin E-Surat</p>
    </div>
</body>
</html>
