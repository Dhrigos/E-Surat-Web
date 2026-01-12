import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { User, Phone, Shield, LoaderCircle } from 'lucide-react';
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

        if (!passwords.password || passwords.password.length < 6) {
            toast.error('Password baru minimal 6 karakter');
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
                <Card className="w-full max-w-md relative z-10 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-white shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-6 px-2">
                            <div className="flex-shrink-0 flex gap-4 items-center">
                                <img src={logoImage} alt="Logo Kementerian Pertahanan" className="h-36 w-36 object-contain drop-shadow-2xl" />
                                <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Logo Badan Cadangan Nasional" className="h-28 w-28 object-contain drop-shadow-2xl" />
                            </div>
                        </div>

                        <CardTitle className="text-2xl md:text-3xl text-red-600">Verifikasi OTP</CardTitle>
                        <CardDescription className="text-gray-400">
                            Masukkan kode OTP yang dikirim ke email <span className="text-white font-bold">{formData.name}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCheckOTP} className="space-y-6">
                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup className="gap-2">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                                className="h-12 w-12 border-2 border-white/20 bg-black/50 text-white text-lg font-bold focus:border-red-600 focus:ring-red-600/20 rounded-md"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg transition-all mt-4"
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
                <Card className="w-full max-w-md relative z-10 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-white shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="flex items-center justify-center mb-6 px-2">
                            <div className="flex-shrink-0 flex gap-4 items-center">
                                <img src={logoImage} alt="Logo Kementerian Pertahanan" className="h-36 w-36 object-contain drop-shadow-2xl" />
                                <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Logo Badan Cadangan Nasional" className="h-28 w-28 object-contain drop-shadow-2xl" />
                            </div>
                        </div>

                        <CardTitle className="text-2xl md:text-3xl text-red-600">Password Baru</CardTitle>
                        <CardDescription className="text-gray-400">
                            Silakan atur password baru Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password Baru</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Minimal 6 karakter"
                                        value={passwords.password}
                                        onChange={(e) => setPasswords(prev => ({ ...prev, password: e.target.value }))}
                                        className="pl-3 bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-red-600 h-11"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                <div className="relative">
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Ulangi password baru"
                                        value={passwords.password_confirmation}
                                        onChange={(e) => setPasswords(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                        className="pl-3 bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-red-600 h-11"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg transition-all mt-4"
                                disabled={loading || passwords.password.length < 6 || passwords.password !== passwords.password_confirmation}
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
            <Card className="w-full max-w-md relative z-10 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-white shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center mb-6 px-2">
                        <div className="flex-shrink-0 flex gap-4 items-center">
                            <img src={logoImage} alt="Logo Kementerian Pertahanan" className="h-36 w-36 object-contain drop-shadow-2xl" />
                            <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Logo Badan Cadangan Nasional" className="h-28 w-28 object-contain drop-shadow-2xl" />
                        </div>
                    </div>

                    <CardTitle className="text-2xl md:text-3xl font-black text-red-600 mb-2 tracking-tight whitespace-nowrap">Badan Cadangan Nasional</CardTitle>
                    <CardDescription className="text-gray-400 font-bold text-base">
                        Atur Ulang Kata Sandi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitForm} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-white font-bold">Username atau Email</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="name"
                                    placeholder="Username atau email terdaftar"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-red-600 h-11"
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
                                    className="pl-10 bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus:border-red-600 h-11"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg transition-all mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                    Mengirim OTP...
                                </span>
                            ) : 'Kirim OTP'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <div className="text-sm text-gray-400">
                            Ingat password Anda?{' '}
                            <Link
                                href={route('login')}
                                className="text-red-500 hover:text-red-400 font-bold transition-colors"
                            >
                                Masuk sekarang
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
