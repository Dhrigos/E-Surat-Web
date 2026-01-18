import React, { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
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
    Download,
    Edit,
    Archive,
    FileText,
    User,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    ChevronRight,
    Paperclip,
    MoreVertical,
    Share2,
    Send,
    Check,
    X,
    Eye,
    ArrowRight,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import StaffDetailModal from '@/Components/StaffDetailModal';


import DispositionModal from '@/components/DispositionModal';
import DispositionList from '@/components/DispositionList';
import ApprovalView from './ApprovalView';
import { SharedData } from '@/types';

interface Attachment {
    id: number;
    name: string;
    url: string;
    size: number;
    type: string;
}

interface Disposition {
    id: number;
    sender: { name: string };
    recipient: { name: string };
    instruction: string;
    note: string | null;
    due_date: string | null;
    status: string;
    created_at: string;
}

interface MailDetailProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mail: {
        id: number;
        subject: string;
        recipient: string;
        status: string;
        priority: string;
        category: string;
        date: string;
        description: string;
        content: string;
        attachments: Attachment[];
        approvers: Approver[];
        recipients_list?: Recipient[];
        dispositions?: Disposition[];
        sender?: Sender;
        type?: 'sent' | 'inbox';
        code?: string;
        letter_number?: string;
        letter_type?: string;
        signature_positions?: Record<string, any>;
        place?: string;
        comments?: {
            id: number;
            user: { name: string };
            comment: string;
            created_at: string;
        }[];
    };
    hideTimeline?: boolean;
}

interface Approver {
    user_id?: number;
    approver_id: number;
    position: string;
    user_name?: string;
    email?: string;
    unit?: string;
    jabatan?: string;
    pangkat?: string;
    rank?: string;
    nip?: string;
    nik?: string;
    join_date?: string;
    user_status?: string;
    role?: string;
    status: 'pending' | 'approved' | 'rejected';
    order: number;
    remarks?: string;
    signature_url?: string;
}

interface Sender {
    name: string;
    email?: string;
    position: string;
    unit?: string;
    jabatan?: string;
    pangkat?: string;
    rank?: string;
    nip?: string;
    nik?: string;
    join_date?: string;
    status?: string;
    role?: string;
    profile_photo_url?: string;
    user_name?: string;
    signature_url?: string;
}

interface Recipient {
    type: 'user' | 'division';
    id: string;
    name: string;
    email?: string;
    position?: string;
    unit?: string;
    jabatan?: string;
    pangkat?: string;
    nip?: string;
    nik?: string;
    join_date?: string;
    status?: string;
    role?: string;
    profile_photo_url?: string;
}

// ... other interfaces ...

