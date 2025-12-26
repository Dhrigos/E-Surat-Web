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
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DispositionModal from '@/components/DispositionModal';
import DispositionList from '@/components/DispositionList';
import ApprovalView from './ApprovalView'; // Import ApprovalView
import { SharedData } from '@/types';

interface Attachment {
    id: number;
    name: string;
    url: string;
    size: number;
    type: string;
}

interface Approver {
    user_id?: number;
    position: string;
    user_name?: string;
    status: 'pending' | 'approved' | 'rejected';
    order: number;
    remarks?: string;
}

interface Recipient {
    type: 'user' | 'division';
    id: string;
    name: string;
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
        sender?: string;
        type?: 'sent' | 'inbox';
        comments?: {
            id: number;
            user: { name: string };
            comment: string;
            created_at: string;
        }[];
    };
}

export default function MailDetail({ open, onOpenChange, mail }: MailDetailProps) {
    const { auth } = usePage<SharedData>().props;
    const [isDispositionOpen, setIsDispositionOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'detail' | 'approval'>('detail'); // New viewMode state
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingSignature, setPendingSignature] = useState<{ x: number; y: number } | null>(null);

    if (!mail) return null;

    const currentApprover = mail.approvers?.find(a => a.user_id === auth.user.id);
    const canApprove = currentApprover?.status === 'pending';

    console.log('Auth User ID:', auth.user.id);
    console.log('Mail Approvers:', mail.approvers);
    console.log('Current Approver:', currentApprover);
    console.log('Can Approve:', canApprove);

    const handleApproval = (data?: { remarks: string; signature_position: { x: number; y: number } | null }, actionType: 'approve' | 'reject' = 'approve') => {
        setIsSubmitting(true);

        // Determine action and remarks based on where it's called from
        const action = actionType || approvalAction || 'approve'; // Use passed action or state
        const finalRemarks = data?.remarks || remarks;
        const signaturePosition = data?.signature_position || pendingSignature || null;

        // Find the step_id for the current approver to save signature position correctly
        // ... (comments omitted for brevity) ...

        router.put(route('letters.update-status', mail.id), {
            status: action === 'approve' ? 'approved' : 'rejected',
            remarks: finalRemarks,
            signature_position: signaturePosition,
            step_id: currentApprover?.position // Using approver_id/jabatan_id as key for now
        }, {
            onSuccess: () => {
                setApprovalAction(null);
                setRemarks('');
                setPendingSignature(null);
                setViewMode('detail'); // Reset view mode
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

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[90vw] h-[95vh] md:h-[90vh] p-0 gap-0 bg-[#09090b] border-zinc-800 text-zinc-100 overflow-hidden flex flex-col [&>button]:hidden">
                    {viewMode === 'approval' && currentApprover ? (
                        <ApprovalView
                            mail={mail}
                            approver={currentApprover}
                            onApprove={(data) => {
                                setRemarks(data.remarks);
                                setPendingSignature(data.signature_position);
                                setApprovalAction('approve');
                            }}
                            onReject={(r) => {
                                setRemarks(r);
                                setPendingSignature(null);
                                setApprovalAction('reject');
                            }}
                            onCancel={() => setViewMode('detail')}
                            isSubmitting={isSubmitting}
                        />
                    ) : (
                        <>
                            {/* Mobile-friendly Header */}
                            <div className="flex-none p-6 md:p-8 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                                <div className="flex flex-col gap-6">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex items-center gap-3 text-sm text-zinc-500 mb-2">
                                                <span className="font-mono">
                                                    SRT/{mail.date.split('-')[0]}/{String(mail.id).padStart(4, '0')}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    {mail.date}
                                                </span>
                                            </div>
                                            <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight break-words tracking-tight">
                                                {mail.subject}
                                            </DialogTitle>
                                            <DialogDescription className="text-zinc-400">
                                                Detail view of letter #{mail.id} - {mail.subject}
                                            </DialogDescription>
                                        </div>
                                        <DialogClose asChild>
                                            <Button variant="ghost" size="icon" className="h-10 w-10 -mr-2 text-zinc-400 hover:text-white">
                                                <XCircle className="h-6 w-6" />
                                            </Button>
                                        </DialogClose>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge variant="outline" className={cn("capitalize font-medium px-3 py-1 text-sm", getStatusColor(mail.status))}>
                                            {mail.status}
                                        </Badge>
                                        <Badge variant="outline" className={cn("capitalize font-medium px-3 py-1 text-sm", getPriorityColor(mail.priority))}>
                                            {mail.priority} Priority
                                        </Badge>
                                        <Badge variant="outline" className="bg-zinc-800/50 border-zinc-700 text-zinc-400 capitalize px-3 py-1 text-sm">
                                            {mail.category}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="p-6 md:p-8 space-y-10">
                                    {/* Sender/Recipient Card */}
                                    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50">
                                        <div className="flex-1 flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/20">
                                                <User className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-1">
                                                    {mail.sender ? 'From' : 'To'}
                                                </p>
                                                <p className="text-lg font-semibold text-zinc-200">
                                                    {mail.sender || mail.recipient}
                                                </p>
                                            </div>
                                        </div>
                                        {mail.recipients_list && mail.recipients_list.length > 0 && (
                                            <>
                                                <div className="hidden md:block w-px bg-zinc-800" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-zinc-500 uppercase tracking-wider font-semibold mb-3">
                                                        Recipients ({mail.recipients_list.length})
                                                    </p>
                                                    <div className="flex -space-x-3 overflow-hidden">
                                                        {mail.recipients_list.slice(0, 5).map((r, i) => (
                                                            <div key={i} className="h-10 w-10 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center text-sm font-medium text-zinc-400" title={r.name}>
                                                                {r.name.charAt(0).toUpperCase()}
                                                            </div>
                                                        ))}
                                                        {mail.recipients_list.length > 5 && (
                                                            <div className="h-10 w-10 rounded-full bg-zinc-800 border-2 border-[#09090b] flex items-center justify-center text-sm font-medium text-zinc-400">
                                                                +{mail.recipients_list.length - 5}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>


                                    {/* Attachments Grid */}
                                    {mail.attachments && mail.attachments.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="text-base font-semibold text-zinc-400 flex items-center gap-2.5">
                                                <Paperclip className="h-5 w-5" />
                                                Attachments ({mail.attachments.length})
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {mail.attachments.map((file, i) => (
                                                    <div
                                                        key={i}
                                                        onClick={() => window.open(file.url, '_blank')}
                                                        className="group relative flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer overflow-hidden"
                                                    >
                                                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                                                            <FileText className="h-6 w-6 text-blue-400" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-base font-medium text-zinc-200 truncate group-hover:text-blue-400 transition-colors">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-sm text-zinc-500">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                        <Download className="h-5 w-5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Disposition List */}
                                    {mail.dispositions && mail.dispositions.length > 0 && (
                                        <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                                            <h3 className="text-base font-semibold text-zinc-400 flex items-center gap-2.5">
                                                <Share2 className="h-5 w-5" />
                                                Disposisi
                                            </h3>
                                            <DispositionList dispositions={mail.dispositions} />
                                        </div>
                                    )}

                                    {/* Approval Timeline - Vertical for Mobile */}
                                    {mail.approvers && mail.approvers.length > 0 && (
                                        <div className="space-y-6 pt-6 border-t border-zinc-800/50">
                                            <h3 className="text-base font-semibold text-zinc-400 flex items-center gap-2.5">
                                                <CheckCircle2 className="h-5 w-5" />
                                                Approval Timeline
                                            </h3>
                                            <div className="relative pl-5 space-y-10">
                                                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-zinc-800" />

                                                {mail.approvers.filter((approver, index, array) => {
                                                    // Show if approved or rejected
                                                    if (approver.status === 'approved' || approver.status === 'rejected') return true;

                                                    // Show if it's pending AND it's the FIRST pending item in the list
                                                    // (assuming array is sorted by order, which it is from backend)
                                                    const firstPendingIndex = array.findIndex(a => a.status === 'pending');
                                                    return index === firstPendingIndex;
                                                }).map((approver, i) => (
                                                    <div key={i} className="relative flex gap-6 group">
                                                        <div className={cn(
                                                            "relative z-10 h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 bg-[#09090b] transition-colors mt-0.5",
                                                            approver.status === 'approved' ? 'border-emerald-500 bg-emerald-500/10' :
                                                                approver.status === 'rejected' ? 'border-rose-500 bg-rose-500/10' :
                                                                    'border-zinc-700 bg-zinc-800'
                                                        )}>
                                                            {approver.status === 'approved' && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                                                            {approver.status === 'rejected' && <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />}
                                                            {approver.status === 'pending' && <div className="h-2.5 w-2.5 rounded-full bg-zinc-500 animate-pulse" />}
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
                                                                    "w-fit text-xs px-2.5 py-0.5 h-6 border-0",
                                                                    approver.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                        approver.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' :
                                                                            'bg-amber-500/10 text-amber-500'
                                                                )}>
                                                                    {approver.status}
                                                                </Badge>
                                                            </div>
                                                            {approver.remarks && (
                                                                <div className="mt-3 text-sm text-zinc-400 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 italic relative">
                                                                    <div className="absolute -top-1.5 left-5 w-3 h-3 bg-zinc-900 border-t border-l border-zinc-800 transform rotate-45" />
                                                                    "{approver.remarks}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile-friendly Footer Actions */}
                            <div className="flex-none p-6 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                                <div className="grid grid-cols-2 gap-4 md:flex md:justify-end">
                                    {canApprove && (
                                        <Button
                                            size="lg"
                                            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white h-12 text-base"
                                            onClick={() => {
                                                setViewMode('approval');
                                            }}
                                        >
                                            Next
                                            <ArrowRight className="h-5 w-5 ml-2.5" />
                                        </Button>
                                    )}
                                    {mail.status !== 'approved' && !canApprove && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full md:w-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12 text-base"
                                            onClick={() => setIsDispositionOpen(true)}
                                        >
                                            <Send className="h-5 w-5 mr-2.5" />
                                            Disposisi
                                        </Button>
                                    )}
                                    {!canApprove && (
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="w-full md:w-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12 text-base"
                                            onClick={() => router.visit(route('letters.create', { reply_to: mail.id }))}
                                        >
                                            <Share2 className="h-5 w-5 mr-2.5" />
                                            Reply
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="w-full md:w-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12 text-base"
                                        onClick={() => window.open(`/letters/${mail.id}/export-pdf`, '_blank')}
                                    >
                                        <Download className="h-5 w-5 mr-2.5" />
                                        Export PDF
                                    </Button>
                                    {!canApprove && (
                                        <>
                                            <Button variant="outline" size="lg" className="w-full md:w-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12 text-base">
                                                <Edit className="h-5 w-5 mr-2.5" />
                                                Edit
                                            </Button>
                                            <Button variant="outline" size="lg" className="w-full md:w-auto border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white h-12 text-base">
                                                <Archive className="h-5 w-5 mr-2.5" />
                                                Archive
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>

                <DispositionModal
                    isOpen={isDispositionOpen}
                    onClose={() => setIsDispositionOpen(false)}
                    letterId={mail.id}
                />
            </Dialog>

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

