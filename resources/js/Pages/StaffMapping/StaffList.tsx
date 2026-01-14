import { router, usePage, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
    Search,
    Edit,
    Trash2,
    Phone,
    IdCard,
    Mail,
    Eye,
    Shield
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface Staff {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    nip: string;
    nik: string;
    nia: string | null;
    position: string;
    jabatan: { id: number; nama: string };
    tanggal_masuk: string;
    role: string;
    status: string; // active (verified) or inactive
}

interface Props {
    staff: Staff[];
    jabatan: any[];
    filters?: {
        search?: string;
    };
}

export default function StaffList({ staff, jabatan = [], filters }: Props) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth.user.roles.some((r: any) => r.name === 'super-admin');
    const isAdmin = auth.user.roles.some((r: any) => r.name === 'admin');

    // Access capabilities based on user request:
    // Super Admin: Access all
    // Admin: Access all except Approval Tracking (sidebar logic), here they can manage staff.
    const canManageStaff = isSuperAdmin || isAdmin;

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);

    const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
    const [roleUpdatingStaff, setRoleUpdatingStaff] = useState<Staff | null>(null);

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

    const roleForm = useForm({
        role: '',
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

    const handleGiveRole = (s: Staff) => {
        setRoleUpdatingStaff(s);
        roleForm.setData({ role: s.role });
        setShowRoleDialog(true);
    }

    const handleUpdateRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleUpdatingStaff) return;

        roleForm.put(route('staff.update-role', roleUpdatingStaff.id), {
            onSuccess: () => {
                setShowRoleDialog(false);
                setRoleUpdatingStaff(null);
                roleForm.reset();
            }
        });
    }

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
            title: isActivating ? 'Verifikasi User' : 'Nonaktifkan Verifikasi',
            description: `Apakah Anda yakin ingin ${isActivating ? 'memverifikasi' : 'membatalkan verifikasi'} user ini?`,
            variant: isActivating ? 'default' : 'destructive',
            action: () => {
                router.put(route('staff.toggle-status', id), {}, {
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
                router.delete(route('staff.destroy', id), {
                    onSuccess: () => {
                        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }
                });
            }
        });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'super-admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {staff.filter(s => s.role === 'admin').length}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                <div className="h-4 w-4 bg-purple-600 rounded-full"></div>
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
                                        {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex gap-1">
                                    <Badge variant="outline" className={getRoleColor(s.role)}>
                                        {s.role}
                                    </Badge>
                                    <Badge variant="outline" className={getStatusColor(s.status)}>
                                        {s.status === 'active' ? 'Verified' : 'Unverified'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-semibold">{s.name}</h3>
                                {s.position && <p className="text-sm font-medium text-blue-500 dark:text-blue-400 mb-0.5">{s.position}</p>}
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.jabatan.nama}</p>

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

                            <div className="flex flex-col gap-2 mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleDetail(s)}
                                >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Detail
                                </Button>

                                <div className="flex gap-2">
                                    {/* Give Role: Super Admin only */}
                                    {isSuperAdmin && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => handleGiveRole(s)}
                                        >
                                            <Shield className="h-4 w-4 mr-2" />
                                            Role
                                        </Button>
                                    )}

                                    {/* Verify/Unverify:
                                      - Super Admin can Always access (Verify & Unverify)
                                      - Admin can only access if status is active (Unverify only)
                                    */}
                                    {(isSuperAdmin || (isAdmin && s.status === 'active')) && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className={cn(
                                                "flex-1",
                                                s.status === 'active' ? "text-destructive hover:text-destructive border-destructive/50" : "text-green-600 hover:text-green-600 border-green-600/50"
                                            )}
                                            onClick={() => handleStatusToggle(s.id)}
                                        >
                                            {s.status === 'active' ? 'Unverify' : 'Verify'}
                                        </Button>
                                    )}

                                    {/* Delete: Super Admin only */}
                                    {isSuperAdmin && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(s.id)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50 aspect-square w-9 p-0 shrink-0"
                                            title="Hapus Permanent"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Give Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Role User</DialogTitle>
                        <DialogDescription>
                            Pilih role baru untuk user <b>{roleUpdatingStaff?.name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    {roleUpdatingStaff && (
                        <form onSubmit={handleUpdateRole} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="update-role">Role</Label>
                                <Select value={roleForm.data.role} onValueChange={(value) => roleForm.setData('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User (Staff Biasa)</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        {isSuperAdmin && <SelectItem value="super-admin">Super Admin</SelectItem>}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowRoleDialog(false)}>Batal</Button>
                                <Button type="submit" disabled={roleForm.processing}>Update Role</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Staff</DialogTitle>
                    </DialogHeader>
                    {viewingStaff && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl">
                                        {viewingStaff.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-lg">{viewingStaff.name}</h3>
                                    <p className="text-muted-foreground">{viewingStaff.email}</p>
                                    <Badge className={getRoleColor(viewingStaff.role) + " mt-2"}>{viewingStaff.role}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm border-t pt-4">
                                <div className="grid grid-cols-3">
                                    <span className="text-muted-foreground">Jabatan</span>
                                    <span className="col-span-2 font-medium">{viewingStaff.position || '-'}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-muted-foreground">Unit Kerja</span>
                                    <span className="col-span-2 font-medium">{viewingStaff.jabatan.nama}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-muted-foreground">NIP</span>
                                    <span className="col-span-2 font-medium">{viewingStaff.nip}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-muted-foreground">NIK</span>
                                    <span className="col-span-2 font-medium">{viewingStaff.nik}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-muted-foreground">Bergabung</span>
                                    <span className="col-span-2 font-medium">{viewingStaff.tanggal_masuk}</span>
                                </div>
                                <div className="grid grid-cols-3">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="col-span-2 font-medium">
                                        {viewingStaff.status === 'active' ? 'Terverifikasi' : 'Belum Terverifikasi'}
                                    </span>
                                </div>
                            </div>
                        </div>
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
