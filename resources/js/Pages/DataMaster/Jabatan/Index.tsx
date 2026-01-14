import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Folder,
    FileText,
    ChevronRight,
    ArrowLeft,
    Home,
    Building2,
    Briefcase
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

interface UnitKerja {
    id: number;
    nama: string;
    kode: string | null;
}

interface Jabatan {
    id: number;
    nama: string;
    kategori: string;
    level: number;
    parent_id: number | null;
    keterangan: string | null;
    is_active: boolean;
    children_count?: number;
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
        parent_id?: number | null;
        kategori?: string;
    };
    currentParent: Jabatan | null;
    breadcrumbs: Jabatan[];
}

export default function Index({ jabatan, filters, currentParent, breadcrumbs }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Jabatan | null>(null);

    const createForm = useForm({
        nama: '',
        kategori: 'anggota',
        level: 99,
        parent_id: currentParent?.id || null, // Default to current folder
        keterangan: '',
        is_active: true,
    });

    const editForm = useForm({
        nama: '',
        kategori: 'anggota',
        level: 99,
        parent_id: null as number | null,
        keterangan: '',
        is_active: true,
    });

    // Handle "Drill Down"
    const handleNavigate = (id: number | null) => {
        if (id) {
            const target = jabatan.data.find(j => j.id === id);
            if (target && target.level >= 5) {
                // Prevent navigation deeper than level 5
                // You might want to use a proper Toast here instead of alert
                return;
            }
        }

        router.get('/jabatan', {
            parent_id: id,
            search,
            kategori: filters.kategori
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/jabatan', {
            parent_id: null, // Global search
            search,
            kategori: filters.kategori
        }, { preserveState: true });
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

    const handleEdit = (item: Jabatan, e?: React.MouseEvent) => {
        e?.stopPropagation(); // Prevent navigation when clicking edit
        setEditingItem(item);
        editForm.setData({
            nama: item.nama,
            kategori: item.kategori,
            level: item.level,
            parent_id: item.parent_id,
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

    const handleDelete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Apakah Anda yakin ingin menghapus unit ini?')) {
            router.delete(`/jabatan/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Data Unit" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Data Unit</h1>
                            <p className="text-muted-foreground mt-2">
                                Kelola struktur dan hierarki unit
                            </p>
                        </div>

                    </div>

                    {/* Navigation Bar */}
                    <div className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded-md border">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleNavigate(currentParent?.parent_id || null)}
                            disabled={!currentParent}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1 overflow-hidden px-2">
                            <button
                                onClick={() => handleNavigate(null)}
                                className={`flex items-center hover:text-primary cursor-pointer ${!currentParent ? 'font-bold' : ''}`}
                            >
                                <Home className="h-4 w-4 mr-1" />
                                Unit
                            </button>

                            {breadcrumbs.map((crumb) => (
                                <div key={crumb.id} className="flex items-center">
                                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                                    <button
                                        onClick={() => handleNavigate(crumb.id)}
                                        className="hover:text-primary whitespace-nowrap cursor-pointer"
                                    >
                                        {crumb.nama}
                                    </button>
                                </div>
                            ))}

                            {currentParent && (
                                <div className="flex items-center font-bold">
                                    <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />
                                    <span>{currentParent.nama}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari unit..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </form>
                        <Select
                            value={filters.kategori || 'all'}
                            onValueChange={(value) => router.get('/jabatan', {
                                parent_id: currentParent?.id,
                                search,
                                kategori: value === 'all' ? '' : value
                            }, { preserveState: true })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Semua Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                <SelectItem value="struktural">Struktural</SelectItem>
                                <SelectItem value="fungsional">Fungsional</SelectItem>
                                <SelectItem value="anggota">Anggota</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={() => {
                                createForm.setData({
                                    ...createForm.data,
                                    parent_id: currentParent?.id || null,
                                    kategori: currentParent?.kategori || 'anggota',
                                    // level: calculated in backend
                                });
                                setIsCreateOpen(true);
                            }}
                            disabled={(currentParent?.level ?? 0) >= 5}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah
                        </Button>
                    </div>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {jabatan.data.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                            <p className="mb-1 text-lg font-medium">Unit yang anda cari tidak ditemukan</p>
                            <p className="text-sm text-muted-foreground">
                                Tambah{' '}
                                <button
                                    onClick={() => {
                                        createForm.setData({
                                            ...createForm.data,
                                            parent_id: currentParent?.id || null,
                                            kategori: currentParent?.kategori || 'anggota',
                                            // level: calculated in backend
                                        });
                                        setIsCreateOpen(true);
                                    }}
                                    className="underline hover:text-primary font-medium text-foreground cursor-pointer"
                                >
                                    disini
                                </button>
                            </p>
                        </div>
                    ) : (
                        jabatan.data.map((item) => (
                            <Card
                                key={item.id}
                                className="cursor-pointer hover:border-primary/50 transition-colors group relative"
                                onDoubleClick={() => handleNavigate(item.id)}
                            >
                                <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                                        {(item.children_count || 0) > 0 ? (
                                            <Building2 className="h-6 w-6 fill-current" />
                                        ) : (
                                            <Briefcase className="h-6 w-6" />
                                        )}
                                    </div>

                                    <div className="w-full">
                                        <h3 className="font-medium truncate" title={item.nama}>
                                            {item.nama}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1 capitalize">
                                            {item.kategori}
                                        </p>
                                    </div>

                                    {(item.children_count || 0) > 0 && (
                                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                            {item.children_count} items
                                        </Badge>
                                    )}

                                    {/* Actions Overlay */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-1 rounded-md backdrop-blur-sm">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => handleEdit(item, e)}
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                            onClick={(e) => handleDelete(item.id, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {jabatan.last_page > 1 && (
                    <div className="flex justify-center mt-4">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                disabled={jabatan.current_page === 1}
                                onClick={() => router.get(`/jabatan?page=${jabatan.current_page - 1}&parent_id=${currentParent?.id || ''}`)}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                disabled={jabatan.current_page === jabatan.last_page}
                                onClick={() => router.get(`/jabatan?page=${jabatan.current_page + 1}&parent_id=${currentParent?.id || ''}`)}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Unit</DialogTitle>
                        <DialogDescription>
                            Menambahkan Unit di: <span className="font-semibold">{currentParent ? currentParent.nama : 'Root (Tingkat Atas)'}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama">Nama Unit *</Label>
                            <Input
                                id="create-nama"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Kepala Bagian"
                                className={createForm.errors.nama ? 'border-destructive' : ''}
                            />
                            {createForm.errors.nama && <p className="text-sm text-destructive">{createForm.errors.nama}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-kategori">Kategori *</Label>
                            <Select
                                value={createForm.data.kategori}
                                onValueChange={(value) => createForm.setData('kategori', value)}
                            >
                                <SelectTrigger id="create-kategori">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="anggota">Anggota</SelectItem>
                                    <SelectItem value="fungsional">Fungsional</SelectItem>
                                    <SelectItem value="struktural">Struktural</SelectItem>
                                </SelectContent>
                            </Select>
                            {createForm.errors.kategori && (
                                <p className="text-sm text-destructive">{createForm.errors.kategori}</p>
                            )}
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
                        <DialogTitle>Edit Unit</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama">Nama Unit *</Label>
                            <Input
                                id="edit-nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-kategori">Kategori *</Label>
                            <Select
                                value={editForm.data.kategori}
                                onValueChange={(value) => editForm.setData('kategori', value)}
                            >
                                <SelectTrigger id="edit-kategori">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="anggota">Anggota</SelectItem>
                                    <SelectItem value="fungsional">Fungsional</SelectItem>
                                    <SelectItem value="struktural">Struktural</SelectItem>
                                </SelectContent>
                            </Select>
                            {editForm.errors.kategori && (
                                <p className="text-sm text-destructive">{editForm.errors.kategori}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-parent">ID Induk (Opsional)</Label>
                            <Input
                                id="edit-parent"
                                type="number"
                                placeholder="ID Unit Induk"
                                value={editForm.data.parent_id || ''}
                                onChange={(e) => editForm.setData('parent_id', e.target.value ? parseInt(e.target.value) : null)}
                            />
                            <p className="text-xs text-muted-foreground">Biarkan kosong jika berada di root.</p>
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
