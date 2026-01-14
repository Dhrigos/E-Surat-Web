<?php

namespace App\Http\Controllers;

use App\Models\LetterType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MasterDataController extends Controller
{
    public function index()
    {
        return Inertia::render('MasterData/Index', [
            'golongans' => \App\Models\Golongan::orderBy('nama')->get(),
            'pangkats' => \App\Models\Pangkat::with('golongan')->orderBy('nama')->get(),
        ]);
    }

    public function storeGolongan(Request $request)
    {
        $request->validate(['nama' => 'required|string|max:255|unique:golongans,nama']);
        \App\Models\Golongan::create($request->all());
        return redirect()->back()->with('success', 'Golongan berhasil ditambahkan');
    }

    public function updateGolongan(Request $request, $id)
    {
        $request->validate(['nama' => 'required|string|max:255|unique:golongans,nama,'.$id]);
        \App\Models\Golongan::findOrFail($id)->update($request->all());
        return redirect()->back()->with('success', 'Golongan berhasil diperbarui');
    }

    public function destroyGolongan($id)
    {
        \App\Models\Golongan::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Golongan berhasil dihapus');
    }

    public function storePangkat(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:pangkat,nama',
            'golongan_id' => 'nullable|exists:golongans,id'
        ]);
        \App\Models\Pangkat::create($request->all());
        return redirect()->back()->with('success', 'Pangkat berhasil ditambahkan');
    }

    public function updatePangkat(Request $request, $id)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:pangkat,nama,'.$id,
            'golongan_id' => 'nullable|exists:golongans,id'
        ]);
        \App\Models\Pangkat::findOrFail($id)->update($request->all());
        return redirect()->back()->with('success', 'Pangkat berhasil diperbarui');
    }

    public function destroyPangkat($id)
    {
        \App\Models\Pangkat::findOrFail($id)->delete();
        return redirect()->back()->with('success', 'Pangkat berhasil dihapus');
    }

    public function getLetterTypes()
    {
        return response()->json(LetterType::select('id', 'name', 'code', 'description')->get());
    }

    public function getJabatan()
    {
        $query = \App\Models\Jabatan::select('id', 'nama', 'parent_id', 'level', 'kategori');

        if (request()->has('kategori')) {
            $query->where('kategori', request('kategori'));
        }

        // Eager load parent to ensure 'nama_lengkap' accessor works correctly without N+1
        return response()->json($query
            ->with('parent:id,nama') // Optimize: only select needed columns from parent
            ->orderBy('nama')
            ->get());
    }

    public function getUsersByJabatan(Request $request)
    {
        $jabatanId = $request->query('jabatan_id');

        if (! $jabatanId) {
            return response()->json([]);
        }

        $users = \App\Models\User::whereHas('staff', function ($q) use ($jabatanId) {
            $q->where('jabatan_id', $jabatanId)
                ->where('status', 'active');
        })->with(['detail.pangkat', 'staff.jabatan.parent'])->get()
          ->map(function ($user) {
              return [
                  'id' => $user->id,
                  'name' => $user->name,
                  'username' => $user->username,
                  'rank' => $user->detail?->pangkat?->nama,
                  'unit' => $user->staff?->jabatan?->parent?->nama,
                  'position_name' => $user->staff?->jabatan?->nama,
              ];
          });

        return response()->json($users);
    }

    public function getOrganizationTree()
    {
        $nodes = \App\Models\Jabatan::with('children')->whereNull('parent_id')->get();

        return response()->json($nodes);
    }

    public function getSuperior(Request $request)
    {
        $userId = $request->query('user_id');
        $jabatanId = $request->query('jabatan_id');

        $parentJabatan = null;

        if ($jabatanId) {
            // Case 1: Fetch superior of a specific Jabatan (Chaining)
            $currentJabatan = \App\Models\Jabatan::with('parent')->find($jabatanId);
            if (!$currentJabatan) {
                 return response()->json(['message' => 'Jabatan awal tidak ditemukan.'], 404);
            }
            if (!$currentJabatan->parent) {
                 return response()->json(['message' => 'Jabatan ini adalah level tertinggi (tidak memiliki atasan).'], 404);
            }
            $parentJabatan = $currentJabatan->parent;
        } elseif ($userId) {
            // Case 2: Fetch superior of a User (Initial Step)
            // Load both staff and detail relationships
            $user = \App\Models\User::with(['staff.jabatan.parent', 'detail.jabatan.parent'])->find($userId);
            
            if (!$user) {
                return response()->json(['message' => 'User tidak ditemukan.'], 404);
            }

            // Check Staff first, then Detail
            $userJabatan = $user->staff?->jabatan ?? $user->detail?->jabatan;

            if (!$userJabatan) {
                 return response()->json(['message' => 'User ini belum memiliki Jabatan (Cek data Staff/Detail).'], 404);
            }
            if (!$userJabatan->parent) {
                 return response()->json(['message' => 'Jabatan user ini adalah level tertinggi (tidak memiliki atasan).'], 404);
            }

            $parentJabatan = $userJabatan->parent;
        }

        if (!$parentJabatan) {
             // Fallback
             return response()->json(['message' => 'Superior not found (Unknown Error).'], 404);
        }

        \Illuminate\Support\Facades\Log::info('getSuperior Debug:', [
            'request_user' => $userId,
            'request_jabatan' => $jabatanId,
            'resolved_parent_id' => $parentJabatan->id,
            'resolved_parent_name' => $parentJabatan->nama
        ]);

        // Check for direct manager linkage first (Highest priority override)
        if ($userId) {
            $user = \App\Models\User::with('staff.manager.staff.jabatan')->find($userId);
            if ($user && $user->staff && $user->staff->manager_id) {
                // If manager exists, return ONLY the manager
                $manager = $user->staff->manager;
                // Validate manager has a position/role
                $managerHasJabatan = $manager->staff?->jabatan || $manager->detail?->jabatanRole;
                
                if ($manager && $managerHasJabatan) {
                     return response()->json([
                        'jabatan' => $manager->staff?->jabatan ?? $parentJabatan, // Use manager's jabata or fallback
                        'users' => [
                            [
                                'id' => $manager->id,
                                'name' => $manager->name,
                                'username' => $manager->username,
                                'rank' => $manager->detail?->pangkat?->nama,
                                'unit' => $manager->staff?->jabatan?->parent?->nama,
                                'position_name' => $manager->staff?->jabatan?->nama,
                                'role_level' => $manager->detail?->jabatanRole?->level,
                            ]
                        ]
                    ]);
                }
            }
        }

        // --- NEW LOGIC: Check "Same Unit" Head first ---
        // If a userId is provided, we need to know:
        // 1. What is the user's role level?
        // 2. Who is the highest level role in THIS unit?
        // 3. Is the user the highest level?
        
        $targetJabatan = $parentJabatan; // Default to parent (legacy behavior)
        
        if ($userId) {
             // Retrieve re-fresh user with roles
             $currentUser = \App\Models\User::with(['detail.jabatanRole', 'staff.jabatan'])->find($userId);
             $myJabatanId = $currentUser->staff?->jabatan_id;
             $myLevel = $currentUser->detail?->jabatanRole?->level ?? 999;

             if ($myJabatanId) {
                  // Find the minimum level (highest rank) in THIS unit
                  // Check BOTH staff and detail to ensure we find "Direktur" or "Ketua"
                  $minLevelInUnit = \App\Models\User::where(function($query) use ($myJabatanId) {
                        $query->whereHas('staff', function($q) use ($myJabatanId) {
                            $q->where('jabatan_id', $myJabatanId)->where('status', 'active');
                        })->orWhereHas('detail', function($q) use ($myJabatanId) {
                            $q->where('jabatan_id', $myJabatanId);
                        });
                  })->join('user_details', 'users.id', '=', 'user_details.user_id')
                    ->join('jabatan_roles', 'user_details.jabatan_role_id', '=', 'jabatan_roles.id')
                    ->min('jabatan_roles.level');

                  // If I am NOT the highest in my unit (myLevel > minLevelInUnit), 
                  // then my superior is the person in MY unit with minLevel.
                  if (!is_null($minLevelInUnit) && $myLevel > $minLevelInUnit) {
                       $targetJabatan = $currentUser->staff->jabatan; // Stay in same unit
                       // We will filter by minLevel later, which effectively picks the "Ketua"
                       
                       // Override parentJabatan variable for subsequent query
                       $parentJabatan = $targetJabatan; 
                       \Log::info("DEBUG SUPERIOR: Switching target to Same Unit: {$targetJabatan->nama} (ID: {$targetJabatan->id})");
                  } else {
                       \Log::info("DEBUG SUPERIOR: Keeping target as Parent Unit: {$targetJabatan->nama} (ID: {$targetJabatan->id})");
                  }
                  // Else: I am the highest (Ketua), so $parentJabatan (my unit's parent) remains the target.
             }
        }

        // Find users holding the TARGET jabatan (either my unit's head OR parent unit's head)
        $potentialSuperiors = \App\Models\User::where(function($query) use ($parentJabatan) {
            $query->whereHas('staff', function ($q) use ($parentJabatan) {
                $q->where('jabatan_id', $parentJabatan->id)
                  ->where('status', 'active');
            })->orWhereHas('detail', function ($q) use ($parentJabatan) {
                $q->where('jabatan_id', $parentJabatan->id);
            });
        })->with(['detail.jabatanRole', 'staff.jabatan.parent'])->get();

        // Calculate Min Level (Highest Rank) available in this set
        $minLevel = $potentialSuperiors->map(function ($u) {
            // Get role from detail (or staff if we had role there)
            // Assuming JabatanRole is linked to UserDetail via jabatan_role_id
            return $u->detail?->jabatanRole?->level ?? 999;
        })->min();

        // If no one has a role assigned, fallback to returning all
        if ($minLevel === null || $minLevel === 999) {
             $filteredSuperiors = $potentialSuperiors;
        } else {
             $filteredSuperiors = $potentialSuperiors->filter(function ($u) use ($minLevel) {
                 $level = $u->detail?->jabatanRole?->level ?? 999;
                 return $level === $minLevel;
             });
        }

        $superiors = $filteredSuperiors->values()->map(function ($user) {
              return [
                  'id' => $user->id,
                  'name' => $user->name,
                  'username' => $user->username,
                  'rank' => $user->detail?->pangkat?->nama,
                  'unit' => $user->staff?->jabatan?->parent?->nama,
                  'position_name' => $user->staff?->jabatan?->nama,
                  'role_level' => $user->detail?->jabatanRole?->level,
              ];
          });

        \Illuminate\Support\Facades\Log::info('getSuperior Result:', [
            'count' => $superiors->count(),
            'users' => $superiors->pluck('name')
        ]);

        return response()->json([
            'jabatan' => $parentJabatan,
            'users' => $superiors
        ]);
    }
}
