<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $letter->subject }}</title>
    <style>
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 10px;
            margin-bottom: 30px;
            position: relative;
        }
        .logo {
            position: absolute;
            left: 0;
            top: 0;
            width: 80px;
            height: auto;
        }
        .instansi-name {
            font-size: 16pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
        }
        .instansi-address {
            font-size: 10pt;
            margin: 5px 0;
        }
        .letter-info {
            margin-bottom: 20px;
        }
        .letter-content {
            text-align: justify;
            margin-bottom: 50px;
            min-height: 300px;
        }
        .signature-section {
            float: right;
            width: 250px;
            text-align: center;
        }
        .signature-name {
            font-weight: bold;
            text-decoration: underline;
            margin-top: 60px;
        }
        .signature-nip {
            font-size: 10pt;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            text-align: center;
            font-size: 8pt;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }
        table {
            width: 100%;
        }
        .meta-table td {
            vertical-align: top;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Letterhead (Kop Surat) -->
        <div class="header">
            <!-- Placeholder Logo -->
            <!-- <img src="{{ public_path('images/logo.png') }}" class="logo" alt="Logo"> -->
            
            <h1 class="instansi-name">BADAN CADANGAN NASIONAL</h1>
            <p class="instansi-address">
                Jl. Merdeka Barat No. 12, Jakarta Pusat, DKI Jakarta 10110<br>
                Telp: (021) 12345678 | Email: info@bcn.go.id | Website: www.bcn.go.id
            </p>
        </div>

        <!-- Letter Meta -->
        <div class="letter-info">
            <table class="meta-table">
                <tr>
                    <td width="15%">Nomor</td>
                    <td width="2%">:</td>
                    <td width="48%">{{ $letter->id }}/BCN/{{ date('Y') }}</td> <!-- Dummy Number Format -->
                    <td width="35%" style="text-align: right;">{{ $letter->created_at->translatedFormat('d F Y') }}</td>
                </tr>
                <tr>
                    <td>Lampiran</td>
                    <td>:</td>
                    <td>{{ $letter->attachments->count() }} Berkas</td>
                    <td></td>
                </tr>
                <tr>
                    <td>Perihal</td>
                    <td>:</td>
                    <td><strong>{{ $letter->subject }}</strong></td>
                    <td></td>
                </tr>
            </table>
        </div>

        <div style="margin-bottom: 20px;">
            Kepada Yth.<br>
            <strong>
                @foreach($letter->recipients as $recipient)
                    @if($recipient->recipient_type == 'user')
                        {{ \App\Models\User::find($recipient->recipient_id)?->name }}
                    @else
                        {{ $recipient->recipient_id }}
                    @endif
                    @if(!$loop->last), @endif
                @endforeach
            </strong><br>
            di Tempat
        </div>

        <!-- Content -->
        <div class="letter-content">
            {!! nl2br(e($letter->content)) !!}
        </div>

        <!-- Signature -->
        <div class="signature-section">
            <p>Hormat Kami,</p>
            <p>Pengirim</p>
            
            <!-- QR Code Placeholder if approved -->
            @if($letter->status == 'approved')
                <div style="margin: 10px auto; width: 80px; height: 80px; border: 1px solid #000; display: flex; align-items: center; justify-content: center;">
                    <small>QR Validated</small>
                </div>
            @endif

            <p class="signature-name">{{ $letter->creator->name }}</p>
            <!-- <p class="signature-nip">NIP. 19800101 200001 1 001</p> -->
        </div>

        <!-- Footer -->
        <div class="footer">
            Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh Balai Sertifikasi Elektronik (BSrE), BSSN.
        </div>
    </div>
</body>
</html>
