import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    parent_id: number | null;
    parent?: {
        nama: string;
    };
    is_active: boolean;
}

interface Props {
    unitKerja: {
        data: UnitKerja[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    allUnitKerja: UnitKerja[];
    filters: {
        search?: string;
    };
}

export default function Index({ unitKerja, allUnitKerja, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<UnitKerja | null>(null);

    const createForm = useForm({
        nama: '',
        kode: '',
        parent_id: '0',
        is_active: true,
    });

    const editForm = useForm({
        nama: '',
        kode: '',
        parent_id: '0',
        is_active: true,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/unit-kerja', { search }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.transform((data) => ({
            ...data,
            parent_id: data.parent_id === '0' ? null : data.parent_id,
        }));

        createForm.post('/unit-kerja', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (item: UnitKerja) => {
        setEditingItem(item);
        editForm.setData({
            nama: item.nama,
            kode: item.kode || '',
            parent_id: item.parent_id?.toString() || '0',
            is_active: item.is_active,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        editForm.transform((data) => ({
            ...data,
            parent_id: data.parent_id === '0' ? null : data.parent_id,
        }));

        editForm.put(`/unit-kerja/${editingItem.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus unit kerja ini?')) {
            router.delete(`/unit-kerja/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Data Unit Kerja" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Data Unit Kerja</h1>
                        <p className="text-muted-foreground mt-2">Kelola data unit kerja</p>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Unit Kerja
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Unit Kerja</CardTitle>
                        <CardDescription>Total {unitKerja.total} unit kerja</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari unit kerja..."
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
                                        <TableHead>Nama Unit Kerja</TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Unit Induk</TableHead>
                                        <TableHead className="w-24">Status</TableHead>
                                        <TableHead className="w-32 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unitKerja.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Tidak ada data unit kerja
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        unitKerja.data.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    {(unitKerja.current_page - 1) * unitKerja.per_page + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">{item.nama}</TableCell>
                                                <TableCell className="text-muted-foreground">{item.kode || '-'}</TableCell>
                                                <TableCell className="text-muted-foreground">{item.parent?.nama || '-'}</TableCell>
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

                        {unitKerja.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {(unitKerja.current_page - 1) * unitKerja.per_page + 1} - {Math.min(unitKerja.current_page * unitKerja.per_page, unitKerja.total)} dari {unitKerja.total} data
                                </div>
                                <div className="flex gap-2">
                                    {unitKerja.current_page > 1 && (
                                        <Button variant="outline" size="sm" onClick={() => router.get(`/unit-kerja?page=${unitKerja.current_page - 1}${search ? `&search=${search}` : ''}`)}>
                                            Sebelumnya
                                        </Button>
                                    )}
                                    {unitKerja.current_page < unitKerja.last_page && (
                                        <Button variant="outline" size="sm" onClick={() => router.get(`/unit-kerja?page=${unitKerja.current_page + 1}${search ? `&search=${search}` : ''}`)}>
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
                        <DialogTitle>Tambah Unit Kerja</DialogTitle>
                        <DialogDescription>Isi form di bawah untuk menambahkan unit kerja baru</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama">Nama Unit Kerja *</Label>
                            <Input
                                id="create-nama"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Bagian Umum"
                                className={createForm.errors.nama ? 'border-destructive' : ''}
                            />
                            {createForm.errors.nama && <p className="text-sm text-destructive">{createForm.errors.nama}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-kode">Kode Unit Kerja</Label>
                            <Input
                                id="create-kode"
                                value={createForm.data.kode}
                                onChange={(e) => createForm.setData('kode', e.target.value)}
                                placeholder="Contoh: BAGUM"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-parent_id">Unit Kerja Induk</Label>
                            <Select value={createForm.data.parent_id} onValueChange={(value) => createForm.setData('parent_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih unit kerja induk (opsional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Tidak ada (Unit Utama)</SelectItem>
                                    {allUnitKerja.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                            {unit.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <DialogTitle>Edit Unit Kerja</DialogTitle>
                        <DialogDescription>Perbarui informasi unit kerja</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama">Nama Unit Kerja *</Label>
                            <Input
                                id="edit-nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Bagian Umum"
                                className={editForm.errors.nama ? 'border-destructive' : ''}
                            />
                            {editForm.errors.nama && <p className="text-sm text-destructive">{editForm.errors.nama}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-kode">Kode Unit Kerja</Label>
                            <Input
                                id="edit-kode"
                                value={editForm.data.kode}
                                onChange={(e) => editForm.setData('kode', e.target.value)}
                                placeholder="Contoh: BAGUM"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-parent_id">Unit Kerja Induk</Label>
                            <Select value={editForm.data.parent_id} onValueChange={(value) => editForm.setData('parent_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih unit kerja induk (opsional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Tidak ada (Unit Utama)</SelectItem>
                                    {allUnitKerja.filter(u => u.id !== editingItem?.id).map((unit) => (
                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                            {unit.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
