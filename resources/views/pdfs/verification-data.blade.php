<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Data Verifikasi - {{ $user->name }}</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 14px;
        }
        .section-title {
            background-color: #f0f0f0;
            padding: 8px;
            margin-top: 20px;
            margin-bottom: 10px;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 13px;
            border-left: 4px solid #AC0021;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        th, td {
            padding: 8px;
            text-align: left;
            vertical-align: top;
            border-bottom: 1px solid #ddd;
        }
        th {
            width: 30%;
            background-color: #fafafa;
            font-weight: bold;
        }
        .photo-container {
            text-align: center;
            margin-bottom: 20px;
        }
        .photo-container img {
            max-width: 150px;
            max-height: 200px;
            border: 1px solid #ddd;
            padding: 4px;
        }
        .empty-state {
            color: #999;
            font-style: italic;
            padding: 10px;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>

    <div class="header">
        <h1>KOMPONEN CADANGAN</h1>
        <p>Data Verifikasi Calon Anggota</p>
    </div>

    <div class="photo-container">
        @if($detail && $detail->foto_profil)
            <img src="{{ public_path('storage/' . $detail->foto_profil) }}" alt="Foto Profil">
        @else
            <div style="width: 150px; height: 200px; border: 1px solid #ddd; display: inline-block; line-height: 200px;">No Photo</div>
        @endif
    </div>

    <div class="section-title">Informasi Pribadi</div>
    <table>
        <tr>
            <th>Nama Lengkap</th>
            <td>{{ $user->name }}</td>
        </tr>
        <tr>
            <th>NIK</th>
            <td>{{ $detail->nik ?? '-' }}</td>
        </tr>
        <tr>
            <th>Nomor KK</th>
            <td>{{ $detail->nomor_kk ?? '-' }}</td>
        </tr>
        <tr>
            <th>Nomor Telepon</th>
            <td>{{ $user->phone_number ?? '-' }}</td>
        </tr>
        <tr>
            <th>Email</th>
            <td>{{ $user->email }}</td>
        </tr>
        <tr>
            <th>Tempat, Tanggal Lahir</th>
            <td>
                {{ $detail->birthplace->name ?? ($detail->tempat_lahir ?? '-') }},
                {{ $detail->tanggal_lahir ?? '-' }}
            </td>
        </tr>
        <tr>
            <th>Jenis Kelamin</th>
            <td>{{ $detail->jenis_kelamin ?? '-' }}</td>
        </tr>
        <tr>
            <th>Pilihan Matra</th>
            <td>{{ $detail->matra ?? '-' }}</td>
        </tr>
        <tr>
            <th>Pilihan Golongan</th>
            <td>{{ $detail->golongan->nama ?? '-' }}</td>
        </tr>
        <tr>
            <th>Agama</th>
            <td>{{ $detail->agama->nama ?? '-' }}</td>
        </tr>
        <tr>
            <th>Suku / Bangsa</th>
            <td>{{ $detail->suku->nama ?? '-' }} / {{ $detail->bangsa->nama ?? '-' }}</td>
        </tr>
        <tr>
            <th>Status Pernikahan</th>
            <td>{{ $detail->statusPernikahan->nama ?? '-' }}</td>
        </tr>
        <tr>
            <th>Golongan Darah</th>
            <td>{{ $detail->golonganDarah->nama ?? '-' }} {{ $detail->golonganDarah->rhesus ?? '' }}</td>
        </tr>
        <tr>
            <th>Tinggi / Berat Badan</th>
            <td>{{ $detail->tinggi_badan ?? '-' }} cm / {{ $detail->berat_badan ?? '-' }} kg</td>
        </tr>
        <tr>
            <th>Nama Ibu Kandung</th>
            <td>{{ $detail->nama_ibu_kandung ?? '-' }}</td>
        </tr>
        <tr>
            <th>Alamat</th>
            <td>
                {{ $detail->alamat_domisili_lengkap ?? '-' }}<br>
                @if($detail->desa) Kel/Des. {{ $detail->desa->name }}, @endif
                @if($detail->kecamatan) Kec. {{ $detail->kecamatan->name }}, @endif
                @if($detail->kabupaten) {{ $detail->kabupaten->name }}, @endif
                @if($detail->provinsi) Prov. {{ $detail->provinsi->name }} @endif
            </td>
        </tr>
    </table>

    <div class="section-title page-break">Detail Informasi Pribadi</div>
    <table>
        <tr>
            <th>Warna Kulit</th>
            <td>{{ $detail->warna_kulit ?? '-' }}</td>
        </tr>
        <tr>
            <th>Warna Rambut</th>
            <td>{{ $detail->warna_rambut ?? '-' }}</td>
        </tr>
        <tr>
            <th>Bentuk Rambut</th>
            <td>{{ $detail->bentuk_rambut ?? '-' }}</td>
        </tr>
        <tr>
            <th>Ukuran Pakaian</th>
            <td>{{ $detail->ukuran_pakaian ?? '-' }}</td>
        </tr>
        <tr>
            <th>Ukuran Sepatu</th>
            <td>{{ $detail->ukuran_sepatu ?? '-' }}</td>
        </tr>
        <tr>
            <th>Ukuran Topi</th>
            <td>{{ $detail->ukuran_topi ?? '-' }}</td>
        </tr>
        <tr>
            <th>Ukuran Kaos Olahraga</th>
            <td>{{ $detail->ukuran_kaos_olahraga ?? '-' }}</td>
        </tr>
        <tr>
            <th>Ukuran Sepatu Olahraga</th>
            <td>{{ $detail->ukuran_sepatu_olahraga ?? '-' }}</td>
        </tr>
    </table>

    <div class="section-title">Informasi Pekerjaan & Sekolah</div>
    <table>
        <tr>
            <th>Jenis Pekerjaan</th>
            <td>{{ $detail->pekerjaan->name ?? '-' }}</td>
        </tr>
        <tr>
            <th>Nama Pekerjaan</th>
            <td>{{ $detail->nama_profesi ?? '-' }}</td>
        </tr>
        <tr>
            <th>Nama Perusahaan</th>
            <td>{{ $detail->nama_perusahaan ?? '-' }}</td>
        </tr>
        <tr>
            <th>Jenis Pendidikan</th>
            <td>{{ $detail->pendidikan->nama ?? '-' }}</td>
        </tr>
        <tr>
            <th>Nama Sekolah/Universitas/Lembaga</th>
            <td>{{ $detail->nama_sekolah ?? '-' }}</td>
        </tr>
        <tr>
            <th>Nama Jurusan/Prodi</th>
            <td>{{ $detail->nama_prodi ?? '-' }}</td>
        </tr>
        <tr>
            <th>Nilai Akhir</th>
            <td>{{ $detail->nilai_akhir ?? '-' }}</td>
        </tr>
        <tr>
            <th>Status Pendidikan</th>
            <td>{{ $detail->status_lulus ?? '-' }}</td>
        </tr>
    </table>

    <div class="section-title">Riwayat Organisasi</div>
    @if($user->organisasis && $user->organisasis->count() > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 25%">Nama Organisasi</th>
                    <th style="width: 20%">Jabatan</th>
                    <th style="width: 15%">Tahun</th>
                    <th style="width: 40%">Deskripsi</th>
                </tr>
            </thead>
            <tbody>
                @foreach($user->organisasis as $org)
                    <tr>
                        <td style="border: none; border-bottom: 1px solid #ddd;">{{ $org->nama_organisasi }}</td>
                        <td style="border: none; border-bottom: 1px solid #ddd;">{{ $org->posisi }}</td>
                        <td style="border: none; border-bottom: 1px solid #ddd;">
                            {{ $org->tanggal_mulai ? \Carbon\Carbon::parse($org->tanggal_mulai)->format('Y') : '-' }} - 
                            {{ $org->tanggal_berakhir ? \Carbon\Carbon::parse($org->tanggal_berakhir)->format('Y') : 'Sekarang' }}
                        </td>
                        <td style="border: none; border-bottom: 1px solid #ddd;">{{ $org->informasi_tambahan ?? '-' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty-state">Tidak ada data organisasi.</div>
    @endif

    <div class="section-title">Riwayat Prestasi</div>
    @if($user->prestasi && $user->prestasi->count() > 0)
        <table>
            <thead>
                <tr>
                    <th style="width: 30%">Jenis Prestasi</th>
                    <th style="width: 30%">Nama Prestasi</th>
                    <th style="width: 20%">Tingkat</th>
                    <th style="width: 15%">Pencapaian</th>
                    <th style="width: 35%">Tahun</th>
                </tr>
            </thead>
            <tbody>
                @foreach($user->prestasi as $pres)
                    <tr>
                        <td style="border: none; border-bottom: 1px solid #ddd;">{{ $pres->jenis_prestasi }}</td>
                        <td style="border: none; border-bottom: 1px solid #ddd;">{{ $pres->nama_kegiatan }}</td>
                        <td style="border: none; border-bottom: 1px solid #ddd;">{{ $pres->tingkat ?? '-' }}</td>
                        <td style="border: none; border-bottom: 1px solid #ddd;">{{ $pres->pencapaian ?? '-' }}</td>
                        <td style="border: none; border-bottom: 1px solid #ddd;">{{ $pres->tahun }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="empty-state">Tidak ada data prestasi.</div>
    @endif

    <div class="footer" style="margin-top: 50px; text-align: right; font-size: 10px; color: #999;">
        <p>Dicetak pada: {{ date('d-m-Y H:i') }}</p>
    </div>

</body>
</html>
