import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
    onCapture: (imageSrc: string) => void;
    label?: string;
    overlayType?: 'card' | 'face';
    className?: string;
    facingMode?: "user" | "environment";
}

export function CameraCapture({ onCapture, label = "Ambil Foto", overlayType = 'card', className, facingMode = "user" }: CameraCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);

    const capture = useCallback(() => {
        if (webcamRef.current) {
            const image = webcamRef.current.getScreenshot();
            setImgSrc(image);
            // Removed immediate onCapture call to allow preview
        }
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    return (
        <div className={cn("flex flex-col gap-4 w-full max-w-md mx-auto", className)}>
            {imgSrc ? (
                <>
                    <div className="relative overflow-hidden rounded-lg bg-black">
                        <img src={imgSrc} alt="Captured" className="w-full h-auto" />
                    </div>
                    <div className="flex justify-center gap-4">
                        <Button onClick={retake} variant="secondary" size="lg" className="w-full max-w-[150px] gap-2 rounded-xl">
                            <RefreshCw className="w-4 h-4" /> Foto Ulang
                        </Button>
                        <Button onClick={() => onCapture(imgSrc)} className="w-full max-w-[150px] bg-red-600 hover:bg-red-700 rounded-xl">
                            Lanjut
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div className="relative overflow-hidden rounded-lg bg-black">
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            mirrored={false} // Disable mirroring for all modes
                            videoConstraints={{
                                facingMode: facingMode,
                                width: 1280,
                                height: 720
                            }}
                            className="w-full h-auto"
                        />

                        {/* Overlays */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-white/20">
                            {overlayType === 'card' && (
                                /* Landscape Card Aspect Ratio ~1.58:1 */
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] aspect-[86/54] border-2 border-dashed border-white bg-transparent rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.85)]">
                                    <div className="absolute -top-12 left-0 right-0 text-center text-white font-bold text-shadow-sm">
                                        POSISIKAN KTP DALAM GARIS PUTUS-PUTUS
                                    </div>
                                    {/* Photo Placeholder Guide (Right side of card) */}
                                    <div className="absolute top-[10%] bottom-[10%] right-[8%] w-[25%] border-2 border-dotted border-white/30 rounded-md bg-white/5 flex items-center justify-center">
                                        <span className="text-[10px] text-white/50 font-medium tracking-widest -rotate-90">FOTO</span>
                                    </div>
                                </div>
                            )}
                            {overlayType === 'face' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-64 overflow-visible">
                                    <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] overflow-visible">
                                        <defs>
                                            <mask id="face-overlay-mask">
                                                <rect x="-5000" y="-5000" width="10000" height="10000" fill="white" />
                                                <path d="M 100 30 C 130 30 155 50 155 90 C 170 90 170 120 155 120 C 155 140 130 170 100 170 C 70 170 45 140 45 120 C 30 120 30 90 45 90 C 45 50 70 30 100 30 Z" fill="black" />
                                                <path d="M 0 250 Q 5 200 35 180 Q 85 175 85 165 L 115 165 Q 115 175 165 180 Q 195 200 200 250 L 0 250 Z" fill="black" />
                                            </mask>
                                        </defs>

                                        {/* Dark Overlay Area */}
                                        <rect x="-5000" y="-5000" width="10000" height="10000" fill="rgba(0,0,0,0.6)" mask="url(#face-overlay-mask)" />

                                        {/* Head Stroke */}
                                        <path
                                            d="M 100 30 C 130 30 155 50 155 90 C 170 90 170 120 155 120 C 155 140 130 170 100 170 C 70 170 45 140 45 120 C 30 120 30 90 45 90 C 45 50 70 30 100 30 Z"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray="8 8"
                                            strokeLinecap="round"
                                            strokeOpacity="0.9"
                                        />
                                        {/* Shoulders Stroke */}
                                        <path
                                            d="M 85 165 Q 85 175 35 180 Q 5 200 0 250 M 115 165 Q 115 175 165 180 Q 195 200 200 250"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray="8 8"
                                            strokeLinecap="round"
                                            strokeOpacity="0.9"
                                        />
                                    </svg>
                                    {/* <div className="absolute inset-x-8 inset-y-4 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] pointer-events-none -z-10" /> */}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center pt-2">
                        <Button onClick={capture} className="rounded-full w-16 h-16 bg-white hover:bg-gray-200 p-0 flex items-center justify-center shadow-lg border-4 border-black/20">
                            <div className="w-12 h-12 rounded-full bg-red-600 border-2 border-white" />
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
