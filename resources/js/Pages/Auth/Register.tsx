import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { User, Mail, Lock, Phone, Shield, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

export default function Register() {
    const { data, setData, post, processing, errors, transform } = useForm({
        name: '',
        username: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        otp: '',
    });

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otpInput, setOtpInput] = useState('');

    // Real assets from public/images
    const logoImage = "/images/KEMENTERIAN-PERTAHANAN.png";
    const tniPhoto = "/images/BEGROUND.png";

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.name || !data.email || !data.phone_number || !data.password || !data.password_confirmation) {
            toast.error('Harap lengkapi semua field');
            return;
        }

        if (data.password !== data.password_confirmation) {
            toast.error('Kata sandi dan konfirmasi kata sandi tidak sama');
            return;
        }

        if (data.password.length < 8) {
            toast.error('Kata sandi minimal 8 karakter');
            return;
        }

        setLoading(true);

        try {
            // Send OTP via backend
            await axios.post(route('otp.send'), {
                email: data.email,
                phone_number: data.phone_number
            });

            toast.success('Kode OTP telah dikirim ke Email dan Nomor Telepon Anda');
            setStep(2);
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Gagal mengirim kode OTP. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = (e: React.FormEvent) => {
        e.preventDefault();

        if (otpInput.length !== 6) {
            toast.error('Kode OTP harus 6 digit');
            return;
        }

        transform((data) => ({
            ...data,
            otp: otpInput,
        }));

        // Submit registration with OTP
        post(route('register'), {
            onSuccess: () => {
                toast.success('Registrasi berhasil! Silakan login');
            },
            onError: () => {
                toast.error('Registrasi gagal atau OTP salah. Silakan periksa input Anda.');
            }
        });
    };

    const handleResendOTP = async () => {
        setLoading(true);
        try {
            await axios.post(route('otp.send'), {
                email: data.email,
                phone_number: data.phone_number
            });
            toast.success('Kode OTP baru telah dikirim');
        } catch (error) {
            console.error('Error resending OTP:', error);
            toast.error('Gagal mengirim ulang OTP');
        } finally {
            setLoading(false);
        }
    };

    // Common Input Styles
    const inputClasses = "pl-10 bg-black border-2 border-white/10 focus:border-red-600 text-white placeholder:text-gray-500";
    const labelClasses = "text-white font-bold";

    // OTP Verification Step
    if (step === 2) {
        return (
            <div className="min-h-screen bg-black relative overflow-hidden font-sans flex items-center justify-center p-4">
                <Head title="Verifikasi OTP" />

                {/* Background Image with Dark Overlay */}
                <div className="absolute inset-0">
                    <img
                        src={tniPhoto}
                        alt="TNI Background"
                        className="w-full h-full object-cover opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
                </div>

                <Card className="relative z-10 w-full max-w-md animate-in fade-in duration-500 bg-[#1a1a1a]/95 backdrop-blur-xl border-2 border-white/10 text-white shadow-2xl p-6">
                    <CardHeader className="text-center p-0 mb-6">
                        <div className="flex justify-center mb-6">
                            <div className="h-20 w-20 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                                <Mail className="h-10 w-10 text-white" />
                            </div>
                        </div>

                        <CardTitle className="text-2xl md:text-3xl text-red-600 mb-2 font-bold tracking-wide">Verifikasi Email</CardTitle>
                        <CardDescription className="text-gray-400 text-base">
                            Masukkan kode OTP yang dikirim ke <br />
                            <span className="text-blue-400 font-medium">{data.email}</span>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">


                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="space-y-2 flex flex-col items-center">
                                <Label className="text-white font-bold text-lg">Kode OTP</Label>
                                <div className="flex justify-center">
                                    <InputOTP maxLength={6} value={otpInput} onChange={setOtpInput}>
                                        <InputOTPGroup className="gap-2">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="bg-[#2a2a2a] border-white/10 text-white h-12 w-10 md:h-14 md:w-12 text-xl focus:border-red-600 transition-colors"
                                                />
                                            ))}
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                                <p className="text-center text-gray-500 text-sm">Periksa email Anda untuk kode OTP</p>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-black border-white/20 text-white hover:bg-white/10 font-bold h-12"
                                >
                                    Kembali
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold h-12 shadow-lg hover:shadow-red-600/20"
                                    disabled={processing || otpInput.length !== 6}
                                >
                                    {processing ? 'Verifikasi...' : 'Verifikasi'}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={loading}
                                className="text-white font-bold hover:text-red-500 transition-colors disabled:opacity-50 text-base"
                            >
                                {loading ? 'Mengirim...' : 'Kirim ulang OTP'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden font-sans flex items-center justify-center p-4">
            <Head title="Register" />

            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0">
                <img
                    src={tniPhoto}
                    alt="TNI Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
            </div>

            <Card className="relative z-10 w-full max-w-md animate-in fade-in duration-500 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-white shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-between mb-6 px-2">
                        <div className="flex items-center gap-3 animate-in slide-in-from-left duration-700">
                            <div className="h-14 w-14 md:h-16 md:w-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl">
                                <Shield className="h-8 w-8 md:h-10 md:w-10 text-white transition-transform duration-300" />
                            </div>
                        </div>

                        <div className="flex-shrink-0 animate-in slide-in-from-right duration-700">
                            <img src={logoImage} alt="Logo Kementerian Pertahanan" className="h-14 w-14 md:h-16 md:w-16 object-contain transition-all duration-300 hover:scale-110" />
                        </div>
                    </div>

                    <CardTitle className="text-2xl md:text-3xl text-red-600 animate-in fade-in duration-700 delay-200">Badan Cadangan Nasional</CardTitle>
                    <CardDescription className="text-gray-400">
                        Buat akun baru untuk mengakses sistem
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className={labelClasses}>Nama Lengkap</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="name"
                                    placeholder="Masukkan nama lengkap"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="username" className={labelClasses}>Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="johndoe"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className={labelClasses}>Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nama@bacanas.go.id"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number" className={labelClasses}>Nomor Telepon</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="phone_number"
                                    placeholder="08xxxxxxxxxx"
                                    value={data.phone_number}
                                    onChange={(e) => setData('phone_number', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className={labelClasses}>Kata Sandi</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Minimal 8 karakter"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className={labelClasses}>Konfirmasi Kata Sandi</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="Ulangi kata sandi"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={inputClasses}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : 'Kirim OTP'}
                            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <div className="text-sm text-gray-400">
                            Sudah punya akun?{' '}
                            <Link
                                href={route('login')}
                                className="text-red-600 p-0 h-auto font-bold hover:underline"
                            >
                                Masuk
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
