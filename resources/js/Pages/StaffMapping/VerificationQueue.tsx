import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, CheckCircle, X, Users, Shield, Key } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

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
    const [isCallOpen, setIsCallOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const jitsiApiRef = useRef<any>(null);
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
                    setIsCallOpen(false);
                    resetRejection();
                },
                onError: () => toast.error('Gagal menolak user'),
            });
        }
    };

    const handleVerify = (user: User) => {
        if (confirm(`Apakah Anda yakin ingin memverifikasi user ${user.name}?`)) {
            post(route('verification-queue.verify', user.id), {
                onSuccess: () => {
                    toast.success('User berhasil diverifikasi');
                    setIsCallOpen(false);
                },
                onError: () => toast.error('Gagal memverifikasi user'),
            });
        }
    };

    const startCall = (user: User) => {
        // Lock the user first
        post(route('verification-queue.lock', user.id), {
            onSuccess: () => {
                setSelectedUser(user);
                setIsCallOpen(true);
            },
            onError: () => toast.error('Gagal mengunci user (mungkin sudah diambil admin lain)'),
        });
    };

    const handleCloseCall = () => {
        if (selectedUser) {
            // Unlock the user when closing
            post(route('verification-queue.unlock', selectedUser.id), {
                onSuccess: () => {
                    setIsCallOpen(false);
                    setSelectedUser(null);
                }
            });
        } else {
            setIsCallOpen(false);
        }
    };

    useEffect(() => {
        if (isCallOpen && selectedUser) {
            // Load Jitsi script if not already loaded
            if (!window.JitsiMeetExternalAPI) {
                const script = document.createElement('script');
                script.src = 'https://8x8.vc/external_api.js';
                script.async = true;
                script.onload = () => initJitsi(selectedUser);
                document.body.appendChild(script);
            } else {
                initJitsi(selectedUser);
            }
        } else {
            // Cleanup Jitsi when modal closes
            if (jitsiApiRef.current) {
                jitsiApiRef.current.dispose();
                jitsiApiRef.current = null;
            }
        }
    }, [isCallOpen, selectedUser]);

    const initJitsi = (user: User) => {
        if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
            const domain = '8x8.vc';
            const options = {
                roomName: `vpaas-magic-cookie-28ed8eb749bf4baaa08a0d979cf0df98/ProjectDevVerification_${user.id}`,
                width: '100%',
                height: 500,
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: 'Admin Interviewer',
                },
                configOverwrite: {
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    prejoinPageEnabled: true,
                    skipMeetingPrejoin: false,
                    disableDeepLinking: true,
                    disableThirdPartyRequests: true,
                    analytics: {
                        disabled: true,
                    },
                },
                interfaceConfigOverwrite: {
                    hideConferenceTimer: false,
                },
            };
            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            jitsiApiRef.current.addEventListeners({
                videoConferenceLeft: handleCloseCall,
                readyToClose: handleCloseCall,
            });
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

    const InfoRow = ({ label, value }: { label: string, value?: string }) => (
        <div className="grid grid-cols-3 gap-2 py-1 border-b border-gray-100 last:border-0">
            <span className="text-sm font-medium text-gray-500">{label}</span>
            <span className="text-sm text-gray-900 col-span-2">{value || '-'}</span>
        </div>
    );

    const DocumentPreview = ({ label, path }: { label: string, path?: string }) => {
        const url = getFileUrl(path);
        if (!url) return null;

        return (
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
                <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img
                        src={url}
                        alt={label}
                        className="w-full h-auto max-h-[300px] object-contain"
                        onError={(e) => {
                            // Fallback if not an image or fails to load
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML += `<a href="${url}" target="_blank" class="block p-4 text-blue-600 hover:underline text-center">Download / Lihat Dokumen</a>`;
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Antrian Verifikasi" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Mapping Staff</h1>
                    <p className="text-muted-foreground mt-2">
                        Kelola tim dan mapping staff di bawah Anda
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
                                User di bawah ini telah melengkapi profil dan menunggu verifikasi video call.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>NRP / NIK</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
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
                                                    <TableCell className="font-medium">{user.name}</TableCell>
                                                    <TableCell>{user.email}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col text-sm">
                                                            <span>NRP: {user.detail?.nia_nrp || '-'}</span>
                                                            <span className="text-gray-500">NIK: {user.detail?.nik || '-'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {isLocked ? (
                                                            <Badge variant={isLockedByMe ? "default" : "destructive"}>
                                                                {isLockedByMe ? "Sedang Anda Verifikasi" : `Sedang diverifikasi oleh ${lockedByName}`}
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
                                                            onClick={() => startCall(user)}
                                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200"
                                                            disabled={isLocked && !isLockedByMe}
                                                        >
                                                            <Video className="w-4 h-4 mr-2" />
                                                            {isLockedByMe ? "Lanjutkan Call" : "Video Call"}
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

            {/* Video Call Modal */}
            <Dialog open={isCallOpen} onOpenChange={(open) => !open && handleCloseCall()}>
                <DialogContent className="!max-w-none !w-screen !h-screen flex flex-col p-0 gap-0 overflow-hidden bg-black border-none">
                    <DialogTitle className="sr-only">Verifikasi User</DialogTitle>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Side: User Info & Actions */}
                        <div className="w-1/3 border-r flex flex-col bg-white">
                            <div className="flex-1 overflow-y-auto p-6">
                                <h3 className="font-semibold text-lg mb-4">Informasi User</h3>

                                <div className="space-y-4 mb-6">
                                    <InfoRow label="Nama Lengkap" value={selectedUser?.name} />
                                    <InfoRow label="Email" value={selectedUser?.email} />
                                    <InfoRow label="NIK" value={selectedUser?.detail?.nik} />
                                    <InfoRow label="NIA / NRP" value={selectedUser?.detail?.nia_nrp} />
                                    <InfoRow label="Tempat Lahir" value={selectedUser?.detail?.tempat_lahir} />
                                    <InfoRow label="Tanggal Lahir" value={selectedUser?.detail?.tanggal_lahir} />
                                    <InfoRow label="Jenis Kelamin" value={selectedUser?.detail?.jenis_kelamin} />
                                    <InfoRow label="Alamat" value={selectedUser?.detail?.alamat_domisili_lengkap} />
                                    <InfoRow label="Status Keanggotaan" value={selectedUser?.detail?.status_keanggotaan?.nama} />
                                    <InfoRow label="Pangkat / Golongan" value={selectedUser?.detail?.pangkat ? `${selectedUser.detail.pangkat.nama} (${selectedUser.detail.pangkat.kode})` : undefined} />
                                    <InfoRow label="Jabatan" value={selectedUser?.detail?.jabatan?.nama} />
                                    <InfoRow label="Unit Kesatuan" value={selectedUser?.detail?.unit_kerja?.nama} />
                                    <InfoRow label="Sub Unit" value={selectedUser?.detail?.subunit?.nama} />
                                    <InfoRow label="No. SK" value={selectedUser?.detail?.nomor_sk} />
                                    <InfoRow label="No. KTA" value={selectedUser?.detail?.nomor_kta} />
                                    <InfoRow label="Tgl Pengangkatan" value={selectedUser?.detail?.tanggal_pengangkatan} />
                                </div>

                                <h3 className="font-semibold text-lg mb-4 mt-8">Dokumen</h3>
                                <DocumentPreview label="Foto Profil" path={selectedUser?.detail?.foto_profil} />
                                <DocumentPreview label="Scan KTP" path={selectedUser?.detail?.scan_ktp} />
                                <DocumentPreview label="Scan KTA" path={selectedUser?.detail?.scan_kta} />
                                <DocumentPreview label="Scan SK" path={selectedUser?.detail?.scan_sk} />
                                <DocumentPreview label="Tanda Tangan" path={selectedUser?.detail?.tanda_tangan} />
                            </div>

                            {/* Action Buttons (Fixed at Bottom) */}
                            <div className="p-4 border-t bg-gray-50 space-y-2 shrink-0">
                                <Button
                                    size="lg"
                                    onClick={() => selectedUser && handleVerify(selectedUser)}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    disabled={processing}
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" /> Verifikasi User Ini
                                </Button>
                                <Button
                                    size="lg"
                                    variant="destructive"
                                    onClick={() => setIsRejectOpen(true)}
                                    className="w-full"
                                    disabled={processing}
                                >
                                    <X className="w-5 h-5 mr-2" /> Tolak Verifikasi
                                </Button>
                            </div>
                        </div>

                        {/* Right Side: Jitsi Meet */}
                        <div className="w-2/3 bg-black relative flex flex-col">
                            <div ref={jitsiContainerRef} className="w-full h-full" />
                        </div>
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
                                placeholder="Masukkan alasan penolakan..."
                                value={rejectionData.reason}
                                onChange={(e) => setRejectionData('reason', e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Batal</Button>
                            <Button variant="destructive" onClick={handleReject} disabled={rejectionProcessing}>Tolak User</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout >
    );
}
