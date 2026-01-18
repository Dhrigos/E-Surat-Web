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

    // Validation State - Moved to top level to avoid hook violation
    const [validationErrors, setValidationErrors] = useState({
        username: '',
        email: '',
        phone_number: ''
    });

    // Real assets from public/images
    const logoImage = "/images/KEMENTERIAN-PERTAHANAN.png";
    const tniPhoto = "/images/Background_final.png";

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
        // Remove all non-digit characters
        let clean = phone.replace(/\D/g, '');

        // If starts with 62, convert to 0
        if (clean.startsWith('62')) {
            return '0' + clean.slice(2);
        }

        // If doesn't start with 0, add it (for numbers like 8123456789)
        if (!clean.startsWith('0')) {
            return '0' + clean;
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

            toast.success('Kode OTP telah dikirim ke Email Anda. Silakan periksa kotak masuk atau folder spam.');
            setStep(3);
        } catch (error) {
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
            toast.error('Gagal mengirim ulang OTP');
        } finally {
            setLoading(false);
        }
    };

    const checkAvailability = async (field: 'username' | 'email' | 'phone_number', value: string) => {
        if (!value) return;

        // Clear previous error first
        setValidationErrors(prev => ({ ...prev, [field]: '' }));

        try {
            const response = await axios.post(route('api.validate.register'), {
                field,
                value
            });

            if (!response.data.available) {
                setValidationErrors(prev => ({
                    ...prev,
                    [field]: response.data.message
                }));
            }
        } catch (error) {
            console.error('Validation check failed', error);
        }
    };

    // Data for strength meter
    const calculateStrength = (pass: string) => {
        let strength = 0;
        if (pass.length === 0) return 0;
        if (pass.length >= 8) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/[0-9]/.test(pass)) strength += 25;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 25;
        return strength;
    };

    const strength = calculateStrength(data.password);

    // Common Input Styles
    const inputClasses = "pl-10 bg-black border-2 border-white/10 focus:border-red-600 text-white placeholder:text-gray-500";
    const labelClasses = "text-white font-bold";

    // Unified Render
    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-sans flex flex-col overscroll-none">
            <Head title={step === 3 ? "Verifikasi OTP" : "Register"} />

            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0">
                <img
                    src={tniPhoto}
                    alt="TNI Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
                .delay-100 { animation-delay: 100ms; opacity: 0; }
                .delay-200 { animation-delay: 200ms; opacity: 0; }
                .delay-300 { animation-delay: 300ms; opacity: 0; }
            `}</style>

            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-white shadow-2xl animate-scale-in">
                        <CardHeader className="text-center animate-fade-in-up delay-100">
                            {/* Logos (Only show on Steps 1 & 2 for cleaner look, or small on Step 3? Let's keep consistent) */}
                            {/* <div className="flex justify-center items-center gap-3 mb-2 -mt-4 transform group-hover:scale-105 transition-transform duration-700">
                                <img src="/images/KEMENTERIAN-PERTAHANAN.png" alt="Kemhan" className="h-16 w-16 md:h-28 md:w-28 object-contain drop-shadow-2xl" />
                                <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Bacan" className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-2xl" />
                            </div> */}
                            <div className="flex justify-center items-center gap-8 mb-1 -mt-8 transform group-hover:scale-105 transition-transform duration-700">
                                <img src="/images/KEMENTERIAN-PERTAHANAN.png" alt="Kemhan" className="h-28 w-28 md:h-40 md:w-40 object-contain drop-shadow-2xl" />
                                <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Bacan" className="h-20 w-auto md:h-28 md:w-28 object-contain drop-shadow-2xl" />
                            </div>

                            <CardTitle className="text-xl md:text-2xl font-black text-[#AC0021] mb-2 -mt-6 tracking-tight whitespace-nowrap">
                                Pendaftaran Pengguna Baru
                            </CardTitle>

                            <p className="text-gray-400 text-sm mb-6 -mt-2 max-w-xs mx-auto">
                                {step === 1 && "Lengkapi data diri Anda untuk memulai."}
                                {step === 2 && "Buat kata sandi yang aman untuk akun Anda."}
                                {step === 3 && "Masukkan kode OTP untuk verifikasi akun Anda."}
                            </p>

                            {/* 3-Step Stepper */}
                            <div className="flex justify-center items-start w-full mb-2 relative">
                                {[
                                    { num: 1, label: 'Registrasi' },
                                    { num: 2, label: 'Password' },
                                    { num: 3, label: 'Verifikasi' }
                                ].map((s, index) => (
                                    <React.Fragment key={s.num}>
                                        <div className="flex flex-col items-center relative z-10 w-24">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s.num
                                                    ? 'bg-[#AC0021] text-white ring-4 ring-[#AC0021]/30 shadow-[0_0_15px_#AC0021]'
                                                    : 'bg-white/10 border-2 border-white/20 text-gray-400'
                                                    }`}
                                            >
                                                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold mt-2 text-center transition-colors duration-300 ${step >= s.num ? 'text-[#AC0021]' : 'text-gray-600'
                                                }`}>
                                                {s.label}
                                            </span>
                                        </div>
                                        {index < 2 && (
                                            <div className="h-[2px] flex-1 mx-2 bg-white/10 mt-5 relative">
                                                <div
                                                    className={`absolute top-0 left-0 h-full bg-[#AC0021] transition-all duration-500 ease-out`}
                                                    style={{ width: step > s.num ? '100%' : '0%' }}
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                        </CardHeader>

                        <CardContent className="animate-fade-in-up delay-200 -mt-2">
                            {/* STEP 1 & 2 FORM */}
                            {step < 3 && (
                                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                    {step === 1 && (
                                        <div className="space-y-4">
                                            <div className="space-y-3">
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
                                                {errors.name && <p className="text-[#AC0021] text-sm">{errors.name}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="username" className={labelClasses}>Username</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="username"
                                                        type="text"
                                                        placeholder="johndoe"
                                                        value={data.username}
                                                        onChange={(e) => setData('username', e.target.value)}
                                                        onBlur={(e) => checkAvailability('username', e.target.value)}
                                                        className={`${inputClasses} ${validationErrors.username ? 'border-[#AC0021] focus:border-[#AC0021]' : ''}`}
                                                        required
                                                    />
                                                </div>
                                                {validationErrors.username && <p className="text-[#AC0021] text-sm mt-1">{validationErrors.username}</p>}
                                                {errors.username && <p className="text-[#AC0021] text-sm">{errors.username}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="email" className={labelClasses}>Email</Label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="nama@bacanas.go.id"
                                                        value={data.email}
                                                        onChange={(e) => setData('email', e.target.value)}
                                                        onBlur={(e) => checkAvailability('email', e.target.value)}
                                                        className={`${inputClasses} ${validationErrors.email ? 'border-[#AC0021] focus:border-[#AC0021]' : ''}`}
                                                        required
                                                    />
                                                </div>
                                                {validationErrors.email && <p className="text-[#AC0021] text-sm mt-1">{validationErrors.email}</p>}
                                                {errors.email && <p className="text-[#AC0021] text-sm">{errors.email}</p>}
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="phone_number" className={labelClasses}>Nomor Telepon</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="phone_number"
                                                        placeholder="(+62) 8xx - xxxx - xxxx"
                                                        value={data.phone_number}
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, '');
                                                            if (value.startsWith('62')) value = value.slice(2);
                                                            if (value.startsWith('0')) value = value.slice(1);
                                                            let formatted = '';
                                                            if (value.length > 0) {
                                                                formatted = `(+62) ${value.slice(0, 3)}`;
                                                                if (value.length >= 4) formatted += ` - ${value.slice(3, 7)}`;
                                                                if (value.length >= 8) formatted += ` - ${value.slice(7, 11)}`;
                                                            }
                                                            setData('phone_number', formatted);
                                                        }}
                                                        onBlur={(e) => {
                                                            const cleanPhone = formatPhoneNumberForApi(data.phone_number);
                                                            if (cleanPhone) checkAvailability('phone_number', cleanPhone);
                                                        }}
                                                        className={`${inputClasses} ${validationErrors.phone_number ? 'border-[#AC0021] focus:border-[#AC0021]' : ''}`}
                                                        required
                                                    />
                                                </div>
                                                {validationErrors.phone_number && <p className="text-[#AC0021] text-sm mt-1">{validationErrors.phone_number}</p>}
                                                {errors.phone_number && <p className="text-[#AC0021] text-sm">{errors.phone_number}</p>}
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={handleNextStep}
                                                className="w-full bg-[#AC0021] hover:bg-[#AC0021]/90 text-white font-bold mt-2 h-12"
                                                disabled={!!validationErrors.username || !!validationErrors.email || !!validationErrors.phone_number}
                                            >
                                                Lanjut
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}

                                    {step === 2 && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="password" className={labelClasses}>Kata Sandi <span className="text-[#AC0021]">*</span></Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="Minimal 8 karakter"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                        onPaste={(e) => e.preventDefault()}
                                                        autoComplete="new-password"
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
                                                {errors.password && <p className="text-[#AC0021] text-sm">{errors.password}</p>}

                                                {/* Password Strength Meter */}
                                                {data.password.length > 0 && (
                                                    <div className="space-y-1 mt-2">
                                                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-300 ${strength <= 25 ? 'bg-[#AC0021] w-[25%]' :
                                                                    strength <= 50 ? 'bg-orange-500 w-[50%]' :
                                                                        strength <= 75 ? 'bg-yellow-500 w-[75%]' :
                                                                            'bg-[#659800] w-[100%]'
                                                                    }`}
                                                            ></div>
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <span className={`text-xs font-bold ${strength <= 25 ? 'text-[#AC0021]' :
                                                                strength <= 50 ? 'text-orange-500' :
                                                                    strength <= 75 ? 'text-yellow-500' :
                                                                        'text-[#659800]'
                                                                }`}>
                                                                {strength <= 25 && 'Lemah'}
                                                                {strength > 25 && strength <= 50 && 'Cukup'}
                                                                {strength > 50 && strength <= 75 && 'Sedang'}
                                                                {strength > 75 && 'Kuat'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-1">
                                                    {[
                                                        { label: 'Minimal 8 karakter', valid: data.password.length >= 8 },
                                                        { label: 'Huruf besar (A-Z)', valid: /[A-Z]/.test(data.password) },
                                                        { label: 'Angka (0-9)', valid: /[0-9]/.test(data.password) },
                                                        { label: 'Karakter spesial (!@#$...)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(data.password) },
                                                    ].map((req, index) => (
                                                        <div key={index} className="flex items-center gap-2 text-xs">
                                                            {req.valid ? (
                                                                <Check className="h-3.5 w-3.5 text-[#659800]" />
                                                            ) : (
                                                                <X className="h-3.5 w-3.5 text-gray-600" />
                                                            )}
                                                            <span className={req.valid ? 'text-[#659800] font-medium' : 'text-gray-500'}>{req.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label htmlFor="password_confirmation" className={labelClasses}>Konfirmasi Kata Sandi <span className="text-[#AC0021]">*</span></Label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="password_confirmation"
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="Ulangi kata sandi"
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                        onPaste={(e) => e.preventDefault()}
                                                        autoComplete="new-password"
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
                                                {data.password_confirmation && data.password !== data.password_confirmation && (
                                                    <div className="flex items-center gap-1 text-[#AC0021] text-xs mt-1">
                                                        <X className="h-3.5 w-3.5" />
                                                        <span>Kata sandi tidak cocok</span>
                                                    </div>
                                                )}
                                                {data.password_confirmation && data.password === data.password_confirmation && (
                                                    <div className="flex items-center gap-1 text-[#659800] text-xs mt-1">
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span>Kata sandi cocok</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-4 mt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setStep(1)}
                                                    className="flex-1 bg-transparent border-2 border-white/20 text-[#FEFCF8] hover:bg-white/5 hover:border-[#FEFCF8]/50 hover:shadow-[0_0_15px_rgba(254,252,248,0.1)] font-bold h-12 transition-all duration-300"
                                                >
                                                    Kembali
                                                </Button>
                                                <Button
                                                    type="submit"
                                                    className="flex-1 bg-[#AC0021] hover:bg-[#AC0021]/90 text-white font-bold h-12"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Memproses...' : 'Kirim OTP'}
                                                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            )}

                            {/* STEP 3 FORM (OTP) */}
                            {step === 3 && (
                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex justify-center mb-4">
                                            <div className="h-16 w-16 bg-[#659800] rounded-full flex items-center justify-center shadow-[0_0_20px_#659800] animate-pulse">
                                                <Mail className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-sm">
                                            Kode OTP telah dikirim ke <span className="text-[#FEFCF8] font-bold">{data.email}</span>
                                        </p>
                                    </div>

                                    <div className="space-y-2 flex flex-col items-center">
                                        <div className="flex justify-center w-full">
                                            <InputOTP maxLength={6} value={otpInput} onChange={setOtpInput}>
                                                <InputOTPGroup className="gap-2">
                                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                            className="h-14 w-12 border-0 border-b-2 border-white/20 bg-transparent text-[#FEFCF8] text-3xl font-bold rounded-none shadow-none transition-all duration-300 focus:border-0 focus:border-b-4 focus:border-[#AC0021] focus:ring-0 outline-none hover:bg-white/5 active:bg-transparent first:border-l-0 first:rounded-none last:rounded-none"
                                                        />
                                                    ))}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setStep(2)}
                                            className="flex-1 bg-white/10 border-2 border-white/30 text-[#FEFCF8] hover:bg-white/20 hover:border-[#FEFCF8]/60 hover:shadow-[0_0_15px_rgba(254,252,248,0.2)] font-bold h-12 transition-all duration-300"
                                        >
                                            Kembali
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 bg-[#AC0021] hover:bg-[#AC0021]/90 text-white font-bold h-12 shadow-lg hover:shadow-[#AC0021]/20"
                                            disabled={processing || otpInput.length !== 6}
                                        >
                                            {processing ? 'Verifikasi...' : 'Verifikasi'}
                                        </Button>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <button
                                            type="button"
                                            onClick={handleResendOTP}
                                            disabled={loading}
                                            className="text-gray-400 font-medium hover:text-[#AC0021] transition-colors disabled:opacity-50 text-sm hover:underline"
                                        >
                                            {loading ? 'Mengirim...' : 'Kirim ulang OTP'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Login Link  */}
                            <div className="mt-8 text-center border-t border-white/10 pt-4">
                                <div className="text-sm text-gray-400">
                                    Sudah punya akun?{' '}
                                    <Link
                                        href={route('login')}
                                        className="text-[#AC0021] p-0 h-auto font-bold hover:underline transition-colors"
                                    >
                                        Masuk
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
