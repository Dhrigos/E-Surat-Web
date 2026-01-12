import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Golongan {
    id: number;
    nama: string;
}

interface Pangkat {
    id: number;
    nama: string;
    golongan_id: number | null;
    golongan?: Golongan;
}

interface Props {
    pangkats: Pangkat[];
    golongans: Golongan[];
}

export default function PangkatTab({ pangkats, golongans }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Pangkat | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        nama: '',
        golongan_id: '',
    });

    const handleCreate = () => {
        setEditingItem(null);
        reset();
        setIsOpen(true);
    };

    const handleEdit = (item: Pangkat) => {
        setEditingItem(item);
        setData({
            nama: item.nama,
            golongan_id: item.golongan_id ? item.golongan_id.toString() : '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pangkat ini?')) {
            router.delete(route('master-data.pangkat.destroy', id), {
                onSuccess: () => toast.success('Pangkat berhasil dihapus'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('master-data.pangkat.update', editingItem.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    toast.success('Pangkat berhasil diperbarui');
                    reset();
                },
            });
        } else {
            post(route('master-data.pangkat.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    toast.success('Pangkat berhasil ditambahkan');
                    reset();
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Data Pangkat</h3>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Pangkat
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Pangkat</TableHead>
                            <TableHead>Golongan</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pangkats.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.nama}</TableCell>
                                <TableCell>
                                    {item.golongan ? (
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">
                                            {item.golongan.nama}
                                        </span>
                                    ) : '-'}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {pangkats.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    Belum ada data pangkat.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Pangkat' : 'Tambah Pangkat'}</DialogTitle>
                        <DialogDescription>Manajemen data pangkat dan golongan terkait.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Pangkat</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="Contoh: Pembina Utama"
                                required
                            />
                            {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="golongan_id">Pilih Golongan</Label>
                            <Select
                                value={data.golongan_id}
                                onValueChange={(val) => setData('golongan_id', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Golongan..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {golongans.map(g => (
                                        <SelectItem key={g.id} value={g.id.toString()}>
                                            {g.nama}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-muted-foreground">Golongan bersifat opsional jika belum ada.</p>
                            {errors.golongan_id && <p className="text-sm text-red-500">{errors.golongan_id}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
