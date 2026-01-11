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
}

export function CameraCapture({ onCapture, label = "Ambil Foto", overlayType = 'card', className }: CameraCaptureProps) {
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
                            videoConstraints={{
                                facingMode: "user",
                                width: 1280,
                                height: 720
                            }}
                            className="w-full h-auto"
                        />

                        {/* Overlays */}
                        <div className="absolute inset-0 pointer-events-none border-2 border-white/20">
                            {overlayType === 'card' && (
                                <div className="absolute inset-x-4 top-[15%] bottom-[25%] border-2 border-dashed border-white/70 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.8)]">
                                    <div className="absolute top-2 left-0 right-0 text-center text-white/80 text-xs font-semibold uppercase tracking-wider">
                                        Posisikan KTP di sini
                                    </div>
                                    {/* Photo Placeholder Guide */}
                                    <div className="absolute top-[15%] bottom-[15%] right-[5%] w-[25%] border-2 border-dashed border-white/50 rounded-md bg-white/10 flex items-center justify-center">
                                        <span className="text-[10px] text-white/70">FOTO</span>
                                    </div>
                                </div>
                            )}
                            {overlayType === 'face' && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80">
                                    <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                                        <path
                                            d="M100 25 C60 25 35 55 35 95 C35 135 60 155 75 160 C35 180 15 230 15 250"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray="8 8"
                                            strokeLinecap="round"
                                            strokeOpacity="0.8"
                                        />
                                        <path
                                            d="M100 25 C140 25 165 55 165 95 C165 135 140 155 125 160 C165 180 185 230 185 250"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="2"
                                            strokeDasharray="8 8"
                                            strokeLinecap="round"
                                            strokeOpacity="0.8"
                                        />
                                    </svg>
                                    <div className="absolute inset-x-8 inset-y-4 rounded-full shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] pointer-events-none -z-10" />

                                    <div className="absolute bottom-4 left-0 right-0 text-center text-white/80 text-xs font-semibold uppercase tracking-wider">
                                        Posisikan Kepala & Bahu
                                    </div>
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
