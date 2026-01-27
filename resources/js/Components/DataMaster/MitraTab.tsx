import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, Search, Building2, Globe, Phone, Mail, Copy, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import MitraAdminDialog from './MitraAdminDialog';

interface Mitra {
    id: number;
    code: string;
    name: string;
    pic?: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
}

interface Props {
    data: {
        mitras: {
            data: Mitra[];
            links: any[]; // Pagination links
            current_page: number;
        };
    };
    filters: {
        search?: string;
    };
}

export default function MitraTab({ data, filters }: Props) {
    const mitras = data.mitras?.data || [];
    const [search, setSearch] = useState(filters?.search || '');

    // -- Mitra State --
    const [isMitraModalOpen, setMitraModalOpen] = useState(false);
    const [isAdminModalOpen, setAdminModalOpen] = useState(false);
    const [selectedMitra, setSelectedMitra] = useState<Mitra | null>(null);

    const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);
    const mitraForm = useForm({
        name: '',
        pic: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        is_active: true,
    });

    // -- Search Handler --
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/data-master', { tab: 'mitra', search }, { preserveState: true });
    };

    const openAdminModal = (mitra: Mitra) => {
        setSelectedMitra(mitra);
        setAdminModalOpen(true);
    };

    // -- Mitra Handlers --
    const openCreateMitra = () => {
        setEditingMitra(null);
        mitraForm.reset();
        setMitraModalOpen(true);
    };

    const openEditMitra = (item: Mitra) => {
        setEditingMitra(item);
        mitraForm.setData({
            name: item.name,
            pic: item.pic || '',
            description: item.description || '',
            address: item.address || '',
            phone: item.phone || '',
            email: item.email || '',
            is_active: Boolean(item.is_active),
        });
        setMitraModalOpen(true);
    };

    const submitMitra = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingMitra) {
            mitraForm.post(route('master-data.mitra.update', editingMitra.id) + '?_method=PUT', {
                onSuccess: () => {
                    setMitraModalOpen(false);
                    mitraForm.reset();
                    toast.success('Mitra berhasil diperbarui');
                },
                forceFormData: true,
            });
        } else {
            mitraForm.post(route('master-data.mitra.store'), {
                onSuccess: () => {
                    setMitraModalOpen(false);
                    mitraForm.reset();
                    toast.success('Mitra berhasil ditambahkan');
                },
                forceFormData: true,
            });
        }
    };

    const deleteMitra = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus mitra ini?')) {
            router.delete(route('master-data.mitra.destroy', id), {
                onSuccess: () => toast.success('Mitra berhasil dihapus'),
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Kode berhasil disalin');
    };

    return (
        <div className="w-full">
            <div className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-2xl rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[600px]">
                {/* Toolbar */}
                <div className="p-4 border-b dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-transparent backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Building2 className="w-5 h-5" />
                            Daftar Mitra
                        </h2>
                    </div>

                    {/* Actions & Filters */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari mitra..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500 rounded-full"
                            />
                        </form>

                        <Button
                            size="sm"
                            onClick={openCreateMitra}
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
                                    <th className="px-6 py-3 font-medium">Beban Kerja</th>
                                    <th className="px-6 py-3 font-medium">PIC & Kontak</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {mitras.length > 0 ? (
                                    mitras.map((item) => (
                                        <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                        <Building2 className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground">{item.name}</div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className="text-xs text-muted-foreground font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded w-fit">{item.code}</div>
                                                            <button
                                                                onClick={() => copyToClipboard(item.code)}
                                                                className="text-muted-foreground hover:text-indigo-600 transition-colors"
                                                                title="Salin Kode"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground truncate max-w-[200px] mt-1">{item.address}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="flex flex-col gap-1 text-xs">
                                                    {item.pic && <div className="font-medium text-foreground mb-1">PIC: {item.pic}</div>}
                                                    {item.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {item.phone}</div>}
                                                    {item.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {item.email}</div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={item.is_active ? "default" : "secondary"} className={item.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}>
                                                    {item.is_active ? 'Aktif' : 'Non-Aktif'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600 hover:shadow-sm rounded-full transition-all"
                                                        onClick={() => openAdminModal(item)}
                                                        title="Kelola Admin"
                                                    >
                                                        <Users className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600 hover:shadow-sm rounded-full transition-all"
                                                        onClick={() => openEditMitra(item)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-red-600 hover:shadow-sm rounded-full transition-all"
                                                        onClick={() => deleteMitra(item.id)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                    <Building2 className="h-6 w-6 text-muted-foreground/50" />
                                                </div>
                                                <p>Tidak ada data mitra ditemukan</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                        {mitras.length > 0 ? (
                            mitras.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-foreground">{item.name}</div>
                                                <div className="text-xs text-muted-foreground">{item.address}</div>
                                            </div>
                                        </div>
                                        <Badge variant={item.is_active ? "default" : "secondary"} className={item.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}>
                                            {item.is_active ? 'Aktif' : 'Non-Aktif'}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 gap-1 text-sm text-muted-foreground">
                                        {item.phone && <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {item.phone}</div>}
                                        {item.email && <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {item.email}</div>}
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600"
                                            onClick={() => openAdminModal(item)}
                                        >
                                            <Users className="h-3 w-3 mr-1.5" /> Admin
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600"
                                            onClick={() => openEditMitra(item)}
                                        >
                                            <Pencil className="h-3 w-3 mr-1.5" /> Edit
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-600"
                                            onClick={() => deleteMitra(item.id)}
                                        >
                                            <Trash2 className="h-3 w-3 mr-1.5" /> Hapus
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Tidak ada data mitra ditemukan</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mitra Modal */}
            <Dialog open={isMitraModalOpen} onOpenChange={setMitraModalOpen}>
                <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                    <div className="px-6 py-6 border-b bg-white dark:bg-[#262626]">
                        <DialogTitle className="text-xl font-semibold text-foreground">{editingMitra ? 'Edit Mitra' : 'Tambah Mitra'}</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Manajemen data mitra kerjasama.
                        </DialogDescription>
                    </div>

                    <form onSubmit={submitMitra} className="p-6 space-y-4">
                        {editingMitra && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Kode Mitra</Label>
                                <div className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm font-mono border border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                                    <span>{editingMitra.code}</span>
                                    <button
                                        type="button"
                                        onClick={() => copyToClipboard(editingMitra.code)}
                                        className="text-muted-foreground hover:text-indigo-600 transition-colors"
                                        title="Salin Kode"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="mitra-name" className="text-sm font-medium">Nama Mitra</Label>
                                <Input
                                    id="mitra-name"
                                    value={mitraForm.data.name}
                                    onChange={(e) => mitraForm.setData('name', e.target.value)}
                                    placeholder="Nama Perusahaan / Instansi"
                                    className={mitraForm.errors.name ? 'border-red-500' : ''}
                                />
                                {mitraForm.errors.name && <p className="text-xs text-red-500">{mitraForm.errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mitra-phone" className="text-sm font-medium">Telepon</Label>
                                <Input
                                    id="mitra-phone"
                                    value={mitraForm.data.phone}
                                    onChange={(e) => mitraForm.setData('phone', e.target.value)}
                                    placeholder="021-xxxxxx"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mitra-pic" className="text-sm font-medium">PIC</Label>
                                <Input
                                    id="mitra-pic"
                                    value={mitraForm.data.pic}
                                    onChange={(e) => mitraForm.setData('pic', e.target.value)}
                                    placeholder="Nama Penanggung Jawab"
                                />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="mitra-email" className="text-sm font-medium">Email</Label>
                                <Input
                                    id="mitra-email"
                                    type="email"
                                    value={mitraForm.data.email}
                                    onChange={(e) => mitraForm.setData('email', e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>



                            <div className="space-y-2 col-span-2">
                                <Label htmlFor="mitra-address" className="text-sm font-medium">Alamat</Label>
                                <Textarea
                                    id="mitra-address"
                                    value={mitraForm.data.address}
                                    onChange={(e) => mitraForm.setData('address', e.target.value)}
                                    placeholder="Alamat lengkap..."
                                />
                            </div>



                            <div className="flex items-center space-x-2 col-span-2">
                                <Switch
                                    id="mitra-active"
                                    checked={mitraForm.data.is_active}
                                    onCheckedChange={(checked) => mitraForm.setData('is_active', checked)}
                                />
                                <Label htmlFor="mitra-active">Status Aktif</Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setMitraModalOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button type="submit" disabled={mitraForm.processing} className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md">
                                {mitraForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            {selectedMitra && (
                <MitraAdminDialog
                    isOpen={isAdminModalOpen}
                    onClose={() => setAdminModalOpen(false)}
                    mitraId={selectedMitra.id}
                    mitraName={selectedMitra.name}
                />
            )}
        </div>
    );
}
