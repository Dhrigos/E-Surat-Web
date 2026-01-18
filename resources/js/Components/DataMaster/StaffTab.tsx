import { router, usePage, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Edit, Trash2, Phone, IdCard, Mail, Eye, Shield, CheckCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

// Interfaces (reused or imported)
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
    status: string;
    pangkat: string;
    detail?: {
        tempat_lahir: string;
        tanggal_lahir: string;
        jenis_kelamin: string;
        alamat: string;
        nomor_kta: string;
        kta_expired_at: string;
        is_kta_lifetime: boolean;
        foto_profil: string | null;
        scan_ktp: string | null;
        scan_kta: string | null;
        scan_sk: string | null;
        tanda_tangan: string | null;
    };
}

interface Props {
    staff: Staff[];
    jabatan: any[];
    filters?: {
        search?: string;
    };
}

export default function StaffTab({ staff, jabatan = [], filters }: Props) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth.user.roles.some((r: any) => r.name === 'super-admin');
    const isAdmin = auth.user.roles.some((r: any) => r.name === 'admin');

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [showRoleDialog, setShowRoleDialog] = useState(false);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
    const [roleUpdatingStaff, setRoleUpdatingStaff] = useState<Staff | null>(null);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        action: () => { },
        variant: 'default' as 'default' | 'destructive'
    });

    const roleForm = useForm({ role: '' });

    const filteredStaff = useMemo(() => {
        // Client-side filtering as fallback or enhancement, though server does search
        if (!searchTerm) return staff;
        return staff.filter(s => {
            return s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.nip.includes(searchTerm);
        });
    }, [staff, searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/data-master', { tab: 'users', search: searchTerm }, { preserveState: true });
    };

    const handleGiveRole = (s: Staff) => {
        setRoleUpdatingStaff(s);
        roleForm.setData({ role: s.role });
        setShowRoleDialog(true);
    };

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
            title: isActivating ? 'Verifikasi User' : 'Nonaktifkan Verifikasi',
            description: `Apakah Anda yakin ingin ${isActivating ? 'memverifikasi' : 'membatalkan verifikasi'} user ini?`,
            variant: isActivating ? 'default' : 'destructive',
            action: () => {
                router.put(route('staff.toggle-status', id), {}, {
                    preserveScroll: true,
                    onSuccess: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
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
                    onSuccess: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
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
            {/* Search and Filter */}
            <form onSubmit={handleSearch} className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="Cari berdasarkan nama, email, atau NIP..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white dark:bg-[#262626] border-zinc-200 dark:border-transparent text-foreground placeholder:text-neutral-500 focus:ring-0 focus:bg-white dark:focus:bg-[#333] transition-colors h-11 rounded-xl shadow-sm"
                    />
                </div>
                <div className="w-[200px]">
                    <Select>
                        <SelectTrigger className="bg-white dark:bg-[#262626] border-zinc-200 dark:border-transparent text-foreground h-11 rounded-xl focus:ring-0 shadow-sm">
                            <SelectValue placeholder="Semua Unit" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-[#262626] border-zinc-200 dark:border-neutral-800 text-foreground">
                            <SelectItem value="all">Semua Unit</SelectItem>
                            {jabatan.map((j) => (
                                <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </form>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((s) => (
                    <Card key={s.id} className="bg-white dark:bg-[#262626] border-zinc-200 dark:border-none overflow-hidden group hover:shadow-2xl transition-all duration-300 rounded-xl shadow-sm dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                        <CardContent className="p-6 relative">
                            {/* Top Section: Avatar and Badges */}
                            <div className="flex justify-between items-start mb-4">
                                <Avatar className="h-14 w-14 border-0">
                                    {s.detail?.foto_profil && (
                                        <AvatarImage src={s.detail.foto_profil} alt={s.name} className="object-cover" />
                                    )}
                                    <AvatarFallback className="text-white font-bold text-lg bg-[#AC0021]">
                                        {s.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex gap-2">
                                    <Badge variant="secondary" className="bg-[#e6fffa] text-[#006050] hover:bg-[#d0fcf4] rounded-full font-normal px-3 py-0.5 text-xs">
                                        staff
                                    </Badge>
                                    <Badge variant="secondary" className={cn("rounded-full font-normal px-3 py-0.5 text-xs",
                                        s.status === 'active'
                                            ? "bg-[#e6fffa] text-[#006050] hover:bg-[#d0fcf4]"
                                            : "bg-red-100 text-red-800 hover:bg-red-200"
                                    )}>
                                        {s.status === 'active' ? 'active' : 'inactive'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="mb-6 space-y-1">
                                <h3 className="dark:text-white font-bold text-lg leading-tight">{s.name}</h3>
                                <p className="text-zinc-500 dark:text-[#888888] text-sm font-medium">{s.position || 'Staff Administrasi'}</p>
                                <p className="text-zinc-400 dark:text-[#666666] text-sm">{s.jabatan.nama}</p>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-[#666666] text-xs">
                                    <Mail className="h-4 w-4" />
                                    <span>{s.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-[#666666] text-xs">
                                    <Phone className="h-4 w-4" />
                                    <span>{s.phone || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-[#666666] text-xs">
                                    <IdCard className="h-4 w-4" />
                                    <span>{s.nip || '-'}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {(isSuperAdmin || (isAdmin && s.status === 'active')) && (
                                    <Button
                                        className={cn("flex-1 h-10 text-sm font-semibold rounded-lg border-0 transition-colors",
                                            s.status === 'active'
                                                ? "bg-[#ae3500] hover:bg-[#ae3500]/90 text-[#Fefcf8] border-0"
                                                : "bg-zinc-800 dark:bg-[#262626] text-white border border-white hover:bg-zinc-700 dark:hover:bg-white/10"
                                        )}
                                        onClick={() => handleStatusToggle(s.id)}
                                    >
                                        {s.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                    </Button>
                                )}
                                <Button
                                    size="icon"
                                    className="h-10 w-10 bg-[#007ee7] hover:bg-[#006bbd] text-white rounded-lg border-0 shadow-[0_0_15px_rgba(0,126,231,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,126,231,0.6)]"
                                    onClick={() => handleDetail(s)}
                                >
                                    <Eye className="h-5 w-5 text-white" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Give Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#262626] dark:text-white border-zinc-200 dark:border-white/10">
                    <DialogHeader>
                        <DialogTitle>Ubah Role User</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-gray-400">
                            Pilih role baru untuk user <b>{roleUpdatingStaff?.name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    {roleUpdatingStaff && (
                        <form onSubmit={handleUpdateRole} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="update-role" className="dark:text-white">Role</Label>
                                <Select value={roleForm.data.role} onValueChange={(value) => roleForm.setData('role', value)}>
                                    <SelectTrigger className="bg-zinc-50 dark:bg-[#1f1f1f] border-zinc-200 dark:border-white/10 dark:text-white">
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-[#1f1f1f] border-zinc-200 dark:border-white/10 dark:text-white">
                                        <SelectItem value="user">User (Staff Biasa)</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        {isSuperAdmin && <SelectItem value="super-admin">Super Admin</SelectItem>}
                                    </SelectContent>

                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowRoleDialog(false)} className="border-zinc-200 dark:border-white/10 dark:text-white dark:hover:bg-white/10 bg-transparent">Batal</Button>
                                <Button type="submit" disabled={roleForm.processing} className="bg-[#659800] text-white hover:bg-[#659800]/90 border-0 shadow-lg shadow-green-500/20">Update Role</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
                <DialogContent className="w-full max-w-6xl bg-white dark:bg-[#262626] border-zinc-200 dark:border-white/10 dark:text-white font-sans max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detail Profil Anggota</DialogTitle>
                    </DialogHeader>
                    {viewingStaff && (
                        <div className="space-y-6">
                            {/* Header Section */}
                            <div className="flex items-start gap-5 p-4 bg-zinc-50 dark:bg-[#262626] rounded-lg border border-zinc-200 dark:border-white/5">
                                <Avatar className="h-20 w-20 border-0">
                                    {/* Use photo if available */
                                        viewingStaff.detail?.foto_profil && (
                                            <AvatarImage src={viewingStaff.detail.foto_profil} alt={viewingStaff.name} className="object-cover" />
                                        )
                                    }
                                    <AvatarFallback className="text-2xl bg-[#AC0021] text-white font-bold">
                                        {viewingStaff.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-xl">{viewingStaff.name}</h3>
                                    <div className="flex items-center gap-2 text-zinc-500 dark:text-gray-400 text-sm">
                                        <Mail className="w-4 h-4" /> {viewingStaff.email}
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <Badge variant="outline" className={getRoleColor(viewingStaff.role)}>{viewingStaff.role}</Badge>
                                        <Badge variant="outline" className={getStatusColor(viewingStaff.status)}>
                                            {viewingStaff.status === 'active' ? 'Terverifikasi' : 'Belum Terverifikasi'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Kepegawaian */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-wider border-b border-zinc-200 dark:border-white/10 pb-1">Data Kepegawaian</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-zinc-500 dark:text-gray-500">Jabatan</span>
                                        <span className="font-medium">{viewingStaff.position || '-'}</span>

                                        <span className="text-zinc-500 dark:text-gray-500">Pangkat</span>
                                        <span className="font-medium">{viewingStaff.pangkat || '-'}</span>

                                        <span className="text-zinc-500 dark:text-gray-500">Unit Kerja</span>
                                        <span className="font-medium">{viewingStaff.jabatan.nama}</span>

                                        <span className="text-zinc-500 dark:text-gray-500">NIP/NIA</span>
                                        <span className="font-medium">
                                            {viewingStaff.nip && viewingStaff.nip !== '-' ? viewingStaff.nip : viewingStaff.nia}
                                        </span>

                                        <span className="text-zinc-500 dark:text-gray-500">Nomor KTA</span>
                                        <span className="font-medium">{viewingStaff.detail?.nomor_kta || '-'}</span>

                                        <span className="text-zinc-500 dark:text-gray-500">Masa KTA</span>
                                        <span className="font-medium">
                                            {viewingStaff.detail?.is_kta_lifetime ? 'Seumur Hidup' : (viewingStaff.detail?.kta_expired_at || '-')}
                                        </span>

                                        <span className="text-zinc-500 dark:text-gray-500">Bergabung</span>
                                        <span className="font-medium">{viewingStaff.tanggal_masuk}</span>
                                    </div>
                                </div>

                                {/* Pribadi */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-wider border-b border-zinc-200 dark:border-white/10 pb-1">Data Pribadi</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-zinc-500 dark:text-gray-500">NIK</span>
                                        <span className="font-medium">{viewingStaff.nik}</span>

                                        <span className="text-zinc-500 dark:text-gray-500">TTL</span>
                                        <span className="font-medium">
                                            {viewingStaff.detail?.tempat_lahir}, {viewingStaff.detail?.tanggal_lahir}
                                        </span>

                                        <span className="text-zinc-500 dark:text-gray-500">Alamat</span>
                                        <span className="font-medium line-clamp-3" title={viewingStaff.detail?.alamat}>
                                            {viewingStaff.detail?.alamat || '-'}
                                        </span>

                                        <span className="text-zinc-500 dark:text-gray-500">Tanda Tangan</span>
                                        <div className="mt-1">
                                            {viewingStaff.detail?.tanda_tangan ? (
                                                <img src={viewingStaff.detail.tanda_tangan} alt="TTD" className="h-10 border border-zinc-200 dark:border-white/20 bg-white rounded p-1" />
                                            ) : '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="space-y-3 pt-2">
                                <h4 className="text-sm font-semibold text-zinc-500 dark:text-gray-400 uppercase tracking-wider border-b border-zinc-200 dark:border-white/10 pb-1">Dokumen Digital</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'KTP', file: viewingStaff.detail?.scan_ktp },
                                        { label: 'KTA', file: viewingStaff.detail?.scan_kta },
                                        { label: 'SK', file: viewingStaff.detail?.scan_sk },
                                        { label: 'Foto Profil', file: viewingStaff.detail?.foto_profil },
                                    ].map((doc, i) => (
                                        <div key={i} className="bg-zinc-50 dark:bg-white/5 rounded p-3 text-center border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 transition-colors">
                                            <p className="text-xs text-zinc-500 dark:text-gray-400 mb-2">{doc.label}</p>
                                            {doc.file ? (
                                                <a href={doc.file} target="_blank" rel="noreferrer" className="block">
                                                    <div className="aspect-video bg-black/50 rounded flex items-center justify-center mb-2 overflow-hidden">
                                                        {doc.file.endsWith('.pdf') ? (
                                                            <div className="text-xs text-white">PDF</div>
                                                        ) : (
                                                            <img src={doc.file} className="w-full h-full object-cover opacity-70 hover:opacity-100" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-blue-400 hover:underline">Lihat</span>
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-600 italic">Tidak ada</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="border-t border-zinc-200 dark:border-white/10 pt-4 mt-6 flex gap-2">
                        {viewingStaff && isSuperAdmin && (
                            <>
                                <Button
                                    onClick={() => { setShowDetailDialog(false); handleGiveRole(viewingStaff); }}
                                    className="bg-[#007ee7] text-white hover:bg-[#007ee7]/90 border-0 shadow-lg shadow-blue-500/20"
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Update Role
                                </Button>
                                <Button
                                    onClick={() => { setShowDetailDialog(false); handleDelete(viewingStaff.id); }}
                                    className="bg-[#d04438] text-white hover:bg-[#d04438]/90 border-0 shadow-lg shadow-red-500/20"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus User
                                </Button>
                            </>
                        )}
                        <div className="flex-1"></div>
                        <Button
                            className="bg-[#659800] text-white hover:bg-[#659800]/90 border-0 shadow-lg shadow-green-500/20"
                            onClick={() => setShowDetailDialog(false)}
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
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
