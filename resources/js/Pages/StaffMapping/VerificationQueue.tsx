import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Users, Shield, Key, Eye, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

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
    const { hasPermission } = usePermission();
    const { post, processing } = useForm({});
    const { data: rejectionData, setData: setRejectionData, post: postRejection, processing: rejectionProcessing, reset: resetRejection } = useForm({
        reason: '',
    });

    const handleReject = () => {
        if (!rejectionData.reason.trim()) {
            toast.error('Alasan penolakan harus diisi');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menolak user ${selectedUser?.name}?`)) {
            postRejection(route('verification-queue.reject', selectedUser?.id), {
                onSuccess: () => {
                    toast.success('User berhasil ditolak');
                    setIsRejectOpen(false);
                    handleCloseReview();
                    resetRejection();
                },
                onError: () => toast.error('Gagal menolak user'),
            });
        }
    };

    const handleVerify = (user: User) => {
        post(route('verification-queue.verify', user.id), {
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
        { id: 'verification-queue', label: 'Verification Queue', icon: Shield, show: hasPermission('manager') || hasPermission('view staff'), href: route('verification-queue.index') },
        { id: 'roles', label: 'Role Management', icon: Shield, show: hasPermission('manage roles'), href: route('staff-mapping') },
        { id: 'permissions', label: 'Permission Management', icon: Key, show: hasPermission('manage permissions'), href: route('staff-mapping') },
    ].filter(tab => tab.show);

    const getFileUrl = (path?: string) => {
        if (!path) return null;
        return `/storage/${path}`;
    };

    return (
        <AppLayout>
            <Head title="Antrian Verifikasi E-KYC" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Verifikasi E-KYC</h1>
                    <p className="text-muted-foreground mt-2">
                        Validasi identitas user berdasarkan data E-KYC (KTP & Selfie)
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-border">
                    <nav className="-mb-px flex gap-5">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = tab.id === 'verification-queue';

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => router.get(tab.href)}
                                    className={`${isActive
                                        ? 'border-primary text-primary border-b-2'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="py-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar User Menunggu Verifikasi</CardTitle>
                            <CardDescription>
                                Review hasil E-KYC (Selfie vs KTP) dan validasi data user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>NRP / NIK</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                                Tidak ada antrian saat ini.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((user) => {
                                            const isLocked = !!user.verification_locked_by;
                                            const isLockedByMe = user.verification_locked_by === currentUserId;
                                            const lockedByName = user.locker?.name;

                                            return (
                                                <TableRow key={user.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex flex-col">
                                                            <span>{user.name}</span>
                                                            <span className="text-xs text-gray-500">{user.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col text-sm">
                                                            <span>NRP: {user.detail?.nia_nrp || '-'}</span>
                                                            <span className="text-gray-500">NIK: {user.detail?.nik || '-'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isLocked ? (
                                                            <Badge variant={isLockedByMe ? "default" : "destructive"}>
                                                                {isLockedByMe ? "Sedang Anda Review" : `Direview oleh ${lockedByName}`}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                Menunggu
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => startReview(user)}
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                                                            disabled={isLocked && !isLockedByMe}
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            {isLockedByMe ? "Lanjutkan Review" : "Review E-KYC"}
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* E-KYC Review Modal */}
            <Dialog open={isReviewOpen} onOpenChange={(open) => !open && handleCloseReview()}>
                <DialogContent className="!max-w-5xl !w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border sm:rounded-xl">
                    <DialogHeader className="p-6 border-b shrink-0 bg-background">
                        <DialogTitle>Verifikasi Data E-KYC</DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-6 bg-muted/30">
                        <div className="grid grid-cols-2 gap-8 h-full">
                            {/* Left: Photos Comparison */}
                            <div className="space-y-6">
                                <div className="bg-card p-4 rounded-xl border shadow-sm">
                                    <h3 className="font-semibold mb-4 flex items-center justify-between text-foreground">
                                        Perbandingan Wajah
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground text-center">Scan E-KTP</p>
                                            <div className="aspect-[3/2] bg-muted rounded-lg overflow-hidden border relative group">
                                                {selectedUser?.detail?.scan_ktp ? (
                                                    <img
                                                        src={getFileUrl(selectedUser.detail.scan_ktp)!}
                                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                                        onClick={() => window.open(getFileUrl(selectedUser.detail?.scan_ktp)!, '_blank')}
                                                        alt="KTP"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Tidak ada foto</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground text-center">Selfie E-KYC</p>
                                            <div className="aspect-[3/2] bg-muted rounded-lg overflow-hidden border relative group">
                                                {selectedUser?.detail?.scan_selfie ? (
                                                    <img
                                                        src={getFileUrl(selectedUser.detail.scan_selfie)!}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                                        onClick={() => window.open(getFileUrl(selectedUser.detail?.scan_selfie)!, '_blank')}
                                                        alt="Selfie"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Tidak ada foto</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-card p-4 rounded-xl border shadow-sm">
                                    <h3 className="font-semibold mb-4 text-foreground">Dokumen Pendukung</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground text-center">Scan KTA</p>
                                            <div className="aspect-[3/2] bg-muted rounded-lg overflow-hidden border relative group">
                                                {selectedUser?.detail?.scan_kta ? (
                                                    <img
                                                        src={getFileUrl(selectedUser.detail.scan_kta)!}
                                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                                        onClick={() => window.open(getFileUrl(selectedUser.detail?.scan_kta)!, '_blank')}
                                                        alt="KTA"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Tidak ada</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-muted-foreground text-center">Scan SK</p>
                                            <div className="aspect-[3/2] bg-muted rounded-lg overflow-hidden border relative group">
                                                {selectedUser?.detail?.scan_sk ? (
                                                    <img
                                                        src={getFileUrl(selectedUser.detail.scan_sk)!}
                                                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                                                        onClick={() => window.open(getFileUrl(selectedUser.detail?.scan_sk)!, '_blank')}
                                                        alt="SK"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Tidak ada</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Data Verification */}
                            <div className="bg-card p-6 rounded-xl border shadow-sm h-fit">
                                <h3 className="font-semibold mb-4 text-lg border-b pb-2 text-foreground">Informasi User</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">Nama Lengkap</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.name}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">NIK</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.detail?.nik}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">NRP</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.detail?.nia_nrp}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">TTL</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.detail?.tempat_lahir}, {selectedUser?.detail?.tanggal_lahir}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">Jenis Kelamin</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.detail?.jenis_kelamin || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">Alamat Lengkap</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.detail?.alamat_domisili_lengkap}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">Jabatan</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.detail?.jabatan?.nama || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">Tanggal Pengangkatan</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.detail?.tanggal_pengangkatan || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm border-b border-border pb-2 last:border-0">
                                        <span className="text-muted-foreground">Nomor SK</span>
                                        <span className="col-span-2 font-medium">{selectedUser?.detail?.nomor_sk || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t bg-card flex justify-end gap-3 shrink-0">
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={() => setIsRejectOpen(true)}
                            className="min-w-[150px]"
                            disabled={processing}
                        >
                            <X className="w-5 h-5 mr-2" /> Tolak
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => setIsApproveOpen(true)}
                            className="min-w-[150px] bg-green-600 hover:bg-green-700"
                            disabled={processing}
                        >
                            <UserCheck className="w-5 h-5 mr-2" /> Verifikasi & Setujui
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
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
                <DialogContent>
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
                                className="bg-green-600 hover:bg-green-700"
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
