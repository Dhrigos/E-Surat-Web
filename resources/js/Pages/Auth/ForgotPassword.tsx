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
            // Call backend to send OTP (expects { email, phone_number })
            await axios.post(route('otp.send'), {
                email: formData.name,
                phone_number: formData.phone,
            });

            toast.success('Kode OTP telah dikirim ke email! Silakan periksa kotak masuk Anda atau spam email.');
            setStep(2);
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.error('Gagal mengirim kode OTP. Silakan coba lagi.');


        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validate OTP and passwords
        if (otp.length !== 6) {
            toast.error('Kode OTP harus 6 digit');
            return;
        }

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
            // Call backend to verify OTP and reset password
            await axios.post(route('otp.verify-reset'), {
                email: formData.name,
                phone_number: formData.phone,
                otp,
                password: passwords.password,
                password_confirmation: passwords.password_confirmation,
            });

            toast.success('Password berhasil diubah! Silakan login dengan password baru');
            window.location.href = route('login');
        } catch (error) {
            console.error('Error verifying OTP / resetting password:', error);
            const message = (error as any)?.response?.data?.message ?? 'Gagal mengubah password. Silakan coba lagi.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    // Assets
    const logoImage = "/images/KEMENTERIAN-PERTAHANAN.png";

    if (step === 2) {
        return (
            <GuestLayout title="Verifikasi OTP" hideHeader={true}>
                <Card className="w-full max-w-md relative z-10 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-white shadow-2xl">
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

                        <CardTitle className="text-2xl md:text-3xl text-red-600 animate-in fade-in duration-700 delay-200">Verifikasi OTP</CardTitle>
                        <CardDescription className="text-gray-400">
                            Masukkan kode OTP yang dikirim ke <span className="text-white font-bold">{formData.phone}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="flex justify-center">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                                    <InputOTPGroup className="gap-2">
                                        {[0, 1, 2, 3, 4, 5].map((index) => (
                                            <InputOTPSlot
                                                key={index}
                                                index={index}
                                                className="h-12 w-12 border-2 border-white/20 bg-black/50 text-white text-lg font-bold focus:border-red-600 focus:ring-red-600/20 rounded-md transition-all"
                                            />
                                        ))}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            {/* Password fields shown alongside OTP to complete reset */}
                            <div className="space-y-2 mt-4">
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
                                disabled={loading || otp.length !== 6 || passwords.password.length < 6 || passwords.password !== passwords.password_confirmation}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <LoaderCircle className="h-5 w-5 animate-spin" />
                                        Verifikasi...
                                    </span>
                                ) : 'Ubah Password'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setStep(1)}
                                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
                            >
                                Kembali ke form reset password
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </GuestLayout>
        );
    }

    return (
        <GuestLayout title="Reset Password" hideHeader={true}>
            <Card className="w-full max-w-md relative z-10 bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 text-white shadow-2xl">
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
                        Reset Password
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
                                    placeholder="Nomor telepon terdaftar"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
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
