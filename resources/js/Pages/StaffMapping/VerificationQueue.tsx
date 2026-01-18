import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, X, Users, Shield, Key, Eye, UserCheck, CreditCard, Phone, Building2, Clock, Mail, Briefcase, AlertCircle } from 'lucide-react';
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
}

interface User {
    id: number;
    name: string;
    email: string;
    detail?: UserDetail;
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
}

export default function VerificationQueue({ users, currentUserId }: Props) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth.user.roles.some((r: any) => r.name === 'super-admin');

    const { post, processing } = useForm({});
    const { data: rejectionData, setData: setRejectionData, post: postRejection, processing: rejectionProcessing, reset: resetRejection } = useForm({
        reason: '',
    });

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
        { id: 'staff-list', label: 'Staff List', icon: Users, show: true, href: route('staff-mapping') },
        { id: 'verification-queue', label: 'Antrian', icon: Shield, show: true, href: route('verification-queue.index') },
    ].filter(tab => tab.show);

    const getFileUrl = (path?: string) => {
        if (!path) return null;
        return `/storage/${path}`;
    };

    const FilePreview = ({ path, alt }: { path: string, alt: string }) => {
        const url = getFileUrl(path);
        if (!url) return null;

        const isPdf = path.toLowerCase().endsWith('.pdf');

        if (isPdf) {
            return (
                <div className="w-full h-full relative group">
                    <iframe src={url} className="w-full h-full bg-white" title={alt}></iframe>
                    <div
                        className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors cursor-pointer flex items-center justify-center"
                        onClick={() => window.open(url, '_blank')}
                    >
                        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            Klik untuk Buka PDF
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <img
                src={url}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                onClick={() => window.open(url, '_blank')}
                alt={alt}
            />
        );
    };

    return (
        <AppLayout>
            <Head title="Antrian Verifikasi E-KYC" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Mapping Staff & Verifikasi</h1>
                    <p className="text-muted-foreground mt-2">
                        Kelola tim dan verifikasi akun karyawan baru oleh Direktorat Jendral Potensi Pertahanan
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center">
                    <nav className="grid grid-cols-2 p-1 bg-[#262626] shadow-lg rounded-full w-full">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = tab.id === 'verification-queue';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => router.get(tab.href)}
                                    className={cn(
                                        "relative flex items-center justify-center gap-2 py-2.5 px-6 rounded-full font-medium text-sm transition-all duration-300",
                                        isActive
                                            ? "bg-[#AC0021] text-white shadow-[0_0_20px_rgba(172,53,0,0.5)]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                    {tab.id === 'verification-queue' && users.length > 0 && (
                                        <span className={cn(
                                            "ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                                            isActive ? "bg-white text-[#AC0021]" : "bg-[#AC0021] text-white"
                                        )}>
                                            {users.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Menunggu Verifikasi */}
                    <Card className="bg-[#262626] border-none shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="p-3 rounded-2xl bg-[#007ee7]/10 w-fit group-hover:bg-[#007ee7]/20 transition-colors">
                                <AlertCircle className="h-6 w-6 text-[#007ee7]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#007ee7] mb-1">Menunggu Verifikasi</p>
                                <p className="text-4xl font-bold text-white">{users.length}</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <Clock className="h-3 w-3" />
                                <span>Menunggu review</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Disetujui */}
                    <Card className="bg-[#262626] border-none shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="p-3 rounded-2xl bg-[#659800]/10 w-fit group-hover:bg-[#659800]/20 transition-colors">
                                <CheckCircle className="h-6 w-6 text-[#659800]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#659800] mb-1">Disetujui</p>
                                <p className="text-4xl font-bold text-white">0</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <UserCheck className="h-3 w-3" />
                                <span>Akun aktif</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ditolak */}
                    <Card className="bg-[#262626] border-none shadow-[0_4px_24px_-2px_rgba(0,0,0,0.4)] transition-all hover:bg-[#2a2a2a] group">
                        <CardContent className="p-6 flex flex-col gap-4">
                            <div className="p-3 rounded-2xl bg-[#d04438]/10 w-fit group-hover:bg-[#d04438]/20 transition-colors">
                                <X className="h-6 w-6 text-[#d04438]" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#d04438] mb-1">Ditolak</p>
                                <p className="text-4xl font-bold text-white">0</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
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
                                                {user.detail?.foto_profil && (
                                                    <AvatarImage src={getFileUrl(user.detail.foto_profil) || ''} alt={user.name} className="object-cover" />
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
                                                    <span>{user.detail?.nia_nrp || user.detail?.nik || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
                                                    <Phone className="h-4 w-4 shrink-0" />
                                                    <span>{user.detail?.alamat_domisili_lengkap || '+62 -'}</span> {/* Fallback if phone not available in detail */}
                                                </div>
                                                <div className="flex items-center gap-2 text-[#B0B0B0] text-sm">
                                                    <Building2 className="h-4 w-4 shrink-0" />
                                                    <span>{user.detail?.unit_kerja?.nama || 'Unit Kerja Belum Set'}</span>
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
                                                    <span>{user.detail?.jabatan?.nama || 'Staff'}</span>
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
                <DialogContent className="max-w-7xl h-[90vh] bg-[#262626] border-none shadow-2xl p-0 overflow-hidden flex flex-col text-white">
                    <div className="px-6 py-4 flex items-center justify-between shrink-0">
                        <DialogTitle className="text-lg font-semibold text-white">Verifikasi Data</DialogTitle>
                        {/* Close button handled by Dialog primitive usually, or typical X icon */}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-[#1a1a1a]">
                        <div className="grid grid-cols-[1.5fr_1fr] gap-6 h-full">
                            {/* Left: Photos */}
                            <div className="space-y-6">
                                {/* Perbandingan Wajah */}
                                <div className="bg-[#1f1f1f] p-5 rounded-xl shadow-lg">
                                    <h3 className="font-semibold mb-6 text-white text-base">Perbandingan Wajah</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <p className="text-sm text-neutral-400 text-center">E-KTP</p>
                                            <div className="aspect-video bg-[#262626] rounded-lg overflow-hidden shadow-inner relative group">
                                                {selectedUser?.detail?.scan_ktp ? (
                                                    <img
                                                        src={getFileUrl(selectedUser.detail.scan_ktp)!}
                                                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                                        onClick={() => window.open(getFileUrl(selectedUser.detail?.scan_ktp)!, '_blank')}
                                                        alt="KTP"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">No Image</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-sm text-neutral-400 text-center">Selfie</p>
                                            <div className="aspect-video bg-[#262626] rounded-lg overflow-hidden shadow-inner relative group">
                                                {selectedUser?.detail?.scan_selfie ? (
                                                    <img
                                                        src={getFileUrl(selectedUser.detail.scan_selfie)!}
                                                        className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                                                        onClick={() => window.open(getFileUrl(selectedUser.detail?.scan_selfie)!, '_blank')}
                                                        alt="Selfie"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">No Image</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dokumen Pendukung */}
                                <div className="bg-[#1f1f1f] p-5 rounded-xl shadow-lg">
                                    <h3 className="font-semibold mb-6 text-white text-base">Dokumen Pendukung</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <p className="text-sm text-neutral-400 text-center">KTA</p>
                                            <div className="aspect-video bg-[#262626] rounded-lg overflow-hidden shadow-inner relative group">
                                                {selectedUser?.detail?.scan_kta ? (
                                                    <FilePreview path={selectedUser.detail.scan_kta} alt="KTA" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">No Document</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-sm text-neutral-400 text-center">SK</p>
                                            <div className="aspect-video bg-[#262626] rounded-lg overflow-hidden shadow-inner relative group">
                                                {selectedUser?.detail?.scan_sk ? (
                                                    <FilePreview path={selectedUser.detail.scan_sk} alt="SK" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-neutral-500 text-sm">No Document</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Info */}
                            <div className="bg-[#1f1f1f] p-6 rounded-xl shadow-lg h-fit">
                                <h3 className="font-semibold mb-6 text-white text-lg">Informasi User</h3>
                                <div className="space-y-0">
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5">
                                        <span className="text-neutral-400">Nama Lengkap</span>
                                        <span className="text-white font-medium">{selectedUser?.name}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5">
                                        <span className="text-neutral-400">NIK</span>
                                        <span className="text-white font-medium">{selectedUser?.detail?.nik}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5">
                                        <span className="text-neutral-400">NRP</span>
                                        <span className="text-white font-medium">{selectedUser?.detail?.nia_nrp}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5">
                                        <span className="text-neutral-400">TTL</span>
                                        <span className="text-white font-medium">{selectedUser?.detail?.tempat_lahir && selectedUser?.detail?.tanggal_lahir ? `${selectedUser.detail.tempat_lahir}, ${selectedUser.detail.tanggal_lahir}` : '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5">
                                        <span className="text-neutral-400">Jenis Kelamin</span>
                                        <span className="text-white font-medium">{selectedUser?.detail?.jenis_kelamin || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5">
                                        <span className="text-neutral-400">Alamat Lengkap</span>
                                        <span className="text-white font-medium">{selectedUser?.detail?.alamat_domisili_lengkap}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5">
                                        <span className="text-neutral-400">Jabatan</span>
                                        <span className="text-white font-medium">{`${selectedUser?.detail?.jabatan_role?.nama || ''} - ${selectedUser?.detail?.jabatan?.nama || ''}`}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5">
                                        <span className="text-neutral-400">Tanggal Pengangkatan</span>
                                        <span className="text-white font-medium">{selectedUser?.detail?.tanggal_pengangkatan || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-white/5 last:border-0">
                                        <span className="text-neutral-400">Nomor KTA</span>
                                        <span className="text-white font-medium">{selectedUser?.detail?.nomor_kta || selectedUser?.detail?.nomor_sk || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-[#262626] flex justify-end gap-3 shrink-0">
                        <Button
                            variant="destructive"
                            onClick={() => setIsRejectOpen(true)}
                            className="bg-[#d04438] hover:bg-[#b03025] text-white border border-red-900/30 px-6"
                            disabled={processing}
                        >
                            <X className="w-4 h-4 mr-2" /> Tolak
                        </Button>
                        <Button
                            onClick={() => setIsApproveOpen(true)}
                            className="bg-[#659800] hover:bg-[#547f00] text-white font-semibold px-6"
                            disabled={processing}
                        >
                            <UserCheck className="w-4 h-4 mr-2" /> Verifikasi & Setujui
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
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
        </AppLayout >
    );
}
