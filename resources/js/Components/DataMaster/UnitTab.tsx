import { router, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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

export default function UnitTab({ jabatan, filters, currentParent, breadcrumbs }: Props) {
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
                return;
            }
        }

        router.get('/data-master', {
            tab: 'units',
            parent_id: id,
            search,
            kategori: filters.kategori
        }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/data-master', {
            tab: 'units',
            parent_id: null,
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
        e?.stopPropagation();
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

    const getKategoriColor = (kategori: string) => {
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    };

    return (
        <div className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-2xl rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[600px]">
            {/* Toolbar */}
            <div className="p-4 border-b dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-transparent backdrop-blur-sm">

                {/* Breadcrumbs Navigation */}
                <div className="flex items-center gap-2 text-sm overflow-x-auto no-scrollbar max-w-full md:max-w-2xl px-2">
                    {currentParent && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-full mr-1 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            onClick={() => handleNavigate(currentParent.parent_id)}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}

                    <button
                        onClick={() => handleNavigate(null)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${!currentParent ? 'bg-white dark:bg-zinc-800 shadow-sm font-medium text-foreground' : 'text-muted-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}`}
                    >
                        <Home className="h-3.5 w-3.5" />
                        <span>Unit</span>
                    </button>

                    {breadcrumbs.map((crumb) => (
                        <div key={crumb.id} className="flex items-center">
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                            <button
                                onClick={() => handleNavigate(crumb.id)}
                                className="px-3 py-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors whitespace-nowrap"
                            >
                                {crumb.nama}
                            </button>
                        </div>
                    ))}

                    {currentParent && (
                        <div className="flex items-center">
                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                            <span className="px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 shadow-sm font-medium text-foreground whitespace-nowrap">
                                {currentParent.nama}
                            </span>
                        </div>
                    )}
                </div>

                {/* Actions & Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari unit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500 rounded-full"
                        />
                    </form>

                    <Select
                        value={filters.kategori || 'all'}
                        onValueChange={(value) => router.get('/data-master', {
                            tab: 'units',
                            parent_id: currentParent?.id,
                            search,
                            kategori: value === 'all' ? '' : value
                        }, { preserveState: true })}
                    >
                        <SelectTrigger className="w-[140px] h-9 rounded-full bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700">
                            <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua</SelectItem>
                            <SelectItem value="struktural">Struktural</SelectItem>
                            <SelectItem value="fungsional">Fungsional</SelectItem>
                            <SelectItem value="anggota">Anggota</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        onClick={() => {
                            createForm.setData({
                                ...createForm.data,
                                parent_id: currentParent?.id || null, // Default
                                kategori: currentParent?.kategori || 'anggota',
                            });
                            setIsCreateOpen(true);
                        }}
                        disabled={(currentParent?.level ?? 0) >= 5}
                        className="h-9 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Tambah
                    </Button>
                </div>
            </div>

            {/* Table View */}
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-transparent border-b border-zinc-100 dark:border-zinc-800 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                            <th className="px-6 py-3 font-medium">Nama Unit</th>
                            <th className="px-6 py-3 font-medium">Kategori</th>
                            <th className="px-6 py-3 font-medium text-center">Sub-Unit</th>
                            <th className="px-6 py-3 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {jabatan.data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                        <p>Tidak ada unit ditemukan</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            jabatan.data.map((item) => {
                                const isAnggota = item.kategori.toLowerCase() === 'anggota';

                                return (
                                    <tr
                                        key={item.id}
                                        className={`group transition-colors ${isAnggota ? 'cursor-default' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer'}`}
                                        onClick={() => !isAnggota && handleNavigate(item.id)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    {(item.children_count || 0) > 0 ? (
                                                        <Building2 className="h-5 w-5 fill-current" />
                                                    ) : (
                                                        <Briefcase className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className={`font-medium transition-colors ${!isAnggota ? 'text-foreground group-hover:text-indigo-600' : 'text-muted-foreground'}`}>{item.nama}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="outline" className={`capitalize border shadow-none font-normal ${getKategoriColor(item.kategori)}`}>
                                                {item.kategori}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {(item.children_count || 0) > 0 ? (
                                                <Badge variant="secondary" className="rounded-full px-2.5">
                                                    {item.children_count}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600 hover:shadow-sm rounded-full transition-all"
                                                    onClick={(e) => handleEdit(item, e)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-red-600 hover:shadow-sm rounded-full transition-all"
                                                    onClick={(e) => handleDelete(item.id, e)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-foreground hover:shadow-sm rounded-full transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleNavigate(item.id);
                                                    }}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {jabatan.last_page > 1 && (
                <div className="p-4 border-t dark:border-zinc-800 flex justify-center bg-zinc-50/30 dark:bg-zinc-900/30">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={jabatan.current_page === 1}
                            onClick={() => router.get('/data-master', { tab: 'units', page: jabatan.current_page - 1, parent_id: currentParent?.id })}
                            className="bg-white dark:bg-zinc-800"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={jabatan.current_page === jabatan.last_page}
                            onClick={() => router.get('/data-master', { tab: 'units', page: jabatan.current_page + 1, parent_id: currentParent?.id })}
                            className="bg-white dark:bg-zinc-800"
                        >
                            Selanjutnya
                        </Button>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                    <div className="px-6 py-6 border-b bg-white dark:bg-[#262626]">
                        <DialogTitle className="text-xl font-semibold text-foreground">Tambah Unit Baru</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Menambahkan unit ke dalam <span className="font-medium text-zinc-900 dark:text-zinc-100">{currentParent ? currentParent.nama : 'Root (Tingkat Atas)'}</span>
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleCreate} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama" className="text-sm font-medium">Nama Unit</Label>
                            <Input
                                id="create-nama"
                                value={createForm.data.nama}
                                onChange={(e) => createForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Divisi Teknologi"
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${createForm.errors.nama ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {createForm.errors.nama && <p className="text-xs text-red-500 font-medium">{createForm.errors.nama}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-kategori" className="text-sm font-medium">Kategori</Label>
                            <Select
                                value={createForm.data.kategori}
                                onValueChange={(value) => createForm.setData('kategori', value)}
                            >
                                <SelectTrigger id="create-kategori" className="h-10 focus:ring-zinc-900 dark:focus:ring-zinc-100">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="anggota">Anggota</SelectItem>
                                    <SelectItem value="fungsional">Fungsional</SelectItem>
                                    <SelectItem value="struktural">Struktural</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-keterangan" className="text-sm font-medium">Keterangan (Opsional)</Label>
                            <Textarea
                                id="create-keterangan"
                                value={createForm.data.keterangan}
                                onChange={(e) => createForm.setData('keterangan', e.target.value)}
                                placeholder="Deskripsi singkat unit ini..."
                                className="min-h-[80px] resize-none focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md"
                            >
                                {createForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                    <div className="px-6 py-6 border-b bg-white dark:bg-[#262626]">
                        <DialogTitle className="text-xl font-semibold text-foreground">Edit Unit</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Perbarui informasi unit ini.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleUpdate} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama" className="text-sm font-medium">Nama Unit</Label>
                            <Input
                                id="edit-nama"
                                value={editForm.data.nama}
                                onChange={(e) => editForm.setData('nama', e.target.value)}
                                className="h-10 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-kategori" className="text-sm font-medium">Kategori</Label>
                            <Select
                                value={editForm.data.kategori}
                                onValueChange={(value) => editForm.setData('kategori', value)}
                            >
                                <SelectTrigger id="edit-kategori" className="h-10 focus:ring-zinc-900 dark:focus:ring-zinc-100">
                                    <SelectValue placeholder="Pilih Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="anggota">Anggota</SelectItem>
                                    <SelectItem value="fungsional">Fungsional</SelectItem>
                                    <SelectItem value="struktural">Struktural</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-keterangan" className="text-sm font-medium">Keterangan</Label>
                            <Textarea
                                id="edit-keterangan"
                                value={editForm.data.keterangan}
                                onChange={(e) => editForm.setData('keterangan', e.target.value)}
                                className="min-h-[80px] resize-none focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                            />
                        </div>

                        <div className="space-y-2 pt-2 border-t border-dashed">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="edit-active"
                                    checked={editForm.data.is_active}
                                    onCheckedChange={(checked) => editForm.setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="edit-active" className="cursor-pointer">Status Aktif</Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
