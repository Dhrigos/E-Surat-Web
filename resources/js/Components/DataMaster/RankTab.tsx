import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Search, Layers, Award, Briefcase, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface Golongan {
    id: number;
    nama: string;
    keterangan?: string;
}

interface Pangkat {
    id: number;
    nama: string;
    golongan_id: number | null;
    golongan?: Golongan;
}

interface Props {
    data: {
        golongans: Golongan[];
        pangkats: Pangkat[];
    };
    filters: {
        search?: string;
    };
}

export default function RankTab({ data: { golongans, pangkats }, filters }: Props) {
    const [subTab, setSubTab] = useState('golongan'); // 'golongan' | 'pangkat'
    const [search, setSearch] = useState(filters.search || '');

    // -- Golongan State --
    const [isGolonganModalOpen, setGolonganModalOpen] = useState(false);
    const [editingGolongan, setEditingGolongan] = useState<Golongan | null>(null);
    const golonganForm = useForm({ nama: '', keterangan: '' });

    // -- Pangkat State --
    const [isPangkatModalOpen, setPangkatModalOpen] = useState(false);
    const [editingPangkat, setEditingPangkat] = useState<Pangkat | null>(null);
    const pangkatForm = useForm({ nama: '', golongan_id: '' });

    // -- Search Handler --
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/data-master', { tab: 'ranks', search }, { preserveState: true });
    };

    // -- Golongan Handlers --
    const openCreateGolongan = () => {
        setEditingGolongan(null);
        golonganForm.reset();
        setGolonganModalOpen(true);
    };

    const openEditGolongan = (item: Golongan) => {
        setEditingGolongan(item);
        golonganForm.setData({
            nama: item.nama,
            keterangan: item.keterangan || '',
        });
        setGolonganModalOpen(true);
    };

    const submitGolongan = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingGolongan) {
            golonganForm.put(route('master-data.golongan.update', editingGolongan.id), {
                onSuccess: () => {
                    setGolonganModalOpen(false);
                    golonganForm.reset();
                    toast.success('Golongan berhasil diperbarui');
                },
            });
        } else {
            golonganForm.post(route('master-data.golongan.store'), {
                onSuccess: () => {
                    setGolonganModalOpen(false);
                    golonganForm.reset();
                    toast.success('Golongan berhasil ditambahkan');
                },
            });
        }
    };

    const deleteGolongan = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus golongan ini?')) {
            router.delete(route('master-data.golongan.destroy', id), {
                onSuccess: () => toast.success('Golongan berhasil dihapus'),
            });
        }
    };

    // -- Pangkat Handlers --
    const openCreatePangkat = () => {
        setEditingPangkat(null);
        pangkatForm.reset();
        setPangkatModalOpen(true);
    };

    const openEditPangkat = (item: Pangkat) => {
        setEditingPangkat(item);
        pangkatForm.setData({
            nama: item.nama,
            golongan_id: item.golongan_id ? item.golongan_id.toString() : '',
        });
        setPangkatModalOpen(true);
    };

    const submitPangkat = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPangkat) {
            pangkatForm.put(route('master-data.pangkat.update', editingPangkat.id), {
                onSuccess: () => {
                    setPangkatModalOpen(false);
                    pangkatForm.reset();
                    toast.success('Pangkat berhasil diperbarui');
                },
            });
        } else {
            pangkatForm.post(route('master-data.pangkat.store'), {
                onSuccess: () => {
                    setPangkatModalOpen(false);
                    pangkatForm.reset();
                    toast.success('Pangkat berhasil ditambahkan');
                },
            });
        }
    };

    const deletePangkat = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pangkat ini?')) {
            router.delete(route('master-data.pangkat.destroy', id), {
                onSuccess: () => toast.success('Pangkat berhasil dihapus'),
            });
        }
    };

    return (
        <Tabs value={subTab} onValueChange={setSubTab} className="w-full">
            <div className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-2xl rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col min-h-[600px]">
                {/* Toolbar */}
                <div className="p-4 border-b dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-transparent backdrop-blur-sm">
                    {/* Tabs List acting as 'Breadcrumbs' / Type Switcher */}
                    <TabsList className="bg-white dark:bg-zinc-800 border dark:border-zinc-700 p-1 h-auto rounded-full shadow-sm">
                        <TabsTrigger
                            value="golongan"
                            className="rounded-full px-4 py-1.5 text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all ease-in-out"
                        >
                            <Layers className="w-3.5 h-3.5 mr-2" /> Golongan
                        </TabsTrigger>
                        <TabsTrigger
                            value="pangkat"
                            className="rounded-full px-4 py-1.5 text-sm font-medium data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all ease-in-out"
                        >
                            <Award className="w-3.5 h-3.5 mr-2" /> Pangkat
                        </TabsTrigger>
                    </TabsList>

                    {/* Actions & Filters */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <form onSubmit={handleSearch} className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={`Cari ${subTab === 'golongan' ? 'golongan' : 'pangkat'}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-9 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500 rounded-full"
                            />
                        </form>

                        <Button
                            size="sm"
                            onClick={subTab === 'golongan' ? openCreateGolongan : openCreatePangkat}
                            className="h-9 px-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
                        >
                            <Plus className="h-4 w-4 mr-1.5" />
                            Tambah
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto">
                    {/* Golongan Table */}
                    <TabsContent value="golongan" className="m-0 h-full">
                        <div className="hidden md:block">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-transparent border-b border-zinc-100 dark:border-zinc-800 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Nama Golongan</th>
                                        <th className="px-6 py-3 font-medium">Keterangan</th>
                                        <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {golongans.filter(g => !search || g.nama.toLowerCase().includes(search.toLowerCase())).length > 0 ? (
                                        golongans.filter(g => !search || g.nama.toLowerCase().includes(search.toLowerCase())).map((item) => (
                                            <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                            <Layers className="h-5 w-5" />
                                                        </div>
                                                        <div className="font-medium text-foreground">{item.nama}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {item.keterangan || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600 hover:shadow-sm rounded-full transition-all"
                                                            onClick={() => openEditGolongan(item)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-red-600 hover:shadow-sm rounded-full transition-all"
                                                            onClick={() => deleteGolongan(item.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                        <Layers className="h-6 w-6 text-muted-foreground/50" />
                                                    </div>
                                                    <p>Tidak ada data golongan ditemukan</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 p-4">
                            {golongans.filter(g => !search || g.nama.toLowerCase().includes(search.toLowerCase())).length > 0 ? (
                                golongans.filter(g => !search || g.nama.toLowerCase().includes(search.toLowerCase())).map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    <Layers className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{item.nama}</div>
                                                    <div className="text-sm text-muted-foreground">{item.keterangan || '-'}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600"
                                                onClick={() => openEditGolongan(item)}
                                            >
                                                <Pencil className="h-3 w-3 mr-1.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-600"
                                                onClick={() => deleteGolongan(item.id)}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1.5" /> Hapus
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                            <Layers className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                        <p>Tidak ada data golongan ditemukan</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Pangkat Table */}
                    <TabsContent value="pangkat" className="m-0 h-full">
                        <div className="hidden md:block">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-transparent border-b border-zinc-100 dark:border-zinc-800 sticky top-0 backdrop-blur-sm z-10">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Nama Pangkat</th>
                                        <th className="px-6 py-3 font-medium">Golongan</th>
                                        <th className="px-6 py-3 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {pangkats.filter(p => !search || p.nama.toLowerCase().includes(search.toLowerCase())).length > 0 ? (
                                        pangkats.filter(p => !search || p.nama.toLowerCase().includes(search.toLowerCase())).map((item) => (
                                            <tr key={item.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                            <Award className="h-5 w-5" />
                                                        </div>
                                                        <div className="font-medium text-foreground">{item.nama}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.golongan ? (
                                                        <Badge variant="outline" className="bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 shadow-none font-medium">
                                                            {item.golongan.nama}
                                                        </Badge>
                                                    ) : <span className="text-zinc-400">-</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-indigo-600 hover:shadow-sm rounded-full transition-all"
                                                            onClick={() => openEditPangkat(item)}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-white dark:hover:bg-zinc-700 hover:text-red-600 hover:shadow-sm rounded-full transition-all"
                                                            onClick={() => deletePangkat(item.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                        <Award className="h-6 w-6 text-muted-foreground/50" />
                                                    </div>
                                                    <p>Tidak ada data pangkat ditemukan</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4 p-4">
                            {pangkats.filter(p => !search || p.nama.toLowerCase().includes(search.toLowerCase())).length > 0 ? (
                                pangkats.filter(p => !search || p.nama.toLowerCase().includes(search.toLowerCase())).map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                    <Award className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{item.nama}</div>
                                                    <div className="mt-1">
                                                        {item.golongan ? (
                                                            <Badge variant="outline" className="bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 shadow-none font-medium text-xs">
                                                                {item.golongan.nama}
                                                            </Badge>
                                                        ) : <span className="text-zinc-400 text-sm">-</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-indigo-600"
                                                onClick={() => openEditPangkat(item)}
                                            >
                                                <Pencil className="h-3 w-3 mr-1.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-red-600"
                                                onClick={() => deletePangkat(item.id)}
                                            >
                                                <Trash2 className="h-3 w-3 mr-1.5" /> Hapus
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                            <Award className="h-6 w-6 text-muted-foreground/50" />
                                        </div>
                                        <p>Tidak ada data pangkat ditemukan</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </div>

            {/* Golongan Modal */}
            <Dialog open={isGolonganModalOpen} onOpenChange={setGolonganModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                    <div className="px-6 py-6 border-b bg-white dark:bg-[#262626]">
                        <DialogTitle className="text-xl font-semibold text-foreground">{editingGolongan ? 'Edit Golongan' : 'Tambah Golongan'}</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Manajemen data golongan kepegawaian.
                        </DialogDescription>
                    </div>

                    <form onSubmit={submitGolongan} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="golongan-nama" className="text-sm font-medium">Nama Golongan</Label>
                            <Input
                                id="golongan-nama"
                                value={golonganForm.data.nama}
                                onChange={(e) => golonganForm.setData('nama', e.target.value)}
                                placeholder="Contoh: IV/a"
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${golonganForm.errors.nama ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {golonganForm.errors.nama && <p className="text-xs text-red-500 font-medium">{golonganForm.errors.nama}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="golongan-ket" className="text-sm font-medium">Keterangan</Label>
                            <Input
                                id="golongan-ket"
                                value={golonganForm.data.keterangan}
                                onChange={(e) => golonganForm.setData('keterangan', e.target.value)}
                                placeholder="Opsional"
                                className="h-10 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setGolonganModalOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button type="submit" disabled={golonganForm.processing} className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md">
                                {golonganForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Pangkat Modal */}
            <Dialog open={isPangkatModalOpen} onOpenChange={setPangkatModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                    <div className="px-6 py-6 border-b bg-white dark:bg-[#262626]">
                        <DialogTitle className="text-xl font-semibold text-foreground">{editingPangkat ? 'Edit Pangkat' : 'Tambah Pangkat'}</DialogTitle>
                        <DialogDescription className="mt-1.5 text-muted-foreground">
                            Manajemen data pangkat dan golongan.
                        </DialogDescription>
                    </div>
                    <form onSubmit={submitPangkat} className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="pangkat-nama" className="text-sm font-medium">Nama Pangkat</Label>
                            <Input
                                id="pangkat-nama"
                                value={pangkatForm.data.nama}
                                onChange={(e) => pangkatForm.setData('nama', e.target.value)}
                                placeholder="Contoh: Pembina Utama"
                                className={`h-10 transition-all focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${pangkatForm.errors.nama ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                            {pangkatForm.errors.nama && <p className="text-xs text-red-500 font-medium">{pangkatForm.errors.nama}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pangkat-gol" className="text-sm font-medium">Golongan</Label>
                            <Select
                                value={pangkatForm.data.golongan_id}
                                onValueChange={(val) => pangkatForm.setData('golongan_id', val)}
                            >
                                <SelectTrigger className="h-10 focus:ring-zinc-900 dark:focus:ring-zinc-100">
                                    <SelectValue placeholder="Pilih Golongan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {golongans.map(g => (
                                        <SelectItem key={g.id} value={g.id.toString()}>{g.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {pangkatForm.errors.golongan_id && <p className="text-xs text-red-500 font-medium">{pangkatForm.errors.golongan_id}</p>}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setPangkatModalOpen(false)} className="h-10 px-4">
                                Batal
                            </Button>
                            <Button type="submit" disabled={pangkatForm.processing} className="h-10 px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-md">
                                {pangkatForm.processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </Tabs>
    );
}
