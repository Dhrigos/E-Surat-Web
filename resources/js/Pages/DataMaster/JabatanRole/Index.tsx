import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronDown, Search, Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface JabatanRole {
    id: number;
    nama: string;
    is_active: boolean;
    level: number;
    children?: JabatanRole[];
}

interface Props {
    roles: {
        data: JabatanRole[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

// Helper Component for Recursive Rows
const JabatanRoleRow = ({
    role,
    level = 0,
    onEdit,
    onDelete,
    data // Pass full data to find siblings for reorder? No, logic is in onDragEnd
}: {
    role: JabatanRole,
    level?: number,
    onEdit: (role: JabatanRole) => void,
    onDelete: (id: number) => void,
    data?: JabatanRole[]
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = role.children && role.children.length > 0;

    // Render as TableRow for Root
    return (
        <React.Fragment>
            <TableRow className="border-white/10 hover:bg-white/5 group">
                <TableCell className="w-[50px] pl-4">
                    {/* No Drag Handle for Root */}
                </TableCell>
                <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                        {hasChildren ? (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                            >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        ) : (
                            <div className="w-6 h-6" /> // Spacer
                        )}
                        <span className="font-medium text-white">{role.nama}</span>
                    </div>
                </TableCell>

                <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                        <Button size="icon" variant="ghost" onClick={() => onEdit(role)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => onDelete(role.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expanded Children View - Rendered as a nested list for DnD support */}
            {isExpanded && hasChildren && (
                <TableRow className="border-white/10 bg-black/20 hover:bg-black/20">
                    <TableCell colSpan={3} className="p-0">
                        <Droppable droppableId={`children-${role.id}`} type={`CHILD-${role.id}`}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex flex-col w-full py-2"
                                >
                                    {role.children!.map((child, index) => (
                                        <Draggable key={child.id} draggableId={child.id.toString()} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="flex items-center border-b border-white/5 last:border-0 hover:bg-white/5 pr-6"
                                                >
                                                    {/* Drag Handle Column (Aligned with Parent Col 1) - Spacer only */}
                                                    <div className="w-[50px] pl-4 flex-shrink-0 flex items-center justify-center">
                                                    </div>

                                                    {/* Name Column (Aligned with Parent Col 2) */}
                                                    <div className="flex-1 pl-6 py-2 flex items-center gap-2">
                                                        {/* Drag Handle moved here (Under Chevron / Closer to Text) */}
                                                        <div {...provided.dragHandleProps} className="cursor-grab text-gray-600 hover:text-gray-400 mr-2">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>

                                                        {/* Indentation? Maybe reduce it if drag handle takes space */}
                                                        <span className="text-gray-300 text-sm">{child.nama}</span>
                                                    </div>

                                                    {/* Actions Column (Aligned matches parent) */}
                                                    <div className="w-[100px] flex-shrink-0 flex justify-end gap-1">
                                                        <Button size="icon" variant="ghost" onClick={() => onEdit(child)} className="h-7 w-7 text-blue-400 opacity-50 hover:opacity-100">
                                                            <Pencil className="w-3 h-3" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" onClick={() => onDelete(child.id)} className="h-7 w-7 text-red-400 opacity-50 hover:opacity-100">
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};

export default function Index({ roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<JabatanRole | null>(null);
    const [localRoles, setLocalRoles] = useState(roles.data);

    // Sync local roles when props change
    React.useEffect(() => {
        setLocalRoles(roles.data);
    }, [roles.data]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        nama: '',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('jabatan-roles.index'), { search }, { preserveState: true });
    };

    const openCreateModal = () => {
        reset();
        setCreateModalOpen(true);
    };

    const openEditModal = (role: JabatanRole) => {
        setEditingRole(role);
        setData({
            nama: role.nama,
            is_active: role.is_active,
        });
        setEditModalOpen(true);
    };

    const handleSubmitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('jabatan-roles.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;
        put(route('jabatan-roles.update', editingRole.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            destroy(route('jabatan-roles.destroy', id));
        }
    };

    const onDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        // Handle Child Reordering
        if (result.source.droppableId.startsWith('children-')) {
            const parentId = parseInt(result.source.droppableId.split('-')[1]);
            const parentIndex = localRoles.findIndex(r => r.id === parentId);

            if (parentIndex === -1) return;

            const newRoles = [...localRoles];
            const parent = { ...newRoles[parentIndex] };

            if (!parent.children) return;

            const newChildren = Array.from(parent.children);
            const [reorderedItem] = newChildren.splice(result.source.index, 1);
            newChildren.splice(result.destination.index, 0, reorderedItem);

            parent.children = newChildren;
            newRoles[parentIndex] = parent;

            setLocalRoles(newRoles);

            const payload = newChildren.map((role, idx) => ({
                id: role.id,
                level: idx + 1
            }));

            // Optimistic Update is already done via setLocalRoles

            // Send to backend via Inertia Router to handle Auth/CSRF correctly
            router.post(route('jabatan-roles.reorder'), {
                roles: payload
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Urutan diperbarui');
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Gagal memperbarui urutan');
                    setLocalRoles(roles.data); // Revert on error
                }
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Status Personel" />

            <div className="p-6 w-full space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manajemen Status Personel</h1>
                        <p className="text-gray-400 text-sm mt-1">Kelola data status personel (misal: Ketua, Staff). Klik panah untuk melihat posisi. Drag logo dikiri nama posisi untuk mengatur urutan (Rank/Tier).</p>
                    </div>
                    <Button onClick={openCreateModal} className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Status
                    </Button>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari Status Personel..."
                                className="pl-9 bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 focus:ring-red-500/50"
                            />
                        </form>
                    </div>

                    <div className="overflow-x-auto">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-white/10 hover:bg-white/5">
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead className="text-gray-400 pl-6">Nama Status Personel</TableHead>
                                        <TableHead className="text-right text-gray-400 pr-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {localRoles.length > 0 ? (
                                        localRoles.map((role) => (
                                            <JabatanRoleRow
                                                key={role.id}
                                                role={role}
                                                onEdit={openEditModal}
                                                onDelete={handleDelete}
                                            />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                                Tidak ada data status personel ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </DragDropContext>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Status Personel Baru</DialogTitle>
                        <DialogDescription className="text-gray-400">Tambahkan status personel baru ke dalam sistem.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama">Nama Status Personel</Label>
                            <Input
                                id="create-nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                className="bg-[#2a2a2a] border-white/10 text-white focus:ring-red-500"
                                placeholder="Contoh: STAFF AHLI"
                                autoFocus
                            />
                            {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)} className="text-gray-400 hover:text-white">Batal</Button>
                            <Button type="submit" disabled={processing} className="bg-red-600 hover:bg-red-700 text-white">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Status Personel</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama">Nama Status Personel</Label>
                            <Input
                                id="edit-nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                className="bg-[#2a2a2a] border-white/10 text-white focus:ring-red-500"
                            />
                            {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setEditModalOpen(false)} className="text-gray-400 hover:text-white">Batal</Button>
                            <Button type="submit" disabled={processing} className="bg-red-600 hover:bg-red-700 text-white">Simpan Perubahan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
