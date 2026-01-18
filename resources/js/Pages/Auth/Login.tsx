import React, { useState, useRef } from 'react';
import { useForm, Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import GuestLayout from '@/layouts/GuestLayout';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [loading, setLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        post(route('login'), {
            onFinish: () => {
                setLoading(false);
            },
            onError: (errors: any) => {
                if (errors.login_error) {
                    toast.error(errors.login_error);
                } else {
                    toast.error('Email atau kata sandi salah');
                }
                setLoading(false);
            }
        });
    };
    const loginSectionRef = useRef<HTMLDivElement>(null);

    const scrollToLogin = () => {
        loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="h-screen w-full bg-black relative overflow-y-scroll snap-y snap-mandatory scroll-smooth font-sans text-[#FEFCF8]">
            <Head title="Login" />

            {/* Single Fixed Background Image - No Heavy Overlay or Gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img
                    src="/images/Background_final.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.3),rgba(0,0,0,95))]" />
            </div>

            {/* Section 1: Hero / Landing */}
            <div className="relative z-10 min-h-[100dvh] w-full snap-start hidden md:flex flex-col justify-between px-4 py-6 md:px-12 md:py-12 overflow-hidden">
                {/* Header Logos */}
                <div className="flex justify-center items-center w-full gap-4 md:gap-0 mt-4 md:mt-0">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-20 w-20 sm:h-40 sm:w-40 md:h-40 md:w-40 flex items-center justify-center transition-all duration-300">
                            <img src="/images/KEMENTERIAN-PERTAHANAN.png" alt="Logo Kemhan" className="h-full w-full object-contain drop-shadow-2xl" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-20 w-20 sm:h-28 sm:w-28 md:h-24 md:w-24 flex items-center justify-center transition-all duration-300">
                            <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Logo Bacan" className="h-full w-full object-contain drop-shadow-2xl scale-125" />
                        </div>
                    </div>
                </div>

                {/* Center Content */}
                <div className="flex flex-col items-center justify-center text-center -mt-10 sm:-mt-20 md:-mt-32">
                    {/* Badge */}
                    <div className="mb-6 md:mb-8 px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-white/30 bg-black/20 backdrop-blur-md flex items-center gap-2 md:gap-3 shadow-lg scale-90 md:scale-100 origin-center">
                        <span className="text-[#AC0021] font-bold text-lg md:text-xl">🏛️</span>
                        <span className="text-[10px] md:text-sm font-bold tracking-widest uppercase text-[#FEFCF8] drop-shadow">Republik Indonesia</span>
                    </div>

                    {/* Big Title */}
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-[0.95] md:leading-[0.9] uppercase drop-shadow-2xl text-[#FEFCF8] max-w-[95%] sm:max-w-[85%] mx-auto md:max-w-none transition-all duration-300">
                        KEMENTERIAN <br /> PERTAHANAN
                    </h1>

                    {/* Subtitle */}
                    <div className="flex items-center gap-3 md:gap-4 mt-5 md:mt-6 mb-3 md:mb-4 w-full justify-center opacity-90 scale-90 md:scale-100 origin-center">
                        <div className="h-[2px] w-8 md:w-32 bg-[#AC0021] shadow-[0_0_10px_#AC0021]"></div>
                        <span className="text-[#AC0021] font-bold tracking-[0.3em] text-[10px] md:text-xl drop-shadow-lg uppercase text-center whitespace-nowrap bg-[#AC0021]/10 px-3 py-1 rounded-full border border-[#AC0021]/30 shadow-[0_0_15px_rgba(172,0,33,0.4)]">
                            REPUBLIK INDONESIA
                        </span>
                        <div className="h-[2px] w-8 md:w-32 bg-[#AC0021] shadow-[0_0_10px_#AC0021]"></div>
                    </div>

                    <p className="text-gray-300 font-medium text-xs md:text-lg tracking-[0.2em] uppercase mt-1 md:mt-2 drop-shadow-md px-4">
                        Portal Sistem Manajemen Dokumen
                    </p>
                </div>

                {/* Bottom Button */}
                <div className="flex justify-center pb-8 md:pb-10">
                    <button
                        type="button"
                        onClick={scrollToLogin}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className="group flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-[#262626]/80 backdrop-blur-md border border-[#AC0021] rounded-full hover:bg-[#AC0021] transition-all duration-500 shadow-2xl hover:shadow-[0_0_30px_rgba(172,53,0,0.5)] cursor-pointer scale-90 md:scale-100 origin-bottom"
                    >
                        <span className="text-[#AC0021] group-hover:text-[#FEFCF8] transition-colors duration-300">
                            {isHovered ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        </span>
                        <span className="font-extrabold tracking-widest text-sm md:text-lg text-[#FEFCF8] group-hover:text-[#FEFCF8] transition-colors duration-300">
                            {isHovered ? 'AKSES LANJUT' : 'AKSES RESMI'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Section 2: Login Form */}
            <div ref={loginSectionRef} className="relative z-10 min-h-[100dvh] w-full snap-start flex flex-col items-center justify-center px-4 py-12">
                <div className="bg-[#252525]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl w-full max-w-lg relative overflow-hidden group">

                    {/* Logos Top Card */}
                    <div className="flex justify-center items-center gap-8 mb-1 -mt-8 transform group-hover:scale-105 transition-transform duration-700">
                        <img src="/images/KEMENTERIAN-PERTAHANAN.png" alt="Kemhan" className="h-28 w-28 md:h-40 md:w-40 object-contain drop-shadow-2xl" />
                        <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Bacan" className="h-20 w-auto md:h-28 md:w-28 object-contain drop-shadow-2xl" />
                    </div>

                    {/* Title Card */}
                    <div className="text-center mb-10 -mt-2">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-black text-[#AC0021] mb-2 uppercase tracking-tight leading-tight">Sistem Informasi<br />Badan Cadangan Nasional</h2>
                        <p className="text-gray-400 text-xs font-medium tracking-wide">Sistem ini hanya diperuntukkan bagi personel BACADNAS</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 -mt-2">
                        <div className="space-y-2">
                            <Label className="text-gray-300 text-sm font-bold uppercase tracking-wide">Email / Username</Label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within/input:text-[#AC0021] transition-colors" />
                                <Input
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Masukkan email atau username"
                                    className="pl-12 h-12 bg-black/50 border-white/10 focus:border-[#AC0021] focus:ring-[#AC0021]/20 text-[#FEFCF8] placeholder:text-gray-500 rounded-xl transition-all"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-[#AC0021] text-xs text-right mt-1 font-bold">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-300 text-sm font-bold uppercase tracking-wide">Kata Sandi</Label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within/input:text-[#AC0021] transition-colors" />
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan kata sandi"
                                    className="pl-12 h-12 bg-black/50 border-white/10 focus:border-[#AC0021] focus:ring-[#AC0021]/20 text-[#FEFCF8] placeholder:text-gray-600 rounded-xl transition-all"
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-[#AC0021] text-xs text-right mt-1 font-bold">{errors.password}</p>}
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="rounded border-gray-600 bg-black/50 text-[#AC0021] shadow-sm focus:ring-[#AC0021] focus:ring-offset-black"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <Label htmlFor="remember" className="text-gray-400 text-sm font-medium cursor-pointer hover:text-[#FEFCF8] transition-colors">Ingat Saya</Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#AC0021] hover:bg-[#AC0021]/80 text-[#FEFCF8] text-base font-bold tracking-wider shadow-lg hover:shadow-[#AC0021]/20 transition-all rounded-xl mt-4"
                            disabled={processing || loading}
                        >
                            {processing || loading ? 'MASUK KE SISTEM' : 'MASUK KE SISTEM'}
                        </Button>
                    </form>

                    <div className="mt-2 flex justify-between text-xs font-boldborder-t border-white/5 pt-6">
                        <Link href={route('password.request')} className="text-gray-500 hover:text-[#D04438] hover:underline hover:decoration-[#D04438] transition-colors">
                            Lupa kata sandi?
                        </Link>
                        <Link href={route('register')} className="text-gray-500 hover:text-[#659800] hover:underline hover:decoration-[#659800] transition-colors">
                            Daftar akun
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center space-y-2 opacity-50">
                    <p className="text-[#FEFCF8] text-xs font-bold uppercase tracking-widest">
                        © {new Date().getFullYear()} Kementerian Pertahanan Republik Indonesia
                    </p>
                    <p className="text-[#FEFCF8] text-[10px]">
                        Badan Cadangan Nasional • Sistem Manajemen Dokumen Digital
                    </p>
                </div>
            </div>
        </div >
    );
}