export default function MailDetail({ open, onOpenChange, mail }: MailDetailProps) {
    const { auth } = usePage<SharedData>().props;
    const [isDispositionOpen, setIsDispositionOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'detail' | 'approval'>('detail');
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingSignature, setPendingSignature] = useState<{ x: number; y: number } | null>(null);
    const [hideTimeline, setHideTimeline] = useState(false);
    const [showPreview, setShowPreview] = useState(false); // Collapsible Preview State

    const [zoom, setZoom] = useState(0.8);
    // Staff Detail Modal State
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [isStaffDetailOpen, setIsStaffDetailOpen] = useState(false);

    const handleStaffClick = (staff: any) => {
        if (!staff) return;
        // Transform to match StaffDetailModal props
        setSelectedStaff({
            name: staff.name || staff.user_name,
            email: staff.email || '-',
            role: staff.role || 'user',
            unit: staff.unit || 'Unknown Unit',
            jabatan: staff.role || staff.position || 'Unknown Position',
            pangkat: staff.pangkat || staff.rank || '-',
            nip: staff.nip || '-',
            nik: staff.nik || '-',
            join_date: staff.join_date || '-',
            status: staff.status || staff.user_status || 'inactive',
            profile_photo_url: staff.profile_photo_url
        });
        setIsStaffDetailOpen(true);
    };

    if (!mail) return null;

    const currentApprover = mail.approvers?.find(a => a.user_id === auth.user.id);
    const canApprove = currentApprover?.status === 'pending';
    const isRecipient = mail.recipients_list?.some(r => r.type === 'user' && String(r.id) === String(auth.user.id));

    const handleApproval = (data?: { remarks: string; signature_position: { x: number; y: number } | null }, actionType: 'approve' | 'reject' = 'approve') => {
        setIsSubmitting(true);

        const action = actionType || approvalAction || 'approve';
        const finalRemarks = data?.remarks || remarks;
        const signaturePosition = data?.signature_position || pendingSignature || null;

        router.put(route('letters.update-status', mail.id), {
            status: action === 'approve' ? 'approved' : 'rejected',
            remarks: finalRemarks,
            signature_position: signaturePosition,
            step_id: currentApprover?.approver_id
        }, {
            onSuccess: () => {
                setApprovalAction(null);
                setRemarks('');
                setPendingSignature(null);
                setViewMode('detail');
                onOpenChange(false);
            },
            onFinish: () => setIsSubmitting(false)
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-500/15 text-amber-500 border-amber-500/20';
            case 'approved': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20';
            case 'rejected': return 'bg-rose-500/15 text-rose-500 border-rose-500/20';
            case 'revision': return 'bg-blue-500/15 text-blue-500 border-blue-500/20';
            default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-rose-500/15 text-rose-500 border-rose-500/20';
            case 'high': return 'bg-orange-500/15 text-orange-500 border-orange-500/20';
            case 'normal': return 'bg-blue-500/15 text-blue-500 border-blue-500/20';
            default: return 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!mail) return null;

    // ... existing logic ...

    if (viewMode === 'approval' && currentApprover) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full sm:max-w-6xl h-[90vh] p-0 bg-[#262626] border border-zinc-800 sm:rounded-xl overflow-hidden block">
                    <DialogTitle className="sr-only">Approval View</DialogTitle>
                    <DialogDescription className="sr-only">Tanda tangani dokumen ini</DialogDescription>
                    <ApprovalView
                        mail={mail}
                        approver={currentApprover}
                        onApprove={(data) => handleApproval(data, 'approve')}
                        onReject={(remarks) => handleApproval({ remarks: remarks, signature_position: null }, 'reject')}
                        onCancel={() => setViewMode('detail')}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>
        );
    }

    // Unified Modern Detail View for All Statuses (Approved, Pending/Inbox, Sent)
    if (viewMode === 'detail') {
        const approvedApprover = mail.approvers?.find(a => a.status === 'approved');
        const isApproved = mail.status === 'approved';
        const isSent = mail.type === 'sent';

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden bg-[#1e1e1e] border-zinc-800 text-zinc-100 p-0 gap-0 sm:rounded-xl">
                    <div className="sticky top-0 z-10 bg-[#1e1e1e]/95 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
                        <div>
                            <DialogTitle className="text-lg font-bold text-white">Detail Surat</DialogTitle>
                            <DialogDescription className="text-zinc-400 text-xs">
                                {isApproved ? 'Lihat detail surat yang telah disetujui' : 'Lihat detail surat yang dipilih'}
                            </DialogDescription>
                        </div>
                        <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors">
                            <X className="h-5 w-5" />
                        </DialogClose>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                        {/* Top Content (Static) */}
                        <div className="shrink-0 px-6 py-6 space-y-6">
                            {/* Status & Type Badges */}
                            <div className="flex items-center gap-2">
                                {isApproved ? (
                                    <Badge className="bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border-0 px-3 py-1 text-xs font-semibold">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                        Disetujui
                                    </Badge>
                                ) : mail.status === 'rejected' ? (
                                    <Badge className="bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 border-0 px-3 py-1 text-xs font-semibold">
                                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                        Ditolak
                                    </Badge>
                                ) : (
                                    <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-0 px-3 py-1 text-xs font-semibold">
                                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                                        Menunggu
                                    </Badge>
                                )}
                                <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700 px-3 py-1 text-xs font-medium">
                                    {mail.category || mail.letter_type || 'Surat'}
                                </Badge>
                            </div>

                            {/* Metadata Grid */}
                            <div className="grid gap-6">
                                <div>
                                    <Label className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Nomor Surat</Label>
                                    <p className="text-lg font-bold text-white mt-1">{mail.code || mail.letter_number || '-'}</p>
                                </div>

                                <div>
                                    <Label className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Jenis Surat</Label>
                                    <p className="text-base text-zinc-200 mt-1">{mail.category || mail.letter_type || '-'}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <Label className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                                            {isSent ? 'Kepada' : 'Dari'}
                                        </Label>
                                        <p className="text-base font-medium text-white mt-1">
                                            {isSent ? mail.recipient : (typeof mail.sender === 'object' ? mail.sender?.name : (mail.sender || 'Unknown'))}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">
                                            {isApproved ? 'Tanggal Disetujui' : 'Tanggal'}
                                        </Label>
                                        <p className="text-base font-medium text-white mt-1">
                                            {mail.date ? new Date(mail.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-zinc-800" />

                            {/* Isi Surat */}
                            <div className="space-y-3">
                                <Label className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Isi Surat</Label>
                                <div className="bg-[#262626] border border-zinc-800 rounded-xl p-5 max-h-[200px] overflow-y-auto custom-scrollbar text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap font-serif">
                                    <div dangerouslySetInnerHTML={{ __html: mail.content || mail.description || '<i>Tidak ada konten surat.</i>' }} />
                                </div>
                            </div>

                            {/* Attachments */}
                            {mail.attachments && mail.attachments.length > 0 && (
                                <div className="space-y-4">
                                    <Label className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Lampiran ({mail.attachments.length})</Label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {mail.attachments.map((file) => (
                                            <a
                                                key={file.id}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-4 p-4 rounded-xl bg-[#262626] border border-zinc-800 hover:bg-zinc-800/50 transition-all group"
                                            >
                                                <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <Paperclip className="h-5 w-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-zinc-200 truncate">{file.name}</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">{formatFileSize(file.size)}</p>
                                                </div>
                                                <Download className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Timeline Approval Section (Scrollable) */}
                        {!hideTimeline && mail.approvers && mail.approvers.length > 0 && (
                            <div className="flex-1 bg-[#1e1e1e] border-t border-zinc-800 min-h-0 flex flex-col">
                                {/* Timeline Header (Static) */}
                                <div className="shrink-0 px-6 py-4 border-b border-zinc-800/50">
                                    <Label className="text-zinc-500 text-xs uppercase tracking-wider font-semibold">Timeline Approval</Label>
                                </div>

                                {/* Scrollable Approvers List */}
                                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                                    <div className="relative pl-5 space-y-8">
                                        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-zinc-800" />
                                        {mail.approvers.map((approver, i) => (
                                            <div key={i} className="relative flex gap-6 group">
                                                <div className={cn(
                                                    "relative z-10 h-10 w-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-transform",
                                                    approver.status === 'approved' ? "bg-emerald-950/50 border-emerald-900 text-emerald-500" :
                                                        approver.status === 'rejected' ? "bg-rose-950/50 border-rose-900 text-rose-500" :
                                                            approver.status === 'pending' ? "bg-amber-950/50 border-amber-900 text-amber-500" :
                                                                "bg-zinc-900 border-zinc-800 text-zinc-600"
                                                )}>
                                                    {approver.status === 'approved' ? <Check className="h-4 w-4" /> :
                                                        approver.status === 'rejected' ? <X className="h-4 w-4" /> :
                                                            <User className="h-4 w-4" />}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                                        <div>
                                                            <p className="text-sm font-semibold text-zinc-200">
                                                                {approver.position.replace(/-/g, ' ')}
                                                            </p>
                                                            {approver.user_name && (
                                                                <p className="text-xs text-zinc-500">
                                                                    {approver.user_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge variant="outline" className={cn(
                                                            "w-fit capitalize border-0 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                                            approver.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                                                                approver.status === 'rejected' ? "bg-rose-500/10 text-rose-500" :
                                                                    approver.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                                                                        "bg-zinc-500/10 text-zinc-500"
                                                        )}>
                                                            {approver.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 p-4 border-t border-zinc-800 bg-[#1e1e1e] flex justify-between items-center gap-3 rounded-b-xl z-50">
                        <div className="flex gap-2">
                            {canApprove && (
                                <>
                                    <Button
                                        onClick={() => setViewMode('approval')}
                                        className="bg-[#AC0021] hover:bg-[#8c001b] text-white gap-2 h-9 px-4 text-sm font-medium shadow-md shadow-[#AC0021]/20"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Review & Sign
                                    </Button>
                                    <Button
                                        onClick={() => setApprovalAction('reject')}
                                        variant="outline"
                                        className="border-[#AC0021]/20 bg-[#AC0021]/5 text-[#AC0021] hover:bg-[#AC0021] hover:text-white hover:border-[#AC0021] gap-2 h-9 px-4 text-sm"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {/* Disposisi Button for Inbox Items */}
                            {mail.type === 'inbox' && (auth.user as any)?.can_dispose && (
                                <Button
                                    onClick={() => setIsDispositionOpen(true)}
                                    variant="outline"
                                    className="border-blue-600/20 bg-blue-500/5 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 gap-2 h-9 px-4 text-sm"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Disposisi
                                </Button>
                            )}

                            {/* Reply Button for Inbox Items */}
                            {mail.type === 'inbox' && (
                                <Link href={`/buat-surat?reply_to=${mail.id}`}>
                                    <Button
                                        variant="outline"
                                        className="border-green-600/20 bg-green-500/5 text-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 gap-2 h-9 px-4 text-sm"
                                    >
                                        <Send className="h-4 w-4" />
                                        Balas Pesan
                                    </Button>
                                </Link>
                            )}
                            <Button variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => onOpenChange(false)}>
                                Tutup
                            </Button>
                        </div>
                    </div>
                </DialogContent>
                <DispositionModal
                    isOpen={isDispositionOpen}
                    onClose={() => setIsDispositionOpen(false)}
                    mail={mail}
                />
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full sm:max-w-6xl max-h-[95dvh] sm:max-h-[90vh] flex flex-col overflow-hidden bg-[#262626] border-zinc-800 text-zinc-100 p-0 gap-0">
                    <div className="shrink-0 z-10 bg-[#262626]/95 backdrop-blur-xl border-b border-zinc-800 px-4 py-3 sm:px-5 flex items-center justify-between">
                        <div className="space-y-0.5 min-w-0 flex-1 mr-2">
                            <DialogTitle className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2 flex-wrap">
                                <span className="truncate">{mail.subject}</span>
                                <Badge variant="outline" className={`${getStatusColor(mail.status)} border-0 px-2 py-0 rounded-full text-[10px] font-semibold uppercase tracking-wide`}>
                                    {mail.status}
                                </Badge>
                                <Badge variant="outline" className={`${getPriorityColor(mail.priority)} border-0 px-2 py-0 rounded-full text-[10px] font-semibold uppercase tracking-wide`}>
                                    {mail.priority}
                                </Badge>
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 text-xs text-zinc-400">
                                <span className="uppercase tracking-wider font-medium text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                                    {mail.category}
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {mail.date}
                                </span>
                            </DialogDescription>
                        </div>
                        <DialogClose className="rounded-full h-7 w-7 flex items-center justify-center hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors">
                            <X className="h-4 w-4" />
                        </DialogClose>
                    </div>

                    <div className="flex-1 flex flex-col min-h-0 relative overflow-y-auto sm:overflow-hidden">
                        {/* Top Content (Static/Non-scrollable on Desktop, Scrollable part of body on Mobile) */}
                        <div className="shrink-0 px-4 sm:px-5 pt-4 sm:pt-5 space-y-4 sm:space-y-6">
                            {/* Sender/Recipient Card */}
                            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-[#262626] border border-zinc-800/50 shadow-sm">
                                <div className="flex-1 flex items-center gap-5">
                                    {mail.sender ? (
                                        <div
                                            className="flex items-center gap-5"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-900/20 overflow-hidden">
                                                {mail.sender.profile_photo_url ? (
                                                    <img src={mail.sender.profile_photo_url} alt={mail.sender.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <User className="h-5 w-5 text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                                                    From
                                                </p>
                                                <p className="text-lg font-semibold text-zinc-200">
                                                    {mail.sender.name}
                                                </p>
                                                <p className="text-sm text-zinc-400">
                                                    {mail.sender.position}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1">
                                            <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-1">To</p>
                                            <p className="text-lg font-semibold text-zinc-200">{mail.recipient}</p>
                                        </div>
                                    )}
                                </div>
                                {mail.recipients_list && mail.recipients_list.length > 0 && (
                                    <>
                                        <div className="hidden md:block w-px bg-zinc-800" />
                                        <div className="flex-1">
                                            <p className="text-xs sm:text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-2 sm:mb-3">
                                                Recipients ({mail.recipients_list.length})
                                            </p>
                                            <div className="flex flex-col gap-3">
                                                {mail.recipients_list.map((r, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => r.type === 'user' && handleStaffClick(r)}
                                                    >
                                                        <div className="h-8 w-8 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center text-xs font-medium text-zinc-400 overflow-hidden">
                                                            {r.profile_photo_url ? (
                                                                <img src={r.profile_photo_url} alt={r.name} className="h-full w-full object-cover" />
                                                            ) : (
                                                                r.name.charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-zinc-200">{r.name}</p>
                                                            {r.position && <p className="text-xs text-zinc-500">{r.position}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Letter Content - A4 Paper Preview */}
                            <div className="space-y-4">
                                <div
                                    className="flex items-center justify-between cursor-pointer group select-none py-2"
                                    onClick={() => setShowPreview(!showPreview)}
                                >
                                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                                        <FileText className="h-4 w-4 text-blue-500" />
                                        Preview Surat (A4)
                                        {showPreview ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    </h3>
                                    {showPreview && (
                                        <div className="flex items-center gap-1 bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-800" onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400" onClick={() => setZoom(Math.max(0.3, zoom - 0.1))}>-</Button>
                                            <span className="text-[10px] font-medium text-zinc-500 w-8 text-center">{Math.round(zoom * 100)}%</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400" onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}>+</Button>
                                        </div>
                                    )}
                                </div>

                                {showPreview && (
                                    <div className="overflow-y-auto max-h-[400px] pb-4 w-full flex justify-center bg-zinc-950/30 rounded-2xl border border-zinc-900 p-8 custom-scrollbar">
                                        <div
                                            className="bg-white text-black shadow-2xl relative transition-transform origin-top"
                                            style={{
                                                width: '210mm',
                                                minHeight: '297mm',
                                                transform: `scale(${zoom})`,
                                                padding: '2.5cm',
                                                boxSizing: 'border-box'
                                            }}
                                        >
                                            {/* Header Kop Surat */}
                                            <div className="text-center mb-4 relative">
                                                <div className="border-b-[3px] border-black pb-1 mb-2 relative min-h-[100px] flex flex-col justify-center">
                                                    <div className="absolute left-10 top-[44%] -translate-y-1/2 h-24 w-24">
                                                        <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Logo" className="w-full h-full object-contain" />
                                                    </div>
                                                    <div className="w-full pl-32 pr-4 space-y-0.5">
                                                        <h3 className="text-md font-bold uppercase tracking-[0.1em] font-serif">KEMENTERIAN PERTAHANAN RI</h3>
                                                        <h1 className="text-xl font-black uppercase tracking-[0.1em] font-serif leading-tight text-black text-center whitespace-nowrap">BADAN CADANGAN NASIONAL</h1>
                                                        <p className="text-sm font-serif text-black text-center">Jalan Medan Merdeka Barat No. 13-14, Jakarta Pusat, 10110</p>
                                                        <p className="text-xs font-serif italic text-zinc-500 text-center">Website: www.kemhan.go.id Email: ppid@kemhan.go.id</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Meta Info */}
                                            <div className="flex justify-between items-start text-sm mb-8">
                                                <div>
                                                    <table className="border-collapse">
                                                        <tbody>
                                                            <tr><td className="pr-4">Nomor</td><td className="pr-2">:</td><td>{mail.code || '...'}</td></tr>
                                                            <tr><td className="pr-4">Lampiran</td><td className="pr-2">:</td><td>{mail.attachments?.length || '-'} berkas</td></tr>
                                                            <tr><td className="pr-4">Perihal</td><td className="pr-2">:</td><td className="font-bold">{mail.subject}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="text-right">
                                                    <p>{mail.place || 'Jakarta'}, {mail.date}</p>
                                                </div>
                                            </div>

                                            {/* Recipient */}
                                            <div className="mb-10 text-sm">
                                                <p>Kepada Yth.</p>
                                                <p className="font-bold">{mail.recipient}</p>
                                                <p>di Tempat</p>
                                            </div>

                                            {/* Content */}
                                            <div className="prose prose-sm max-w-none text-black leading-relaxed text-justify font-serif min-h-[300px]">
                                                <div dangerouslySetInnerHTML={{ __html: mail.content || mail.description || '<i>Tidak ada konten surat.</i>' }} />
                                            </div>

                                            {/* Signatures */}
                                            {(() => {
                                                const processedApprovers = new Set<string>();
                                                return mail.signature_positions && Object.entries(mail.signature_positions).map(([stepId, pos]: [string, any]) => {
                                                    let stepApprover: any = mail.approvers?.find(a => a.order === parseInt(stepId));

                                                    // Fuzzy match if ID lookup fails
                                                    if (!stepApprover && mail.approvers) {
                                                        stepApprover = mail.approvers.find(a =>
                                                            (a.user_name && pos.name && a.user_name.toLowerCase() === pos.name.toLowerCase()) ||
                                                            (a.position && pos.jabatan && a.position.toLowerCase().includes(pos.jabatan.toLowerCase()))
                                                        );
                                                    }

                                                    if (!stepApprover && mail.sender && (mail.sender.user_name === pos.name || mail.sender.name === pos.name)) {
                                                        stepApprover = mail.sender;
                                                    }
                                                    const isApproved = stepApprover?.status === 'approved' || (mail.sender && (stepApprover === mail.sender || mail.sender.name === pos.name));

                                                    if (!isApproved) return null;

                                                    // Deduplication logic
                                                    const uniqueId = stepApprover.user_id ? `u-${stepApprover.user_id}` : (stepApprover.id ? `a-${stepApprover.id}` : (stepApprover === mail.sender ? 'sender' : null));
                                                    if (uniqueId && processedApprovers.has(uniqueId)) {
                                                        return null;
                                                    }
                                                    if (uniqueId) {
                                                        processedApprovers.add(uniqueId);
                                                    }

                                                    return (
                                                        <div
                                                            key={stepId}
                                                            className="absolute flex flex-col items-center justify-start w-[150px] min-h-[110px] p-2 text-center"
                                                            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                                        >
                                                            <div className="min-h-[3.5rem] flex flex-col items-center justify-center mb-1">
                                                                <p className="text-[10px] font-bold uppercase text-black leading-tight line-clamp-2">{pos.jabatan || stepApprover?.position || 'Pejabat'}</p>
                                                                <p className="text-[9px] font-semibold uppercase text-zinc-600 leading-tight line-clamp-1">{pos.unit || stepApprover?.unit || ''}</p>
                                                            </div>
                                                            <div className="h-10 w-full flex items-center justify-center my-0.5">
                                                                {stepApprover?.signature_url && (
                                                                    <img src={stepApprover.signature_url} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-center">
                                                                <p className="text-xs font-bold text-black underline underline-offset-2 w-full truncate px-1">{pos.name || stepApprover?.user_name || (stepApprover as any)?.name || '...'}</p>
                                                                <p className="text-[9px] text-zinc-800 font-medium leading-tight mt-0.5">{stepApprover?.rank || pos.rank || '-'}</p>
                                                                <p className="text-[9px] text-zinc-600 leading-tight">NIP. {stepApprover?.nip || pos.nip || '-'}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Attachments */}
                            {mail.attachments && mail.attachments.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                                        <Paperclip className="h-4 w-4 text-blue-500" />
                                        Lampiran ({mail.attachments.length})
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {mail.attachments.map((file) => (
                                            <a
                                                key={file.id}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
                                            >
                                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-zinc-200 truncate">{file.name}</p>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">{formatFileSize(file.size)}</p>
                                                </div>
                                                <Download className="h-3 w-3 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Approvers List */}
                        </div>

                        {/* Timeline Section (Fills remaining space on desktop, stacks on mobile) */}
                        <div className="flex-1 bg-[#1e1e1e] border-t border-zinc-800 min-h-0 flex flex-col relative z-0 mt-4 sm:mt-0">
                            {!hideTimeline && mail.approvers && mail.approvers.length > 0 && (
                                <>
                                    {/* Timeline Header (Static) */}
                                    <div className="shrink-0 p-4 border-b border-zinc-800/50 bg-[#1e1e1e] z-10 box-border sticky top-0">
                                        <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                            Timeline Approval
                                        </h3>
                                    </div>

                                    {/* Scrollable List */}
                                    <div className="flex-1 sm:overflow-y-auto p-4 pt-4 custom-scrollbar" style={{ contain: 'paint' }}>
                                        <div className="relative pl-4 space-y-6 pb-24 sm:pb-0">
                                            <div className="absolute left-[21px] top-3 bottom-0 w-px bg-zinc-800" />
                                            {mail.approvers.map((approver, i) => (
                                                <div key={i} className="relative flex gap-6 group overflow-hidden">
                                                    <div className={cn(
                                                        "relative h-10 w-10 rounded-xl border-2 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                                        approver.status === 'approved' ? "bg-emerald-950/50 border-emerald-900 text-emerald-500" :
                                                            approver.status === 'rejected' ? "bg-rose-950/50 border-rose-900 text-rose-500" :
                                                                approver.status === 'pending' ? "bg-amber-950/50 border-amber-900 text-amber-500" :
                                                                    "bg-zinc-900 border-zinc-800 text-zinc-600"
                                                    )}>
                                                        {approver.status === 'approved' ? <Check className="h-5 w-5" /> :
                                                            approver.status === 'rejected' ? <X className="h-5 w-5" /> :
                                                                <User className="h-5 w-5" />}
                                                        {approver.status === 'pending' && (
                                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 -mt-1.5">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                            <div>
                                                                <p className="text-base font-semibold text-zinc-200 capitalize">
                                                                    {approver.position.replace(/-/g, ' ')}
                                                                </p>
                                                                {approver.user_name && (
                                                                    <p className="text-sm text-zinc-500">
                                                                        {approver.user_name}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Badge variant="outline" className={cn(
                                                                "w-fit capitalize border-0 px-2.5 py-0.5 rounded-full text-xs font-semibold",
                                                                approver.status === 'approved' ? "bg-emerald-500/10 text-emerald-500" :
                                                                    approver.status === 'rejected' ? "bg-rose-500/10 text-rose-500" :
                                                                        approver.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                                                                            "bg-zinc-500/10 text-zinc-500"
                                                            )}>
                                                                {approver.status}
                                                            </Badge>
                                                        </div>

                                                        {approver.remarks && (
                                                            <div className="bg-zinc-900/50 rounded-lg p-3 text-sm text-zinc-400 border border-zinc-800/50">
                                                                <span className="text-zinc-500 text-xs uppercase tracking-wide font-semibold block mb-1">Catatan:</span>
                                                                {approver.remarks}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Dispositions List */}
                            {mail.dispositions && mail.dispositions.length > 0 && (
                                <DispositionList dispositions={mail.dispositions} />
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="shrink-0 z-50 bg-[#262626] border-t border-zinc-800 p-4 flex justify-between items-center gap-3 relative before:absolute before:bottom-full before:left-0 before:right-0 before:h-12 before:bg-gradient-to-t before:from-[#262626] before:via-[#262626]/90 before:to-transparent before:pointer-events-none before:z-50">
                        <div className="flex gap-2">
                            {(canApprove) && (
                                <>
                                    <Button
                                        onClick={() => setViewMode('approval')}
                                        className="bg-[#AC0021] hover:bg-[#8c001b] text-white gap-2 shadow-lg shadow-red-900/20"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Review & Sign
                                    </Button>
                                    <Button
                                        onClick={() => setApprovalAction('reject')}
                                        variant="outline"
                                        className="border-red-600/20 bg-red-500/5 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 gap-2 transition-colors"
                                    >
                                        <XCircle className="h-4 w-4" />
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="flex gap-2">

                            <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => onOpenChange(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog >

            <DispositionModal
                isOpen={isDispositionOpen}
                onClose={() => setIsDispositionOpen(false)}
                mail={mail}
            />

            <StaffDetailModal
                open={isStaffDetailOpen}
                onOpenChange={setIsStaffDetailOpen}
                staff={selectedStaff}
            />

            <AlertDialog open={!!approvalAction} onOpenChange={(open) => !open && setApprovalAction(null)}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {approvalAction === 'approve' ? 'Approve Letter' : 'Reject Letter'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            {approvalAction === 'approve'
                                ? 'Are you sure you want to approve this letter? You can add optional remarks below.'
                                : 'Are you sure you want to reject this letter? Please provide a reason for rejection.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                        <Label htmlFor="remarks" className="text-zinc-300 mb-2 block">
                            Remarks {approvalAction === 'reject' && <span className="text-rose-500">*</span>}
                        </Label>
                        <Textarea
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            placeholder={approvalAction === 'approve' ? "Optional remarks..." : "Reason for rejection..."}
                            className="bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-blue-500/20 min-h-[100px]"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white border-zinc-700">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleApproval({ remarks, signature_position: pendingSignature }, approvalAction!);
                            }}
                            disabled={isSubmitting || (approvalAction === 'reject' && !remarks.trim())}
                            className={cn(
                                "text-white",
                                approvalAction === 'approve'
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-rose-600 hover:bg-rose-700"
                            )}
                        >
                            {isSubmitting ? 'Processing...' : (approvalAction === 'approve' ? 'Confirm Approve' : 'Confirm Reject')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

