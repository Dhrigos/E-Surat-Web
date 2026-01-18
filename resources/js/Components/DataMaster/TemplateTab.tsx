import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    FileText,
    Workflow,
} from 'lucide-react';
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LetterType {
    id: number;
    name: string;
    code: string;
    description: string | null;
    approval_workflows?: { steps?: any[] }[];
}

interface Props {
    templates: {
        data: LetterType[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
    };
}

export default function TemplateTab({ templates, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LetterType | null>(null);

    const createForm = useForm({
        name: '',
        code: '',
        description: '',
    });

    const editForm = useForm({
        name: '',
        code: '',
        description: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/data-master', {
            tab: 'templates',
            search,
        }, { preserveState: true });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/jenis-surat', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (item: LetterType) => {
        setEditingItem(item);
        editForm.setData({
            name: item.name,
            code: item.code,
            description: item.description || '',
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        editForm.put(`/jenis-surat/${editingItem.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus jenis surat ini?')) {
            router.delete(`/jenis-surat/${id}`);
        }
    };

    return (
        <div className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-2xl rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[600px]">
            {/* Toolbar */}
            <div className="p-4 border-b dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-transparent backdrop-blur-sm">

                {/* Title/Description - Optional or keep simplify like role tab */}
                <div className="hidden md:block">
                    <h3 className="text-sm font-medium text-foreground">Daftar Jenis Surat</h3>
                    <p className="text-xs text-muted-foreground">Kelola template dan jenis surat sistem.</p>
                </div>

                {/* Actions & Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari jenis surat..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500 rounded-full"
                        />
                    </form>
                    <Button
                        size="sm"
                        onClick={() => {
                            createForm.reset();
                            setIsCreateOpen(true);
                        }}
                        className="h-9 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Tambah
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                <div className="hidden md:block">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-transparent border-b border-zinc-100 dark:border-zinc-800 sticky top-0 backdrop-blur-sm z-10">
                            <tr>
                                <th className="px-6 py-3 font-medium">Nama Surat</th>
                                <th className="px-6 py-3 font-medium">Kode</th>
                                <th className="px-6 py-3 font-medium">Deskripsi</th>
                                <th className="px-6 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {templates.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-muted-foreground/50" />
                                            </div>
                                            <p>Tidak ada jenis surat ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                templates.data.map((item) => (
                                    <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="font-medium text-foreground">{item.name}</div>
                                                {item.approval_workflows?.[0]?.steps?.length ? (
                                                    <div className="ml-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-md shadow-sm border border-green-200 dark:border-green-800" title="Workflow Aktif">
                                                        <Workflow className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                {item.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                                            {item.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600 hover:shadow-sm rounded-full transition-all"
                                                    onClick={() => handleEdit(item)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-red-600 hover:shadow-sm rounded-full transition-all"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {templates.data.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <p>Tidak ada jenis surat ditemukan</p>
                            </div>
                        </div>
                    ) : (
                        templates.data.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-medium text-foreground">{item.name}</div>
                                                {item.approval_workflows?.[0]?.steps?.length ? (
                                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-md shadow-sm border border-green-200 dark:border-green-800" title="Workflow Aktif">
                                                        <Workflow className="w-3 h-3" />
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="mt-1 flex gap-2 items-center">
                                                <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                    {item.code}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {item.description && (
                                    <div className="text-sm text-muted-foreground bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-md border border-zinc-100 dark:border-zinc-800/50">
                                        {item.description}
                                    </div>
                                )}

                                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600"
                                        onClick={() => handleEdit(item)}
                                    >
                                        <Pencil className="h-3 w-3 mr-1.5" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-600"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1.5" /> Hapus
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {templates.last_page > 1 && (
                <div className="p-4 border-t dark:border-zinc-800 flex justify-center bg-zinc-50/30 dark:bg-zinc-900/30">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={templates.current_page === 1}
                            onClick={() => router.get(`/data-master?tab=templates&page=${templates.current_page - 1}&search=${search}`)}
                            className="bg-white dark:bg-zinc-800"
                        >
                            Sebelumnya
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={templates.current_page === templates.last_page}
                            onClick={() => router.get(`/data-master?tab=templates&page=${templates.current_page + 1}&search=${search}`)}
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
                        <DialogTitle className="text-xl font-semibold text-foreground">Tambah Jenis Surat</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Tambahkan jenis surat baru ke dalam sistem.
                        </DialogDescription>
                    </div>
                    <form onSubmit={handleCreate} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="create-name" className="text-sm font-medium">Nama Surat <span className="text-red-500">*</span></Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Surat Keputusan"
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${createForm.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {createForm.errors.name && <p className="text-xs text-red-500 font-medium">{createForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-code" className="text-sm font-medium">Kode Surat <span className="text-red-500">*</span></Label>
                            <Input
                                id="create-code"
                                value={createForm.data.code}
                                onChange={(e) => createForm.setData('code', e.target.value)}
                                placeholder="Contoh: SK"
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${createForm.errors.code ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {createForm.errors.code && <p className="text-xs text-red-500 font-medium">{createForm.errors.code}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-description" className="text-sm font-medium">Deskripsi</Label>
                            <Textarea
                                id="create-description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                placeholder="Keterangan tambahan..."
                                className="min-h-[80px] resize-none focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button type="submit" disabled={createForm.processing} className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md">
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
                        <DialogTitle className="text-xl font-semibold text-foreground">Edit Jenis Surat</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Perbarui informasi jenis surat ini.
                        </DialogDescription>
                    </div>
                    <form onSubmit={handleUpdate} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name" className="text-sm font-medium">Nama Surat <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${editForm.errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {editForm.errors.name && <p className="text-xs text-red-500 font-medium">{editForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-code" className="text-sm font-medium">Kode Surat <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit-code"
                                value={editForm.data.code}
                                onChange={(e) => editForm.setData('code', e.target.value)}
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${editForm.errors.code ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {editForm.errors.code && <p className="text-xs text-red-500 font-medium">{editForm.errors.code}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description" className="text-sm font-medium">Deskripsi</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
                                className="min-h-[80px] resize-none focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button type="submit" disabled={editForm.processing} className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md">
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
