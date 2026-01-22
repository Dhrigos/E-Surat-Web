<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        body {
            background-color: #f3f4f6;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            color: #1f2937;
        }
        .container {
            display: block;
            margin: 0 auto !important;
            max-width: 100%;
            padding: 20px;
            width: 100%;
        }
        .content {
            box-sizing: border-box;
            display: block;
            margin: 0 auto;
            max-width: 100%;
        }
        .main {
            background: #ffffff;
            border-radius: 8px;
            width: 100%;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            border-top: 4px solid #AC0021; /* Kemhan Red Accent */
            overflow: hidden;
        }
        .wrapper {
            box-sizing: border-box;
            padding: 40px 30px;
            text-align: center; /* Center align all text */
        }
        .logo-container {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            height: 120px;
            width: auto;
            margin-bottom: 15px;
        }
        .ministry-title {
            color: #111827;
            font-size: 18px;
            font-weight: 700;
            margin: 0;
            letter-spacing: -0.01em;
            text-transform: uppercase;
        }
        .ministry-subtitle {
            color: #4B5563;
            font-size: 14px;
            font-weight: 500;
            margin: 5px 0 0 0;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .divider {
            border: 0;
            border-top: 1px solid #E5E7EB;
            margin: 25px 0;
        }
        .btn-primary {
            text-decoration: none;
            color: #ffffff !important;
            background-color: #AC0021;
            border: 1px solid #AC0021;
            border-radius: 6px;
            box-sizing: border-box;
            cursor: pointer;
            display: inline-block;
            font-size: 15px;
            font-weight: 600;
            margin: 25px 0;
            padding: 14px 30px;
            text-align: center;
            transition: background-color 0.2s;
        }
        .btn-primary:hover {
            background-color: #8a001a;
            border-color: #8a001a;
        }
        .footer {
            clear: both;
            margin-top: 25px;
            text-align: center;
            width: 100%;
        }
        .footer td, .footer p, .footer span, .footer a {
            color: #6B7280;
            font-size: 12px;
            text-align: center;
        }
        h1 {
            color: #047857; /* Emerald Green for Success */
            font-size: 22px;
            font-weight: 700;
            margin: 0 0 20px 0;
            text-align: center;
        }
        p {
            margin: 0 0 16px 0;
            font-size: 15px;
        }
        .success-box {
            background-color: #ECFDF5;
            border: 1px solid #A7F3D0;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
            color: #065F46;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
        <tr>
            <td>&nbsp;</td>
            <td class="container">
                <div class="content">
                    <table role="presentation" class="main">
                        <tr>
                            <td class="wrapper">
                                <!-- Standardized Header -->
                                <div class="logo-container">
                                    <img src="{{ $message->embed(public_path('/images/KEMENTERIAN-PERTAHANAN.png')) }}" alt="Lambang Kementerian Pertahanan" class="logo">
                                    <h2 class="ministry-title">Kementerian Pertahanan</h2>
                                    <h3 class="ministry-subtitle">Republik Indonesia</h3>
                                </div>

                                <div class="divider"></div>

                                <!-- Success Message -->
                                <h1>Verifikasi Berhasil</h1>
                                
                                <p>Yth. <strong>{{ $user->name }}</strong>,</p>
                                
                                <p>Kami informasikan bahwa proses verifikasi data administrasi dan wawancara E-KYC Anda telah selesai dan dinyatakan <strong>DITERIMA</strong>.</p>
                                
                                <div class="success-box">
                                    Akun Anda Telah Aktif Secara Penuh
                                </div>

                                <p>Saat ini Anda sudah dapat mengakses seluruh fitur layanan E-Surat untuk keperluan administrasi Komponen Cadangan.</p>
                                
                                <div style="text-align: center;">
                                    <!-- Explicit color style inline for extra email client compatibility -->
                                    <a href="{{ route('login') }}" class="btn-primary" style="color: #ffffff !important;">Masuk ke Aplikasi</a>
                                </div>

                                <p style="font-size: 13px; color: #6B7280; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    Hormat Kami,<br>
                                    <strong>Tim Seleksi Administrasi Komponen Cadangan</strong>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="footer">
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td class="content-block">
                                    <p style="margin-bottom: 5px;"><strong>Badan Cadangan Nasional - Kementerian Pertahanan RI</strong></p>
                                    <span>Jl. Medan Merdeka Barat No. 13-14, Jakarta Pusat</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </td>
            <td>&nbsp;</td>
        </tr>
    </table>
</body>
</html>
