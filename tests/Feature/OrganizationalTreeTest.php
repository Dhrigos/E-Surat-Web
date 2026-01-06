<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\UnitKerja;
use App\Models\Jabatan;
use App\Models\StatusKeanggotaan;
use App\Models\Pangkat;
use App\Services\OrganizationalTreeService;

class OrganizationalTreeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\MasterDataSeeder::class);
    }

    /** @test */
    public function it_can_get_jabatan_for_a_unit(): void
    {
        $sekretariat = UnitKerja::where('nama', 'Sekretariat')->first();
        $jabatans = $sekretariat->jabatans;

        $this->assertGreaterThan(0, $jabatans->count());
        $this->assertTrue($jabatans->contains('nama', 'Sekretaris Dinas'));
    }

    /** @test */
    public function it_can_get_units_for_a_jabatan(): void
    {
        $stafPelaksana = Jabatan::where('nama', 'Staf Pelaksana')->first();
        $units = $stafPelaksana->unitKerjas;

        // Staf Pelaksana should exist in multiple units
        $this->assertGreaterThan(1, $units->count());
    }

    /** @test */
    public function it_can_get_status_keanggotaan_for_jabatan(): void
    {
        $kepalaDinas = Jabatan::where('nama', 'Kepala Dinas')->first();
        $statuses = $kepalaDinas->statusKeanggotaans;

        // Kepala Dinas should only have "Tetap" status
        $this->assertEquals(1, $statuses->count());
        $this->assertEquals('Tetap', $statuses->first()->nama);
    }

    /** @test */
    public function it_can_get_pangkat_for_status_keanggotaan(): void
    {
        $tetap = StatusKeanggotaan::where('nama', 'Tetap')->first();
        $pangkats = $tetap->pangkats;

        // Tetap should have all pangkat
        $this->assertGreaterThan(0, $pangkats->count());
    }

    /** @test */
    public function kontrak_has_limited_pangkat(): void
    {
        $kontrak = StatusKeanggotaan::where('nama', 'Kontrak')->first();
        $pangkats = $kontrak->pangkats;

        // Kontrak should have limited pangkat (tingkat <= 3)
        $this->assertGreaterThan(0, $pangkats->count());
        
        foreach ($pangkats as $pangkat) {
            $this->assertLessThanOrEqual(3, $pangkat->tingkat);
        }
    }

    /** @test */
    public function it_can_build_organizational_tree(): void
    {
        $service = new OrganizationalTreeService();
        $tree = $service->buildTree();

        $this->assertIsArray($tree);
        $this->assertGreaterThan(0, count($tree));
        
        // Check structure
        $firstUnit = $tree[0];
        $this->assertArrayHasKey('nama', $firstUnit);
        $this->assertArrayHasKey('jabatans', $firstUnit);
        $this->assertArrayHasKey('subunits', $firstUnit);
    }

    /** @test */
    public function it_can_validate_valid_combination(): void
    {
        $service = new OrganizationalTreeService();
        
        $sekretariat = UnitKerja::where('nama', 'Sekretariat')->first();
        $sekretarisDinas = Jabatan::where('nama', 'Sekretaris Dinas')->first();
        $tetap = StatusKeanggotaan::where('nama', 'Tetap')->first();
        $pangkat = Pangkat::first();

        $isValid = $service->validateCombination(
            $sekretariat->id,
            $sekretarisDinas->id,
            $tetap->id,
            $pangkat->id
        );

        $this->assertTrue($isValid);
    }

    /** @test */
    public function it_can_detect_invalid_combination(): void
    {
        $service = new OrganizationalTreeService();
        
        $bidangKeuangan = UnitKerja::where('nama', 'Bidang Keuangan')->first();
        $sekretarisDinas = Jabatan::where('nama', 'Sekretaris Dinas')->first();
        $tetap = StatusKeanggotaan::where('nama', 'Tetap')->first();
        $pangkat = Pangkat::first();

        // Sekretaris Dinas should NOT be in Bidang Keuangan
        $isValid = $service->validateCombination(
            $bidangKeuangan->id,
            $sekretarisDinas->id,
            $tetap->id,
            $pangkat->id
        );

        $this->assertFalse($isValid);
    }

    /** @test */
    public function it_can_get_flat_structure(): void
    {
        $service = new OrganizationalTreeService();
        $flatStructure = $service->getFlatStructure();

        $this->assertIsArray($flatStructure);
        $this->assertGreaterThan(0, count($flatStructure));
        
        // Check structure
        $firstItem = $flatStructure[0];
        $this->assertArrayHasKey('unit_nama', $firstItem);
        $this->assertArrayHasKey('jabatan_nama', $firstItem);
        $this->assertArrayHasKey('status_nama', $firstItem);
        $this->assertArrayHasKey('pangkat_nama', $firstItem);
    }

    /** @test */
    public function unit_hierarchy_works_correctly(): void
    {
        $sekretariat = UnitKerja::where('nama', 'Sekretariat')->first();
        $subBagKeuangan = UnitKerja::where('nama', 'Sub Bagian Keuangan')->first();

        // Sub Bagian Keuangan should be child of Sekretariat
        $this->assertEquals($sekretariat->id, $subBagKeuangan->parent_id);
        $this->assertTrue($sekretariat->children->contains($subBagKeuangan));
    }

    /** @test */
    public function pivot_data_is_accessible(): void
    {
        $sekretariat = UnitKerja::where('nama', 'Sekretariat')->first();
        $jabatan = $sekretariat->jabatans->first();

        // Check pivot data
        $this->assertNotNull($jabatan->pivot);
        $this->assertIsBool($jabatan->pivot->is_active);
    }
}
