import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, X, Users, Shield, Key, Eye, UserCheck, CreditCard, Phone, Building2, Clock, Mail, Briefcase, AlertCircle, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UserDetail {
    nia_nrp: string;
    nik: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat_domisili_lengkap: string;
    foto_profil: string;
    unit_kerja?: { id: number; nama: string; kode: string | null; };
    subunit?: { id: number; nama: string; kode: string | null; };
    jabatan?: { id: number; nama: string; };
    jabatan_role?: { id: number; nama: string };
    status_keanggotaan?: { id: number; nama: string; };
    pangkat?: { id: number; nama: string; kode: string | null; };
    scan_ktp: string;
    scan_selfie?: string;
    ekyc_score?: string;
    scan_kta: string;
    scan_sk: string;
    tanda_tangan: string;
    nomor_sk: string;
    nomor_kta: string;
    tanggal_pengangkatan: string;
    suku?: { id: number; nama: string };
    bangsa?: { id: number; nama: string };
    agama?: { id: number; nama: string };
    status_pernikahan?: { id: number; nama: string };
    nama_ibu_kandung?: string;
    golongan_darah?: { id: number; nama: string; rhesus?: string | null };
    tinggi_badan?: string;
    berat_badan?: string;
    warna_kulit?: string;
    warna_rambut?: string;
    bentuk_rambut?: string;
    ukuran_pakaian?: string;
    ukuran_sepatu?: string;
    ukuran_topi?: string;
    ukuran_kaos_olahraga?: string;
    ukuran_sepatu_olahraga?: string;

    // Regions
    desa?: { id: number; name: string };
    kecamatan?: { id: number; name: string };
    kabupaten?: { id: number; name: string };
    provinsi?: { id: number; name: string };

    // Education
    pendidikan?: { id: number; nama: string };
    nama_sekolah?: string;
    nama_prodi?: string;
    nilai_akhir?: string;
    status_lulus?: string;

    // Job
    is_bekerja?: boolean;
    pekerjaan?: { id: number; name: string }; // Assuming relationship
    nama_perusahaan?: string;
    nama_profesi?: string;

    // Calon Documents
    doc_surat_lamaran?: string;
    doc_ktp?: string;
    doc_kk?: string;
    doc_sk_lurah?: string;
    doc_skck?: string;
    doc_ijazah?: string;
    doc_sk_sehat?: string;
    doc_drh?: string;
    doc_latsarmil?: string;
    doc_izin_instansi?: string;
    doc_izin_ortu?: string;
    birthplace?: { id: string; name: string };
}

interface User {
    id: number;
    name: string;
    email: string;
    member_type: 'anggota' | 'calon_anggota';
    member?: UserDetail;
    calon?: UserDetail;
    detail?: UserDetail; // Legacy - for backward compatibility
    created_at: string;
    updated_at: string;
    verification_locked_at?: string;
    verification_locked_by?: number;
    locker?: {
        id: number;
        name: string;
    };
}

interface Props {
    users: User[];
    currentUserId: number;
    activeType?: string;
    staffQueueCount?: number;
    calonQueueCount?: number;
}

