import React, { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, AlertOctagon, Loader2, RefreshCw, ArrowRight, Check } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import { CameraCapture } from '@/components/ui/ekyc/camera-capture';
import { processKTP } from '@/components/ui/ekyc/ocr-processor';
import { compareFaces } from '@/components/ui/ekyc/face-matcher';
import axios from 'axios';

export default function VerificationEkyc() {
    const { auth } = usePage().props as any;
    const [step, setStep] = useState<'intro' | 'ktp' | 'selfie' | 'processing' | 'success' | 'failed'>('intro');
    const [ktpImg, setKtpImg] = useState<string | null>(null);
    const [selfieImg, setSelfieImg] = useState<string | null>(null);
    const [similarityScore, setSimilarityScore] = useState(0);

    const handleKtpCapture = async (img: string) => {
        setKtpImg(img);
        // Skip OCR validation - just accept the captured image
        setStep('selfie');
    };

    const handleSelfieCapture = async (img: string) => {
        setSelfieImg(img);
        setStep('processing');
    };

    const processVerification = async () => {
        if (!ktpImg || !selfieImg) return;

        const tId = toast.loading('Mengunggah data E-KYC...');

        try {
            // Convert Base64/Blob URL to File for KTP
            const ktpResponse = await fetch(ktpImg);
            const ktpBlob = await ktpResponse.blob();
            const ktpFile = new File([ktpBlob], "scan_ktp.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('image_selfie', selfieImg); // Base64 string
            formData.append('scan_ktp', ktpFile);

            // Submit FormData
            const response = await axios.post(route('verification.approve-ekyc'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.dismiss(tId);

            if (response.data.status === 'success') {
                setStep('success');
                toast.success('Foto berhasil diunggah!');
                // Remove auto-redirect, let user click Next button
            }
        } catch (e: any) {
            toast.dismiss(tId);
            console.error(e);
            toast.error('Terjadi kesalahan saat mengunggah foto: ' + (e.response?.data?.message || e.message));
            setStep('failed');
        }
    };

    useEffect(() => {
        if (step === 'processing') {
            processVerification();
        }
    }, [step]);

    const reset = () => {
        setKtpImg(null);
        setSelfieImg(null);
        setStep('ktp');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 p-4 relative overflow-hidden text-white">
            <Toaster richColors />

            <div className="absolute top-8 right-8 z-50">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-[#FEFCF8]/60 hover:text-[#FEFCF8] transition-colors text-sm font-medium flex items-center gap-2"
                >
                    Logout <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Background Effects */}
            {/* <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] animate-pulse delay-700" /> */}
            <style>{`
                @keyframes glow-move-1 {
                    0% { transform: translate(0, 0) scale(1); opacity: 0.2; }
                    50% { transform: translate(40px, -30px) scale(1.15); opacity: 0.5; }
                    100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
                }
                @keyframes glow-move-2 {
                    0% { transform: translate(0, 0) scale(1); opacity: 0.15; }
                    50% { transform: translate(-30px, 40px) scale(1.2); opacity: 0.4; }
                    100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
                }
                @keyframes check-pop {
                    0% { transform: scale(0) rotate(-45deg); opacity: 0; }
                    70% { transform: scale(1.2) rotate(0deg); }
                    100% { transform: scale(1) rotate(0deg); opacity: 1; }
                }
                @keyframes ring-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(101, 152, 0, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(101, 152, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(101, 152, 0, 0); }
                }
                .animate-glow-1 { animation: glow-move-1 15s infinite ease-in-out; }
                .animate-glow-2 { animation: glow-move-2 18s infinite ease-in-out reverse; }
                .animate-check-pop { animation: check-pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-ring-pulse { animation: ring-pulse 2s infinite; }
            `}</style>

            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] left-[-15%] w-[700px] h-[700px] bg-[#D04438] rounded-full blur-[150px] animate-glow-1"></div>
                <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] bg-[#D04438] rounded-full blur-[130px] animate-glow-2"></div>
            </div>

            <Head title="Verifikasi E-KYC" />

            <Card className="w-full max-w-2xl bg-[#1a1a1a]/90 border-white/10 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-[#FEFCF8]">Verifikasi Identitas Digital</CardTitle>
                    <CardDescription className="text-[#B0B0B0]">
                        {step === 'selfie'
                            ? "Verifikasi Wajah Anda untuk mengaktifkan akun Anda."
                            : "Lakukan Verifikasi Identitas Digital Anda untuk mengaktifkan akun Anda."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Visual Stepper */}
                    {step !== 'intro' && (
                        <div className="flex justify-center items-start w-full mb-2 relative px-4">
                            {[
                                { num: 1, label: 'Foto E-KTP' },
                                { num: 2, label: 'Foto Wajah' }
                            ].map((s, index) => {
                                const currentStepNum = step === 'ktp' ? 1 : 2;
                                return (
                                    <React.Fragment key={s.num}>
                                        <div className="flex flex-col items-center relative z-10 w-24">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStepNum > s.num
                                                    ? 'bg-[#AC0021] text-white ring-4 ring-[#AC0021]/30 shadow-[0_0_15px_#AC0021]'
                                                    : currentStepNum === s.num
                                                        ? 'bg-[#AC0021] text-white ring-4 ring-[#AC0021]/30 shadow-[0_0_15px_#AC0021]'
                                                        : 'bg-white/10 border-2 border-white/20 text-gray-400'
                                                    }`}
                                            >
                                                {currentStepNum > s.num ? <Check className="w-5 h-5" /> : s.num}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 text-center transition-colors duration-300 ${currentStepNum >= s.num ? 'text-[#AC0021]' : 'text-gray-600'
                                                }`}>
                                                {s.label}
                                            </span>
                                        </div>
                                        {index < 1 && (
                                            <div className="h-[2px] flex-1 mx-2 bg-white/10 mt-5 relative">
                                                <div
                                                    className={`absolute top-0 left-0 h-full bg-[#AC0021] transition-all duration-500 ${currentStepNum > 1 ? 'w-full' : 'w-0'
                                                        }`}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}

                    {step === 'intro' && (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-[#AC0021]/20 text-[#AC0021] rounded-full flex items-center justify-center mx-auto">
                                <Camera className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-[#FEFCF8]">Siapkan E-KTP Anda</h3>
                                <p className="text-[#B0B0B0] max-w-md mx-auto">
                                    Kami akan mencocokkan wajah Anda dengan foto yang ada di KTP untuk memastikan keamanan akun.
                                </p>
                            </div>
                            <Button onClick={() => setStep('ktp')} className="w-full max-w-xs bg-[#AC0021] hover:bg-[#AC0021]/80 text-white font-bold py-6 text-lg rounded-xl">
                                Mulai Verifikasi
                            </Button>
                        </div>
                    )}

                    {step === 'ktp' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right">
                            <h3 className="text-xl font-bold text-center text-white">Langkah 1: Foto E-KTP</h3>
                            <CameraCapture
                                onCapture={handleKtpCapture}
                                overlayType="card"
                                label="Ambil Foto KTP"
                                facingMode="environment" // Force Back Camera
                            />
                        </div>
                    )}

                    {step === 'selfie' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right">
                            <h3 className="text-xl font-bold text-center text-white">Langkah 2: Selfie Wajah</h3>
                            <CameraCapture
                                onCapture={handleSelfieCapture}
                                overlayType="face"
                                label="Ambil Selfie"
                                facingMode="user" // Force Front Camera
                            />
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-20 text-center space-y-6 animate-in fade-in zoom-in">
                            <Loader2 className="w-16 h-16 text-red-500 animate-spin mx-auto" />
                            <h3 className="text-xl font-bold text-white">Memverifikasi Data Biometrik...</h3>
                            <p className="text-gray-400">Mohon jangan tutup halaman ini</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in">
                            <div className="w-24 h-24 bg-[#659800]/20 text-[#659800] rounded-full flex items-center justify-center mx-auto animate-ring-pulse">
                                <CheckCircle className="w-12 h-12 animate-check-pop" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Verifikasi Berhasil!</h3>
                            <p className="text-gray-400">Lanjutkan lengkapi data Anda</p>
                            <Button
                                onClick={() => window.location.href = route('complete-profile.create')}
                                className="w-full max-w-xs bg-[#AC0021] hover:bg-[#AC0021]/80 text-white font-bold py-6 text-lg rounded-xl gap-2"
                            >
                                Lanjutkan <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    )}

                    {step === 'failed' && (
                        <div className="py-12 text-center space-y-6 animate-in fade-in zoom-in">
                            <div className="w-24 h-24 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                <AlertOctagon className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Verifikasi Gagal</h3>
                            <p className="text-gray-400">
                                Pastikan pencahayaan cukup dan wajah terlihat jelas.
                            </p>
                            <Button onClick={reset} variant="outline" className="gap-2 border-white/20 text-white hover:bg-white/10">
                                <RefreshCw className="w-4 h-4" /> Coba Lagi
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
