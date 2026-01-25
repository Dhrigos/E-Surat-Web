<?php

namespace App\Http\Controllers;

use App\Exports\CalonAnggotaExport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    /**
     * Export Calon Anggota data to Excel.
     */
    public function exportCalonAnggota()
    {
        $fileName = 'data_calon_anggota_' . date('Y-m-d_H-i') . '.xlsx';

        return Excel::download(new CalonAnggotaExport, $fileName);
    }
}
