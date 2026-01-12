
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface JabatanRole {
    id: number;
    nama: string;
    is_active: boolean;
}

interface Props {
    roles: {
        data: JabatanRole[];
        links: any[];
        meta: any;
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

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        nama: '',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('data-master.jabatan-role.index'), { search }, { preserveState: true });
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
        post(route('data-master.jabatan-role.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const handleSubmitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;
        put(route('data-master.jabatan-role.update', editingRole.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            destroy(route('data-master.jabatan-role.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Data Master', href: '#' },
            { title: 'Jabatan Role', href: route('data-master.jabatan-role.index') },
        ]}>
            <Head title="Manajemen Jabatan Role" />

            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Manajemen Jabatan Role</h1>
                        <p className="text-gray-400 text-sm mt-1">Kelola data role jabatan (misal: Ketua, Staff, Anggota)</p>
                    </div>
                    <Button onClick={openCreateModal} className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Role
                    </Button>
                </div>

                <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                        <form onSubmit={handleSearch} className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari role..."
                                className="pl-9 bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 focus:ring-red-500/50"
                            />
                        </form>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-white/10 hover:bg-white/5">
                                <TableHead className="text-gray-400">Nama Role</TableHead>
                                <TableHead className="text-gray-400">Status</TableHead>
                                <TableHead className="text-right text-gray-400">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.data.length > 0 ? (
                                roles.data.map((role) => (
                                    <TableRow key={role.id} className="border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium text-white">{role.nama}</TableCell>
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
                                        <TableCell className="text-right">
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                        Tidak ada data role ditemukan.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Role Baru</DialogTitle>
                        <DialogDescription className="text-gray-400">Tambahkan role jabatan baru ke dalam sistem.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama">Nama Role</Label>
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
                        <DialogTitle>Edit Role</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitEdit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama">Nama Role</Label>
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
