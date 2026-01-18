import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { User, Phone, Shield, LoaderCircle, Check, X, Eye, EyeOff, Lock, CheckCircle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import GuestLayout from '@/layouts/GuestLayout';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });
    const [passwords, setPasswords] = useState({
        password: '',
        password_confirmation: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Calculate password strength
    const calculateStrength = (pass: string) => {
        let strength = 0;
        if (pass.length === 0) return 0;
        if (pass.length >= 8) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/[0-9]/.test(pass)) strength += 25;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 25;
        return strength;
    };

    const strength = calculateStrength(passwords.password);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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

    const handleSubmitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation: require username/email and phone
        if (!formData.name.trim()) {
            toast.error('Masukkan username atau email');
            return;
        }

        if (!formData.phone.trim()) {
            toast.error('Masukkan nomor telepon terdaftar');
            return;
        }

        setLoading(true);

        try {
            // Call backend to send OTP Reset (expects { keyword, phone_number })
            await axios.post(route('otp.send-reset'), {
                keyword: formData.name, // Send as keyword (username/email)
                phone_number: formatPhoneNumberForApi(formData.phone),
            });

            toast.success('Kode OTP telah dikirim ke email terdaftar! Silakan periksa kotak masuk atau spam.');
            setStep(2);
        } catch (error) {
            const message = (error as any)?.response?.data?.message ?? 'Gagal mengirim kode OTP. Silakan coba lagi.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Check OTP Validity Only
    const handleCheckOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error('Kode OTP harus 6 digit');
            return;
        }

        setLoading(true);

        try {
            // Verify OTP without resetting password yet
            await axios.post(route('otp.check'), {
                keyword: formData.name,
                otp
            });

            toast.success('Kode OTP valid! Silakan atur password baru.');
            setStep(3); // Move to password input step
        } catch (error) {
            const message = (error as any)?.response?.data?.message ?? 'Kode OTP tidak valid.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.password.length < 8) {
            toast.error('Password baru minimal 8 karakter');
            return;
        }

        if (!/[A-Z]/.test(passwords.password)) {
            toast.error('Password harus memiliki huruf besar');
            return;
        }

        if (!/[0-9]/.test(passwords.password)) {
            toast.error('Password harus memiliki angka');
            return;
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwords.password)) {
            toast.error('Password harus memiliki karakter spesial');
            return;
        }

        if (passwords.password !== passwords.password_confirmation) {
            toast.error('Password dan konfirmasi password tidak sama');
            return;
        }

        setLoading(true);

        try {
            // Call backend to really reset password and wipe E-KYC
            await axios.post(route('otp.verify-reset'), {
                keyword: formData.name,
                phone_number: formatPhoneNumberForApi(formData.phone),
                otp, // OTP needed for final verification
                password: passwords.password,
                password_confirmation: passwords.password_confirmation,
            });

            toast.success('Password berhasil diubah! Silakan login dan verifikasi ulang identitas.');
            window.location.href = route('login');
        } catch (error) {
            const message = (error as any)?.response?.data?.message ?? 'Gagal mengubah password.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Assets
    const logoImage = "/images/KEMENTERIAN-PERTAHANAN.png";

    // RENDER STEPS

    // STEP 2: INPUT OTP
    if (step === 2) {
        return (
            <GuestLayout title="Verifikasi OTP" hideHeader={true}>
                <Card className="w-full max-w-md relative z-10 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-[#FEFCF8] shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-6 px-2">
                            <div className="flex-shrink-0 flex gap-4 items-center">
                                <img src={logoImage} alt="Logo Kementerian Pertahanan" className="h-36 w-36 object-contain drop-shadow-2xl" />
                                <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Logo Badan Cadangan Nasional" className="h-28 w-28 object-contain drop-shadow-2xl" />
                            </div>
                        </div>
                        <div className="text-center mb-1 -mt-9">
                            <h2 className="text-2xl font-black text-[#AC0021] mb-2 uppercase tracking-tight leading-tight">Verifikasi OTP</h2>
                            <p className="text-gray-400 text-xs font-medium tracking-wide mb-4">Masukkan kode OTP yang dikirim ke email <span className="text-[#FEFCF8] font-bold">{formData.name}</span></p>

                            <div className="flex justify-center gap-2 mb-2">
                                <div className="h-1.5 w-8 bg-[#AC0021] rounded-full transition-colors duration-500"></div>
                                <div className="h-1.5 w-8 bg-[#AC0021] rounded-full transition-colors duration-500"></div>
                                <div className="h-1.5 w-8 bg-gray-600 rounded-full transition-colors duration-500"></div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCheckOTP} className="space-y-6">
                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup className="gap-6">
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

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#AC0021] hover:bg-[#AC0021]/90 text-[#FEFCF8] font-bold shadow-lg transition-all mt-4"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        Verifikasi...
                                    </span>
                                ) : 'Verifikasi OTP'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                            >
                                Kembali
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </GuestLayout>
        );
    }

    // STEP 3: NEW PASSWORD
    if (step === 3) {
        return (
            <GuestLayout title="Password Baru" hideHeader={true}>
                <style>{`
                    input[type="password"]::-ms-reveal,
                    input[type="password"]::-ms-clear {
                        display: none;
                    }
                `}</style>
                <Card className="w-full max-w-md relative z-10 bg-[#1a1a1a]/95 backdrop-blur-xl border-2 border-white/10 text-[#FEFCF8] shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center items-center gap-2 mb-2 transform group-hover:scale-105 transition-transform duration-700">
                            <img src="/images/KEMENTERIAN-PERTAHANAN.png" alt="Kemhan" className="h-28 w-28 md:h-40 md:w-40 object-contain drop-shadow-2xl" />
                            <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Bacan" className="h-28 w-28 object-contain drop-shadow-2xl" />
                        </div>

                        <div className="text-center mb-1 -mt-9">
                            <h2 className="text-2xl font-black text-[#AC0021] mb-2 uppercase tracking-tight leading-tight">Password Baru</h2>
                            <p className="text-gray-400 text-xs font-medium tracking-wide mb-4">Buat kata sandi baru untuk mengamankan akun Anda</p>

                            <div className="flex justify-center gap-2 mb-2">
                                <div className="h-1.5 w-8 bg-[#AC0021] rounded-full transition-colors duration-500"></div>
                                <div className="h-1.5 w-8 bg-[#AC0021] rounded-full transition-colors duration-500"></div>
                                <div className="h-1.5 w-8 bg-[#AC0021] rounded-full transition-colors duration-500"></div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-4">
                                {/* Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password">Kata Sandi <span className="text-[#AC0021]">*</span></Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-[#FEFCF8] transition-colors" />
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={passwords.password}
                                            onChange={(e) => setPasswords(prev => ({ ...prev, password: e.target.value }))}
                                            className="pl-10 pr-10 bg-[#0f0f0f] border-white/10 text-[#FEFCF8] placeholder:text-gray-600 focus:border-white focus:ring-0 h-12 rounded-lg transition-all"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-gray-500 hover:text-[#FEFCF8] transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>

                                    {/* Password Strength Meter - Only show when typing */}
                                    {passwords.password.length > 0 && (
                                        <div className="space-y-1">
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

                                    {/* Validation List */}
                                    <div className="space-y-1 pt-1">
                                        {[
                                            { label: 'Minimal 8 karakter', valid: passwords.password.length >= 8 },
                                            { label: 'Mengandung huruf besar (A-Z)', valid: /[A-Z]/.test(passwords.password) },
                                            { label: 'Mengandung angka (0-9)', valid: /[0-9]/.test(passwords.password) },
                                            { label: 'Mengandung karakter spesial (!@#$%^&*)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.password) },
                                        ].map((req, index) => (
                                            <div key={index} className="flex items-center gap-2 text-xs">
                                                {req.valid ? (
                                                    <CheckCircle className="h-3.5 w-3.5 text-[#659800]" />
                                                ) : (
                                                    <XCircle className="h-3.5 w-3.5 text-gray-600" />
                                                )}
                                                <span className={req.valid ? 'text-[#659800] font-medium' : 'text-gray-500'}>{req.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi <span className="text-[#AC0021]">*</span></Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-[#FEFCF8] transition-colors" />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={passwords.password_confirmation}
                                            onChange={(e) => setPasswords(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                            className={`pl-10 pr-10 bg-[#0f0f0f] border-white/10 text-[#FEFCF8] placeholder:text-gray-600 h-12 rounded-lg transition-all ${passwords.password_confirmation && passwords.password !== passwords.password_confirmation
                                                ? 'focus:border-[#AC0021] border-[#AC0021]/50'
                                                : 'focus:border-blue-500' // Blue focus as per screenshot hint
                                                }`}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-gray-500 hover:text-[#FEFCF8] transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {passwords.password_confirmation && passwords.password !== passwords.password_confirmation && (
                                        <div className="flex items-center gap-1 text-[#AC0021] text-xs mt-1">
                                            <XCircle className="h-3.5 w-3.5" />
                                            <span>Kata sandi tidak cocok</span>
                                        </div>
                                    )}
                                    {passwords.password_confirmation && passwords.password === passwords.password_confirmation && (
                                        <div className="flex items-center gap-1 text-[#659800] text-xs mt-1">
                                            <CheckCircle className="h-3.5 w-3.5" />
                                            <span>Kata sandi cocok</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#AC0021] hover:bg-[#AC0021]/90 text-[#FEFCF8] font-bold shadow-lg transition-all mt-6"
                                disabled={loading || passwords.password.length < 8 || passwords.password !== passwords.password_confirmation}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        Simpan Password...
                                    </span>
                                ) : 'Simpan Password Baru'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </GuestLayout>
        );
    }

    // Step 1: Default Form
    return (
        <GuestLayout title="Atur Ulang Kata Sandi" hideHeader={true}>
            <Card className="w-full max-w-md relative z-10 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-[#FEFCF8] shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-2 transform group-hover:scale-105 transition-transform duration-700">
                        <img src="/images/KEMENTERIAN-PERTAHANAN.png" alt="Kemhan" className="h-28 w-28 md:h-40 md:w-40 object-contain drop-shadow-2xl" />
                        <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Bacan" className="h-28 w-28 object-contain drop-shadow-2xl" />
                    </div>

                    <div className="text-center mb-1 -mt-9">
                        <h2 className="text-2xl font-black text-[#AC0021] mb-2 uppercase tracking-tight leading-tight">Reset Password</h2>
                        <p className="text-gray-400 text-xs font-medium tracking-wide mb-4">Masukkan username atau email dan nomor telepon yang terdaftar</p>

                        <div className="flex justify-center gap-2 mb-2">
                            <div className="h-1.5 w-8 bg-[#AC0021] rounded-full"></div>
                            <div className="h-1.5 w-8 bg-gray-600 rounded-full"></div>
                            <div className="h-1.5 w-8 bg-gray-600 rounded-full"></div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[#FEFCF8] font-bold">Username atau Email</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="name"
                                    placeholder="Username atau email terdaftar"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="pl-10 bg-black/50 border-white/10 text-[#FEFCF8] placeholder:text-gray-500 focus:border-[#AC0021] h-11"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">No. Telepon</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="phone"
                                    placeholder="(+62) 8xx - xxxx - xxxx"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        // Remove all non-digit characters
                                        let value = e.target.value.replace(/\D/g, '');

                                        // Remove country code if user types it
                                        if (value.startsWith('62')) {
                                            value = value.slice(2);
                                        }

                                        // Remove leading 0 if present
                                        if (value.startsWith('0')) {
                                            value = value.slice(1);
                                        }

                                        // Format the number as (+62) 8xx - xxxx - xxxx
                                        let formatted = '';
                                        if (value.length > 0) {
                                            formatted = `(+62) ${value.slice(0, 3)}`;
                                            if (value.length >= 4) {
                                                formatted += ` - ${value.slice(3, 7)}`;
                                            }
                                            if (value.length >= 8) {
                                                formatted += ` - ${value.slice(7, 11)}`;
                                            }
                                        }
                                        handleInputChange('phone', formatted);
                                    }}
                                    className="pl-10 bg-black/50 border-white/10 text-[#FEFCF8] placeholder:text-gray-500 focus:border-[#AC0021] h-11"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#AC0021] hover:bg-[#AC0021]/90 text-[#FEFCF8] font-bold shadow-lg transition-all mt-4 group"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                    Mengirim OTP...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Kirim OTP
                                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-[#FEFCF8] transition-all duration-300 hover:drop-shadow-[0_0_5px_#AC0021]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Kembali ke Login</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
