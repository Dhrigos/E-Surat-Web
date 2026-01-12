import React, { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Jabatan {
    id: number;
    nama: string;
    parent_id?: number | null;
    level?: number;
    kategori?: string;
}

interface Props {
    jabatans: Jabatan[];
    value?: string | number;
    onChange: (value: string) => void;
    error?: string;
    className?: string;
    triggerClassName?: string;
}

export function CascadingJabatanSelector({ jabatans, value, onChange, error, className, triggerClassName }: Props) {
    // 1. Data Structure Building
    const { childrenMap, itemMap } = useMemo(() => {
        const cMap: Record<number | string, Jabatan[]> = {};
        const iMap: Record<number, Jabatan> = {};

        jabatans.forEach(j => {
            iMap[j.id] = j;
            const pid = j.parent_id || 'root';
            if (!cMap[pid]) cMap[pid] = [];
            cMap[pid].push(j);
        });
        return { childrenMap: cMap, itemMap: iMap };
    }, [jabatans]);

    // 2. State
    const [selectionPath, setSelectionPath] = useState<number[]>([]);

    // 3. Initialize from value
    useEffect(() => {
        if (!value) {
            setSelectionPath([]);
            return;
        }

        const id = Number(value);
        if (!itemMap[id]) return; // Guard against invalid IDs

        const path: number[] = [];
        let current = itemMap[id];

        // Traverse up
        while (current) {
            path.unshift(current.id);
            if (!current.parent_id) break;
            current = itemMap[current.parent_id];
        }

        setSelectionPath(path);
    }, [value, itemMap]);

    const handleSelect = (selectedIdStr: string, depthIndex: number) => {
        const selectedId = Number(selectedIdStr);
        // Reset path after this level
        const newPath = [...selectionPath.slice(0, depthIndex), selectedId];

        setSelectionPath(newPath);

        // Notify Parent (Immediate on change)
        onChange(selectedId.toString());
    };

    // 4. Render
    const renderedLevels = [];
    let currentParentId: number | string = 'root';

    for (let i = 0; i < selectionPath.length + 1; i++) {
        const allChildren = childrenMap[currentParentId] || [];

        if (allChildren.length === 0) break;

        const currentSelectedId = selectionPath[i] ? selectionPath[i].toString() : '';

        renderedLevels.push(
            <div key={i} className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="flex justify-between items-end">
                    <Label className="text-white font-medium flex items-center gap-2">
                        {(i > 0) && <ChevronRight className="w-3 h-3 text-red-500" />}
                        {i === 0 ? 'Status / Kategori' : `Unit Tingkat ${i + 1}`}
                    </Label>
                </div>

                <Select
                    value={currentSelectedId}
                    onValueChange={(val) => handleSelect(val, i)}
                >
                    <SelectTrigger className={cn(
                        "bg-[#2a2a2a] border-white/10 text-white",
                        error && i === selectionPath.length - 1 ? 'border-red-500' : 'focus:border-red-500',
                        triggerClassName
                    )}>
                        <SelectValue placeholder={`Pilih ${i === 0 ? 'Status' : 'Unit'}...`} />
                    </SelectTrigger>
                    <SelectContent>
                        {allChildren.map(opt => (
                            <SelectItem key={opt.id} value={opt.id.toString()}>
                                {opt.nama}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );

        if (currentSelectedId) {
            currentParentId = Number(currentSelectedId);
        } else {
            break;
        }
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-300 ease-in-out">
                {renderedLevels}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
