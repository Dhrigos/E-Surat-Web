import React, { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';

interface Jabatan {
    id: number;
    nama: string;
    parent_id?: number | null;
    level?: number;
}

interface Props {
    jabatans: Jabatan[];
    value?: string | number;
    onChange: (value: string) => void;
    error?: string;
}

export function CascadingJabatanSelector({ jabatans, value, onChange, error }: Props) {
    // 1. Convert flat list to tree-like adjacency list for O(1) lookups
    const { childrenMap, itemMap } = useMemo(() => {
        const cMap: Record<number | string, Jabatan[]> = {}; // Key is parent_id (or 'root' for null)
        const iMap: Record<number, Jabatan> = {};

        jabatans.forEach(j => {
            iMap[j.id] = j;
            const pid = j.parent_id || 'root';
            if (!cMap[pid]) cMap[pid] = [];
            cMap[pid].push(j);
        });
        return { childrenMap: cMap, itemMap: iMap };
    }, [jabatans]);

    // 2. Determine the path of selected IDs based on the current `value` (leaf or intermediate node)
    // We recreate this whenever `value` changes from outside (e.g. initial load)
    const [selectionPath, setSelectionPath] = useState<number[]>([]);

    useEffect(() => {
        if (!value) {
            setSelectionPath([]);
            return;
        }

        const id = Number(value);
        const path: number[] = [];
        let current = itemMap[id];

        // Traverse up to build path [RootID, ..., LeafID]
        while (current) {
            path.unshift(current.id);
            if (!current.parent_id) break;
            current = itemMap[current.parent_id];
        }

        setSelectionPath(path);
    }, [value, itemMap]);

    // 3. Handle change at a specific depth index
    // index 0 = Level 1 select, index 1 = Level 2 select, etc.
    const handleSelect = (selectedIdStr: string, depthIndex: number) => {
        const selectedId = Number(selectedIdStr);

        // Take the path up to this depth, and append the new selection
        // All subsequent children selections are discarded (reset)
        const newPath = [...selectionPath.slice(0, depthIndex), selectedId];

        setSelectionPath(newPath);
        onChange(selectedId.toString());
    };

    // 4. Render drop-downs dynamically
    // We verify if the last selected item has children. If so, we render the next level.
    // We always start with 'root'.
    const renderedLevels = [];
    let currentParentId: number | string = 'root';

    // We iterate one step BEYOND the current path length to allow selecting the next child
    // Max 5 levels as safeguards, though logic is generic
    for (let i = 0; i < selectionPath.length + 1; i++) {
        const options = childrenMap[currentParentId];

        // If no options for this level, stop rendering
        if (!options || options.length === 0) break;

        const currentSelectedId = selectionPath[i] ? selectionPath[i].toString() : '';

        renderedLevels.push(
            <div key={i} className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <Label className="text-white font-medium flex items-center gap-2">
                    {(i > 0 || i === 0) && <ChevronRight className={`w-3 h-3 text-red-500 ${i === 0 ? 'md:hidden' : ''}`} />}
                    Tingkat {i + 1}
                </Label>
                <Select
                    value={currentSelectedId}
                    onValueChange={(val) => handleSelect(val, i)}
                >
                    <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${error && i === selectionPath.length - 1 ? 'border-red-500' : 'focus:border-red-500'}`}>
                        <SelectValue placeholder={`Pilih Jabatan Tingkat ${i + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(opt => (
                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                {opt.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );

        // Prepare parent ID for next iteration (if we have a selection at this level)
        if (currentSelectedId) {
            currentParentId = Number(currentSelectedId);
        } else {
            break; // Can't render next level if current one isn't selected
        }
    }

    // Dynamic grid cols class for Tailwind (safelist approach or inline style)
    const gridColsMap: Record<number, string> = {
        1: 'md:grid-cols-1',
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-3',
        4: 'md:grid-cols-4',
        5: 'md:grid-cols-5',
    };
    const gridClass = gridColsMap[renderedLevels.length] || 'md:grid-cols-1';

    return (
        <div className="space-y-4">
            <div className={`grid grid-cols-1 ${gridClass} gap-4 transition-all duration-300 ease-in-out`}>
                {renderedLevels}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
