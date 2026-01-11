<!DOCTYPE html>
<html>
<head>
    <title>Activity Logs</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .header { margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 18px; }
        .meta { margin-top: 5px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Riwayat Aktifitas Akun</h1>
        <div class="meta">
            User: {{ $user->name }} ({{ $user->username }})<br>
            Tanggal Export: {{ now()->format('d F Y H:i') }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 150px;">Waktu</th>
                <th style="width: 120px;">IP Address</th>
                <th style="width: 150px;">Action</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            @foreach($logs as $log)
            <tr>
                <td>{{ $log->created_at->format('d/m/Y H:i:s') }}</td>
                <td>{{ $log->ip_address }}</td>
                <td>{{ $log->action }}</td>
                <td>{{ $log->description }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
