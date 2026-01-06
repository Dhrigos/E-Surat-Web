import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { User, Mail, Lock, Phone, Shield, ArrowRight, Check, X, Eye, EyeOff } from 'lucide-react';
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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Real assets from public/images
    const logoImage = "/images/KEMENTERIAN-PERTAHANAN.png";
    const tniPhoto = "/images/BEGROUND.png";

    const handleNextStep = () => {
        if (step === 1) {
            if (!data.name || !data.username || !data.email || !data.phone_number) {
                toast.error('Harap lengkapi data diri');
                return;
            }
            setStep(2);
        }
    };

    const formatPhoneNumberForApi = (phone: string) => {
        let clean = phone.replace(/\D/g, '');
        if (clean.startsWith('62')) {
            return '0' + clean.slice(2);
        }
        return clean;
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.password || !data.password_confirmation) {
            toast.error('Harap lengkapi kata sandi');
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

        if (!/[A-Z]/.test(data.password)) {
            toast.error('Kata sandi harus memiliki huruf besar');
            return;
        }

        if (!/[0-9]/.test(data.password)) {
            toast.error('Kata sandi harus memiliki angka');
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(data.password)) {
            toast.error('Kata sandi harus memiliki karakter spesial');
            return;
        }

        setLoading(true);

        try {
            // Send OTP via backend
            await axios.post(route('otp.send'), {
                email: data.email,
                phone_number: formatPhoneNumberForApi(data.phone_number)
            });

            toast.success('Kode OTP telah dikirim ke Email dan Nomor Telepon Anda');
            setStep(3);
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
            phone_number: formatPhoneNumberForApi(data.phone_number),
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
                phone_number: formatPhoneNumberForApi(data.phone_number)
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
    if (step === 3) {
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
                                        <InputOTPGroup className="gap-3">
                                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                    className="bg-black/50 border-2 border-white/20 text-white h-12 w-10 md:h-16 md:w-14 text-2xl font-bold rounded-lg focus:border-red-600 focus:ring-4 focus:ring-red-600/20 transition-all shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
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
                                    onClick={() => setStep(2)}
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

            <Card className="relative z-10 w-full max-w-lg animate-in fade-in duration-500 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-white shadow-2xl">
                <CardHeader className="text-center">
                    <img
                        src={logoImage}
                        alt="Logo Kementerian Pertahanan"
                        className="h-28 w-28 object-contain mx-auto mb-4 drop-shadow-2xl transition-all duration-300 hover:scale-110"
                    />

                    <CardTitle className="text-2xl md:text-3xl font-black text-red-600 mb-2 tracking-tight animate-in fade-in duration-700 delay-200 whitespace-nowrap">Badan Cadangan Nasional</CardTitle>
                    <CardDescription className="text-gray-400 text-base font-medium">
                        Buat akun baru untuk mengakses sistem
                    </CardDescription>

                    <div className="mt-6 flex justify-center items-center gap-4">
                        {[1, 2].map((s) => (
                            <div
                                key={s}
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step === s ? 'bg-red-600 text-white ring-4 ring-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : step > s ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-400'}`}
                            >
                                {step > s ? <Check className="w-6 h-6" /> : s}
                            </div>
                        ))}
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        {step === 1 && (
                            <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
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
                                            placeholder="(+62) 8xxx - xxxx - xxx"
                                            value={data.phone_number}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/\D/g, '');
                                                if (value.startsWith('62')) value = value.slice(2);
                                                if (value.startsWith('0')) value = value.slice(1);

                                                let formatted = '';
                                                if (value.length > 0) {
                                                    formatted = `(+62) ${value.slice(0, 4)}`;
                                                    if (value.length >= 5) {
                                                        formatted += ` - ${value.slice(4, 8)}`;
                                                    }
                                                    if (value.length >= 9) {
                                                        formatted += ` - ${value.slice(8, 13)}`;
                                                    }
                                                }
                                                setData('phone_number', formatted);
                                            }}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleNextStep}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold mt-4"
                                >
                                    Lanjut
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className={labelClasses}>Kata Sandi</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Minimal 8 karakter"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            onPaste={(e) => e.preventDefault()}
                                            className={inputClasses}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

                                    <div className="mt-2 space-y-1 bg-white/5 p-3 rounded-lg border border-white/10">
                                        <p className="text-xs text-gray-400 font-bold mb-2">Syarat Kata Sandi:</p>
                                        {[
                                            { label: 'Minimal 8 karakter', valid: data.password.length >= 8 },
                                            { label: 'Huruf besar (A-Z)', valid: /[A-Z]/.test(data.password) },
                                            { label: 'Angka (0-9)', valid: /[0-9]/.test(data.password) },
                                            { label: 'Karakter spesial (!@#$...)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(data.password) },
                                        ].map((req, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                <div className={`h-4 w-4 rounded-full flex items-center justify-center ${req.valid ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                                    {req.valid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                                </div>
                                                <span className={req.valid ? 'text-green-500 font-medium' : 'text-gray-500'}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation" className={labelClasses}>Konfirmasi Kata Sandi</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Ulangi kata sandi"
                                            value={data.password_confirmation}
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                            onPaste={(e) => e.preventDefault()}
                                            className={inputClasses}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 bg-black border-white/20 text-white hover:bg-white/10 font-bold"
                                    >
                                        Kembali
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                                        disabled={loading}
                                    >
                                        {loading ? 'Memproses...' : 'Kirim OTP'}
                                        {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        )}
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
        </div >
    );
}
