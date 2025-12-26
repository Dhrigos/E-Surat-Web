import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface StatusKeanggotaan {
    id: number;
    nama: string;
}

interface Pangkat {
    id: number;
    nama: string;
    kode: string | null;
    tingkat: number | null;
    is_active: boolean;
    status_keanggotaans?: StatusKeanggotaan[];
}

interface Props {
    pangkat: {
        data: Pangkat[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ pangkat, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Pangkat | null>(null);

    const createForm = useForm({
        nama: '',
        kode: '',
        tingkat: '',
        is_active: true,
    });

    const editForm = useForm({
        nama: '',
        kode: '',
        tingkat: '',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/pangkat', { search }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/pangkat', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (item: Pangkat) => {
        setEditingItem(item);
        editForm.setData({
            nama: item.nama,
            kode: item.kode || '',
            tingkat: item.tingkat?.toString() || '',
            is_active: item.is_active,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        editForm.put(`/pangkat/${editingItem.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pangkat ini?')) {
            router.delete(`/pangkat/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Data Pangkat" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Data Pangkat</h1>
                        <p className="text-muted-foreground mt-2">Kelola data pangkat pegawai</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Pangkat
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pangkat</CardTitle>
                        <CardDescription>Total {pangkat.total} pangkat</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari pangkat..."
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
                                        <TableHead>Nama Pangkat</TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead className="w-24">Tingkat</TableHead>
                                        <TableHead>Status Keanggotaan</TableHead>
                                        <TableHead className="w-24">Status</TableHead>
                                        <TableHead className="w-32 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pangkat.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Tidak ada data pangkat
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pangkat.data.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {(pangkat.current_page - 1) * pangkat.per_page + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.nama}</TableCell>
                                                <TableCell className="text-muted-foreground">{item.kode || '-'}</TableCell>
                                                <TableCell>{item.tingkat || '-'}</TableCell>
                                                <TableCell>
                                                    {item.status_keanggotaans && item.status_keanggotaans.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {item.status_keanggotaans.map((status) => (
                                                                <Badge key={status.id} variant="outline" className="text-xs">
                                                                    {status.nama}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-sm">-</span>
                                                    )}
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

                        {pangkat.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {(pangkat.current_page - 1) * pangkat.per_page + 1} - {Math.min(pangkat.current_page * pangkat.per_page, pangkat.total)} dari {pangkat.total} data
                                </div>
                                <div className="flex gap-2">
                                    {pangkat.current_page > 1 && (
                                        <Button variant="outline" size="sm" onClick={() => router.get(`/pangkat?page=${pangkat.current_page - 1}${search ? `&search=${search}` : ''}`)}>
                                            Sebelumnya
                                        </Button>
                                    )}
                                    {pangkat.current_page < pangkat.last_page && (
                                        <Button variant="outline" size="sm" onClick={() => router.get(`/pangkat?page=${pangkat.current_page + 1}${search ? `&search=${search}` : ''}`)}>
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
                        <DialogTitle>Tambah Pangkat</DialogTitle>
                        <DialogDescription>Isi form di bawah untuk menambahkan pangkat baru</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama">Nama Pangkat *</Label>
                            <Input
                                id="create-nama"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Letnan Satu"
                                className={createForm.errors.nama ? 'border-destructive' : ''}
                            />
                            {createForm.errors.nama && <p className="text-sm text-destructive">{createForm.errors.nama}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-kode">Kode Pangkat</Label>
                            <Input
                                id="create-kode"
                                value={createForm.data.kode}
                                onChange={(e) => createForm.setData('kode', e.target.value)}
                                placeholder="Contoh: LETTU"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-tingkat">Tingkat</Label>
                            <Input
                                id="create-tingkat"
                                type="number"
                                value={createForm.data.tingkat}
                                onChange={(e) => createForm.setData('tingkat', e.target.value)}
                                placeholder="Contoh: 5"
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
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Batal</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Pangkat</DialogTitle>
                        <DialogDescription>Perbarui informasi pangkat</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama">Nama Pangkat *</Label>
                            <Input
                                id="edit-nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Letnan Satu"
                                className={editForm.errors.nama ? 'border-destructive' : ''}
                            />
                            {editForm.errors.nama && <p className="text-sm text-destructive">{editForm.errors.nama}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-kode">Kode Pangkat</Label>
                            <Input
                                id="edit-kode"
                                value={editForm.data.kode}
                                onChange={(e) => editForm.setData('kode', e.target.value)}
                                placeholder="Contoh: LETTU"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-tingkat">Tingkat</Label>
                            <Input
                                id="edit-tingkat"
                                type="number"
                                value={editForm.data.tingkat}
                                onChange={(e) => editForm.setData('tingkat', e.target.value)}
                                placeholder="Contoh: 5"
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
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Batal</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
