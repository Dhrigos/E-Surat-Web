import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MailDetail from '@/Pages/MailManagement/MailDetail';
import axios from 'axios';

interface Disposition {
    id: number;
    letter: {
        id: number;
        subject: string;
        letter_number: string;
        content?: string;
        approvers?: Approver[];
        // Additional fields for MailDetail
        status?: string;
        priority?: string;
        category?: string;
        date?: string;
        description?: string;
        attachments?: any[];
        recipients?: any[];
        created_at?: string;
        sender?: {
            name: string;
            profile_photo_url?: string;
            detail?: {
                jabatan_role?: {
                    name: string;
                };
            };
        };
    };
    sender: {
        name: string;
    };
    instruction: string;
    status: string;
    created_at: string;
}

interface Approver {
    id: number;
    status: string;
    updated_at: string;
    user?: {
        name: string;
        detail?: {
            jabatan_role?: {
                name: string;
            };
        };
    };
}

interface Props {
    dispositions: Disposition[];
}

export default function DispositionIndex({ dispositions }: Props) {
    const [localDispositions, setLocalDispositions] = React.useState<Disposition[]>(dispositions);
    const [selectedDisposition, setSelectedDisposition] = React.useState<Disposition | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [showFullDetail, setShowFullDetail] = React.useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
    const [detailedMail, setDetailedMail] = React.useState<any>(null);

    const openDetail = (disp: Disposition) => {
        setSelectedDisposition(disp);
        setIsModalOpen(true);
    };

    const handleViewDetail = async () => {
        if (!selectedDisposition) return;

        setIsLoadingDetail(true);
        try {
            const response = await axios.get(route('dispositions.show-letter', selectedDisposition.id));

            // Update local state to reflect 'read' status
            if (selectedDisposition.status === 'pending') {
                const updatedStatus = 'read';
                setLocalDispositions(prev => prev.map(d =>
                    d.id === selectedDisposition.id ? { ...d, status: updatedStatus } : d
                ));
                setSelectedDisposition(prev => prev ? { ...prev, status: updatedStatus } : null);
            }

            const getPositionName = (detail: any) => {
                const roleName = detail?.jabatan_role?.name;
                const jabatanName = detail?.jabatan?.nama;
                const jabatanLengkap = detail?.jabatan?.nama_lengkap;

                if (jabatanLengkap) return jabatanLengkap;
                if (roleName && jabatanName) {
                    // Check if roleName is already part of jabatanName (case insensitive)
                    if (jabatanName.toLowerCase().includes(roleName.toLowerCase())) {
                        return jabatanName;
                    }
                    return `${roleName} ${jabatanName}`;
                }
                return roleName || jabatanName || 'Staff';
            };

            setDetailedMail({
                ...response.data,
                // Ensure date format matches UI expectations if needed
                date: format(new Date(response.data.created_at || new Date()), 'dd MMMM yyyy'),
                sender: response.data.sender ? {
                    name: response.data.sender.name,
                    email: response.data.sender.email,
                    position: getPositionName(response.data.sender.detail),
                    unit: response.data.sender.detail?.jabatan?.nama || 'Unknown Unit',
                    pangkat: response.data.sender.detail?.pangkat?.nama || '-',
                    jabatan: response.data.sender.detail?.jabatan_role?.name || '-',
                    nip: response.data.sender.detail?.nia_nrp || '-',
                    nik: response.data.sender.detail?.nik || '-',
                    join_date: response.data.sender.detail?.tanggal_pengangkatan || response.data.sender.created_at || '-',
                    status: response.data.sender.is_active === 1 ? 'active' : 'inactive',
                    role: response.data.sender.roles?.[0]?.name || 'user',
                    profile_photo_url: response.data.sender.profile_photo_url
                } : { name: 'Unknown', position: 'Unknown' },
                recipients_list: response.data.recipients?.map((r: any) => ({
                    type: r.recipient_type,
                    id: r.recipient_id,
                    name: r.recipient?.name || r.recipient_name || 'Unknown',
                    email: r.recipient?.email,
                    position: getPositionName(r.recipient?.detail),
                    unit: r.recipient?.detail?.jabatan?.nama || 'Unknown Unit',
                    pangkat: r.recipient?.detail?.pangkat?.nama || '-',
                    jabatan: r.recipient?.detail?.jabatan_role?.name || '-',
                    nip: r.recipient?.detail?.nia_nrp || '-',
                    nik: r.recipient?.detail?.nik || '-',
                    join_date: r.recipient?.detail?.tanggal_pengangkatan || r.recipient?.created_at || '-',
                    status: r.recipient?.is_active === 1 ? 'active' : 'inactive',
                    role: r.recipient?.roles?.[0]?.name || 'user',
                    profile_photo_url: r.recipient?.profile_photo_url
                })),
                approvers: response.data.approvers?.map((a: any) => ({
                    user_id: a.user_id || a.user?.id,
                    approver_id: a.id,
                    position: getPositionName(a.user?.detail),
                    user_name: a.user?.name,
                    email: a.user?.email,
                    unit: a.user?.detail?.jabatan?.nama || 'Unknown Unit',
                    pangkat: a.user?.detail?.pangkat?.nama || '-',
                    jabatan: a.user?.detail?.jabatan_role?.name || '-',
                    nip: a.user?.detail?.nia_nrp || '-',
                    nik: a.user?.detail?.nik || '-',
                    join_date: a.user?.detail?.tanggal_pengangkatan || a.user?.created_at || '-',
                    user_status: a.user?.is_active === 1 ? 'active' : 'inactive',
                    role: a.user?.roles?.[0]?.name || 'user',
                    status: a.status,
                    order: a.order || 0,
                    remarks: a.remarks,
                    signature_url: a.signature_url
                }))
            });
            setShowFullDetail(true);
        } catch (error) {
            console.error("Failed to fetch letter details", error);
            // Optionally show toast error
        } finally {
            setIsLoadingDetail(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Disposisi Masuk" />

            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Disposisi Masuk</h2>
                    <p className="text-muted-foreground">Daftar surat yang didisposisikan kepada Anda.</p>
                </div>

                <div className="bg-card rounded-xl border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Dari</TableHead>
                                <TableHead>Perihal Surat</TableHead>
                                <TableHead>Instruksi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {localDispositions.map((disp) => (
                                <TableRow key={disp.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(disp.created_at), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell>{disp.sender.name}</TableCell>
                                    <TableCell className="font-medium">{disp.letter.subject}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{disp.instruction}</TableCell>
                                    <TableCell>
                                        <Badge variant={disp.status === 'completed' ? 'default' : 'secondary'}>
                                            {disp.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openDetail(disp)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Detail
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {localDispositions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Tidak ada disposisi masuk.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Detail Disposisi</DialogTitle>
                        <DialogDescription>
                            Informasi lengkap mengenai disposisi yang diterima.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDisposition && (
                        <>
                            <Tabs defaultValue="info" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info">Info</TabsTrigger>
                                    <TabsTrigger value="content">Isi Surat</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-sm font-medium text-muted-foreground text-right">Dari</span>
                                        <div className="col-span-3 text-sm font-medium">{selectedDisposition.sender.name}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-sm font-medium text-muted-foreground text-right">Tanggal</span>
                                        <div className="col-span-3 text-sm">{format(new Date(selectedDisposition.created_at), 'dd MMMM yyyy HH:mm')}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-sm font-medium text-muted-foreground text-right">Surat</span>
                                        <div className="col-span-3 text-sm">
                                            <p className="font-semibold">{selectedDisposition.letter.subject}</p>
                                            <p className="text-muted-foreground text-xs">{selectedDisposition.letter.letter_number}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-sm font-medium text-muted-foreground text-right">Instruksi</span>
                                        <div className="col-span-3 text-sm bg-muted/50 p-2 rounded-md border">
                                            {selectedDisposition.instruction}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="text-sm font-medium text-muted-foreground text-right">Status</span>
                                        <div className="col-span-3">
                                            <Badge variant={selectedDisposition.status === 'completed' ? 'default' : 'secondary'}>
                                                {selectedDisposition.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="content" className="pt-4">
                                    <div className="border rounded-md p-4 bg-muted/20 min-h-[200px] text-sm whitespace-pre-wrap">
                                        <div dangerouslySetInnerHTML={{ __html: selectedDisposition.letter.content || 'Content not available' }} />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Tutup
                                </Button>
                                <Button onClick={handleViewDetail} disabled={isLoadingDetail}>
                                    {isLoadingDetail ? 'Loading...' : 'Lihat Surat'}
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {detailedMail && (
                <MailDetail
                    open={showFullDetail}
                    onOpenChange={setShowFullDetail}
                    mail={detailedMail}
                    hideTimeline={false}
                />
            )}
        </AppLayout>
    );
}


