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
            text-align: center;
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
            color: #111827;
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 20px 0;
            text-align: center;
        }
        p {
            margin: 0 0 16px 0;
            font-size: 15px;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 8px;
            color: #AC0021;
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background-color: #FEF2F2;
            border-radius: 8px;
            border: 2px dashed #FECACA;
            display: inline-block;
            min-width: 200px;
        }
        .warning-text {
            color: #EF4444; 
            font-weight: 600;
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

                                <h1>Kode Verifikasi (OTP)</h1>
                                
                                <p>Yth. Calon Anggota Komponen Cadangan,</p>
                                <p>Gunakan kode verifikasi berikut untuk melanjutkan proses pendaftaran atau masuk ke aplikasi:</p>
                                
                                <div class="otp-code">
                                    {{ $otp }}
                                </div>

                                <p>Kode ini hanya berlaku selama <strong>5 menit</strong>.</p>
                                <p class="warning-text">JANGAN BERIKAN KODE INI KEPADA SIAPAPUN TERMASUK ADMIN.</p>

                                <div class="divider"></div>

                                <p style="font-size: 13px; color: #6B7280;">
                                    Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.
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
