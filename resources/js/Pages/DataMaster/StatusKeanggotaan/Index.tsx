import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Jabatan {
    id: number;
    nama: string;
}

interface Pangkat {
    id: number;
    nama: string;
    kode: string | null;
}

interface StatusKeanggotaan {
    id: number;
    nama: string;
    keterangan: string | null;
    jabatans?: Jabatan[];
    pangkats?: Pangkat[];
}

interface Props {
    statusKeanggotaan: StatusKeanggotaan[];
    filters: {
        search?: string;
    };
}

export default function Index({ statusKeanggotaan, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StatusKeanggotaan | null>(null);

    const createForm = useForm({
        nama: '',
        keterangan: '',
    });

    const editForm = useForm({
        nama: '',
        keterangan: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/status-keanggotaan', { search }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/status-keanggotaan', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (item: StatusKeanggotaan) => {
        setEditingItem(item);
        editForm.setData({
            nama: item.nama,
            keterangan: item.keterangan || '',
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        editForm.put(`/status-keanggotaan/${editingItem.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus status keanggotaan ini?')) {
            router.delete(`/status-keanggotaan/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Data Status Keanggotaan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Data Status Keanggotaan</h1>
                        <p className="text-muted-foreground mt-2">
                            Kelola data status keanggotaan pegawai
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Status
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Status Keanggotaan</CardTitle>
                        <CardDescription>
                            Total {statusKeanggotaan.length} status
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari status..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit">Cari</Button>
                            </div>
                        </form>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Nama Status</TableHead>
                                        <TableHead>Jabatan</TableHead>
                                        <TableHead>Pangkat</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead className="w-32 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {statusKeanggotaan.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Tidak ada data status keanggotaan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        statusKeanggotaan.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.nama}</TableCell>
                                                <TableCell>
                                                    {item.jabatans && item.jabatans.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.jabatans.map((jabatan) => (
                                                                <Badge key={jabatan.id} variant="outline" className="text-xs">
                                                                    {jabatan.nama}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {item.pangkats && item.pangkats.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.pangkats.map((pangkat) => (
                                                                <Badge key={pangkat.id} variant="secondary" className="text-xs">
                                                                    {pangkat.kode || pangkat.nama}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {item.keterangan || '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Status Keanggotaan</DialogTitle>
                        <DialogDescription>Isi form di bawah untuk menambahkan status baru</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama">Nama Status *</Label>
                            <Input
                                id="create-nama"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Aktif"
                                className={createForm.errors.nama ? 'border-destructive' : ''}
                            />
                            {createForm.errors.nama && (
                                <p className="text-sm text-destructive">{createForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-keterangan">Keterangan</Label>
                            <Textarea
                                id="create-keterangan"
                                value={createForm.data.keterangan}
                                onChange={(e) => createForm.setData('keterangan', e.target.value)}
                                placeholder="Deskripsi status (opsional)"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Status Keanggotaan</DialogTitle>
                        <DialogDescription>Perbarui informasi status</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama">Nama Status *</Label>
                            <Input
                                id="edit-nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Aktif"
                                className={editForm.errors.nama ? 'border-destructive' : ''}
                            />
                            {editForm.errors.nama && (
                                <p className="text-sm text-destructive">{editForm.errors.nama}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-keterangan">Keterangan</Label>
                            <Textarea
                                id="edit-keterangan"
                                value={editForm.data.keterangan}
                                onChange={(e) => editForm.setData('keterangan', e.target.value)}
                                placeholder="Deskripsi status (opsional)"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Batal
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
