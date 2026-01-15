import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock } from 'lucide-react';
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
            {/* Institutional Badge */}
            <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 md:gap-4">
                    <div className="h-px w-8 md:w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                    <p className="text-xs md:text-lg font-bold text-red-600 drop-shadow-lg uppercase tracking-wider text-center leading-tight">
                        <span className="whitespace-nowrap">KEMENTERIAN PERTAHANAN</span><br />
                        <span className="whitespace-nowrap">REPUBLIK INDONESIA</span>
                    </p>
                    <div className="h-px w-8 md:w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                </div>
            </div>

            {/* Login Card */}
            <div className="bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 shadow-2xl">

                {/* Card Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <img
                            src="/images/KEMENTERIAN-PERTAHANAN.png"
                            alt="Logo Kementerian Pertahanan"
                            className="h-36 w-36 object-contain drop-shadow-2xl"
                        />
                        <img
                            src="/images/BADAN-CADANGAN-NASIONAL.png"
                            alt="Logo Badan Cadangan Nasional"
                            className="h-28 w-28 object-contain drop-shadow-2xl"
                        />
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-red-600 mb-2 tracking-tight">Sistem Informasi Badan Cadangan Nasional</h2>
                    <p className="text-gray-400 font-medium text-sm">Sistem ini hanya diperuntukkan bagi personel BACADNAS</p>
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

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="remember"
                            className="rounded border-gray-600 bg-black/50 text-red-600 shadow-sm focus:ring-red-600"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <Label htmlFor="remember" className="text-gray-300 font-medium cursor-pointer">Ingat Saya</Label>
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
                        Lupa kata sandi?
                    </Link>
                    <Link
                        href={route('register')}
                        className="text-red-600 hover:text-red-700 p-0 h-auto font-bold"
                    >
                        Daftar akun
                    </Link>
                </div>
            </div>

            {/* Bottom Info */}
        </GuestLayout>
    );
}
