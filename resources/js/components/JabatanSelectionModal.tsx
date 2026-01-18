import React, { useMemo, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronRight, CheckCircle2, Circle, Undo2, ArrowLeft, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CascadingJabatanRoleSelector } from '@/components/CascadingJabatanRoleSelector';

interface Jabatan {
    id: number;
    nama: string;
    parent_id?: number | null;
    level?: number;
    kategori?: string;
}
interface JabatanRole {
    id: number;
    nama: string;
    parent_id?: number | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jabatans: Jabatan[];
    jabatanRoles: JabatanRole[];
    initialUnitId?: string;
    initialRole?: string; // This might be Name or ID? Let's assume ID for consistency if we migrate fully. But wait, `initialRole` was likely a name before? No, `CompleteProfile` stored string. Now it will store ID.
    onConfirm: (unitId: string, roleId: string) => void;
}

function JabatanSelectionModalBase({ open, onOpenChange, jabatans, jabatanRoles, initialUnitId, initialRole, onConfirm }: Props) {
    // --- Data Processing ---
    const { childrenMap, itemMap, rootItems } = useMemo(() => {
        const cMap: Record<number | string, Jabatan[]> = {};
        const iMap: Record<number, Jabatan> = {};
        const roots: Jabatan[] = [];

        jabatans.forEach(j => {
            iMap[j.id] = j;
            const pid = j.parent_id || 'root';
            if (!cMap[pid]) cMap[pid] = [];
            cMap[pid].push(j);

            if (!j.parent_id) roots.push(j);
        });
        return { childrenMap: cMap, itemMap: iMap, rootItems: roots };
    }, [jabatans]);

    // --- State ---
    // path stores the stack of PARENT jabatans we have drilled into.
    const [path, setPath] = useState<Jabatan[]>([]);

    // selectedUnit is the one the user Locked to pick a role.
    const [selectedUnit, setSelectedUnit] = useState<Jabatan | null>(null);
    const [selectedRoleId, setSelectedRoleId] = useState('');

    // --- Init ---
    useEffect(() => {
        if (open) {
            if (initialUnitId && itemMap[Number(initialUnitId)]) {
                const target = itemMap[Number(initialUnitId)];
                setSelectedUnit(target);
                setSelectedRoleId(initialRole || '');

                // Reconstruct path to this item
                const newPath = [];
                let curr = target.parent_id ? itemMap[target.parent_id] : null;
                while (curr) {
                    newPath.unshift(curr);
                    curr = curr.parent_id ? itemMap[curr.parent_id] : null;
                }
                setPath(newPath);
            } else {
                setPath([]);
                setSelectedUnit(null);
                setSelectedRoleId('');
            }
        }
    }, [open, initialUnitId, initialRole, itemMap]);

    // --- Helpers ---
    const currentParentId = path.length > 0 ? path[path.length - 1].id : 'root';
    const currentChildren = childrenMap[currentParentId] || [];

    const handleNavigateDown = (item: Jabatan) => {
        setPath([...path, item]);
    };

    const handleNavigateUp = () => {
        if (path.length === 0) return;
        setPath(path.slice(0, -1));
    };

    const handleJumpToLevel = (index: number) => {
        setPath(path.slice(0, index + 1));
        // Reset selection when navigating via breadcrumbs to show list view again
        setSelectedUnit(null);
        setSelectedRoleId('');
    };

    const handleReset = () => {
        setPath([]);
        setSelectedUnit(null);
        setSelectedRoleId('');
    };

    // ... (lines 78-115)

    // Refined Flow:
    // If selectedUnit is set -> Show Role Selection View.
    // Else -> Show Navigation View (List).

    const roleOptions = useMemo(() => {
        if (!selectedUnit) return [];

        // Smart Mapping: Filter roles based on Selected Unit Name
        // Example: Unit "Subdirektorat X" -> Show Role Root "Subdirektorat" + Children
        // Example: Unit "Direktorat Y" -> Show Role Root "Direktorat" + Children

        // Strategy: Check if any Root Role name is contained in the Unit Name
        // We only look at Top Level roles (parent_id === null) from the provided list
        // actually existing list 'jabatanRoles' is flat. We need to identify roots.

        // Let's first identify potential root matches.
        const unitNameUpper = selectedUnit.nama.toUpperCase();

        // Find a root role that matches the start of the unit name
        // e.g. Role "DIREKTORAT" matches "DIREKTORAT JENDERAL..." ? careful. "Direktorat Jenderal" is separate role.
        // We should try to find the Longest Matching Root Role Name?

        const rootRoles = jabatanRoles.filter(r => !r.parent_id);
        let bestMatch: JabatanRole | null = null;

        for (const root of rootRoles) {
            const roleNameUpper = root.nama.toUpperCase();
            if (unitNameUpper.includes(roleNameUpper)) {
                // If we have a match, check if it's better (longer) than previous
                if (!bestMatch || roleNameUpper.length > bestMatch.nama.length) {
                    bestMatch = root;
                }
            }
        }

        if (bestMatch) {
            // If match found, return ONLY this root and its descendants (if we can find them in the flat list)
            // The flat list 'jabatanRoles' contains all roles.
            // We need to filter recursively? 
            // Actually, we can just filter where id == bestMatch.id OR parent_id == bestMatch.id (and grandchildren?).
            // The list is flat. If we only return the relevant subset, the Selector will hide others.

            // Helper to find all descendants
            const getDescendants = (parentId: number): JabatanRole[] => {
                const children = jabatanRoles.filter(r => r.parent_id === parentId);
                let descendants = [...children];
                children.forEach(child => {
                    descendants = [...descendants, ...getDescendants(child.id)];
                });
                return descendants;
            };

            const descendants = getDescendants(bestMatch.id);
            return [bestMatch, ...descendants];
        }

        // Default: Return all roles if no specific match
        return jabatanRoles;
    }, [selectedUnit, jabatanRoles]);

    const handleConfirm = () => {
        if (selectedUnit && selectedRoleId) {
            onConfirm(selectedUnit.id.toString(), selectedRoleId);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333] text-white p-0 gap-0">
                {/* ... Header & Breadcrumbs ... (unchanged) */}

                <div className="p-4 border-b border-white/10 bg-zinc-900/50">
                    <DialogTitle className="text-xl mb-3">Pilih Unit & Jabatan</DialogTitle>

                    {/* Breadcrumbs - Scrollable & Compact */}
                    <div className="flex items-center gap-1.5 text-sm overflow-x-auto scrollbar-hide whitespace-nowrap pb-2 mask-linear">
                        <div
                            onClick={handleReset}
                            className={cn(
                                "cursor-pointer transition-colors flex items-center flex-shrink-0 px-2 py-1 rounded-md hover:bg-white/10",
                                path.length === 0 ? "text-white font-bold bg-white/5" : "text-gray-500 hover:text-white"
                            )}>
                            <Building2 className="w-4 h-4 mr-1.5" />
                            <span>Status Personel</span>
                        </div>

                        {path.map((item, idx) => (
                            <React.Fragment key={item.id}>
                                <ChevronRight className="w-3 h-3 text-gray-700 flex-shrink-0" />
                                <div
                                    onClick={() => handleJumpToLevel(idx)}
                                    className={cn(
                                        "cursor-pointer transition-all px-2 py-1 rounded-md hover:bg-white/10 max-w-[200px] truncate",
                                        idx === path.length - 1 && !selectedUnit ? "text-white font-bold bg-white/5" : "text-gray-500 hover:text-white"
                                    )}
                                    title={item.nama}
                                >
                                    {item.nama}
                                </div>
                            </React.Fragment>
                        ))}

                        {selectedUnit && (
                            <>
                                <ChevronRight className="w-3 h-3 text-gray-700 flex-shrink-0" />
                                <Badge variant="secondary" className="bg-red-600/20 text-[#B0B0B0] hover:bg-red-600/30 border-red-600/50 flex-shrink-0">
                                    <span className="max-w-[200px] truncate block">{selectedUnit.nama}</span>
                                    <span className="ml-1 opacity-70 text-[10px]">(Terpilih)</span>
                                </Badge>
                            </>
                        )}
                    </div>
                </div>

                {/* Main Content Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 min-h-[400px]">

                    {/* VIEW: ROLE SELECTION (Final Step) */}
                    {selectedUnit && selectedUnit.nama.toUpperCase().includes('ANGGOTA') ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center border-2 border-red-600">
                                <CheckCircle2 className="w-8 h-8 text-red-500" />
                            </div>

                            <div className="text-center space-y-1 mb-4">
                                <h3 className="text-xl font-bold">Anggota</h3>
                                <p className="text-gray-400">Anda akan bergabung sebagai Anggota.</p>
                            </div>

                            {/* Auto-select logic happens on confirm usually, but we need the ID. 
                                We find the 'Anggota' role ID from props. */}

                            <div className="flex gap-3 mt-4">
                                <Button variant="outline" onClick={() => setSelectedUnit(null)} className="border-white/10 hover:bg-zinc-800 text-gray-300">
                                    <Undo2 className="w-4 h-4 mr-2" />
                                    Ganti Unit
                                </Button>
                                <Button
                                    onClick={() => {
                                        // Find 'Anggota' role
                                        const anggotaRole = jabatanRoles.find(r => r.nama.toUpperCase() === 'ANGGOTA');
                                        if (anggotaRole) {
                                            onConfirm(selectedUnit.id.toString(), anggotaRole.id.toString());
                                            onOpenChange(false);
                                        } else {
                                            // Fallback or error if role not found (shouldn't happen with correct seeder)
                                            console.error("Role 'Anggota' not found in system.");
                                            // Maybe alert user?
                                        }
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white min-w-[150px]"
                                >
                                    Konfirmasi
                                </Button>
                            </div>
                        </div>
                    ) : selectedUnit ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <style>{`
                                @keyframes check-pop {
                                    0% { transform: scale(0); opacity: 0; }
                                    70% { transform: scale(1.2); }
                                    100% { transform: scale(1); opacity: 1; }
                                }
                                @keyframes ring-pulse {
                                    0% { box-shadow: 0 0 0 0 rgba(172, 0, 33, 0.4); }
                                    70% { box-shadow: 0 0 0 10px rgba(172, 0, 33, 0); }
                                    100% { box-shadow: 0 0 0 0 rgba(172, 0, 33, 0); }
                                }
                            `}</style>
                            <div className="w-16 h-16 bg-[#AC0021]/20 rounded-full flex items-center justify-center border-2 border-[#AC0021] animate-[ring-pulse_2s_infinite]">
                                <CheckCircle2 className="w-8 h-8 text-[#AC0021] animate-[check-pop_0.5s_ease-out_forwards]" />
                            </div>

                            <div className="text-center space-y-1 mb-4">
                                <h3 className="text-xl font-bold">Tetapkan Posisi</h3>
                            </div>

                            <div className="w-full max-w-sm space-y-3">
                                <div className="w-full max-w-sm space-y-3">
                                    <CascadingJabatanRoleSelector
                                        roles={roleOptions}
                                        value={selectedRoleId}
                                        onChange={setSelectedRoleId}
                                        placeholder="Pilih Posisi..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <Button variant="outline" onClick={() => setSelectedUnit(null)} className="border-white/10 hover:bg-zinc-800 text-gray-300">
                                    <Undo2 className="w-4 h-4 mr-2" />
                                    Ganti Unit
                                </Button>
                                <Button
                                    onClick={handleConfirm}
                                    disabled={!selectedRoleId}
                                    className="bg-[#AC0021] hover:bg-[#AC0021]/80 text-white min-w-[150px]"
                                >
                                    Konfirmasi & Simpan
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // VIEW: NAVIGATION LIST
                        <div className="space-y-4">
                            {/* Option to Select Current Level Parent (if not root) */}
                            {path.length > 0 && !['FUNGSIONAL', 'STRUKTURAL'].includes(path[path.length - 1].nama) && (
                                <div className="p-4 rounded-xl border border-dashed border-white/20 bg-white/5 flex items-center justify-between mb-6 group hover:border-[#AC0021] transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-[#AC0021]">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-md text-[#FEFCF8]">Saya bekerja di unit <br></br>{path[path.length - 1].nama}</h4>
                                            {/* <p className="text-xs text-gray-400">Saya bekerja langsung di kantor {path[path.length - 1].nama}</p> */}
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => setSelectedUnit(path[path.length - 1])} variant="secondary" className="hover:bg-[#AC0021] hover:text-white bg-[#AC0021]/10 text-red-100 border border-[#AC0021]/20">
                                        Pilih
                                    </Button>
                                </div>
                            )}

                            {/* Children List - Single Column for clearer hierarchy */}
                            <div className={cn("flex flex-col gap-2 relative",
                                (path.length > 0 && !['FUNGSIONAL', 'STRUKTURAL'].includes(path[path.length - 1].nama)) && "ml-8 pl-8 border-l-2 border-dashed border-white/10"
                            )}>
                                {/* Visual styling for the dashed line connection */}
                                {(path.length > 0 && !['FUNGSIONAL', 'STRUKTURAL'].includes(path[path.length - 1].nama)) && (
                                    <div className="absolute top-[-24px] left-[-2px] w-[2px] h-[24px] border-l-2 border-dashed border-white/10" />
                                )}

                                {currentChildren.length > 0 ? (
                                    currentChildren.map(child => {
                                        const hasSubChildren = childrenMap[child.id]?.length > 0;
                                        const isRestricted = ['FUNGSIONAL', 'STRUKTURAL'].includes(child.nama);

                                        return (
                                            <div
                                                key={child.id}
                                                className="group p-3 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/10 hover:bg-zinc-800/80 transition-all relative flex items-center justify-between gap-3"
                                            >
                                                {/* Connecting line for item */}
                                                {(path.length > 0 && !['FUNGSIONAL', 'STRUKTURAL'].includes(path[path.length - 1].nama)) && (
                                                    <div className="absolute top-1/2 left-[-34px] w-[32px] h-[2px] border-t-2 border-dashed border-white/10" />
                                                )}

                                                {/* Left Side: Navigation / Info */}
                                                <div
                                                    onClick={() => {
                                                        if (hasSubChildren) {
                                                            handleNavigateDown(child);
                                                        } else {
                                                            setSelectedUnit(child);
                                                        }
                                                    }}
                                                    className="flex-1 flex items-center gap-4 min-w-0 cursor-pointer"
                                                >
                                                    {/* Icon */}
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl font-bold border border-white/5 shadow-sm",
                                                        "bg-gray-800 text-gray-400 group-hover:bg-red-600/20 group-hover:text-red-500 group-hover:border-red-500/20 transition-all duration-300"
                                                    )}>
                                                        {child.nama.charAt(0)}
                                                    </div>

                                                    {/* Text Content */}
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                                                        <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors text-base leading-snug break-words">
                                                            {child.nama}
                                                        </h4>
                                                        <div className="mt-1.5 flex items-center gap-2">
                                                            {hasSubChildren && (
                                                                <Badge variant="outline" className="text-[10px] px-2 h-5 border-white/10 text-gray-500 bg-black/20 font-normal">
                                                                    {childrenMap[child.id].length} Unit Bawahan
                                                                </Badge>
                                                            )}
                                                            {!hasSubChildren && (
                                                                <Badge variant="outline" className="text-[10px] px-2 h-5 border-emerald-500/20 text-emerald-500 bg-emerald-500/10 font-medium">
                                                                    Unit Akhir
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-16 text-center text-gray-500 flex flex-col items-center justify-center bg-zinc-900/30 rounded-xl border border-dashed border-white/10">
                                        <Building2 className="w-12 h-12 text-white/5 mb-4" />
                                        <p className="mb-4">Tidak ada sub-unit di level ini.</p>
                                        <Button variant="outline" onClick={() => setSelectedUnit(path[path.length - 1])} className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                            Pilih "{path[path.length - 1]?.nama}"
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer only for Navigation Mode */}
                {!selectedUnit && (
                    <div className="p-4 border-t border-white/10 bg-zinc-900/50 flex justify-between">
                        <Button variant="ghost" onClick={() => path.length > 0 ? handleNavigateUp() : onOpenChange(false)} className="text-gray-400 hover:text-white">
                            {path.length > 0 ? <><ArrowLeft className="w-4 h-4 mr-2" /> Kembali</> : 'Batal'}
                        </Button>
                        <div className="text-xs text-[#B0B0B0] py-2">
                            Pilih struktur organisasi Anda secara bertahap
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export const JabatanSelectionModal = React.memo(JabatanSelectionModalBase);
