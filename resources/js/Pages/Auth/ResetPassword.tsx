import { update } from '@/routes/password';
import { useForm, Head } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import GuestLayout from '@/layouts/GuestLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, LoaderCircle } from 'lucide-react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(update.url(), {
            onSuccess: () => reset('password', 'password_confirmation'),
        });
    };

    const calculateStrength = (pass: string) => {
        let strength = 0;
        if (pass.length >= 8) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/[0-9]/.test(pass)) strength += 25;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) strength += 25;
        return strength;
    };

    const strength = calculateStrength(data.password);

    return (
        <GuestLayout title="Reset Password" hideHeader={true}>
            <Head title="Reset Password" />

            <Card className="w-full max-w-md relative z-10 bg-[#1a1a1a]/95 backdrop-blur-xl border-2 border-white/10 text-[#FEFCF8] shadow-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-2 mb-2 transform group-hover:scale-105 transition-transform duration-700">
                        <img src="/images/KEMENTERIAN-PERTAHANAN.png" alt="Kemhan" className="h-28 w-28 md:h-40 md:w-40 object-contain drop-shadow-2xl" />
                        <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="Bacan" className="h-28 w-28 object-contain drop-shadow-2xl" />
                    </div>

                    <div className="text-center mb-1 -mt-9">
                        <h2 className="text-2xl font-black text-[#AC0021] mb-2 uppercase tracking-tight leading-tight">Manajemen Informasi<br />Badan Cadangan Nasional</h2>
                        <p className="text-gray-400 text-xs font-medium tracking-wide">Sistem ini hanya diperuntukkan bagi personel BACADNAS</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={submit} className="space-y-6">
                        {/* New Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Kata Sandi Baru <span className="text-[#AC0021]">*</span></Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500 group-focus-within:text-[#FEFCF8] transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
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

                            {/* Password Strength Meter */}
                            {data.password.length > 0 && (
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
                                    { label: 'Minimal 8 karakter', valid: data.password.length >= 8 },
                                    { label: 'Mengandung huruf besar (A-Z)', valid: /[A-Z]/.test(data.password) },
                                    { label: 'Mengandung angka (0-9)', valid: /[0-9]/.test(data.password) },
                                    { label: 'Mengandung karakter spesial (!@#$%^&*)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(data.password) },
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
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    className={`pl-10 pr-10 bg-[#0f0f0f] border-white/10 text-[#FEFCF8] placeholder:text-gray-600 h-12 rounded-lg transition-all ${data.password_confirmation && data.password !== data.password_confirmation
                                        ? 'focus:border-[#AC0021] border-[#AC0021]/50'
                                        : 'focus:border-blue-500'
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
                            {data.password_confirmation && data.password !== data.password_confirmation && (
                                <div className="flex items-center gap-1 text-[#AC0021] text-xs mt-1">
                                    <XCircle className="h-3.5 w-3.5" />
                                    <span>Kata sandi tidak cocok</span>
                                </div>
                            )}
                            {data.password_confirmation && data.password === data.password_confirmation && (
                                <div className="flex items-center gap-1 text-[#659800] text-xs mt-1">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>Kata sandi cocok</span>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#AC0021] hover:bg-[#AC0021]/90 text-[#FEFCF8] font-bold shadow-lg transition-all mt-6"
                            disabled={processing || data.password.length < 8 || data.password !== data.password_confirmation}
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                    Menyimpan...
                                </span>
                            ) : 'Simpan Password Baru'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </GuestLayout>
    );
}