export default function VerificationQueue({ users, currentUserId, activeType = 'staff', staffQueueCount = 0, calonQueueCount = 0 }: Props) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isDisqualifyOpen, setIsDisqualifyOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth.user.roles.some((r: any) => r.name === 'super-admin');

    const { post, processing } = useForm({});
    const { data: rejectionData, setData: setRejectionData, post: postRejection, processing: rejectionProcessing, reset: resetRejection } = useForm({
        reason: '',
    });

    // Helper to get the correct detail based on member_type
    const getDetail = (user: User | null) => {
        if (!user) return null;
        return user.member_type === 'anggota' ? user.member : user.calon;
    };

    const handleReject = () => {
        if (!rejectionData.reason.trim()) {
            toast.error('Alasan penolakan harus diisi');
            return;
        }

        postRejection(route('verification-queue.reject', selectedUser?.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User berhasil ditolak');
                setIsRejectOpen(false);
                handleCloseReview();
                resetRejection();
            },
            onError: () => toast.error('Gagal menolak user'),
        });
    };

    const handleVerify = (user: User) => {
        post(route('verification-queue.verify', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User berhasil diverifikasi');
                handleCloseReview();
                setIsApproveOpen(false);
            },
            onError: () => toast.error('Gagal memverifikasi user'),
        });
    };

    const { data: disqualifyData, setData: setDisqualifyData, delete: deleteDisqualify, processing: disqualifyProcessing, reset: resetDisqualify } = useForm({
        reason: '',
    });

    const handleDisqualify = () => {
        if (!selectedUser) return;

        if (!disqualifyData.reason.trim()) {
            toast.error('Alasan harus diisi');
            return;
        }

        deleteDisqualify(route('verification-queue.disqualify', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('User berhasil dinyatakan tidak lulus dan data dihapus.');
                setIsDisqualifyOpen(false);
                handleCloseReview();
                resetDisqualify();
            },
            onError: () => toast.error('Gagal memproses data'),
        });
    };

    const startReview = (user: User) => {
        // Lock the user first
        post(route('verification-queue.lock', user.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSelectedUser(user);
                setIsReviewOpen(true);
            },
            onError: () => toast.error('Gagal mengunci user (mungkin sudah diambil admin lain)'),
        });
    };

    const handleCloseReview = () => {
        if (selectedUser) {
            // Unlock the user when closing
            post(route('verification-queue.unlock', selectedUser.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsReviewOpen(false);
                    setSelectedUser(null);
                }
            });
        } else {
            setIsReviewOpen(false);
        }
    };

    const tabs = [
        {
            id: 'staff-list',
            label: activeType === 'staff' ? 'Data Anggota' : 'Data Calon Anggota',
            shortLabel: activeType === 'staff' ? 'Data Anggota' : 'Data Calon',
            icon: Users,
            show: true,
            href: route(activeType === 'staff' ? 'staff-mapping' : 'calon-mapping'),
            isActive: false  // Not active on verification queue page
        },
        {
            id: 'verification-queue',
            label: activeType === 'staff' ? 'Antrian Anggota' : 'Antrian Calon Anggota',
            shortLabel: 'Antrian',
            icon: Shield,
            show: true,
            href: route('verification-queue.index', { type: activeType }),
            count: activeType === 'staff' ? staffQueueCount : calonQueueCount,
            isActive: true  // Always active on verification queue page
        },
    ].filter(tab => tab.show);

    const formatGender = (value?: string) => {
        if (value === '1') return 'Laki-laki';
        if (value === '2') return 'Perempuan';
        return value || '-';
    };

    const getFileUrl = (path?: string) => {
        if (!path) return null;
        return `/storage/${path}`;
    };

    const FilePreview = ({ path, alt }: { path: string, alt: string }) => {
        const url = getFileUrl(path);
        if (!url) return null;

        const extension = path.split('.').pop()?.toLowerCase();
        const isPdf = extension === 'pdf';
        const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '');

        if (isPdf) {
            return (
                <div className="w-full h-full relative group bg-neutral-900">
                    <iframe
                        src={`${url}#view=FitH`}
                        className="w-full h-full rounded-lg"
                        title={alt}
                    />
                    {/* Overlay for "Open in New Tab" only on hover */}
                    <div
                        className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors pointer-events-none flex items-center justify-center"
                    >
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto flex items-center gap-2 hover:bg-black/90"
                        >
                            <Eye className="w-4 h-4" />
                            Buka PDF
                        </a>
                    </div>
                </div>
            );
        }

        if (isImage) {
            return (
                <div className="w-full h-full relative group">
                    <img
                        src={url}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer rounded-lg"
                        onClick={() => window.open(url, '_blank')}
                        alt={alt}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg pointer-events-none flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100" />
                    </div>
                </div>
            );
        }

        // Fallback for other file types (DOCX, etc)
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#2a2a2a] rounded-lg p-4 border border-white/5 gap-3 group hover:bg-[#333] transition-colors">
                <div className="p-3 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                    <Briefcase className="w-8 h-8 text-neutral-400 group-hover:text-[#007ee7] transition-colors" />
                </div>
                <div className="text-center">
                    <p className="text-xs text-neutral-400 mb-1 font-medium">{extension?.toUpperCase()} File</p>
                    <p className="text-sm font-semibold text-white truncate max-w-[150px]">{alt}</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 bg-transparent border-white/20 text-white hover:bg-white/10 hover:text-white h-8 text-xs gap-2"
                    onClick={() => window.open(url, '_blank')}
                >
                    <Eye className="w-3 h-3" /> Preview
                </Button>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title={`Antrian Verifikasi - ${activeType === 'staff' ? 'Staff' : 'Calon'}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">
                        {activeType === 'staff' ? 'Data Anggota' : 'Data Calon Anggota'}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {activeType === 'staff'
                            ? 'Kelola tim dan verifikasi akun anggota karyawan baru.'
                            : 'Kelola dan verifikasi akun calon anggota baru.'}
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center">
                    <nav className="grid grid-cols-2 p-1 bg-[#262626] border border-white/5 rounded-full w-full">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            // isActive logic handles highlighting
                            const isActive = (tab as any).isActive || false;

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
                                    <span className="truncate lg:hidden">{(tab as any).shortLabel}</span>
                                    {((tab as any).count > 0) && (
                                        <span className={cn(
                                            "ml-1 lg:ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0",
                                            isActive ? "bg-white text-[#AC0021]" : "bg-[#AC0021] text-white"
                                        )}>
                                            {(tab as any).count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="grid grid-cols-3 gap-2 md:gap-4">
                    {/* Menunggu Verifikasi */}
                    <Card className="bg-[#262626] border-none shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-3 md:p-6 flex flex-col gap-2 md:gap-4">
                            <div className="p-2 md:p-3 rounded-2xl bg-[#007ee7]/10 w-fit group-hover:bg-[#007ee7]/20 transition-colors">
                                <AlertCircle className="h-4 w-4 md:h-6 md:w-6 text-[#007ee7]" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-sm font-medium text-[#007ee7] mb-0.5 md:mb-1 truncate">Menunggu</p>
                                <p className="text-xl md:text-4xl font-bold text-white">{users.length}</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <Clock className="h-3 w-3" />
                                <span>Menunggu review</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disetujui */}
                    <Card className="bg-[#262626] border-none shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-3 md:p-6 flex flex-col gap-2 md:gap-4">
                            <div className="p-2 md:p-3 rounded-2xl bg-[#659800]/10 w-fit group-hover:bg-[#659800]/20 transition-colors">
                                <CheckCircle className="h-4 w-4 md:h-6 md:w-6 text-[#659800]" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-sm font-medium text-[#659800] mb-0.5 md:mb-1 truncate">Disetujui</p>
                                <p className="text-xl md:text-4xl font-bold text-white">0</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <UserCheck className="h-3 w-3" />
                                <span>Akun aktif</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ditolak */}
                    <Card className="bg-[#262626] border-none shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-3 md:p-6 flex flex-col gap-2 md:gap-4">
                            <div className="p-2 md:p-3 rounded-2xl bg-[#d04438]/10 w-fit group-hover:bg-[#d04438]/20 transition-colors">
                                <X className="h-4 w-4 md:h-6 md:w-6 text-[#d04438]" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-sm font-medium text-[#d04438] mb-0.5 md:mb-1 truncate">Ditolak</p>
                                <p className="text-xl md:text-4xl font-bold text-white">0</p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <Shield className="h-3 w-3" />
                                <span>Verifikasi gagal</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="py-6 space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield className="h-5 w-5 text-[#007ee7]" />
                        <h2 className="text-lg font-bold text-[#FEFCF8]">Permintaan Verifikasi Akun ({users.length})</h2>
                    </div>

                    <div className="space-y-4">
                        {users.length === 0 ? (
                            <Card className="bg-[#262626] border-white/5">
                                <CardContent className="py-12 text-center text-gray-500">
                                    Tidak ada antrian saat ini.
                                </CardContent>
                            </Card>
                        ) : (
                            users.map((user) => {
                                const isLocked = !!user.verification_locked_by;
                                const isLockedByMe = user.verification_locked_by === currentUserId;
                                const lockedByName = user.locker?.name;

                                // Helper for time ago (simplified)
                                const timeAgo = new Date(user.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                });

                                return (
                                    <div key={user.id} className="bg-[#262626] border-none rounded-xl p-6 flex flex-col md:flex-row gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-300 hover:shadow-2xl">
                                        {/* Avatar */}
                                        <div className="shrink-0">
                                            <Avatar className="h-14 w-14 border-0">
                                                {getDetail(user)?.foto_profil && (
                                                    <AvatarImage src={getFileUrl(getDetail(user)!.foto_profil) || ''} alt={user.name} className="object-cover" />
                                                )}
                                                <AvatarFallback className="text-white font-bold text-lg bg-[#AC0021]">
                                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        {/* Main Content */}
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                                                <h3 className="text-white font-bold text-lg">{user.name}</h3>
                                                {isLocked ? (
                                                    <Badge className='bg-[#AC0021] hover:bg-[#8f2c00] text-white border-0 rounded-full px-3 font-normal'>
                                                        {isLockedByMe ? "Sedang Anda Review" : `Direview oleh ${lockedByName}`}
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-[#007ee7] text-white border-0 rounded-full px-3 font-normal">
                                                        Menunggu
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Column 1 Details */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
                                                    <CreditCard className="h-4 w-4 shrink-0" />
                                                    <span>{getDetail(user)?.nia_nrp || getDetail(user)?.nik || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
                                                    <Phone className="h-4 w-4 shrink-0" />
                                                    <span>{getDetail(user)?.alamat_domisili_lengkap || '+62 -'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
                                                    <Building2 className="h-4 w-4 shrink-0" />
                                                    <span>{getDetail(user)?.unit_kerja?.nama || 'Unit Kerja Belum Set'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-orange-500 text-sm mt-1">
                                                    <Clock className="h-4 w-4 shrink-0" />
                                                    <span>{timeAgo}</span>
                                                </div>
                                            </div>

                                            {/* Column 2 Details */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
                                                    <Mail className="h-4 w-4 shrink-0" />
                                                    <span>{user.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
                                                    <Briefcase className="h-4 w-4 shrink-0" />
                                                    <span>{getDetail(user)?.jabatan?.nama || 'Staff'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex items-center justify-end md:justify-center shrink-0">
                                            <Button
                                                onClick={() => startReview(user)}
                                                className="bg-[#AC0021] hover:bg-[#AC0021]/80 text-[#FEFCF8] border-0 h-10 px-6 font-medium"
                                                disabled={isLocked && !isLockedByMe}
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                {isLockedByMe ? "Lanjutkan Review" : "Lihat Detail"}
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* E-KYC Review Modal */}
            <Dialog open={isReviewOpen} onOpenChange={(open) => !open && handleCloseReview()}>
                <DialogContent className="w-full max-w-6xl bg-[#262626] border-white/10 text-white font-sans">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser?.member_type === 'calon_anggota' ? 'Detail Profil Calon Anggota' : 'Detail Profil Anggota'}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedUser && <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Header Section */}
                        <div className="flex items-start gap-4 md:gap-5 p-4 bg-[#262626] rounded-lg border border-white/5">
                            <Avatar className="h-16 w-16 md:h-20 md:w-20 border-0 shrink-0">
                                {getDetail(selectedUser)?.foto_profil && (
                                    <AvatarImage src={getFileUrl(getDetail(selectedUser)!.foto_profil) || ''} alt={selectedUser.name} className="object-cover" />
                                )}
                                <AvatarFallback className="text-xl md:text-2xl bg-[#AC0021] text-white font-bold">
                                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1 min-w-0 flex-1">
                                <h3 className="font-bold text-lg md:text-xl truncate">{selectedUser.name}</h3>
                                <div className="flex items-center gap-2 text-gray-400 text-sm truncate">
                                    <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{selectedUser.email}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {/* Locked Badge substitute for role/status badges in this context */}
                                    {!!selectedUser.verification_locked_by ? (
                                        <Badge className='bg-[#AC0021] hover:bg-[#8f2c00] text-white border-0 rounded-full px-3 font-normal whitespace-nowrap'>
                                            {selectedUser.verification_locked_by === currentUserId ? "Sedang Anda Review" : `Direview oleh ${selectedUser.locker?.name}`}
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-[#007ee7] text-white border-0 rounded-full px-3 font-normal whitespace-nowrap">
                                            Menunggu
                                        </Badge>
                                    )}
                                    {selectedUser.member_type === 'calon_anggota' && (
                                        <Badge variant="outline" className="bg-blue-900/40 text-blue-200 border-blue-800 whitespace-nowrap">
                                            Calon Anggota
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Column 1: Pegawai & Pribadi */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Data Pribadi</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-500">NIK</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.nik}</span>

                                        <span className="text-gray-500">TTL</span>
                                        <span className="font-medium">
                                            {getDetail(selectedUser)?.birthplace?.name
                                                ? `${getDetail(selectedUser)!.birthplace!.name}, `
                                                : (getDetail(selectedUser)?.tempat_lahir ? `${getDetail(selectedUser)!.tempat_lahir}, ` : '')}
                                            {getDetail(selectedUser)?.tanggal_lahir || '-'}
                                        </span>

                                        <span className="text-gray-500">JK</span>
                                        <span className="font-medium">{formatGender(getDetail(selectedUser)?.jenis_kelamin)}</span>

                                        <span className="text-gray-500">Agama</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.agama?.nama || '-'}</span>

                                        <span className="text-gray-500">Suku/Bangsa</span>
                                        <span className="font-medium">
                                            {getDetail(selectedUser)?.suku?.nama || '-'} / {getDetail(selectedUser)?.bangsa?.nama || '-'}
                                        </span>

                                        <span className="text-gray-500">Ibu Kandung</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.nama_ibu_kandung || '-'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Alamat Lengkap</h4>
                                    <div className="text-sm space-y-1">
                                        <p className="font-medium">{getDetail(selectedUser)?.alamat_domisili_lengkap}</p>
                                        <p className="text-gray-400">
                                            {getDetail(selectedUser)?.desa ? `Desa ${getDetail(selectedUser)?.desa?.name}, ` : ''}
                                            {getDetail(selectedUser)?.kecamatan ? `Kec. ${getDetail(selectedUser)?.kecamatan?.name}` : ''}
                                        </p>
                                        <p className="text-gray-400">
                                            {getDetail(selectedUser)?.kabupaten ? `${getDetail(selectedUser)?.kabupaten?.name}, ` : ''}
                                            {getDetail(selectedUser)?.provinsi?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Fisik & Ukuran & Kontak */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Fisik & Ukuran</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-500">TB / BB</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.tinggi_badan || '-'} cm / {getDetail(selectedUser)?.berat_badan || '-'} kg</span>

                                        <span className="text-gray-500">Warna Kulit</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.warna_kulit || '-'}</span>

                                        <span className="text-gray-500">Rambut</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.warna_rambut} / {getDetail(selectedUser)?.bentuk_rambut}</span>

                                        <span className="text-gray-500">Ukuran Pakaian</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.ukuran_pakaian || '-'}</span>

                                        <span className="text-gray-500">Ukuran Sepatu</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.ukuran_sepatu || '-'}</span>

                                        <span className="text-gray-500">Ukuran Topi</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.ukuran_topi || '-'}</span>

                                        <span className="text-gray-500">Ukuran Pakaian Olahraga</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.ukuran_kaos_olahraga || '-'}</span>

                                        <span className="text-gray-500">Ukuran Sepatu Olahraga</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.ukuran_sepatu_olahraga || '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Column 3: Pendidikan & Pekerjaan */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Pendidikan</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-500">Terakhir</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.pendidikan?.nama || '-'}</span>

                                        <span className="text-gray-500">Sekolah</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.nama_sekolah || '-'}</span>

                                        <span className="text-gray-500">Prodi</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.nama_prodi || '-'}</span>

                                        <span className="text-gray-500">Nilai/Lulus</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.nilai_akhir || '-'} / {getDetail(selectedUser)?.status_lulus || '-'}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Pekerjaan</h4>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                                        <span className="text-gray-500">Status</span>
                                        <span className="font-medium">{getDetail(selectedUser)?.is_bekerja ? 'Bekerja' : 'Tidak Bekerja'}</span>

                                        {getDetail(selectedUser)?.is_bekerja && (
                                            <>
                                                <span className="text-gray-500">Bidang</span>
                                                <span className="font-medium">{getDetail(selectedUser)?.pekerjaan?.name || '-'}</span>

                                                <span className="text-gray-500">Profesi</span>
                                                <span className="font-medium">{getDetail(selectedUser)?.nama_profesi || '-'}</span>

                                                <span className="text-gray-500">Perusahaan</span>
                                                <span className="font-medium">{getDetail(selectedUser)?.nama_perusahaan || '-'}</span>
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
                                    {(selectedUser as any).prestasi && (selectedUser as any).prestasi.length > 0 ? (
                                        (selectedUser as any).prestasi.map((p: any, i: number) => (
                                            <li key={i} className="uppercase">{p.nama_kegiatan} ({p.pencapaian}, {p.tahun})</li>
                                        ))
                                    ) : <li className="text-gray-500 list-none">- Tidak ada data</li>}
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Riwayat Organisasi</h4>
                                <ul className="text-sm space-y-1 list-disc list-inside text-gray-300">
                                    {(selectedUser as any).organisasis && (selectedUser as any).organisasis.length > 0 ? (
                                        (selectedUser as any).organisasis.map((o: any, i: number) => (
                                            <li key={i} className="uppercase">{o.nama_organisasi} ({o.posisi}, {o.tanggal_mulai ? o.tanggal_mulai.substring(0, 4) : '-'})</li>
                                        ))
                                    ) : <li className="text-gray-500 list-none">- Tidak ada data</li>}
                                </ul>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-3 pt-2 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10 pb-1">Dokumen Digital</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedUser?.member_type === 'calon_anggota' ? [
                                    { label: 'Scan Verifikasi KTP', file: getDetail(selectedUser)?.scan_ktp }, // Use scan_ktp or doc_ktp? Using scan_ktp as per existing code, or check doc_ktp
                                    { label: 'Scan Verifikasi Selfie', file: getDetail(selectedUser)?.scan_selfie },
                                    { label: 'Foto Profil', file: getDetail(selectedUser)?.foto_profil },
                                    { label: 'Surat Lamaran', file: getDetail(selectedUser)?.doc_surat_lamaran },
                                    { label: 'Kartu Tanda Penduduk', file: getDetail(selectedUser)?.doc_ktp },
                                    { label: 'Kartu Keluarga', file: getDetail(selectedUser)?.doc_kk },
                                    { label: 'Surat Keterangan Lurah', file: getDetail(selectedUser)?.doc_sk_lurah },
                                    { label: 'SKCK', file: getDetail(selectedUser)?.doc_skck },
                                    { label: 'Ijazah', file: getDetail(selectedUser)?.doc_ijazah },
                                    { label: 'Surat Keterangan Sehat', file: getDetail(selectedUser)?.doc_sk_sehat },
                                    { label: 'Daftar Riwayat Hidup', file: getDetail(selectedUser)?.doc_drh },
                                    { label: 'Latsarmil', file: getDetail(selectedUser)?.doc_latsarmil },
                                    { label: 'Izin Instansi/Perusahaan/Universitas', file: getDetail(selectedUser)?.doc_izin_instansi },
                                    { label: 'Izin Orang tua/Istri', file: getDetail(selectedUser)?.doc_izin_ortu },
                                    { label: 'Tanda Tangan', file: getDetail(selectedUser)?.tanda_tangan },
                                ].map((doc, i) => {
                                    // Helper for path
                                    const path = doc.file;
                                    if (!path) return null; // Skip empty docs or show placeholder?

                                    // Reuse StaffList display logic
                                    const isPdf = path.toLowerCase().endsWith('.pdf');
                                    const fileUrl = path.startsWith('http') ? path : `/storage/${path}`;

                                    return (
                                        <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition-all flex flex-col h-full group">
                                            <p className="text-xs text-gray-400 mb-2 font-medium truncate" title={doc.label}>{doc.label}</p>
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
                                        </div>
                                    );
                                }) : (
                                    // Anggota Documents (Existing)
                                    [
                                        { label: 'KTP', file: getDetail(selectedUser)?.scan_ktp },
                                        { label: 'KTA', file: getDetail(selectedUser)?.scan_kta },
                                        { label: 'SK', file: getDetail(selectedUser)?.scan_sk },
                                        { label: 'Foto Profil', file: getDetail(selectedUser)?.foto_profil },
                                    ].map((doc, i) => {
                                        const path = doc.file;
                                        if (!path) return (
                                            <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5 flex flex-col h-full">
                                                <p className="text-xs text-gray-400 mb-2 font-medium">{doc.label}</p>
                                                <div className="flex-1 aspect-video flex items-center justify-center bg-white/5 rounded-lg border border-dashed border-white/10">
                                                    <span className="text-[10px] text-gray-600 italic">Tidak ada</span>
                                                </div>
                                            </div>
                                        );

                                        const isPdf = path.toLowerCase().endsWith('.pdf');
                                        const fileUrl = path.startsWith('http') ? path : `/storage/${path}`;

                                        return (
                                            <div key={i} className="bg-white/5 rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition-all flex flex-col h-full group">
                                                <p className="text-xs text-gray-400 mb-2 font-medium">{doc.label}</p>
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
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                    }

                    <div className="p-4 bg-[#262626] flex flex-col md:flex-row justify-end gap-3 shrink-0 border-t border-white/10">
                        <Button
                            onClick={() => window.open(route('verification-queue.download', selectedUser?.id), '_blank')}
                            className="bg-[#007ee7] hover:bg-[#007ee7]/90 text-[#FEFCF8] font-semibold w-full md:w-auto px-6 md:mr-auto"
                            disabled={processing}
                        >
                            <Download className="w-4 h-4 mr-2" /> Download
                        </Button>
                        <div className="flex flex-row gap-3 w-full md:w-auto">
                            <Button
                                variant="destructive"
                                onClick={() => setIsRejectOpen(true)}
                                className="bg-[#d04438] hover:bg-[#b03025] text-white border border-red-900/30 flex-1 md:w-auto md:flex-none px-6"
                                disabled={processing}
                            >
                                <X className="w-4 h-4 mr-2" /> Tolak
                            </Button>
                            <Button
                                onClick={() => setIsApproveOpen(true)}
                                className="bg-[#659800] hover:bg-[#547f00] text-white font-semibold flex-1 md:w-auto md:flex-none px-6"
                                disabled={processing}
                            >
                                <UserCheck className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Verifikasi & Setujui</span>
                                <span className="sm:hidden">Verifikasi</span>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Rejection Dialog */}
            < Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen} >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Tolak Verifikasi User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="reason" className="text-sm font-medium">Alasan Penolakan</label>
                            <textarea
                                id="reason"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Jelaskan kenapa foto/data tidak sesuai..."
                                value={rejectionData.reason}
                                onChange={(e) => setRejectionData('reason', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Batal</Button>
                            <Button variant="destructive" onClick={handleReject} disabled={rejectionProcessing}>Kirim Penolakan</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Disqualify Dialog */}
            < Dialog open={isDisqualifyOpen} onOpenChange={setIsDisqualifyOpen} >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-500 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Konfirmasi Tidak Lulus
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
                            <p className="font-bold flex items-center gap-2 mb-2">
                                <AlertCircle className="h-4 w-4" />
                                PERHATIAN KERAS!
                            </p>
                            <p>
                                Aksi ini akan <strong>MENGHAPUS PERMANEN</strong> seluruh data user ini (Profil, Dokumen, dll) dari database.
                            </p>
                            <p className="mt-2">
                                Data yang dihapus tidak dapat dikembalikan lagi. User harus mendaftar ulang jika ingin melamar kembali.
                            </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Apakah Anda yakin ingin menyatakan user <span className="font-semibold text-foreground">{selectedUser?.name}</span> tidak lulus?
                        </p>
                        <div className="space-y-2">
                            <label htmlFor="disqualifyReason" className="text-sm font-medium text-red-500">
                                Alasan Tidak Lulus (Wajib)
                            </label>
                            <textarea
                                id="disqualifyReason"
                                className="flex min-h-[80px] w-full rounded-md border border-red-500/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Jelaskan alasan kenapa user ini tidak lulus (akan dikirim ke email user)..."
                                value={disqualifyData.reason}
                                onChange={(e) => setDisqualifyData('reason', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setIsDisqualifyOpen(false)}>Batal</Button>
                            <Button
                                variant="destructive"
                                onClick={handleDisqualify}
                                disabled={disqualifyProcessing}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Ya, Tidak Lulus & Hapus Data
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Approval Confirmation Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Verifikasi</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            Apakah Anda yakin ingin memverifikasi user <span className="font-semibold text-foreground">{selectedUser?.name}</span>?
                        </p>
                        <p className="text-sm text-muted-foreground">
                            User akan mendapatkan akses penuh ke sistem setelah diverifikasi.
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Batal</Button>
                            <Button
                                className="bg-[#659800] hover:bg-[#547f00] text-white"
                                onClick={() => selectedUser && handleVerify(selectedUser)}
                                disabled={processing}
                            >
                                Ya, Verifikasi
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
