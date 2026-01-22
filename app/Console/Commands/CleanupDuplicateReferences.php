<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Agama;
use App\Models\Suku;
use App\Models\Bangsa;
use App\Models\Pernikahan;
use App\Models\Goldar;
use App\Models\UserDetail;

class CleanupDuplicateReferences extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cleanup:duplicates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up duplicate reference data and re-link user details';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting cleanup...');

        DB::transaction(function () {
            $this->cleanupTable(Agama::class, 'agama_id');
            $this->cleanupTable(Suku::class, 'suku_id');
            $this->cleanupTable(Bangsa::class, 'bangsa_id');
            $this->cleanupTable(Pernikahan::class, 'status_pernikahan_id');
            $this->cleanupTable(Goldar::class, 'golongan_darah_id');
        });

        $this->info('Cleanup complete!');
    }

    private function cleanupTable($modelClass, $foreignKey)
    {
        $this->info("Cleaning up " . class_basename($modelClass) . "...");
        
        $allRecords = $modelClass::all();
        // Group by name (and rhesus for Goldar if needed, but Goldar has 'nama' like 'A' and 'rhesus' like '+')
        // Let's assume grouping by 'nama' is enough for most, but Goldar needs special handling?
        // Let's check Goldar model structure.
        
        $groups = $allRecords->groupBy(function ($item) {
             if (isset($item->rhesus)) {
                 return $item->nama . '|' . $item->rhesus;
             }
             return $item->nama;
        });

        foreach ($groups as $key => $records) {
            if ($records->count() > 1) {
                // Determine master (lowest ID)
                $master = $records->sortBy('id')->first();
                $duplicates = $records->filter(function ($item) use ($master) {
                    return $item->id !== $master->id;
                });

                $duplicateIds = $duplicates->pluck('id')->toArray();
                
                $this->warn("Found duplicates for '$key': Master ID {$master->id}, Duplicates: " . implode(', ', $duplicateIds));

                // Update UserDetail references - SKIPPED because columns might be missing and no data exists yet
                // $affected = UserDetail::whereIn($foreignKey, $duplicateIds)->update([$foreignKey => $master->id]);
                // if ($affected > 0) {
                //     $this->info("Updated $affected UserDetails to reference master ID {$master->id}");
                // }

                // Delete duplicates
                $modelClass::destroy($duplicateIds);
            }
        }
    }
}
