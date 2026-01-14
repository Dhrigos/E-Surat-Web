import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
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
    ArrowRight
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
    nip?: string;
    nik?: string;
    join_date?: string;
    status?: string;
    role?: string;
    profile_photo_url?: string;
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

export default function MailDetail({ open, onOpenChange, mail, hideTimeline = false }: MailDetailProps) {
    const { auth } = usePage<SharedData>().props;
    const [isDispositionOpen, setIsDispositionOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'detail' | 'approval'>('detail');
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingSignature, setPendingSignature] = useState<{ x: number; y: number } | null>(null);

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
            jabatan: staff.jabatan || 'Unknown Position',
            pangkat: staff.pangkat || '-',
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

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="w-full sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-zinc-100 p-0 gap-0">
                    <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                                {mail.subject}
                                <Badge variant="outline" className={`${getStatusColor(mail.status)} border-0 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide`}>
                                    {mail.status}
                                </Badge>
                                <Badge variant="outline" className={`${getPriorityColor(mail.priority)} border-0 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide`}>
                                    {mail.priority}
                                </Badge>
                            </DialogTitle>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <span className="uppercase tracking-wider font-medium text-xs bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-500">
                                    {mail.category}
                                </span>
                                <span>&bull;</span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5" />
                                    {mail.date}
                                </span>
                            </div>
                        </div>
                        <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors">
                            <X className="h-5 w-5" />
                        </DialogClose>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Sender/Recipient Card */}
                        <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                            <div className="flex-1 flex items-center gap-5">
                                {mail.sender ? (
                                    <div
                                        className="flex items-center gap-5 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => handleStaffClick(mail.sender)}
                                    >
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/20 overflow-hidden">
                                            {mail.sender.profile_photo_url ? (
                                                <img src={mail.sender.profile_photo_url} alt={mail.sender.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-7 w-7 text-white" />
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
                                        <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-3">
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

                        {/* Letter Content */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                Isi Surat
                            </h3>
                            <div className="prose prose-invert max-w-none p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 text-zinc-300 leading-relaxed">
                                <div dangerouslySetInnerHTML={{ __html: mail.content || mail.description || '<i>Tidak ada konten surat.</i>' }} />
                            </div>
                        </div>

                        {/* Attachments */}
                        {mail.attachments && mail.attachments.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                                    <Paperclip className="h-5 w-5 text-blue-500" />
                                    Lampiran ({mail.attachments.length})
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {mail.attachments.map((file) => (
                                        <a
                                            key={file.id}
                                            href={file.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
                                        >
                                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FileText className="h-5 w-5" />
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

                        {/* Approvers List */}
                        {!hideTimeline && mail.approvers && mail.approvers.length > 0 && (
                            <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                                <h3 className="text-lg font-bold text-zinc-200 flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                    Timeline Approval
                                </h3>
                                <div className="relative pl-5 space-y-10">
                                    <div className="absolute left-[27px] top-4 bottom-4 w-px bg-zinc-800" />
                                    {mail.approvers.map((approver, i) => (
                                        <div key={i} className="relative flex gap-6 group">
                                            <div className={cn(
                                                "relative z-10 h-14 w-14 rounded-2xl border-4 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                                                approver.status === 'approved' ? "bg-emerald-950/50 border-emerald-900 text-emerald-500 shadow-lg shadow-emerald-900/20" :
                                                    approver.status === 'rejected' ? "bg-rose-950/50 border-rose-900 text-rose-500 shadow-lg shadow-rose-900/20" :
                                                        approver.status === 'pending' ? "bg-amber-950/50 border-amber-900 text-amber-500 shadow-lg shadow-amber-900/20" :
                                                            "bg-zinc-900 border-zinc-800 text-zinc-600"
                                            )}>
                                                {approver.status === 'approved' ? <Check className="h-6 w-6" /> :
                                                    approver.status === 'rejected' ? <X className="h-6 w-6" /> :
                                                        <User className="h-6 w-6" />}
                                                {approver.status === 'pending' && (
                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 -mt-1.5">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                                    <div
                                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => handleStaffClick(approver)}
                                                    >
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
                        )}

                        {/* Dispositions List */}
                        {mail.dispositions && mail.dispositions.length > 0 && (
                            <DispositionList dispositions={mail.dispositions} />
                        )}

                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 z-10 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 p-6 flex justify-between items-center gap-4">
                        <div className="flex gap-2">
                            {(canApprove) && (
                                <>
                                    <Button
                                        onClick={() => setApprovalAction('approve')}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Approve
                                    </Button>
                                    <Button
                                        onClick={() => setApprovalAction('reject')}
                                        variant="destructive"
                                        className="gap-2"
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
            </Dialog>

            <DispositionModal
                isOpen={isDispositionOpen}
                onClose={() => setIsDispositionOpen(false)}
                letterId={mail.id}
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

