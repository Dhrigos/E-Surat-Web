import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronDown, Search, Plus, Pencil, Trash2, GripVertical, Shield, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface JabatanRole {
    id: number;
    nama: string;
    is_active: boolean;
    level: number;
    children?: JabatanRole[];
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

// Helper Component for Recursive Rows
const JabatanRoleRow = ({
    role,
    level = 0,
    onEdit,
    onDelete,
    data
}: {
    role: JabatanRole,
    level?: number,
    onEdit: (role: JabatanRole) => void,
    onDelete: (id: number) => void,
    data?: JabatanRole[]
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = role.children && role.children.length > 0;

    // Render as TableRow for Root
    return (
        <React.Fragment>
            <TableRow className="border-b border-zinc-100 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group transition-colors">
                <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        {hasChildren ? (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700/50 rounded transition-colors text-zinc-400 hover:text-foreground"
                            >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        ) : (
                            <div className="w-6 h-6" /> // Spacer
                        )}
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Shield className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-foreground">{role.nama}</span>
                    </div>
                </TableCell>

                <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(role)}
                            className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600 hover:shadow-sm rounded-full transition-all"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(role.id)}
                            className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-red-600 hover:shadow-sm rounded-full transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>

            {/* Expanded Children View - Rendered as a nested list for DnD support */}
            {isExpanded && hasChildren && (
                <TableRow className="border-b border-zinc-100 dark:border-white/5 bg-zinc-50/30 dark:bg-black/20">
                    <TableCell colSpan={2} className="p-0">
                        <Droppable droppableId={`children-${role.id}`} type={`CHILD-${role.id}`}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex flex-col w-full py-2 pl-4"
                                >
                                    {role.children!.map((child, index) => (
                                        <Draggable key={child.id} draggableId={child.id.toString()} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className="flex items-center border-b border-zinc-100 dark:border-white/5 last:border-0 hover:bg-zinc-100/50 dark:hover:bg-white/5 pr-6 transition-colors group/child"
                                                >
                                                    {/* Name Column (Aligned with Parent Col 2) */}
                                                    <div className="flex-1 pl-12 py-3 flex items-center gap-3">
                                                        {/* Drag Handle */}
                                                        <div {...provided.dragHandleProps} className="cursor-grab text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 mr-1">
                                                            <GripVertical className="w-4 h-4" />
                                                        </div>

                                                        <span className="text-sm font-medium text-muted-foreground group-hover/child:text-foreground transition-colors">{child.nama}</span>
                                                    </div>

                                                    {/* Actions Column (Aligned matches parent) */}
                                                    <div className="w-[100px] flex-shrink-0 flex justify-end gap-1 pr-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => onEdit(child)}
                                                            className="h-7 w-7 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600 hover:shadow-sm rounded-full transition-all"
                                                        >
                                                            <Pencil className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            onClick={() => onDelete(child.id)}
                                                            className="h-7 w-7 hover:bg-white dark:hover:bg-zinc-700 hover:text-red-600 hover:shadow-sm rounded-full transition-all"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};

// Mobile Role Item Component
const MobileRoleItem = ({
    role,
    level = 0,
    onEdit,
    onDelete
}: {
    role: JabatanRole,
    level?: number,
    onEdit: (role: JabatanRole) => void,
    onDelete: (id: number) => void
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const hasChildren = role.children && role.children.length > 0;

    return (
        <div className="space-y-2">
            <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col gap-3 ${level > 0 ? 'ml-4 border-l-4 border-l-indigo-500' : ''}`}>
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="font-medium text-foreground">{role.nama}</div>
                            {hasChildren && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {role.children?.length} sub-roles
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    {hasChildren && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
                            {isExpanded ? 'Tutup' : 'Lihat Sub-role'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600"
                        onClick={() => onEdit(role)}
                    >
                        <Pencil className="h-3 w-3 mr-1.5" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-600"
                        onClick={() => onDelete(role.id)}
                    >
                        <Trash2 className="h-3 w-3 mr-1.5" /> Hapus
                    </Button>
                </div>
            </div>

            {isExpanded && hasChildren && role.children && (
                <div className="space-y-2 pt-1 border-l-2 border-dashed border-zinc-200 dark:border-zinc-800 ml-4 pl-0">
                    {role.children.map((child) => (
                        <MobileRoleItem
                            key={child.id}
                            role={child}
                            level={level + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function JabatanRoleTab({ roles, filters }: Props) {
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
        router.get('/data-master', { tab: 'roles', search }, { preserveState: true });
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

        // Handle Child Reordering
        if (result.source.droppableId.startsWith('children-')) {
            const parentId = parseInt(result.source.droppableId.split('-')[1]);
            const parentIndex = localRoles.findIndex(r => r.id === parentId);

            if (parentIndex === -1) return;

            const newRoles = [...localRoles];
            const parent = { ...newRoles[parentIndex] };

            if (!parent.children) return;

            const newChildren = Array.from(parent.children);
            const [reorderedItem] = newChildren.splice(result.source.index, 1);
            newChildren.splice(result.destination.index, 0, reorderedItem);

            parent.children = newChildren;
            newRoles[parentIndex] = parent;

            setLocalRoles(newRoles);

            const payload = newChildren.map((role, idx) => ({
                id: role.id,
                level: idx + 1
            }));

            // Optimistic Update is already done via setLocalRoles

            // Send to backend via Inertia Router to handle Auth/CSRF correctly
            router.post(route('jabatan-roles.reorder'), {
                roles: payload
            }, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success('Urutan diperbarui');
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error('Gagal memperbarui urutan');
                    setLocalRoles(roles.data); // Revert on error
                }
            });
        }
    };

    return (
        <div className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-2xl rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[600px]">
            {/* Toolbar */}
            <div className="p-4 border-b dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-transparent backdrop-blur-sm">

                {/* Title/Description - Optional or keep simplify */}
                <div className="hidden md:block">
                    <h3 className="text-sm font-medium text-foreground">Daftar Role & Jabatan</h3>
                    <p className="text-xs text-muted-foreground">Kelola struktur jabatan dan role pengguna.</p>
                </div>

                {/* Actions & Filters */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Role..."
                            className="pl-9 h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500 rounded-full"
                        />
                    </form>
                    <Button
                        size="sm"
                        onClick={openCreateModal}
                        className="h-9 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Tambah Role
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto">
                <div className="hidden md:block overflow-x-auto">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Table className="w-full text-sm text-left">
                            <TableHeader>
                                <TableRow className="text-xs uppercase bg-transparent border-b border-zinc-100 dark:border-zinc-800 sticky top-0 backdrop-blur-sm z-10">
                                    <TableHead className="px-6 py-3 font-medium text-muted-foreground w-full">Nama Role</TableHead>
                                    <TableHead className="px-6 py-3 font-medium text-muted-foreground text-right whitespace-nowrap">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {localRoles.length > 0 ? (
                                    localRoles.map((role) => (
                                        <JabatanRoleRow
                                            key={role.id}
                                            role={role}
                                            onEdit={openEditModal}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                    <Shield className="h-6 w-6 text-muted-foreground/50" />
                                                </div>
                                                <p>Tidak ada data role ditemukan.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DragDropContext>
                </div>

                {/* Mobile ListView */}
                <div className="md:hidden p-4 space-y-4">
                    {localRoles.length > 0 ? (
                        localRoles.map((role) => (
                            <MobileRoleItem
                                key={role.id}
                                role={role}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Shield className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <p>Tidak ada data role ditemukan.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                    <div className="px-6 py-6 border-b bg-white dark:bg-[#262626]">
                        <DialogTitle className="text-xl font-semibold text-foreground">Tambah Role Baru</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Tambahkan role atau jabatan baru ke dalam sistem.
                        </DialogDescription>
                    </div>

                    <form onSubmit={handleSubmitCreate} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="create-nama" className="text-sm font-medium">Nama Role</Label>
                            <Input
                                id="create-nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${errors.nama ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                placeholder="Contoh: STAFF AHLI"
                                autoFocus
                            />
                            {errors.nama && <p className="text-xs text-red-500 font-medium">{errors.nama}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md">
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                    <div className="px-6 py-6 border-b bg-white dark:bg-[#262626]">
                        <DialogTitle className="text-xl font-semibold text-foreground">Edit Role</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Perbarui informasi role ini.
                        </DialogDescription>
                    </div>
                    <form onSubmit={handleSubmitEdit} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="edit-nama" className="text-sm font-medium">Nama Role</Label>
                            <Input
                                id="edit-nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${errors.nama ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {errors.nama && <p className="text-xs text-red-500 font-medium">{errors.nama}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setEditModalOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing} className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md">
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
