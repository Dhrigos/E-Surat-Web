import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, FileText, ArrowLeft, ZoomIn, ZoomOut, XCircle } from 'lucide-react';

interface ApprovalViewProps {
    mail: any;
    approver: any;
    onApprove: (data: { remarks: string; signature_position: any }) => void;
    onReject: (remarks: string) => void;
    onCancel: () => void;
    readonly?: boolean;
    isSubmitting?: boolean; // Add isSubmitting prop
}

export default function ApprovalView({
    mail,
    approver,
    onApprove,
    onReject,
    onCancel,
    readonly = false,
    isSubmitting = false // Default to false
}: ApprovalViewProps) {
    const [signaturePosition, setSignaturePosition] = useState<{ x: number; y: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [dragSource, setDragSource] = useState<'sidebar' | 'placed' | null>(null);
    const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    // Removed local isSubmitting state

    // Determine if view should be read-only
    const isReadOnly = readonly || approver.status === 'approved' || approver.status === 'rejected';

    // --- Mouse Drag Handlers (Desktop) ---
    const handleDragStart = (e: React.DragEvent, source: 'sidebar' | 'placed') => {
        if (isReadOnly) return; // Prevent drag if read-only
        e.dataTransfer.setData('text/plain', 'signature');
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
        setDragSource(source);

        if (source === 'placed') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        } else {
            // Standardize grab offset for 200x100 box
            setDragOffset({ x: 100, y: 50 });
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setDragSource(null);
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate Top-Left Position
        const targetX = e.clientX - containerRect.left - dragOffset.x;
        const targetY = e.clientY - containerRect.top - dragOffset.y;

        // Convert to percentage
        let xPercent = (targetX / containerRect.width) * 100;
        let yPercent = (targetY / containerRect.height) * 100;

        // Snap to placeholder if close (within 5%)
        if (mail.signature_positions) {
            for (const pos of Object.values(mail.signature_positions) as any[]) {
                if (Math.abs(pos.x - xPercent) < 5 && Math.abs(pos.y - yPercent) < 5) {
                    xPercent = pos.x;
                    yPercent = pos.y;
                    break;
                }
            }
        }

        setSignaturePosition({ x: xPercent, y: yPercent });
    };


    // --- Touch Handlers (Mobile) ---
    const handleTouchStart = (e: React.TouchEvent, source: 'sidebar' | 'placed') => {
        // Prevent default to stop scrolling/zooming while dragging
        // e.preventDefault(); // Note: calling preventDefault on touchstart might block click events if not careful, but for a drag handle it's usually okay.
        // However, React synthetic events might warn. Better to use touch-action: none in CSS.

        const touch = e.touches[0];
        setIsDragging(true);
        setDragSource(source);
        setGhostPosition({ x: touch.clientX, y: touch.clientY });

        if (source === 'placed') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setDragOffset({
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            });
        } else {
            setDragOffset({ x: 75, y: 40 }); // Center grab for 150x80 box
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        // e.preventDefault(); // Important to prevent scrolling
        const touch = e.touches[0];
        setGhostPosition({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        setDragSource(null);
        setGhostPosition(null);

        const touch = e.changedTouches[0];
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();

        // Check if dropped within container
        if (
            touch.clientX >= containerRect.left &&
            touch.clientX <= containerRect.right &&
            touch.clientY >= containerRect.top &&
            touch.clientY <= containerRect.bottom
        ) {
            // Calculate Top-Left Position
            const targetX = touch.clientX - containerRect.left - dragOffset.x;
            const targetY = touch.clientY - containerRect.top - dragOffset.y;

            let xPercent = (targetX / containerRect.width) * 100;
            let yPercent = (targetY / containerRect.height) * 100;

            // Snap to placeholder if close (within 5%)
            if (mail.signature_positions) {
                for (const pos of Object.values(mail.signature_positions) as any[]) {
                    if (Math.abs(pos.x - xPercent) < 5 && Math.abs(pos.y - yPercent) < 5) {
                        xPercent = pos.x;
                        yPercent = pos.y;
                        break;
                    }
                }
            }

            setSignaturePosition({ x: xPercent, y: yPercent });
        }
    };

    // Add global touch move/end listeners when dragging to handle movement outside elements
    useEffect(() => {
        if (isDragging) {
            const preventScroll = (e: TouchEvent) => e.preventDefault();
            document.addEventListener('touchmove', preventScroll, { passive: false });
            return () => document.removeEventListener('touchmove', preventScroll);
        }
    }, [isDragging]);


    // Find target position for the current user to validate placement
    const targetPosEntry = mail.signature_positions ? Object.entries(mail.signature_positions).find(([stepId, pos]: [string, any]) => {
        return parseInt(stepId) === approver.order ||
            (approver.user_name && pos.name && approver.user_name.toLowerCase().includes(pos.name.toLowerCase()));
    }) : null;
    const targetPos = targetPosEntry ? targetPosEntry[1] as any : null;

    const isCorrectlyPlaced = signaturePosition && targetPos &&
        Math.abs(signaturePosition.x - targetPos.x) < 0.1 &&
        Math.abs(signaturePosition.y - targetPos.y) < 0.1;

    const handleApproveClick = () => {
        if (!isCorrectlyPlaced) return;
        onApprove({ remarks: '', signature_position: signaturePosition });
    };

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-zinc-100"
            onTouchMove={isDragging ? handleTouchMove : undefined}
            onTouchEnd={isDragging ? handleTouchEnd : undefined}
        >
            {/* Header */}
            <div className="flex-none p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onCancel} className="text-zinc-400 hover:text-white">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold">Approval & Tanda Tangan</h2>
                    <p className="text-sm text-zinc-400">
                        Review surat dan tempatkan tanda tangan Anda sebelum menyetujui.
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
                {/* Sidebar / Controls (Moved to Left) */}
                <div className="w-full md:w-80 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-20">
                    {/* Zoom Controls */}
                    <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Zoom</span>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                                disabled={zoom <= 0.5}
                                className="h-8 w-8 p-0 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="text-sm font-medium w-[3rem] text-center text-zinc-300">
                                {Math.round(zoom * 100)}%
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                                disabled={zoom >= 2}
                                className="h-8 w-8 p-0 bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {isReadOnly ? (
                        <div className="mt-auto p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-full ${approver.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                                    {approver.status === 'approved' ? <Check className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-200">
                                        {approver.status === 'approved' ? 'Surat Disetujui' : 'Surat Ditolak'}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Anda telah {approver.status === 'approved' ? 'menyetujui' : 'menolak'} surat ini.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {!signaturePosition && (
                                <div className="space-y-3">
                                    <Label className="text-zinc-400 font-medium">Tanda Tangan Anda</Label>
                                    <div
                                        className="p-4 bg-zinc-800/50 border border-zinc-700 border-dashed rounded-xl cursor-move hover:border-blue-500 hover:bg-blue-500/10 transition-all flex flex-col items-center gap-3 touch-none group"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, 'sidebar')}
                                        onTouchStart={(e) => handleTouchStart(e, 'sidebar')}
                                    >
                                        <div className="h-24 w-full bg-white rounded-lg flex items-center justify-center overflow-hidden border border-zinc-600">
                                            {approver.signature_url ? (
                                                <img src={approver.signature_url} alt="Sig" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 text-zinc-400">
                                                    <FileText className="h-8 w-8" />
                                                    <span className="text-xs">Tidak ada tanda tangan</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-zinc-200 uppercase group-hover:text-blue-400 transition-colors">{approver.position.replace(/-/g, ' ')}</p>
                                            <p className="text-xs text-zinc-500 mt-1">Drag kartu ini ke dokumen</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isCorrectlyPlaced && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    <div className="font-medium">
                                        Posisi Tanda Tangan Sesuai
                                    </div>
                                </div>
                            )}


                            <div className="mt-auto space-y-3 pt-6 border-t border-zinc-800">
                                <Button
                                    className="w-full bg-[#AC0021] hover:bg-[#8c001b] text-white h-11 font-medium shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handleApproveClick}
                                    disabled={isSubmitting || !isCorrectlyPlaced}
                                >
                                    {isSubmitting ? 'Memproses...' : 'Setujui & Tanda Tangan'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-colors h-11"
                                    onClick={() => onReject('')}
                                    disabled={isSubmitting}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Tolak Surat
                                </Button>
                            </div>
                        </>
                    )}
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-[#1c1c1c] overflow-auto relative flex justify-center p-4 sm:p-8">
                    {/* Ghost Element for Mobile Drag */}
                    {isDragging && ghostPosition && (
                        <div
                            className="fixed z-50 pointer-events-none opacity-80"
                            style={{
                                left: ghostPosition.x - (dragOffset.x || 75),
                                top: ghostPosition.y - (dragOffset.y || 40),
                                width: '150px'
                            }}
                        >
                            <div className="p-2 border-2 border-dashed border-blue-500 bg-white/90 rounded text-center flex flex-col items-center justify-start shadow-2xl">
                                <div className="min-h-[3.5rem] flex flex-col items-center justify-center mb-1">
                                    <p className="text-[10px] font-bold uppercase text-black leading-tight text-center line-clamp-2">{approver.position.replace(/-/g, ' ')}</p>
                                    <p className="text-[9px] font-semibold uppercase text-zinc-500 leading-tight line-clamp-1">{approver.unit || ''}</p>
                                </div>
                                <div className="h-10 w-full border border-zinc-200 border-dashed my-1 flex items-center justify-center text-[10px] text-zinc-400 font-sans"></div>
                                <div className="flex flex-col items-center w-full">
                                    <p className="text-xs font-bold text-black underline underline-offset-2 leading-tight w-full truncate px-1">{approver.user_name || 'Anda'}</p>
                                    <p className="text-[9px] text-zinc-800 font-medium leading-tight mt-0.5 truncate w-full px-1">{approver.rank || '-'}</p>
                                    <p className="text-[9px] text-zinc-600 leading-tight truncate w-full px-1">NIP. {approver.nip || '-'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div
                        className="bg-white text-black shadow-2xl relative transition-transform origin-top mx-auto"
                        style={{
                            width: '210mm',
                            minHeight: '297mm', // A4 height
                            transform: `scale(${zoom})`,
                            padding: '2.5cm 2.5cm 2.5cm 2.5cm',
                            boxSizing: 'border-box'
                        }}
                        // @ts-ignore
                        ref={containerRef}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {/* Header Kop Surat */}
                        <div className="text-center mb-4 relative">
                            <div className="border-b-[3px] border-black pb-1 mb-2 relative min-h-[100px] flex flex-col justify-center">
                                <div className="absolute left-10 top-[44%] -translate-y-1/2 h-24 w-24">
                                    <img
                                        src="/images/BADAN-CADANGAN-NASIONAL.png"
                                        alt="Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <div className="w-full pl-32 pr-4 space-y-0.5">
                                    <h3 className="text-md font-bold uppercase tracking-[0.1em] font-serif text-black">KEMENTERIAN PERTAHANAN RI</h3>
                                    <h1 className="text-xl font-black uppercase tracking-[0.1em] font-serif leading-tight text-black whitespace-nowrap">BADAN CADANGAN NASIONAL</h1>
                                    <p className="text-sm font-serif text-black">Jalan Medan Merdeka Barat No. 13-14, Jakarta Pusat, 10110</p>
                                    <p className="text-xs font-serif italic text-zinc-500">Website: www.kemhan.go.id Email: ppid@kemhan.go.id</p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="mb-8 font-serif">
                            <div className="flex justify-between items-start mb-8 text-sm">
                                <div>
                                    <p>Nomor: {mail.letter_number || mail.code || '...'}</p>
                                    <p>Lampiran: {mail.attachments?.length || '-'} berkas</p>
                                    <p className="mt-2">Perihal: <span className="font-bold">{mail.subject}</span></p>
                                </div>
                                <div className="text-right">
                                    <p>{mail.place || 'Jakarta'}, {mail.date}</p>
                                </div>
                            </div>
                            <div className="mb-8 text-sm">
                                <p>Kepada Yth.</p>
                                <p className="font-bold">{mail.recipient}</p>
                                <p>di Tempat</p>
                            </div>

                            <div className="whitespace-pre-wrap text-sm leading-relaxed text-justify min-h-[300px]">
                                {mail.content}
                            </div>
                        </div>

                        {/* Existing Signatures */}
                        {(() => {
                            const processedApprovers = new Set<number>();
                            return mail.signature_positions && Object.entries(mail.signature_positions).map(([stepId, pos]: [string, any]) => {
                                let stepApprover = mail.approvers.find((a: any) => a.order === parseInt(stepId));
                                let isApproved = stepApprover?.status === 'approved';

                                const senderName = mail.sender?.user_name || mail.sender?.name || '';
                                const posName = pos.name || '';

                                // Try to match stepApprover by ID first
                                if (!stepApprover) {
                                    stepApprover = mail.approvers.find((a: any) =>
                                        (a.user_name && pos.name && a.user_name.toLowerCase() === pos.name.toLowerCase()) ||
                                        (a.position && pos.jabatan && a.position.toLowerCase().includes(pos.jabatan.toLowerCase()))
                                    );
                                }

                                if (!stepApprover && mail.sender && senderName && posName &&
                                    (senderName.toLowerCase().includes(posName.toLowerCase()) || posName.toLowerCase().includes(senderName.toLowerCase()))) {
                                    stepApprover = mail.sender;
                                    isApproved = true;
                                }

                                const isCurrentUsersSlot = Math.abs(pos.x - (signaturePosition?.x ?? -100)) < 0.1 && Math.abs(pos.y - (signaturePosition?.y ?? -100)) < 0.1;

                                if (isCurrentUsersSlot && isCorrectlyPlaced) {
                                    return null;
                                }

                                // If no valid approver is found and it's not the sender, do not render (prevents ghost/default blocks)
                                if (!stepApprover) {
                                    return null;
                                }

                                // Deduplication: If we've already rendered this approver, skip (unless it's a distinct position far away? Assume duplicates are errors for now)
                                // We use a unique ID for the approver (user_id or approver id)
                                const uniqueId = stepApprover.user_id || stepApprover.id || (stepApprover === mail.sender ? 'sender' : null);
                                if (uniqueId && processedApprovers.has(uniqueId)) {
                                    return null;
                                }
                                if (uniqueId) {
                                    processedApprovers.add(uniqueId);
                                }


                                return (
                                    <div
                                        key={stepId}
                                        className={`absolute ${isApproved ? '' : 'border-2 border-dashed border-gray-300 bg-gray-50/50'} rounded flex flex-col items-center justify-start w-[150px] min-h-[110px] p-2 pointer-events-none`}
                                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                    >
                                        <div className="min-h-[3.5rem] flex flex-col items-center justify-center mb-1">
                                            <p className="text-[10px] font-bold uppercase text-black leading-tight text-center line-clamp-2">{pos.jabatan || stepApprover?.position || 'Pejabat'}</p>
                                            <p className="text-[9px] font-semibold uppercase text-zinc-600 leading-tight line-clamp-1">{pos.unit || stepApprover?.unit || ''}</p>
                                        </div>

                                        <div className="relative w-full h-10 my-0.5 flex items-center justify-center">
                                            {isApproved && stepApprover?.signature_url && (
                                                <img
                                                    src={stepApprover.signature_url}
                                                    alt="Signature"
                                                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                                                />
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center w-full">
                                            <p className="text-xs font-bold text-black underline underline-offset-2 w-full truncate px-1">{pos.name || stepApprover?.user_name || stepApprover?.name || '...'}</p>
                                            <p className="text-[9px] text-zinc-800 font-medium leading-tight mt-0.5 w-full truncate px-1">{stepApprover?.rank || pos.rank || '-'}</p>
                                            <p className="text-[9px] text-zinc-600 leading-tight w-full truncate px-1">NIP. {stepApprover?.nip || pos.nip || '-'}</p>
                                        </div>
                                    </div>
                                );
                            });
                        })()}

                        {signaturePosition && (
                            <div
                                className={`absolute cursor-move border-2 ${isCorrectlyPlaced ? 'border-transparent' : 'border-blue-500 border-dashed bg-blue-50/20'} rounded flex flex-col items-center justify-start w-[150px] min-h-[110px] p-2 touch-none z-10 group`}
                                style={{ left: `${signaturePosition.x}%`, top: `${signaturePosition.y}%` }}
                                draggable
                                onDragStart={(e) => handleDragStart(e, 'placed')}
                                onTouchStart={(e) => handleTouchStart(e, 'placed')}
                            >
                                <div className="min-h-[3.5rem] flex flex-col items-center justify-center mb-1">
                                    <p className="text-[10px] font-bold uppercase text-black leading-tight text-center line-clamp-2">{approver.position.replace(/-/g, ' ')}</p>
                                    <p className="text-[9px] font-semibold uppercase text-zinc-500 leading-tight line-clamp-1">{approver.unit || ''}</p>
                                </div>

                                <div className="relative w-full h-10 my-0.5 flex items-center justify-center">
                                    {approver.signature_url ? (
                                        <img src={approver.signature_url} alt="Signature" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                                    ) : (
                                        <div className="w-full h-full border border-dashed border-gray-400 rounded flex items-center justify-center">
                                            <span className="text-[10px] text-gray-400 font-sans">TTD</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center w-full">
                                    <p className="text-xs font-bold text-black underline underline-offset-2 w-full truncate px-1">{approver.user_name || 'Anda'}</p>
                                    <p className="text-[9px] text-zinc-800 font-medium leading-tight mt-0.5 w-full truncate px-1">{approver.rank || '-'}</p>
                                    <p className="text-[9px] text-zinc-600 leading-tight w-full truncate px-1">NIP. {approver.nip || '-'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
