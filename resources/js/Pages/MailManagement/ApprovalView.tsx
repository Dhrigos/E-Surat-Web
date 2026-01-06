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
            // For sidebar, center the stamp (approx 150x80)
            setDragOffset({ x: 75, y: 40 });
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

        // Calculate position relative to container, accounting for drag offset
        const x = e.clientX - containerRect.left - dragOffset.x;
        const y = e.clientY - containerRect.top - dragOffset.y;

        // Convert to percentage
        let xPercent = (x / containerRect.width) * 100;
        let yPercent = (y / containerRect.height) * 100;

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
            setDragOffset({ x: 75, y: 40 });
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
            const x = touch.clientX - containerRect.left - dragOffset.x;
            const y = touch.clientY - containerRect.top - dragOffset.y;

            let xPercent = (x / containerRect.width) * 100;
            let yPercent = (y / containerRect.height) * 100;

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


    const handleApproveClick = () => {
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
                {/* Ghost Element for Mobile Drag */}
                {isDragging && ghostPosition && (
                    <div
                        className="fixed z-50 pointer-events-none opacity-80"
                        style={{
                            left: ghostPosition.x - dragOffset.x,
                            top: ghostPosition.y - dragOffset.y,
                            width: '150px'
                        }}
                    >
                        <div className={`border-2 border-dashed border-blue-500 bg-blue-50/50 rounded text-center min-w-[150px] p-2`}>
                            {approver.signature_url ? (
                                <img src={approver.signature_url} alt="Signature" className="w-auto h-auto object-contain max-h-[60px] mx-auto" />
                            ) : (
                                <>
                                    <p className="text-xs font-semibold uppercase text-black">{approver.position.replace(/-/g, ' ')}</p>
                                    <div className="h-12"></div>
                                    <p className="text-xs font-bold underline text-black">{approver.user_name || 'Anda'}</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Preview Area */}
                <div className="flex-1 overflow-auto p-4 md:p-6 bg-zinc-900/30 custom-scrollbar">
                    <div className="flex flex-col items-center space-y-4 min-w-fit px-4">
                        <div
                            ref={containerRef}
                            className="bg-white text-black p-8 shadow-sm border min-h-[800px] relative w-[210mm] transition-all duration-200"
                            style={{ zoom: zoom } as React.CSSProperties}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {/* Header (Simplified for Preview) */}
                            <div className="text-center mb-8 relative">
                                <div className="border-b-4 border-black pb-4 mb-4">
                                    <h3 className="text-lg font-bold uppercase tracking-wide">PEMERINTAH KABUPATEN CONTOH</h3>
                                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-1">DINAS KOMUNIKASI DAN INFORMATIKA</h2>
                                    <p className="text-sm font-medium">Jalan Jenderal Sudirman No. 123, Kota Contoh, 12345</p>
                                </div>
                                <h2 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4 mb-6">SURAT DINAS</h2>
                                {/* ... Metadata ... */}
                                <div className="flex justify-between items-start text-sm mb-4">
                                    <div className="text-left">
                                        <table className="border-collapse">
                                            <tbody>
                                                <tr><td className="pr-2">Nomor</td><td>: ...</td></tr>
                                                <tr><td className="pr-2">Perihal</td><td className="font-bold">: {mail.subject}</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="text-right">
                                        <p>{mail.date}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="whitespace-pre-wrap text-sm leading-relaxed mb-12 min-h-[200px]">
                                {mail.content}
                            </div>

                            {/* Existing Signatures (Placeholder logic) */}
                            {mail.signature_positions && Object.entries(mail.signature_positions).map(([stepId, pos]: [string, any]) => {
                                // Find the approver for this step
                                // Find the approver for this step
                                const stepApprover = mail.approvers.find((a: any) => a.order === parseInt(stepId));
                                const isApproved = stepApprover?.status === 'approved';

                                return (
                                    <div
                                        key={stepId}
                                        className={`absolute ${isApproved ? '' : 'border-2 border-dashed border-gray-400 bg-gray-50/50'} p-2 rounded text-center min-w-[150px] pointer-events-none flex flex-col justify-between`}
                                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                    >
                                        <p className="text-[10px] font-semibold uppercase text-gray-600">{pos.jabatan || 'Posisi Tanda Tangan'}</p>
                                        <div className="h-12 flex items-center justify-center relative">
                                            {isApproved && stepApprover?.signature_url && (
                                                <img
                                                    src={stepApprover.signature_url}
                                                    alt="Signature"
                                                    className="absolute inset-0 w-full h-full object-contain"
                                                />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-800">{pos.name || '...'}</p>
                                    </div>
                                );
                            })}

                            {/* Current User's Signature (Dropped) */}
                            {signaturePosition && (
                                <div
                                    className={`absolute cursor-move border-2 border-dashed border-blue-500 bg-blue-50/50 rounded text-center touch-none min-w-[150px] p-2`}
                                    style={{ left: `${signaturePosition.x}%`, top: `${signaturePosition.y}%` }}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, 'placed')}
                                    onTouchStart={(e) => handleTouchStart(e, 'placed')}
                                >
                                    <p className="text-xs font-semibold uppercase">{approver.position.replace(/-/g, ' ')}</p>
                                    <div className="h-12 flex items-center justify-center relative">
                                        {approver.signature_url ? (
                                            <img src={approver.signature_url} alt="Signature" className="absolute inset-0 w-full h-full object-contain" />
                                        ) : (
                                            <div className="h-full w-full border border-dashed border-blue-300 rounded bg-blue-50/50"></div>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold underline">{approver.user_name || 'Anda'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Controls */}
                {/* Sidebar / Controls */}
                <div className="w-full md:w-80 bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col gap-6 overflow-y-auto">
                    {/* Zoom Controls */}
                    <div className="p-3 bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-400">Zoom Preview</span>
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
                                    <Label className="text-zinc-400">Tanda Tangan Anda</Label>
                                    <div
                                        className="p-4 bg-zinc-800 border border-zinc-700 rounded-lg cursor-move hover:border-blue-500 hover:bg-zinc-800/80 transition-all flex items-center gap-3 touch-none"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, 'sidebar')}
                                        onTouchStart={(e) => handleTouchStart(e, 'sidebar')}
                                    >
                                        <div className="h-10 w-10 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 overflow-hidden">
                                            {approver.signature_url ? (
                                                <img src={approver.signature_url} alt="Sig" className="w-full h-full object-contain" />
                                            ) : (
                                                <FileText className="h-5 w-5" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-200 uppercase">{approver.position.replace(/-/g, ' ')}</p>
                                            <p className="text-xs text-zinc-500">Drag ke area surat</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {signaturePosition && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
                                    <Check className="h-4 w-4" />
                                    Tanda tangan ditempatkan.
                                </div>
                            )}


                            <div className="mt-auto space-y-3 pt-6 border-t border-zinc-800">
                                <Button
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={handleApproveClick}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Memproses...' : 'Approve & Tanda Tangan'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full border-rose-500/50 text-rose-500 hover:bg-rose-500/10"
                                    onClick={() => onReject('')}
                                    disabled={isSubmitting}
                                >
                                    Reject
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
