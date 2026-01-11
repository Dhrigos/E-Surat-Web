import React, { useState, useEffect } from 'react';
import { Head, router, usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, CheckCircle, AlertOctagon, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
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
        const tId = toast.loading('Memproses KTP...');
        try {
            // Optional: We can still run OCR here to verify against DB if desired
            // For now just ensuring it's a valid capture
            const ocr = await processKTP(img);
            if (!ocr.nik) {
                toast.warning('NIK tidak terdeteksi dengan jelas. Pastikan foto KTP terang.');
            }
            toast.dismiss(tId);
            setStep('selfie');
        } catch (e) {
            toast.dismiss(tId);
            toast.error('Gagal memproses KTP');
        }
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

                // Redirect to Profile Completion or Pending based on response
                setTimeout(() => {
                    if (response.data.redirect) {
                        window.location.href = response.data.redirect;
                    } else {
                        window.location.href = route('complete-profile.create');
                    }
                }, 2000);
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
                    className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                >
                    Logout <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] animate-pulse delay-700" />

            <Head title="Verifikasi E-KYC" />

            <Card className="w-full max-w-2xl bg-[#1a1a1a]/90 border-white/10 backdrop-blur-xl shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-white">Verifikasi Identitas Digital</CardTitle>
                    <CardDescription className="text-gray-400">
                        Lakukan verifikasi wajah untuk mengaktifkan akun Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {step === 'intro' && (
                        <div className="text-center space-y-6 py-8">
                            <div className="w-20 h-20 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
                                <Camera className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-white">Siapkan E-KTP Anda</h3>
                                <p className="text-gray-400 max-w-md mx-auto">
                                    Kami akan mencocokkan wajah Anda dengan foto yang ada di KTP untuk memastikan keamanan akun.
                                </p>
                            </div>
                            <Button onClick={() => setStep('ktp')} className="w-full max-w-xs bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg rounded-xl">
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
                            <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Verifikasi Berhasil!</h3>
                            <p className="text-gray-400">Akun Anda telah diaktifkan. Mengalihkan ke Dashboard...</p>
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
