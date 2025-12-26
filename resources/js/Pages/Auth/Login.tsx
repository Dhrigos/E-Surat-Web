import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import GuestLayout from '@/layouts/GuestLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        post(route('login'), {
            onFinish: () => {
                setLoading(false);
            },
            onError: () => {
                toast.error('Email atau kata sandi salah');
                setLoading(false);
            }
        });
    };
    return (
        <GuestLayout title="Login">
            {/* Institutional Badge */}
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 bg-[#252525] border-2 border-red-600/30 rounded-full px-8 py-3 shadow-lg">
                    <Shield className="h-6 w-6 text-red-600" />
                    <span className="text-white font-black text-lg">AKSES RESMI</span>
                </div>
            </div>

            {/* Login Card */}
            <div className="bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 shadow-2xl">

                {/* Card Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-white mb-2">Portal Login</h2>
                    <p className="text-gray-400">Sistem Manajemen Dokumen BCN</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <Label className="text-white text-base font-bold">Email / Username</Label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Masukkan email atau username"
                                className="pl-12 h-14 bg-black border-2 border-white/10 focus:border-red-600 text-white text-base placeholder:text-gray-500"
                                required
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-white text-base font-bold">Kata Sandi</Label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan kata sandi"
                                className="pl-12 h-14 bg-black border-2 border-white/10 focus:border-red-600 text-white text-base placeholder:text-gray-500"
                                required
                            />
                        </div>
                        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-lg font-bold shadow-lg"
                        disabled={processing || loading}
                    >
                        {processing || loading ? 'Memproses...' : 'MASUK KE SISTEM'}
                    </Button>
                </form>

                {/* Footer Links */}
                <div className="mt-8 flex justify-between text-sm">
                    <Link
                        href={route('password.request')}
                        className="text-gray-400 hover:text-red-600 p-0 h-auto font-bold"
                    >
                        Lupa password?
                    </Link>
                    <Link
                        href={route('register')}
                        className="text-red-600 hover:text-red-700 p-0 h-auto font-bold"
                    >
                        Daftar Akun
                    </Link>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-6 text-center">
                <p className="text-white/50 text-xs">
                    Portal ini dilindungi dengan enkripsi tingkat militer
                </p>
            </div>
        </GuestLayout>
    );
}
