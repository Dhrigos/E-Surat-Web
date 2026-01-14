import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import axios from 'axios';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface JabatanRole {
    id: number;
    nama: string;
    is_active: boolean;
    level: number;
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

        const items = Array.from(localRoles);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setLocalRoles(items);

        const payload = items.map((role, idx) => ({
            id: role.id,
            level: idx + 1 + ((roles.current_page - 1) * roles.per_page)
        }));

        try {
            await axios.post(route('jabatan-roles.reorder'), { roles: payload });
            toast.success('Urutan diperbarui');
        } catch (error) {
            console.error(error);
            toast.error('Gagal memperbarui urutan');
            setLocalRoles(roles.data);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Jabatan" />

            <div className="p-6 w-full space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manajemen Jabatan</h1>
                        <p className="text-gray-400 text-sm mt-1">Kelola data jabatan (misal: Ketua, Staff, Anggota). Drag untuk mengatur hierarki.</p>
                    </div>
                    <Button onClick={openCreateModal} className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Jabatan
                    </Button>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <form onSubmit={handleSearch} className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari jabatan..."
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
                                        <TableHead className="text-gray-400 pl-6">Nama Jabatan</TableHead>
                                        <TableHead className="text-gray-400">Status</TableHead>
                                        <TableHead className="text-right text-gray-400 pr-6">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <Droppable droppableId="jabatan-roles">
                                    {(provided) => (
                                        <TableBody
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {localRoles.length > 0 ? (
                                                localRoles.map((role, index) => (
                                                    <Draggable key={role.id} draggableId={role.id.toString()} index={index}>
                                                        {(provided) => (
                                                            <TableRow
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className="border-white/10 hover:bg-white/5"
                                                            >
                                                                <TableCell>
                                                                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-white pl-4">
                                                                        <GripVertical className="w-5 h-5" />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-medium text-white pl-6">{role.nama}</TableCell>
                                                                <TableCell>
                                                                    {role.is_active ? (
                                                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                                                            Aktif
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                                                                            Non-Aktif
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right pr-6">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button size="icon" variant="ghost" onClick={() => openEditModal(role)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                                                                            <Pencil className="w-4 h-4" />
                                                                        </Button>
                                                                        <Button size="icon" variant="ghost" onClick={() => handleDelete(role.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                                        Tidak ada data jabatan ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                            {provided.placeholder}
                                        </TableBody>
                                    )}
                                </Droppable>
                            </Table>
                        </DragDropContext>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Jabatan Baru</DialogTitle>
                        <DialogDescription className="text-gray-400">Tambahkan jabatan baru ke dalam sistem.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama">Nama Jabatan</Label>
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
                        <DialogTitle>Edit Jabatan</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama">Nama Jabatan</Label>
                            <Input
                                id="edit-nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                className="bg-[#2a2a2a] border-white/10 text-white focus:ring-red-500"
                            />
                            {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setData('is_active', !data.is_active)}
                                className={`w-full justify-between ${data.is_active ? 'border-emerald-500/50 text-emerald-500 bg-emerald-500/10' : 'border-red-500/50 text-red-500 bg-red-500/10'}`}
                            >
                                Status: {data.is_active ? 'Aktif' : 'Non-Aktif'}
                                {data.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            </Button>
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
