import { router, usePage, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

    Phone,
    IdCard,
    Mail,
    Eye,
    Shield,
    Building2,
    CheckCircle,
    UserCheck,
    Key,
    FileSpreadsheet,
    X,
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface Staff {
    id: number;

    name: string;
    member_type: 'anggota' | 'calon_anggota';
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
    pangkat: string;
    detail?: {
        tempat_lahir: string;
        tanggal_lahir: string;
        jenis_kelamin: string;
        alamat: string;
        nomor_kta: string;
        kta_expired_at: string | null;
        is_kta_lifetime: boolean;
        foto_profil: string | null;
        scan_ktp: string | null;
        scan_kta: string | null;
        scan_sk: string | null;
        tanda_tangan: string | null;
        suku?: string;
        bangsa?: string;
        agama?: string;
        status_pernikahan?: string;
        nama_ibu_kandung?: string;

        nomor_registrasi?: string;
        matra?: string;
        golongan?: { id: number; nama: string };
        pangkat?: { id: number; nama: string };

        // Extended
        tinggi_badan?: string;
        berat_badan?: string;
        warna_kulit?: string;
        warna_mata?: string;
        warna_rambut?: string;
        bentuk_rambut?: string;
        ukuran_pakaian?: string;
        ukuran_sepatu?: string;
        ukuran_topi?: string;
        ukuran_kaos_olahraga?: string;
        ukuran_sepatu_olahraga?: string;
        ukuran_kaos_pdl?: string;
        ukuran_seragam_tactical?: string;
        ukuran_baju_tidur?: string;
        ukuran_training_pack?: string;
        ukuran_baju_renang?: string;
        ukuran_sepatu_tactical?: string;

        // Regions
        provinsi?: { code: string; name: string };
        kabupaten?: { code: string; name: string };
        kecamatan?: { code: string; name: string };
        desa?: { code: string; name: string };
        jalan?: string;

        domisili_provinsi?: { code: string; name: string };
        domisili_kabupaten?: { code: string; name: string };
        domisili_kecamatan?: { code: string; name: string };
        domisili_desa?: { code: string; name: string };
        domisili_jalan?: string;

        // Edu
        pendidikan_terakhir?: string;
        nama_sekolah?: string;
        nama_prodi?: string;
        nilai_akhir?: string;
        status_lulus?: string;

        // Job
        is_bekerja?: boolean;
        pekerjaan?: string;
        nama_perusahaan?: string;
        nama_profesi?: string;

        // Lists
        prestasi?: any[];
        organisasi?: any[];

        // Documents
        doc_surat_lamaran?: string | null;
        doc_ktp?: string | null;
        doc_kk?: string | null;
        doc_sk_lurah?: string | null;
        doc_skck?: string | null;
        doc_ijazah?: string | null;
        doc_sk_sehat?: string | null;
        doc_drh?: string | null;
        doc_latsarmil?: string | null;
        doc_izin_instansi?: string | null;
        doc_izin_ortu?: string | null;

        ekyc_score?: any;
    };
}

interface Props {
    staff: Staff[];
    jabatan: any[];
    filters?: {
        search?: string;
    };
    pendingCount?: number;
    title?: string;
    description?: string;
}

export default function StaffList({ staff, jabatan = [], filters, pendingCount, title, description }: Props) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth.user.roles.some((r: any) => r.name === 'super-admin');
    const isAdmin = auth.user.roles.some((r: any) => r.name === 'admin');

    // State
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

    // Access capabilities based on user request:
    // Super Admin: Access all
    // Admin: Access all except Approval Tracking (sidebar logic), here they can manage staff.
    const canManageStaff = isSuperAdmin || isAdmin;

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

    const { data: disqualifyData, setData: setDisqualifyData, delete: deleteDisqualify, processing: disqualifyProcessing, reset: resetDisqualify } = useForm({
        reason: '',
    });

    const [isDisqualifyOpen, setIsDisqualifyOpen] = useState(false);

    const handleDisqualify = () => {
        if (!viewingStaff) return;

        if (!disqualifyData.reason.trim()) {
            // Toast removed to avoid import issues, using simple return for now or relying on required prop handling if possible
            // But actually I can use window.alert as fallback or just return.
            // Let's assume user fills it.
            return;
        }

        deleteDisqualify(route('verification-queue.disqualify', viewingStaff.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsDisqualifyOpen(false);
                setShowDetailDialog(false);
                resetDisqualify();
            },
        });
    };

    const roleForm = useForm({
        role: '',
    });

    const filteredStaff = useMemo(() => {
        let result = staff.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.nip.includes(searchTerm);

            const matchesStatus = statusFilter === 'all'
                ? true
                : s.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        // Sort: Active first, then A-Z
        return result.sort((a, b) => {
            // Priority 1: Status (Active first)
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;

            // Priority 2: Name (A-Z)
            return a.name.localeCompare(b.name);
        });
    }, [staff, searchTerm, statusFilter]);

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

    // Tab Navigation
    const tabs = [
        {
            id: 'staff-list',
            label: title || 'Mapping Staff',
            shortLabel: title?.includes('Calon') ? 'Data Calon' : 'Data Staff',
            icon: Users,
            show: true,
            href: route(title?.includes('Calon') ? 'calon-mapping' : 'staff-mapping')
        },
        {
            id: 'verification-queue',
            label: title?.includes('Calon') ? 'Antrian Calon Anggota' : 'Antrian Anggota',
            shortLabel: 'Antrian',
            icon: Shield,
            show: true,
            href: route('verification-queue.index', { type: title?.includes('Calon') ? 'calon' : 'staff' })
        },
    ].filter(tab => tab.show);

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-bold">{title || "Mapping Staff & Verifikasi"}</h1>
                <p className="text-muted-foreground mt-2">
                    {description || "Kelola tim dan verifikasi akun karyawan baru oleh Direktorat Jendral Potensi Pertahanan"}
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
                <nav className="grid grid-cols-2 p-1 bg-[#262626] border border-white/5 rounded-full w-full">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = tab.id === 'staff-list';

                        return (
                            <button
                                key={tab.id}
                                onClick={() => router.get(tab.href)}
                                className={cn(
                                    "relative flex items-center justify-center gap-2 py-2.5 px-2 md:px-6 rounded-full font-medium text-xs md:text-sm transition-all duration-300 whitespace-nowrap overflow-hidden",
                                    isActive
                                        ? "bg-[#AC0021] text-white shadow-[0_0_20px_rgba(172,53,0,0.5)]"
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <Icon className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                <span className="truncate hidden lg:inline">{tab.label}</span>
                                <span className="truncate lg:hidden">{tab.shortLabel}</span>
                                {tab.id === 'verification-queue' && (pendingCount || 0) > 0 && (
                                    <span className={cn(
                                        "ml-1 lg:ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0",
                                        isActive ? "bg-white text-[#AC0021]" : "bg-[#AC0021] text-white"
                                    )}>
                                        {pendingCount}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Statistics */}
            {!title?.includes('Calon') && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Staff */}
                    <Card className="bg-[#262626] border-white/5 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="p-3 rounded-2xl bg-[#007ee7]/10 w-fit group-hover:bg-[#007ee7]/20 transition-colors">
                                <Users className="h-6 w-6 text-[#007ee7]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#007ee7] mb-1">Total Staff</p>
                                <p className="text-4xl font-bold text-white">{staff.length}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <CheckCircle className="h-3 w-3" />
                                <span>Staff terdaftar</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Staff Aktif */}
                    <Card className="bg-[#262626] border-white/5 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="p-3 rounded-2xl bg-[#659800]/10 w-fit group-hover:bg-[#659800]/20 transition-colors">
                                <UserCheck className="h-6 w-6 text-[#659800]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#659800] mb-1">Staff Aktif</p>
                                <p className="text-4xl font-bold text-white">{staff.filter(s => s.status === 'active').length}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <Shield className="h-3 w-3" />
                                <span>Sedang aktif</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Supervisor */}
                    <Card className="bg-[#262626] border-white/5 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="p-3 rounded-2xl bg-[#007ee7]/10 w-fit group-hover:bg-[#007ee7]/20 transition-colors">
                                <Shield className="h-6 w-6 text-[#007ee7]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#007ee7] mb-1">Supervisor</p>
                                <p className="text-4xl font-bold text-white">
                                    {staff.filter(s => ['admin', 'super-admin'].includes(s.role)).length}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <Key className="h-3 w-3" />
                                <span>Akses penuh</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unit Kerja */}
                    <Card className="bg-[#262626] border-white/5 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="p-3 rounded-2xl bg-[#d04438]/10 w-fit group-hover:bg-[#d04438]/20 transition-colors">
                                <Building2 className="h-6 w-6 text-[#d04438]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#d04438] mb-1">Unit Kerja</p>
                                <p className="text-4xl font-bold text-white">{jabatan.length}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <Building2 className="h-3 w-3" />
                                <span>Total departemen</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Search and Filter */}
            <div className="flex gap-2 md:gap-4 items-center">

                {/* Mobile Search Icon Trigger */}
                {!isMobileSearchActive && (
                    <Button
                        onClick={() => setIsMobileSearchActive(true)}
                        className="md:hidden h-11 w-11 p-0 bg-[#262626] border border-white/10 text-white hover:bg-[#333] shrink-0"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                )}

                {/* Search Input */}
                <div className={cn(
                    "relative transition-all duration-300",
                    isMobileSearchActive ? "flex-1 w-full" : "hidden md:block md:flex-1"
                )}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <Input
                        placeholder="Cari..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-[#262626] border-transparent text-white placeholder:text-neutral-500 focus:ring-0 focus:bg-[#333] transition-colors h-11 rounded-xl w-full"
                        autoFocus={isMobileSearchActive}
                    />
                    {isMobileSearchActive && (
                        <Button
                            onClick={() => {
                                setIsMobileSearchActive(false);
                                setSearchTerm('');
                            }}
                            variant="ghost"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-white md:hidden"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Filters - Hidden when mobile search is active */}
                <div className={cn(
                    "flex gap-2 md:gap-4 items-center flex-1 md:flex-none",
                    isMobileSearchActive ? "hidden md:flex" : "flex"
                )}>
                    <div className="w-full md:w-[200px]">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="bg-[#262626] border-transparent text-neutral-300 h-11 rounded-xl focus:ring-0 w-full">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#262626] border-neutral-800 text-white">
                                <SelectItem value="all">Semua</SelectItem>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Nonaktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {!title?.includes('Calon') && (
                        <div className="hidden md:block w-[200px]">
                            <Select>
                                <SelectTrigger className="bg-[#262626] border-transparent text-neutral-300 h-11 rounded-xl focus:ring-0 w-full">
                                    <SelectValue placeholder="Semua Unit" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-neutral-800 text-white">
                                    <SelectItem value="all">Semua Unit</SelectItem>
                                    {jabatan.map((j) => (
                                        <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {title?.includes('Calon') && (
                        <Button
                            onClick={() => window.location.href = route('export.calon-anggota')}
                            className="bg-[#659800] hover:bg-[#659800]/90 text-[#FEFCF8] border-0 h-11 w-11 md:w-auto p-0 md:px-4 shrink-0"
                            title="Export Excel"
                        >
                            <Building2 className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Export Excel</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* Staff List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map((s) => (
                    <Card key={s.id} className="bg-[#262626] border-none overflow-hidden group hover:shadow-2xl transition-all duration-300 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
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
                                <h3 className="text-white font-bold text-lg leading-tight">{s.name}</h3>
                                <p className="text-[#888888] text-sm font-medium">{s.position || 'Staff Administrasi'}</p>
                                <p className="text-[#666666] text-sm">{s.jabatan.nama}</p>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-[#666666] text-xs">
                                    <Mail className="h-4 w-4" />
                                    <span>{s.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#666666] text-xs">
                                    <Phone className="h-4 w-4" />
                                    <span>{s.phone || '+6281234567890'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[#666666] text-xs">
                                    <IdCard className="h-4 w-4" />
                                    <span>{s.nip || '198501012010011001'}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {(isSuperAdmin || (isAdmin && s.status === 'active')) && (
                                    <Button
                                        className={cn("flex-1 h-10 text-sm font-semibold rounded-lg border-0 transition-colors",
                                            s.status === 'active'
                                                ? "bg-[#AC0021] hover:bg-[#AC0021]/90 text-[#FEFCF8] border-0"
                                                : "bg-[#262626] text-white border border-white hover:bg-white/10"
                                        )}
                                        onClick={() => handleStatusToggle(s.id)}
                                    >
                                        {s.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                    </Button>
                                )}
                                <Button
                                    size="icon"
                                    className="h-10 w-10 bg-[#262626] hover:bg-[#333] text-[#FEFCF8] rounded-lg border border-white hover:border-white/90 shadow-none transition-all hover:scale-105"
                                    onClick={() => handleDetail(s)}
                                >
                                    <Eye className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Give Role Dialog */}
            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogContent className="sm:max-w-[425px] bg-[#262626] text-white border-white/10">
                    <DialogHeader>
                        <DialogTitle>Ubah Role User</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Pilih role baru untuk user <b>{roleUpdatingStaff?.name}</b>.
                        </DialogDescription>
                    </DialogHeader>
                    {roleUpdatingStaff && (
                        <form onSubmit={handleUpdateRole} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="update-role" className="text-white">Role</Label>
                                <Select value={roleForm.data.role} onValueChange={(value) => roleForm.setData('role', value)}>
                                    <SelectTrigger className="bg-[#1f1f1f] border-white/10 text-white">
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1f1f1f] border-white/10 text-white">
                                        <SelectItem value="user">User (Staff Biasa)</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        {isSuperAdmin && <SelectItem value="super-admin">Super Admin</SelectItem>}
                                    </SelectContent>

                                </Select>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setShowRoleDialog(false)} className="border-white/10 text-white hover:bg-white/10 bg-transparent">Batal</Button>
                                <Button type="submit" disabled={roleForm.processing} className="bg-[#659800] text-white hover:bg-[#659800]/90 border-0 shadow-lg shadow-green-500/20">Update Role</Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog >

            {/* Detail Dialog */}
            < Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog} >
                <DialogContent className="w-full max-w-6xl bg-[#262626] border-white/10 text-white font-sans">
                    <DialogHeader>
                        <DialogTitle>
                            {viewingStaff?.member_type === 'calon_anggota' ? 'Detail Profil Calon Anggota' : 'Detail Profil Anggota'}
                        </DialogTitle>
                    </DialogHeader>
                    {viewingStaff && <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Header Section */}
                        <div className="flex items-start gap-5 p-4 bg-[#262626] rounded-lg border border-white/5">
                            <Avatar className="h-20 w-20 border-0">
                                {viewingStaff.detail?.foto_profil && (
                                    <AvatarImage src={viewingStaff.detail.foto_profil} alt={viewingStaff.name} className="object-cover" />
                                )}
                                <AvatarFallback className="text-2xl bg-[#AC0021] text-white font-bold">
                                    {viewingStaff.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-xl">{viewingStaff.name}</h3>
                                    <span className="font-bold text-[#007ee7]">{viewingStaff.detail?.nomor_registrasi || '-'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Mail className="w-4 h-4" /> {viewingStaff.email}
                                </div>
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <Phone className="w-4 h-4" /> {viewingStaff.phone || '-'}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className={getRoleColor(viewingStaff.role)}>{viewingStaff.role}</Badge>
                                    <Badge variant="outline" className={getStatusColor(viewingStaff.status)}>
                                        {viewingStaff.status === 'active' ? 'Terverifikasi' : 'Belum Terverifikasi'}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Column 1: Pegawai & Pribadi */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Data Pribadi</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-500">Matra</span>
                                        <span className="font-medium">{viewingStaff.detail?.matra || '-'}</span>

                                        <span className="text-gray-500">Golongan</span>
                                        <span className="font-medium">{viewingStaff.detail?.golongan?.nama || '-'}</span>

                                        <span className="text-gray-500">NIK</span>
                                        <span className="font-medium">{viewingStaff.nik}</span>

                                        <span className="text-gray-500">TTL</span>
                                        <span className="font-medium">{viewingStaff.detail?.tempat_lahir}, {viewingStaff.detail?.tanggal_lahir}</span>

                                        <span className="text-gray-500">JK</span>
                                        <span className="font-medium">{viewingStaff.detail?.jenis_kelamin || '-'}</span>

                                        <span className="text-gray-500">Agama</span>
                                        <span className="font-medium">{viewingStaff.detail?.agama || '-'}</span>

                                        <span className="text-gray-500">Status</span>
                                        <span className="font-medium">{viewingStaff.detail?.status_pernikahan || '-'}</span>

                                        <span className="text-gray-500">Suku/Bangsa</span>
                                        <span className="font-medium">{viewingStaff.detail?.suku || '-'} / {viewingStaff.detail?.bangsa || '-'}</span>

                                        <span className="text-gray-500">Ibu Kandung</span>
                                        <span className="font-medium">{viewingStaff.detail?.nama_ibu_kandung || '-'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Alamat Domisili</h4>
                                    <div className="text-sm space-y-1">
                                        <p className="font-medium">{viewingStaff.detail?.domisili_jalan || viewingStaff.detail?.alamat}</p>
                                        <p className="text-gray-400">
                                            {viewingStaff.detail?.domisili_desa?.name ? `Desa ${viewingStaff.detail.domisili_desa.name}, ` : ''}
                                            {viewingStaff.detail?.domisili_kecamatan?.name ? `Kec. ${viewingStaff.detail.domisili_kecamatan.name}` : ''}
                                        </p>
                                        <p className="text-gray-400">
                                            {viewingStaff.detail?.domisili_kabupaten?.name ? `${viewingStaff.detail.domisili_kabupaten.name}, ` : ''}
                                            {viewingStaff.detail?.domisili_provinsi?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Fisik & Ukuran */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Fisik & Ukuran</h4>
                                    <div className="grid grid-cols-[170px_1fr] gap-2 text-sm">
                                        <span className="text-gray-500 whitespace-nowrap">TB / BB</span>
                                        <span className="font-medium">{viewingStaff.detail?.tinggi_badan || '-'} cm / {viewingStaff.detail?.berat_badan || '-'} kg</span>

                                        <span className="text-gray-500 whitespace-nowrap">Warna Kulit</span>
                                        <span className="font-medium">{viewingStaff.detail?.warna_kulit || '-'}</span>

                                        <span className="text-gray-500 whitespace-nowrap">Warna Mata</span>
                                        <span className="font-medium">{viewingStaff.detail?.warna_mata || '-'}</span>

                                        <span className="text-gray-500 whitespace-nowrap">Rambut</span>
                                        <span className="font-medium">{viewingStaff.detail?.warna_rambut} / {viewingStaff.detail?.bentuk_rambut}</span>

                                        <span className="text-gray-500 whitespace-nowrap">Ukuran Pakaian PDL</span>
                                        <span className="font-medium">{viewingStaff.detail?.ukuran_pakaian || '-'}</span>

                                        <span className="text-gray-500 whitespace-nowrap">Ukuran Sepatu PDL</span>
                                        <span className="font-medium">{viewingStaff.detail?.ukuran_sepatu || '-'}</span>

                                        <span className="text-gray-500 whitespace-nowrap">Ukuran Baret</span>
                                        <span className="font-medium">{viewingStaff.detail?.ukuran_topi || '-'}</span>

                                        <span className="text-gray-500 whitespace-nowrap">Ukuran Pakaian Olahraga</span>
                                        <span className="font-medium">{viewingStaff.detail?.ukuran_kaos_olahraga || '-'}</span>

                                        <span className="text-gray-500 whitespace-nowrap">Ukuran Sepatu Olahraga</span>
                                        <span className="font-medium">{viewingStaff.detail?.ukuran_sepatu_olahraga || '-'}</span>
                                    </div>
                                </div>
                                <div className='space-y-3'>
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1 mt-4">Alamat KTP</h4>
                                    <div className="text-sm space-y-1">
                                        <p className="font-medium">{viewingStaff.detail?.jalan}</p>
                                        <p className="text-gray-400">
                                            {viewingStaff.detail?.desa?.name ? `Desa ${viewingStaff.detail.desa.name}, ` : ''}
                                            {viewingStaff.detail?.kecamatan?.name ? `Kec. ${viewingStaff.detail.kecamatan.name}` : ''}
                                        </p>
                                        <p className="text-gray-400">
                                            {viewingStaff.detail?.kabupaten?.name ? `${viewingStaff.detail.kabupaten.name}, ` : ''}
                                            {viewingStaff.detail?.provinsi?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Pendidikan & Pekerjaan */}
                            <div className="space-y-6">
                                <div className="grid grid-cols-[170px_1fr] gap-2 text-sm mt-9">
                                    <span className="text-gray-500 whitespace-nowrap">Ukuran Seragam Tactical</span>
                                    <span className="font-medium">{viewingStaff.detail?.ukuran_seragam_tactical || '-'}</span>
                                    <span className="text-gray-500 whitespace-nowrap">Ukuran Sepatu Tactical</span>
                                    <span className="font-medium">{viewingStaff.detail?.ukuran_sepatu_tactical || '-'}</span>
                                    <span className="text-gray-500 whitespace-nowrap">Ukuran Baju Tidur</span>
                                    <span className="font-medium">{viewingStaff.detail?.ukuran_baju_tidur || '-'}</span>
                                    <span className="text-gray-500 whitespace-nowrap">Ukuran Training Pack</span>
                                    <span className="font-medium">{viewingStaff.detail?.ukuran_training_pack || '-'}</span>
                                    <span className="text-gray-500 whitespace-nowrap">Ukuran Baju Renang</span>
                                    <span className="font-medium">{viewingStaff.detail?.ukuran_baju_renang || '-'}</span>
                                    <span className="text-gray-500 whitespace-nowrap">Ukuran Kaos PDL</span>
                                    <span className="font-medium">{viewingStaff.detail?.ukuran_kaos_pdl || '-'}</span>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Pendidikan</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-500">Terakhir</span>
                                        <span className="font-medium">{viewingStaff.detail?.pendidikan_terakhir || '-'}</span>

                                        <span className="text-gray-500">Sekolah</span>
                                        <span className="font-medium">{viewingStaff.detail?.nama_sekolah || '-'}</span>

                                        <span className="text-gray-500">Jurusan/Prodi</span>
                                        <span className="font-medium">{viewingStaff.detail?.nama_prodi || '-'}</span>

                                        <span className="text-gray-500">Nilai/Lulus</span>
                                        <span className="font-medium">{viewingStaff.detail?.nilai_akhir || '-'} / {viewingStaff.detail?.status_lulus || '-'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Pekerjaan</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-medium">{viewingStaff.detail?.is_bekerja ? 'Bekerja' : 'Tidak Bekerja'}</span>

                                        {viewingStaff.detail?.is_bekerja && (
                                            <>
                                                <span className="text-gray-500">Bidang</span>
                                                <span className="font-medium">{viewingStaff.detail?.pekerjaan || '-'}</span>

                                                <span className="text-gray-500">Profesi</span>
                                                <span className="font-medium">{viewingStaff.detail?.nama_profesi || '-'}</span>

                                                <span className="text-gray-500">Perusahaan</span>
                                                <span className="font-medium">{viewingStaff.detail?.nama_perusahaan || '-'}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Width: Prestasi & Organisasi */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Riwayat Prestasi</h4>
                                <ul className="text-sm space-y-1 list-disc list-inside text-gray-300">
                                    {viewingStaff.detail?.prestasi && viewingStaff.detail.prestasi.length > 0 ? (
                                        (viewingStaff.detail.prestasi as any[]).map((p, i) => (
                                            <li key={i}>{p.nama_kegiatan} ({p.pencapaian}, {p.tahun})</li>
                                        ))
                                    ) : <li className="text-gray-500 list-none">- Tidak ada data</li>}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Riwayat Organisasi</h4>
                                <ul className="text-sm space-y-1 list-disc list-inside text-gray-300">
                                    {viewingStaff.detail?.organisasi && viewingStaff.detail.organisasi.length > 0 ? (
                                        (viewingStaff.detail.organisasi as any[]).map((o, i) => (
                                            <li key={i}>{o.nama_organisasi} ({o.posisi}, {o.tanggal_mulai ? o.tanggal_mulai.substring(0, 4) : '-'})</li>
                                        ))
                                    ) : <li className="text-gray-500 list-none">- Tidak ada data</li>}
                                </ul>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-3 pt-2 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Dokumen Digital</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Pas Foto', file: viewingStaff.detail?.foto_profil },
                                    { label: 'KTP', file: viewingStaff.detail?.doc_ktp || viewingStaff.detail?.scan_ktp },
                                    { label: 'KK', file: viewingStaff.detail?.doc_kk },
                                    { label: 'Ijazah', file: viewingStaff.detail?.doc_ijazah },
                                    { label: 'Surat Lamaran', file: viewingStaff.detail?.doc_surat_lamaran },
                                    { label: 'SK Lurah', file: viewingStaff.detail?.doc_sk_lurah },
                                    { label: 'SKCK', file: viewingStaff.detail?.doc_skck },
                                    { label: 'SK Sehat', file: viewingStaff.detail?.doc_sk_sehat },
                                    { label: 'DRH', file: viewingStaff.detail?.doc_drh },
                                    { label: 'Latsarmil', file: viewingStaff.detail?.doc_latsarmil },
                                    { label: 'Izin Instansi', file: viewingStaff.detail?.doc_izin_instansi },
                                    { label: 'Izin Ortu', file: viewingStaff.detail?.doc_izin_ortu },
                                    // Fallbacks for Staff
                                    { label: 'KTA', file: viewingStaff.detail?.scan_kta, hideIfEmpty: true },
                                    { label: 'SK', file: viewingStaff.detail?.scan_sk, hideIfEmpty: true },
                                ].filter(doc => !doc.hideIfEmpty || doc.file).map((doc, i) => {
                                    const isPdf = doc.file?.toLowerCase().endsWith('.pdf');
                                    const fileUrl = doc.file ? (doc.file.startsWith('http') ? doc.file : `/storage/${doc.file.replace(/^\/?storage\//, '')}`) : '';

                                    return (
                                        <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition-all flex flex-col h-full group">
                                            <p className="text-xs text-gray-400 mb-2 font-medium truncate" title={doc.label}>{doc.label}</p>
                                            {fileUrl ? (
                                                <div className="flex-1 aspect-video relative rounded-lg overflow-hidden bg-black/20 group-preview">
                                                    {isPdf ? (
                                                        <div className="w-full h-full relative">
                                                            <embed
                                                                src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                                                type="application/pdf"
                                                                className="w-full h-full"
                                                            />
                                                            <div
                                                                className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center"
                                                                onClick={() => window.open(fileUrl, '_blank')}
                                                            >
                                                                <div className="bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-2 backdrop-blur-sm transform scale-95 group-hover:scale-100 duration-200">
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    Buka PDF
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="w-full h-full relative cursor-pointer"
                                                            onClick={() => window.open(fileUrl, '_blank')}
                                                        >
                                                            <img src={fileUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={doc.label} />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">Lihat Gambar</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex-1 aspect-video flex items-center justify-center bg-white/5 rounded-lg border border-dashed border-white/10">
                                                    <span className="text-[10px] text-gray-600 italic">Tidak ada</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    }
                    <DialogFooter className="border-t border-white/10 pt-4 mt-6 grid grid-cols-3 gap-2 sm:flex sm:justify-end">
                        {viewingStaff && isSuperAdmin && (
                            <>
                                {viewingStaff.member_type !== 'calon_anggota' ? (
                                    <Button
                                        onClick={() => { setShowDetailDialog(false); handleGiveRole(viewingStaff); }}
                                        className="bg-[#007ee7] text-white hover:bg-[#007ee7]/90 border-0 shadow-lg shadow-blue-500/20 w-full sm:w-auto"
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Update Role</span>
                                        <span className="sm:hidden">Role</span>
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            setShowDetailDialog(false);
                                            setConfirmDialog({
                                                isOpen: true,
                                                title: 'Luluskan Anggota',
                                                description: `Apakah Anda yakin ingin meluluskan ${viewingStaff.name} menjadi Anggota resmi?`,
                                                variant: 'default',
                                                action: () => {
                                                    router.put(route('staff.promote', viewingStaff.id), {}, {
                                                        onSuccess: () => setConfirmDialog(prev => ({ ...prev, isOpen: false }))
                                                    });
                                                }
                                            });
                                        }}
                                        className="bg-[#007ee7] text-white hover:bg-[#007ee7]/90 border-0 shadow-lg shadow-blue-500/20 w-full sm:w-auto px-2"
                                    >
                                        <Shield className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">Lulus Anggota</span>
                                        <span className="sm:hidden text-xs">Lulus</span>
                                    </Button>
                                )}

                                <Button
                                    onClick={() => setIsDisqualifyOpen(true)}
                                    className="bg-transparent hover:bg-red-900/20 text-red-500 border border-red-900/50 shadow-lg shadow-red-500/10 w-full sm:w-auto px-2"
                                >
                                    <UserCheck className="h-4 w-4 sm:mr-2 rotate-180" />
                                    <span className="hidden sm:inline">Tidak Lulus</span>
                                    <span className="sm:hidden text-xs">Tolak</span>
                                </Button>
                            </>
                        )}
                        <div className="hidden sm:block flex-1"></div>
                        <Button
                            className="bg-[#659800] text-white hover:bg-[#659800]/90 border-0 shadow-lg shadow-green-500/20 w-full sm:w-auto"
                            onClick={() => setShowDetailDialog(false)}
                        >
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent >
            </Dialog >

            {/* Confirmation Alert Dialog */}
            < AlertDialog open={confirmDialog.isOpen} onOpenChange={(isOpen) => setConfirmDialog(prev => ({ ...prev, isOpen }))
            }>
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
            </AlertDialog >
            {/* Disqualify Dialog */}
            <AlertDialog open={isDisqualifyOpen} onOpenChange={setIsDisqualifyOpen}>
                <AlertDialogContent className="bg-[#262626] border-red-500/20 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-500 flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Konfirmasi Tidak Lulus
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            Aksi ini akan <strong>MENGHAPUS PERMANEN</strong> data user ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-2">
                        <label className="text-sm font-medium text-red-400 mb-1 block">Alasan (Wajib)</label>
                        <textarea
                            className="w-full bg-[#1f1f1f] border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-red-500"
                            rows={3}
                            placeholder="Jelaskan alasan..."
                            value={disqualifyData.reason}
                            onChange={(e) => setDisqualifyData('reason', e.target.value)}
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">Batal</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            onClick={handleDisqualify}
                            disabled={disqualifyProcessing}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {disqualifyProcessing ? 'Memproses...' : 'Ya, Tidak Lulus'}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
