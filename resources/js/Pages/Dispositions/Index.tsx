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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import {
    Eye,
    Search,
    FileText,
    Clock,
    MessageSquare,
    CheckCircle,
    AlertCircle,
    Calendar,
    User
} from 'lucide-react';
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
    priority?: string; // If available or derived
    due_date?: string;
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

interface Stats {
    total: number;
    pending: number;
    process: number;
    completed: number;
}

interface Props {
    dispositions: Disposition[];
    stats: Stats;
}

export default function DispositionIndex({ dispositions, stats }: Props) {
    const [localDispositions, setLocalDispositions] = React.useState<Disposition[]>(dispositions);
    const [selectedDisposition, setSelectedDisposition] = React.useState<Disposition | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [showFullDetail, setShowFullDetail] = React.useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
    const [detailedMail, setDetailedMail] = React.useState<any>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

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
                    if (jabatanName.toLowerCase().includes(roleName.toLowerCase())) {
                        return jabatanName;
                    }
                    return `${roleName} ${jabatanName}`;
                }
                return roleName || jabatanName || 'Staff';
            };

            setDetailedMail({
                ...response.data,
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
        } finally {
            setIsLoadingDetail(false);
        }
    };

    // Filter logic
    const filteredDispositions = localDispositions.filter(disp => {
        const matchesSearch =
            disp.letter.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            disp.letter.letter_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            disp.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            disp.instruction.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'pending' && disp.status === 'pending') ||
            (statusFilter === 'process' && disp.status === 'read') ||
            (statusFilter === 'completed' && disp.status === 'completed');

        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>;
            case 'read':
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/20"><MessageSquare className="w-3 h-3 mr-1" /> Diproses</Badge>;
            case 'completed':
                return <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Selesai</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="Disposisi Masuk" />

            <div className="p-6 space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#AC0021] rounded-lg shadow-lg shadow-[#AC0021]/20">
                            <FileText className="w-6 h-6 text-[#FEFCF8]" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Disposisi Masuk</h2>
                    </div>
                    <p className="text-gray-400">Kelola disposisi dan instruksi surat yang ditugaskan kepada Anda</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] group bg-[#262626] text-[#FEFCF8] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl transition-colors group-hover:bg-blue-500/20">
                                    <FileText className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <h3 className="text-sm font-medium text-blue-400">Total</h3>
                                <div className="text-4xl font-bold text-[#FEFCF8]">{stats.total}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle className="h-3 w-3 text-blue-400" />
                                <span>Semua disposisi</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] group bg-[#262626] text-[#FEFCF8] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#d04438]/10 rounded-xl transition-colors group-hover:bg-[#d04438]/20">
                                    <Clock className="h-6 w-6 text-[#d04438]" />
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <h3 className="text-sm font-medium text-[#d04438]">Menunggu</h3>
                                <div className="text-4xl font-bold text-[#FEFCF8]">{stats.pending}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <AlertCircle className="h-3 w-3 text-[#d04438]" />
                                <span>Perlu tindakan</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] group bg-[#262626] text-[#FEFCF8] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#AC0021]/10 rounded-xl transition-colors group-hover:bg-[#AC0021]/20">
                                    <MessageSquare className="h-6 w-6 text-[#AC0021]" />
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <h3 className="text-sm font-medium text-[#AC0021]">Diproses</h3>
                                <div className="text-4xl font-bold text-[#FEFCF8]">{stats.process}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle className="h-3 w-3 text-[#AC0021]" />
                                <span>Sedang berjalan</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] group bg-[#262626] text-[#FEFCF8] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#659800]/10 rounded-xl transition-colors group-hover:bg-[#659800]/20">
                                    <CheckCircle className="h-6 w-6 text-[#659800]" />
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <h3 className="text-sm font-medium text-[#659800]">Selesai</h3>
                                <div className="text-4xl font-bold text-[#FEFCF8]">{stats.completed}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle className="h-3 w-3 text-[#659800]" />
                                <span>Telah selesai</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Filters Section */}
                    <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-[#262626] relative z-20 shadow-md">
                        <div className="relative w-full md:w-[500px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Cari berdasarkan perihal, pengirim, nomor surat, atau instruksi..."
                                className="pl-9 bg-[#1a1a1a] border-white/10 text-white placeholder:text-gray-500 focus:ring-blue-500/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-white/10 text-white">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="pending">Menunggu</SelectItem>
                                    <SelectItem value="process">Diproses</SelectItem>
                                    <SelectItem value="completed">Selesai</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto relative z-10">
                        <Table>
                            <TableHeader className="bg-[#262626] border-b border-white/10 shadow-sm relative z-10">
                                <TableRow className="border-white/10 hover:bg-[#262626]">
                                    <TableHead className="w-[180px] text-gray-400 pl-4 md:pl-6 h-12">Tanggal</TableHead>
                                    <TableHead className="w-[200px] text-gray-400 h-12 hidden md:table-cell">Dari</TableHead>
                                    <TableHead className="text-gray-400 h-12">Perihal Surat</TableHead>
                                    <TableHead className="w-[250px] text-gray-400 h-12 hidden lg:table-cell">Instruksi</TableHead>
                                    <TableHead className="w-[150px] text-gray-400 h-12">Status</TableHead>
                                    <TableHead className="w-[80px] md:w-[100px] text-right text-gray-400 pr-4 md:pr-6 h-12">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDispositions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FileText className="w-8 h-8 opacity-20" />
                                                <p>Tidak ada disposisi ditemukan</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredDispositions.map((disp) => (
                                        <TableRow key={disp.id} className="border-white/10 bg-[#262626] transition-colors group">
                                            <TableCell className="py-4 pl-4 md:pl-6 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                                                        <span className="text-sm font-medium">{format(new Date(disp.created_at), 'dd/M/yyyy')}</span>
                                                    </div>
                                                    {disp.due_date && (
                                                        <span className="text-xs text-red-400 font-medium">
                                                            DL: {format(new Date(disp.due_date), 'dd/M/yyyy')}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top hidden md:table-cell">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-gray-300">
                                                        <User className="w-3.5 h-3.5 text-gray-500" />
                                                        <span className="font-medium">{disp.sender.name}</span>
                                                    </div>
                                                    {disp.letter.priority && (
                                                        <Badge variant="outline" className={`w-fit text-[10px] ${disp.letter.priority === 'Tinggi' ? 'border-red-500/30 text-red-500 bg-red-500/10' :
                                                            disp.letter.priority === 'Sedang' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' :
                                                                'border-green-500/30 text-green-500 bg-green-500/10'
                                                            }`}>
                                                            {disp.letter.priority}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2">
                                                        {disp.letter.subject}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {disp.letter.letter_number}
                                                    </span>
                                                    {/* Mobile Only: Sender & Priority */}
                                                    <div className="md:hidden mt-2 flex flex-col gap-1">
                                                        <span className="text-xs text-gray-400">Dari: {disp.sender.name}</span>
                                                        {disp.letter.priority && (
                                                            <span className={`text-[10px] ${disp.letter.priority === 'Tinggi' ? 'text-red-400' :
                                                                disp.letter.priority === 'Sedang' ? 'text-yellow-400' :
                                                                    'text-green-400'
                                                                }`}>{disp.letter.priority}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top hidden lg:table-cell text-gray-400 text-sm">
                                                <div className="line-clamp-2">
                                                    {disp.instruction}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 align-top">
                                                {getStatusBadge(disp.status)}
                                            </TableCell>
                                            <TableCell className="py-4 align-top text-right pr-4 md:pr-6">
                                                <Button
                                                    size="sm"
                                                    className="bg-[#AC0021] hover:bg-[#AC0021]/90 text-white h-8 w-8 p-0 rounded-lg shadow-lg shadow-red-900/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-2 md:group-hover:translate-x-0"
                                                    onClick={() => openDetail(disp)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] bg-[#1a1a1a] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Detail Disposisi</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Informasi lengkap mengenai disposisi yang diterima.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedDisposition && (
                        <>
                            <Tabs defaultValue="info" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a]">
                                    <TabsTrigger value="info" className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-gray-400">Info</TabsTrigger>
                                    <TabsTrigger value="content" className="data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white text-gray-400">Isi Surat</TabsTrigger>
                                </TabsList>

                                <TabsContent value="info" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-sm font-medium text-gray-400 text-right">Dari</span>
                                        <div className="col-span-3 text-sm font-medium text-white">{selectedDisposition.sender.name}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-sm font-medium text-gray-400 text-right">Tanggal</span>
                                        <div className="col-span-3 text-sm text-gray-200">{format(new Date(selectedDisposition.created_at), 'dd MMMM yyyy HH:mm')}</div>
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-sm font-medium text-gray-400 text-right">Surat</span>
                                        <div className="col-span-3 text-sm">
                                            <p className="font-semibold text-white">{selectedDisposition.letter.subject}</p>
                                            <p className="text-gray-500 text-xs">{selectedDisposition.letter.letter_number}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-start gap-4">
                                        <span className="text-sm font-medium text-gray-400 text-right">Instruksi</span>
                                        <div className="col-span-3 text-sm bg-[#2a2a2a] p-3 rounded-md border border-white/5 text-gray-300">
                                            {selectedDisposition.instruction}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <span className="text-sm font-medium text-gray-400 text-right">Status</span>
                                        <div className="col-span-3">
                                            {getStatusBadge(selectedDisposition.status)}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="content" className="pt-4">
                                    <div className="border border-white/10 rounded-md p-4 bg-[#2a2a2a] min-h-[200px] text-sm whitespace-pre-wrap text-gray-300">
                                        <div dangerouslySetInnerHTML={{ __html: selectedDisposition.letter.content || 'Content not available' }} />
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="pt-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5 hover:text-white">
                                    Tutup
                                </Button>
                                <Button onClick={handleViewDetail} disabled={isLoadingDetail} className="bg-[#AC0021] hover:bg-[#AC0021]/90 text-[#FEFCF8]">
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
