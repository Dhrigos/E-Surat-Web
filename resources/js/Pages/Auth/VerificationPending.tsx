import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function VerificationPending() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 p-4 relative overflow-hidden text-white">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-yellow-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] animate-pulse delay-700" />

            <Head title="Menunggu Verifikasi Admin" />

            <div className="w-full max-w-md space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2">
                    <div className="w-20 h-20 bg-yellow-600/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                        <Clock className="w-10 h-10 animate-pulse" />
                    </div>
                </div>

                <Card className="bg-[#1a1a1a]/95 border-yellow-500/30 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-white">Menunggu Validasi Admin</CardTitle>
                        <CardDescription className="text-gray-400">
                            Terima kasih telah melakukan E-KYC.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 text-center">
                        <p className="text-gray-300">
                            Data Anda sedang ditinjau oleh tim Admin kami. Proses ini biasanya memakan waktu <span className="font-bold text-yellow-500">1x24 jam</span>.
                        </p>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10 text-sm text-gray-400">
                            <p>Mohon cek berkala atau tunggu notifikasi email jika tersedia.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                    >
                        Logout <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
