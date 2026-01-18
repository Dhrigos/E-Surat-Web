@php
    $sender = $letter->creator;
    $senderName = $sender->name ?? '';
    // Determine letter number
    $letterNumber = $letter->letter_number ?? ($letter->code ?? '...');
    // Format date
    $date = $letter->date ?? date('d F Y');
    $place = $letter->place ?? 'Jakarta';
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>{{ $letter->subject }}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background-color: #fff;
            width: 210mm;
            height: 297mm;
            position: relative;
        }
        /* This represents the full paper */
        .paper {
            width: 210mm;
            height: 297mm;
            position: relative;
            box-sizing: border-box;
        }
        /* This represents the text content area with 2.5cm margins */
        .content-area {
            padding: 2.5cm;
            position: relative;
            z-index: 1;
        }
        .kop-surat {
            border-bottom: 3px solid #000;
            margin-bottom: 30px;
            padding-bottom: 20px;
            text-align: center;
            position: relative;
        }
        .logo {
            position: absolute;
            left: 0;
            top: 0;
            width: 80px;
            height: 80px;
        }
        .header-text h2 {
            margin: 0;
            font-size: 12pt;
            font-weight: bold;
        }
        .header-text h1 {
            margin: 5px 0;
            font-size: 14pt;
            font-weight: bold;
            white-space: nowrap;
        }
        .header-text p {
            margin: 2px 0;
            font-size: 9pt;
        }
        .info-section {
            margin-bottom: 30px;
            width: 100%;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            vertical-align: top;
        }
        .letter-content {
            text-align: justify;
            min-height: 400px;
            white-space: pre-wrap;
        }
        .recipient-section {
            margin-bottom: 30px;
        }
        /* Signatures Layer - Relative to the FULL PAPER */
        .signature-item {
            position: absolute;
            width: 150px;
            text-align: center;
            z-index: 10;
        }
        .sig-jabatan {
            font-size: 10pt;
            font-weight: bold;
            line-height: 1.1;
            text-transform: uppercase;
            margin-bottom: 2px;
        }
        .sig-unit {
            font-size: 9pt;
            font-weight: bold;
            line-height: 1.1;
            text-transform: uppercase;
            color: #444;
            margin-bottom: 5px;
        }
        .sig-header-area {
            height: 50px; /* Accommodate two lines */
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .sig-image-container {
            height: 40px;
            width: 100%;
            margin: 2px 0;
            display: block;
        }
        .sig-image {
            max-height: 100%;
            max-width: 100%;
            object-fit: contain;
        }
        .sig-name {
            font-size: 11pt;
            font-weight: bold;
            text-decoration: underline;
        }
        .sig-nip {
            font-size: 9pt;
            color: #333;
            margin-top: 2px;
        }
        .footer {
            position: absolute;
            bottom: 1cm;
            left: 2.5cm;
            right: 2.5cm;
            text-align: center;
            font-size: 8pt;
            color: #777;
            border-top: 1px solid #eee;
            padding-top: 5px;
        }
    </style>
</head>
<body>
    <div class="paper">
        <div class="content-area">
            <!-- Kop Surat -->
            <!-- Kop Surat -->
            <table class="kop-surat" style="border-bottom: 3px solid #000; width: 100%; margin-bottom: 8px; padding-bottom: 4px;">
                <tr>
                    <td style="width: 30px;"></td> <!-- Left Shift Spacer -->
                    <td style="width: 180px; text-align: center; vertical-align: top; padding-top: 10px;">
                        <img src="{{ public_path('images/BADAN-CADANGAN-NASIONAL.png') }}" style="width: 80px; height: 80px;" alt="Logo">
                    </td>
                    <td style="text-align: center; vertical-align: middle;">
                        <div class="header-text">
                            <h2>KEMENTERIAN PERTAHANAN RI</h2>
                            <h1>BADAN CADANGAN NASIONAL</h1>
                            <p>Jalan Medan Merdeka Barat No. 13-14, Jakarta Pusat, 10110</p>
                            <p>Website: www.kemhan.go.id Email: ppid@kemhan.go.id</p>
                        </div>
                    </td>
                    <td style="width: 60px;"></td> <!-- Spacer for centering -->
                </tr>
            </table>

            <!-- Letter Info -->
            <div class="info-section">
                <table class="info-table">
                    <tr>
                        <td style="width: 60%">
                            <table class="info-table">
                                <tr><td style="width: 80px">Nomor</td><td style="width: 10px">:</td><td>{{ $letterNumber }}</td></tr>                                
                                <tr><td>Perihal</td><td>:</td><td><strong>{{ $letter->subject }}</strong></td></tr>
                            </table>
                        </td>
                        <td style="text-align: right">
                            {{ $place }}, {{ $date }}
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Recipient -->
            <div class="recipient-section">
                Kepada Yth.<br>
                <strong>{{ $letter->recipient_name ?? $letter->recipient }}</strong><br>
                di Tempat
            </div>

            <!-- Content -->
            <div class="letter-content">{!! nl2br(e($letter->content)) !!}</div>
        </div>

        <!-- Dynamic Signatures (Absolute to Paper) -->
        @if($letter->signature_positions)
            @php $processedUsers = []; @endphp
            @foreach($letter->signature_positions as $stepId => $pos)
                @php
                    $stepApprover = $letter->approvers->where('order', (int)$stepId)->first();
                    $isApproved = $stepApprover && $stepApprover->status === 'approved';
                    
                    // Fallback for sender
                    if (!$stepApprover && $sender) {
                        $pName = $pos['name'] ?? '';
                        if (stripos($senderName, $pName) !== false || stripos($pName, $senderName) !== false) {
                            $stepApprover = $sender; // This will be the User model
                            $isApproved = true;
                        }
                    }

                    // Ensure we have the user model for signature
                    $user = null;
                    if ($stepApprover) {
                        if ($stepApprover instanceof \App\Models\User) {
                            $user = $stepApprover;
                        } elseif (isset($stepApprover->user_id)) {
                            $user = \App\Models\User::find($stepApprover->user_id);
                        }
                    }

                    // Deduplication Logic
                    if ($user) {
                        if (in_array($user->id, $processedUsers)) {
                            $user = null; // Skip rendering
                        } else {
                            $processedUsers[] = $user->id;
                        }
                    }
                @endphp

                @if($user && ($isApproved || $stepApprover == $sender))
                    <div class="signature-item" style="left: {{ $pos['x'] }}%; top: {{ $pos['y'] }}%;">
                        <div class="sig-header-area">
                            <div class="sig-jabatan">{{ $pos['jabatan'] ?? ($user->detail?->jabatan?->nama ?? 'Pejabat') }}</div>
                            <div class="sig-unit">{{ $pos['unit'] ?? ($user->detail?->jabatan?->parent?->nama ?? '') }}</div>
                        </div>
                        <div class="sig-image-container">
                            @if($user->signature_url)
                                @php
                                    $sigPath = public_path(str_replace(url('/'), '', $user->signature_url));
                                @endphp
                                @if(file_exists($sigPath))
                                    <img src="{{ $sigPath }}" class="sig-image">
                                @endif
                            @endif
                        </div>
                        <div class="sig-name">{{ $pos['name'] ?? $user->name }}</div>
                        <div class="sig-nip">{{ $pos['rank'] ?? ($user->detail?->pangkat?->nama ?? '') }}</div>
                        <div class="sig-nip">NIP. {{ $pos['nip'] ?? ($user->detail?->nia_nrp ?? '') }}</div>
                    </div>
                @endif
            @endforeach
        @endif

        <div class="footer">
            Dokumen ini telah ditandatangani secara elektronik. Keaslian dapat diverifikasi melalui sistem E-Surat.
        </div>
    </div>
</body>
</html>
