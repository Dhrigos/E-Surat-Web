import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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

interface LetterType {
    id: number;
    name: string;
    code: string;
    description: string | null;
    approval_workflows?: { steps?: any[] }[];
}

interface Props {
    jenisSurat: {
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

// ... other imports
import WorkflowEditor from './WorkflowEditor';

export default function Index({ jenisSurat, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LetterType | null>(null);

    // Workflow Editor State
    const [isWorkflowOpen, setIsWorkflowOpen] = useState(false);
    const [selectedLetterType, setSelectedLetterType] = useState<LetterType | null>(null);

    const handleOpenWorkflow = (item: LetterType) => {
        setSelectedLetterType(item);
        setIsWorkflowOpen(true);
    };

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
        router.get('/jenis-surat', {
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
        <AppLayout>
            <Head title="Data Jenis Surat" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* ... (Header and Filters unchanged) ... */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Data Jenis Surat</h1>
                            <p className="text-muted-foreground mt-2">
                                Kelola jenis surat dan kode surat
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari jenis surat (nama, kode)..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </form>
                        <Button
                            onClick={() => {
                                createForm.reset();
                                setIsCreateOpen(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah
                        </Button>
                    </div>
                </div>

                {/* Grid View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {jenisSurat.data.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                            <p className="mb-1 text-lg font-medium">Jenis surat yang anda cari tidak ditemukan</p>
                            <p className="text-sm text-muted-foreground">
                                Tambah{' '}
                                <button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="underline hover:text-primary font-medium text-foreground cursor-pointer"
                                >
                                    disini
                                </button>
                            </p>
                        </div>
                    ) : (
                        jenisSurat.data.map((item) => (
                            <Card
                                key={item.id}
                                className="group relative hover:border-primary/50 transition-colors cursor-pointer"
                                onDoubleClick={() => handleOpenWorkflow(item)}
                            >
                                <CardContent className="p-4 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h3 className="font-medium truncate" title={item.name}>
                                                {item.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-mono">
                                                {item.code}
                                            </p>
                                        </div>
                                    </div>

                                    {item.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {item.description}
                                        </p>
                                    )}

                                    {item.approval_workflows?.[0]?.steps?.length ? (
                                        <div className="absolute top-2 left-2 flex gap-1 z-10">
                                            <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-md shadow-sm border border-green-200 dark:border-green-800" title="Workflow Aktif">
                                                <Workflow className="w-4 h-4" />
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* Actions Overlay */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-1 rounded-md backdrop-blur-sm shadow-sm z-10">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                                        >
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {jenisSurat.last_page > 1 && (
                    <div className="flex justify-center mt-4">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                disabled={jenisSurat.current_page === 1}
                                onClick={() => router.get(`/jenis-surat?page=${jenisSurat.current_page - 1}&search=${search}`)}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                disabled={jenisSurat.current_page === jenisSurat.last_page}
                                onClick={() => router.get(`/jenis-surat?page=${jenisSurat.current_page + 1}&search=${search}`)}
                            >
                                Selanjutnya
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Workflow Editor Modal */}
            <WorkflowEditor
                isOpen={isWorkflowOpen}
                onClose={() => setIsWorkflowOpen(false)}
                letterType={selectedLetterType}
            />

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Jenis Surat</DialogTitle>
                        <DialogDescription>
                            Tambahkan jenis surat baru ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Nama Surat *</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Contoh: Surat Keputusan"
                                className={createForm.errors.name ? 'border-destructive' : ''}
                            />
                            {createForm.errors.name && <p className="text-sm text-destructive">{createForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-code">Kode Surat *</Label>
                            <Input
                                id="create-code"
                                value={createForm.data.code}
                                onChange={(e) => createForm.setData('code', e.target.value)}
                                placeholder="Contoh: SK"
                                className={createForm.errors.code ? 'border-destructive' : ''}
                            />
                            {createForm.errors.code && <p className="text-sm text-destructive">{createForm.errors.code}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-description">Deskripsi</Label>
                            <Textarea
                                id="create-description"
                                value={createForm.data.description}
                                onChange={(e) => createForm.setData('description', e.target.value)}
                                placeholder="Keterangan tambahan..."
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
                        <DialogTitle>Edit Jenis Surat</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nama Surat *</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                className={editForm.errors.name ? 'border-destructive' : ''}
                            />
                            {editForm.errors.name && <p className="text-sm text-destructive">{editForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-code">Kode Surat *</Label>
                            <Input
                                id="edit-code"
                                value={editForm.data.code}
                                onChange={(e) => editForm.setData('code', e.target.value)}
                                className={editForm.errors.code ? 'border-destructive' : ''}
                            />
                            {editForm.errors.code && <p className="text-sm text-destructive">{editForm.errors.code}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Deskripsi</Label>
                            <Textarea
                                id="edit-description"
                                value={editForm.data.description}
                                onChange={(e) => editForm.setData('description', e.target.value)}
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
