<?php

namespace App\Services;

use App\Models\UnitKerja;
use App\Models\Jabatan;
use App\Models\StatusKeanggotaan;
use App\Models\Pangkat;

class OrganizationalTreeService
{
    /**
     * Build complete organizational tree structure.
     *
     * @param int|null $unitId Specific unit ID or null for all root units
     * @return array
     */
    public function buildTree(?int $unitId = null): array
    {
        $query = UnitKerja::with([
            'children.jabatans.statusKeanggotaans.pangkats',
            'jabatans.statusKeanggotaans.pangkats'
        ]);

        if ($unitId) {
            $units = collect([$query->find($unitId)]);
        } else {
            $units = $query->root()->get();
        }

        return $units->map(function ($unit) {
            return $this->formatUnit($unit);
        })->toArray();
    }

    /**
     * Format a single unit with its hierarchy.
     *
     * @param UnitKerja $unit
     * @return array
     */
    protected function formatUnit(UnitKerja $unit): array
    {
        return [
            'id' => $unit->id,
            'nama' => $unit->nama,
            'kode' => $unit->kode,
            'is_active' => $unit->is_active,
            'jabatans' => $unit->jabatans->map(function ($jabatan) {
                return [
                    'id' => $jabatan->id,
                    'nama' => $jabatan->nama,
                    'keterangan' => $jabatan->keterangan,
                    'is_active' => $jabatan->pivot->is_active ?? true,
                    'status_keanggotaan' => $jabatan->statusKeanggotaans->map(function ($status) {
                        return [
                            'id' => $status->id,
                            'nama' => $status->nama,
                            'keterangan' => $status->keterangan,
                            'is_active' => $status->pivot->is_active ?? true,
                            'pangkat' => $status->pangkats->map(function ($pangkat) {
                                return [
                                    'id' => $pangkat->id,
                                    'nama' => $pangkat->nama,
                                    'kode' => $pangkat->kode,
                                    'tingkat' => $pangkat->tingkat,
                                    'is_active' => $pangkat->pivot->is_active ?? true,
                                    'min_tingkat' => $pangkat->pivot->min_tingkat,
                                    'max_tingkat' => $pangkat->pivot->max_tingkat,
                                ];
                            })->toArray()
                        ];
                    })->toArray()
                ];
            })->toArray(),
            'subunits' => $unit->children->map(function ($subunit) {
                return $this->formatUnit($subunit);
            })->toArray()
        ];
    }

    /**
     * Get all jabatan for a specific unit.
     *
     * @param int $unitId
     * @return \Illuminate\Support\Collection
     */
    public function getJabatansByUnit(int $unitId)
    {
        $unit = UnitKerja::with('jabatans')->find($unitId);
        return $unit ? $unit->jabatans : collect();
    }

    /**
     * Get all units that have a specific jabatan.
     *
     * @param int $jabatanId
     * @return \Illuminate\Support\Collection
     */
    public function getUnitsByJabatan(int $jabatanId)
    {
        $jabatan = Jabatan::with('unitKerjas')->find($jabatanId);
        return $jabatan ? $jabatan->unitKerjas : collect();
    }

    /**
     * Get all valid status keanggotaan for a specific jabatan.
     *
     * @param int $jabatanId
     * @return \Illuminate\Support\Collection
     */
    public function getStatusByJabatan(int $jabatanId)
    {
        $jabatan = Jabatan::with('statusKeanggotaans')->find($jabatanId);
        return $jabatan ? $jabatan->statusKeanggotaans : collect();
    }

    /**
     * Get all valid pangkat for a specific status keanggotaan.
     *
     * @param int $statusId
     * @return \Illuminate\Support\Collection
     */
    public function getPangkatByStatus(int $statusId)
    {
        $status = StatusKeanggotaan::with('pangkats')->find($statusId);
        return $status ? $status->pangkats : collect();
    }

    /**
     * Validate if a combination is valid.
     *
     * @param int $unitId
     * @param int $jabatanId
     * @param int $statusId
     * @param int $pangkatId
     * @return bool
     */
    public function validateCombination(int $unitId, int $jabatanId, int $statusId, int $pangkatId): bool
    {
        // Check if jabatan exists in unit
        $unit = UnitKerja::find($unitId);
        if (!$unit || !$unit->jabatans()->where('jabatan_id', $jabatanId)->exists()) {
            return false;
        }

        // Check if status is valid for jabatan
        $jabatan = Jabatan::find($jabatanId);
        if (!$jabatan || !$jabatan->statusKeanggotaans()->where('status_keanggotaan_id', $statusId)->exists()) {
            return false;
        }

        // Check if pangkat is valid for status
        $status = StatusKeanggotaan::find($statusId);
        if (!$status || !$status->pangkats()->where('pangkat_id', $pangkatId)->exists()) {
            return false;
        }

        return true;
    }

    /**
     * Get flattened organizational structure (for dropdowns, etc).
     *
     * @return array
     */
    public function getFlatStructure(): array
    {
        $result = [];

        $units = UnitKerja::with(['jabatans.statusKeanggotaans.pangkats'])->get();

        foreach ($units as $unit) {
            foreach ($unit->jabatans as $jabatan) {
                foreach ($jabatan->statusKeanggotaans as $status) {
                    foreach ($status->pangkats as $pangkat) {
                        $result[] = [
                            'unit_id' => $unit->id,
                            'unit_nama' => $unit->nama,
                            'jabatan_id' => $jabatan->id,
                            'jabatan_nama' => $jabatan->nama,
                            'status_id' => $status->id,
                            'status_nama' => $status->nama,
                            'pangkat_id' => $pangkat->id,
                            'pangkat_nama' => $pangkat->nama,
                            'pangkat_kode' => $pangkat->kode,
                        ];
                    }
                }
            }
        }

        return $result;
    }
}
