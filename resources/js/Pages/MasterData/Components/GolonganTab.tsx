import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Golongan {
    id: number;
    nama: string;
    keterangan?: string;
}

interface Props {
    golongans: Golongan[];
}

export default function GolonganTab({ golongans }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Golongan | null>(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors } = useForm({
        nama: '',
        keterangan: '',
    });

    const handleCreate = () => {
        setEditingItem(null);
        reset();
        setIsOpen(true);
    };

    const handleEdit = (item: Golongan) => {
        setEditingItem(item);
        setData({
            nama: item.nama,
            keterangan: item.keterangan || '',
        });
        setIsOpen(true);
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus golongan ini?')) {
            router.delete(route('master-data.golongan.destroy', id), {
                onSuccess: () => toast.success('Golongan berhasil dihapus'),
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            put(route('master-data.golongan.update', editingItem.id), {
                onSuccess: () => {
                    setIsOpen(false);
                    toast.success('Golongan berhasil diperbarui');
                    reset();
                },
            });
        } else {
            post(route('master-data.golongan.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    toast.success('Golongan berhasil ditambahkan');
                    reset();
                },
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Data Golongan</h3>
                <Button onClick={handleCreate} size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Golongan
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Keterangan</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {golongans.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.nama}</TableCell>
                                <TableCell>{item.keterangan || '-'}</TableCell>
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
                        {golongans.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                                    Belum ada data golongan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit Golongan' : 'Tambah Golongan'}</DialogTitle>
                        <DialogDescription>Manajemen data golongan kepegawaian.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama">Nama Golongan</Label>
                            <Input
                                id="nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                placeholder="Contoh: IV/a"
                                required
                            />
                            {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
                            <Input
                                id="keterangan"
                                value={data.keterangan}
                                onChange={(e) => setData('keterangan', e.target.value)}
                                placeholder="Keterangan tambahan..."
                            />
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
