import React, { useMemo, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Using the shape from JabatanSelectionModal but ensuring compatibility
export interface JabatanRole {
    id: number;
    nama: string;
    parent_id?: number | null;
    level?: number;
    is_active?: boolean;
}

interface Props {
    roles: JabatanRole[];
    value?: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    triggerClassName?: string;
}

export function CascadingJabatanRoleSelector({ roles, value, onChange, placeholder = "Pilih Posisi...", className, triggerClassName }: Props) {
    // 1. Data Structure Building
    const { childrenMap, itemMap } = useMemo(() => {
        const cMap: Record<number | string, JabatanRole[]> = {};
        const iMap: Record<number, JabatanRole> = {};

        roles.forEach(r => {
            iMap[r.id] = r;
            const pid = r.parent_id || 'root';
            if (!cMap[pid]) cMap[pid] = [];
            cMap[pid].push(r);
        });
        return { childrenMap: cMap, itemMap: iMap };
    }, [roles]);

    // 2. State
    const [selectionPath, setSelectionPath] = useState<number[]>([]);

    // 3. Initialize from value or Auto-Select Single Root
    useEffect(() => {
        const rootItems = childrenMap['root'] || [];
        const isSingleRoot = rootItems.length === 1;
        const rootHasChildren = isSingleRoot && (childrenMap[rootItems[0].id]?.length > 0);

        // Strategy: 
        // If value exists, respect it.
        // If no value, but Single Root with Children exists -> Auto Select Root so user sees children immediately.

        if (value) {
            const id = Number(value);
            if (itemMap[id]) {
                const path: number[] = [];
                let current = itemMap[id];
                while (current) {
                    path.unshift(current.id);
                    if (!current.parent_id) break;
                    current = itemMap[current.parent_id];
                }
                setSelectionPath(path);
                return;
            }
        }

        // Auto selection logic for empty value
        if (!value && isSingleRoot && rootHasChildren) {
            setSelectionPath([rootItems[0].id]);
        } else if (!value) {
            setSelectionPath([]);
        }

    }, [value, itemMap, childrenMap]);

    const handleSelect = (selectedIdStr: string, depthIndex: number) => {
        const selectedId = Number(selectedIdStr);
        // Reset path after this level
        const newPath = [...selectionPath.slice(0, depthIndex), selectedId];
        setSelectionPath(newPath);
        onChange(selectedId.toString());
    };

    // 4. Render
    const renderedLevels = [];
    let currentParentId: number | string = 'root';

    // Check if we should hide the first level (Root)
    const rootItems = childrenMap['root'] || [];
    const isSingleRoot = rootItems.length === 1;
    const rootHasChildren = isSingleRoot && (childrenMap[rootItems[0].id]?.length > 0);
    const shouldHideRoot = isSingleRoot && rootHasChildren;

    // We allow rendering until we hit a dead end, but we always render at least one level if root items exist
    // Loop through the selection path + 1 (for the next potential child selector)
    for (let i = 0; i <= selectionPath.length; i++) {
        const allChildren = childrenMap[currentParentId] || [];

        if (allChildren.length === 0) break;

        // Skip rendering Root level if auto-selected/hidden
        if (i === 0 && shouldHideRoot) {
            // But we must propagate the ID to next iteration
            if (selectionPath[0]) {
                currentParentId = selectionPath[0];
                continue;
            }
        }

        const currentSelectedId = selectionPath[i] ? selectionPath[i].toString() : '';

        renderedLevels.push(
            <div key={i} className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200 w-full">
                {/* Label logic: If i > 0 OR (i==0 and !hidden) explain. 
                    Actually if we hide i=0, then i=1 becomes the first visible element. 
                    So i=1 doesn't need "Posisi" chevron if it's the "first" thing user sees?
                    User said: "yang harus di select itu posisinya / children".
                    So we can just label it "Posisi" or "Sub Posisi"?
                    Previous: i > 0 shows "Posisi".
                    If we hide i=0, then i=1 is the first *rendered* element. 
                    So we might want to hide the label for the first RENDERED element purely for cleaner UI, or show a main label?
                    The parent component has a header "Tetapkan Posisi".
                    So just the Select is fine.
                */}
                {(i > 0 && !(i === 1 && shouldHideRoot)) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground my-1">
                        <ChevronRight className="w-3 h-3" />
                        <span>Posisi</span>
                    </div>
                )}

                <Select
                    value={currentSelectedId}
                    onValueChange={(val) => handleSelect(val, i)}
                >
                    <SelectTrigger className={cn(
                        "bg-zinc-900 border-white/10 h-11 text-base w-full",
                        triggerClassName
                    )}>
                        <SelectValue placeholder={
                            // Dynamic Placeholder
                            i === 0 ? placeholder : (shouldHideRoot && i === 1) ? placeholder : "Pilih Posisi..."
                        } />
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
        <div className={cn("space-y-3 w-full", className)}>
            {renderedLevels}
        </div>
    );
}
