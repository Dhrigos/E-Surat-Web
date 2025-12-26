import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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

interface UnitKerja {
    id: number;
    nama: string;
    kode: string | null;
}

interface Jabatan {
    id: number;
    nama: string;
    keterangan: string | null;
    is_active: boolean;
    unit_kerjas?: UnitKerja[];
}

interface Props {
    jabatan: {
        data: Jabatan[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ jabatan, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Jabatan | null>(null);

    const createForm = useForm({
        nama: '',
        keterangan: '',
        is_active: true,
    });

    const editForm = useForm({
        nama: '',
        keterangan: '',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/jabatan', { search }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/jabatan', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (item: Jabatan) => {
        setEditingItem(item);
        editForm.setData({
            nama: item.nama,
            keterangan: item.keterangan || '',
            is_active: item.is_active,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        editForm.put(`/jabatan/${editingItem.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus jabatan ini?')) {
            router.delete(`/jabatan/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Data Jabatan" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Data Jabatan</h1>
                        <p className="text-muted-foreground mt-2">
                            Kelola data jabatan pegawai
                        </p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Jabatan
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Jabatan</CardTitle>
                        <CardDescription>
                            Total {jabatan.total} jabatan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari jabatan..."
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
                                        <TableHead>Nama Jabatan</TableHead>
                                        <TableHead>Unit / Sub Unit</TableHead>
                                        <TableHead>Keterangan</TableHead>
                                        <TableHead className="w-24">Status</TableHead>
                                        <TableHead className="w-32 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jabatan.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Tidak ada data jabatan
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        jabatan.data.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {(jabatan.current_page - 1) * jabatan.per_page + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.nama}</TableCell>
                                                <TableCell>
                                                    {item.unit_kerjas && item.unit_kerjas.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.unit_kerjas.map((unit) => (
                                                                <Badge key={unit.id} variant="outline" className="text-xs">
                                                                    {unit.nama}
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
                                                <TableCell>
                                                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                                                        {item.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </Badge>
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

                        {jabatan.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {(jabatan.current_page - 1) * jabatan.per_page + 1} - {Math.min(jabatan.current_page * jabatan.per_page, jabatan.total)} dari {jabatan.total} data
                                </div>
                                <div className="flex gap-2">
                                    {jabatan.current_page > 1 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/jabatan?page=${jabatan.current_page - 1}${search ? `&search=${search}` : ''}`)}
                                        >
                                            Sebelumnya
                                        </Button>
                                    )}
                                    {jabatan.current_page < jabatan.last_page && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.get(`/jabatan?page=${jabatan.current_page + 1}${search ? `&search=${search}` : ''}`)}
                                        >
                                            Selanjutnya
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Jabatan</DialogTitle>
                        <DialogDescription>Isi form di bawah untuk menambahkan jabatan baru</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama">Nama Jabatan *</Label>
                            <Input
                                id="create-nama"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Kepala Bagian"
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
                                placeholder="Deskripsi jabatan (opsional)"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="create-is_active"
                                checked={createForm.data.is_active}
                                onCheckedChange={(checked) => createForm.setData('is_active', checked as boolean)}
                            />
                            <Label htmlFor="create-is_active" className="cursor-pointer">Status Aktif</Label>
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
                        <DialogTitle>Edit Jabatan</DialogTitle>
                        <DialogDescription>Perbarui informasi jabatan</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama">Nama Jabatan *</Label>
                            <Input
                                id="edit-nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Kepala Bagian"
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
                                placeholder="Deskripsi jabatan (opsional)"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-is_active"
                                checked={editForm.data.is_active}
                                onCheckedChange={(checked) => editForm.setData('is_active', checked as boolean)}
                            />
                            <Label htmlFor="edit-is_active" className="cursor-pointer">Status Aktif</Label>
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
