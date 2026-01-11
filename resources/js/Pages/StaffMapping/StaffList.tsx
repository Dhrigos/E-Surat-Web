import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    Phone,
    IdCard,
    Building,
    Mail,
    Eye
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface Staff {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    nip: string;
    nik: string;
    nia: string | null;
    jabatan: { id: number; nama: string };
    tanggal_masuk: string;
    role: string;
    status: string;
}

interface Props {
    staff: Staff[];
    jabatan: any[];
    filters?: {
        search?: string;
    };
}

export default function StaffList({ staff, jabatan = [], filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);

    // Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: () => void;
        variant?: 'default' | 'destructive';
    }>({
        isOpen: false,
        title: '',
        description: '',
        action: () => { },
        variant: 'default'
    });

    const { hasPermission } = usePermission();





    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        nip: '',
        nia: '',
        jabatan_id: '',
        role: 'staff',
    });




    const filteredStaff = useMemo(() => {
        return staff.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.nip.includes(searchTerm);
            return matchesSearch;
        });
    }, [staff, searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/staff-mapping', { search: searchTerm }, { preserveState: true });
    };



    const handleEdit = (s: Staff) => {
        setEditingStaff(s);
        editForm.setData({
            name: s.name,
            email: s.email,
            phone: s.phone || '',
            nip: s.nip,
            nia: s.nia || '',
            jabatan_id: s.jabatan.id.toString(),
            role: s.role,
        });
        setShowEditDialog(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;

        editForm.put(`/staff/${editingStaff.id}`, {
            onSuccess: () => {
                setShowEditDialog(false);
                setEditingStaff(null);
                editForm.reset();
            },
        });
    };



    const handleDetail = (s: Staff) => {
        setViewingStaff(s);
        setShowDetailDialog(true);
    };

    const handleStatusToggle = (id: number) => {
        const s = staff.find(item => item.id === id);
        if (!s) return;

        const isActivating = s.status !== 'active';

        setConfirmDialog({
            isOpen: true,
            title: isActivating ? 'Aktifkan User' : 'Nonaktifkan User',
            description: `Apakah Anda yakin ingin ${isActivating ? 'mengaktifkan' : 'menonaktifkan'} user ini?`,
            variant: isActivating ? 'default' : 'destructive',
            action: () => {
                router.put(`/staff/${id}/toggle-status`, {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }
                });
            }
        });
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Hapus User',
            description: 'Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.',
            variant: 'destructive',
            action: () => {
                router.delete(`/staff/${id}`, {
                    onSuccess: () => {
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }
                });
            }
        });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'manager': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'supervisor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'staff': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'active'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Staff List</h2>
                    <p className="text-muted-foreground mt-1">Kelola tim dan staff di bawah Anda</p>
                </div>


            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                                <p className="text-2xl font-bold">{staff.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Staff Aktif</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {staff.filter(s => s.status === 'active').length}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Supervisor</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {staff.filter(s => s.role === 'supervisor').length}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>


            </div>

            {/* Search and Filter */}
            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari berdasarkan nama, email, atau NIP..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>



                        <Button type="submit">Cari</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((s) => (
                    <Card key={s.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {s.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex gap-1">
                                    <Badge variant="outline" className={getRoleColor(s.role)}>
                                        {s.role}
                                    </Badge>
                                    <Badge variant="outline" className={getStatusColor(s.status)}>
                                        {s.status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold">{s.name}</h3>
                                <p className="text-sm text-muted-foreground">{s.jabatan.nama}</p>


                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <IdCard className="h-3 w-3" />
                                        <span>NIP: {s.nip}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <IdCard className="h-3 w-3" />
                                        <span>NIK: {s.nik}</span>
                                    </div>
                                    {s.nia && (
                                        <div className="flex items-center gap-1">
                                            <IdCard className="h-3 w-3" />
                                            <span>NRP: {s.nia}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <span>{s.email}</span>
                                    </div>
                                    {s.phone && (
                                        <div className="flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            <span>{s.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => handleDetail(s)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Detail
                                </Button>
                                {hasPermission('edit staff') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(s)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                )}
                                {hasPermission('edit staff') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "flex-1",
                                            s.status === 'active' ? "text-destructive hover:text-destructive" : "text-green-600 hover:text-green-600"
                                        )}
                                        onClick={() => handleStatusToggle(s.id)}
                                    >
                                        {s.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                    </Button>
                                )}

                                {hasPermission('delete staff') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(s.id)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>



            {/* Edit Staff Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Staff</DialogTitle>
                        <DialogDescription>Perbarui informasi staff</DialogDescription>
                    </DialogHeader>
                    {editingStaff && (
                        <form onSubmit={handleUpdate} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nama Lengkap *</Label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="edit-name"
                                        placeholder="Nama lengkap staff"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                {editForm.errors.name && <p className="text-sm text-destructive">{editForm.errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-email">Email *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            placeholder="email@kemhan.go.id"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {editForm.errors.email && <p className="text-sm text-destructive">{editForm.errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-phone">No. Telepon</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="edit-phone"
                                            placeholder="+6281234567890"
                                            value={editForm.data.phone}
                                            onChange={(e) => editForm.setData('phone', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-nip">NIP *</Label>
                                    <div className="relative">
                                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="edit-nip"
                                            placeholder="Nomor Induk Pegawai"
                                            value={editForm.data.nip}
                                            onChange={(e) => editForm.setData('nip', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {editForm.errors.nip && <p className="text-sm text-destructive">{editForm.errors.nip}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-nia">NRP</Label>
                                    <div className="relative">
                                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="edit-nia"
                                            placeholder="Nomor Induk Anggota/NRP"
                                            value={editForm.data.nia}
                                            onChange={(e) => editForm.setData('nia', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>



                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-jabatan_id">Jabatan *</Label>
                                    <Select value={editForm.data.jabatan_id} onValueChange={(value) => editForm.setData('jabatan_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jabatan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jabatan.map((j: any) => (
                                                <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editForm.errors.jabatan_id && <p className="text-sm text-destructive">{editForm.errors.jabatan_id}</p>}
                                </div>


                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={editForm.data.role} onValueChange={(value) => editForm.setData('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staff">Staff</SelectItem>
                                        <SelectItem value="supervisor">Supervisor</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    {editForm.processing ? 'Menyimpan...' : 'Perbarui Staff'}
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation Alert Dialog */}
            <AlertDialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog(prev => ({ ...prev, isOpen }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmDialog.description}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDialog.action();
                            }}
                            className={confirmDialog.variant === 'destructive' ? 'bg-destructive text-white hover:bg-destructive/90' : ''}
                        >
                            Ya, Lanjutkan
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
