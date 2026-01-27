import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm, Link } from '@inertiajs/react';
import { Building2, ArrowLeft } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function MitraLogin() {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('mitra.login.post'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <Head title="Login Mitra - E-Surat Komcad" />

            {/* Left Side - Form */}
            <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-background">
                <div className="w-full max-w-sm mx-auto space-y-8">
                    <div className="space-y-2">
                        <Link
                            href="/"
                            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Beranda
                        </Link>
                        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Building2 className="h-8 w-8" />
                            <span className="text-xl font-bold tracking-tight">Mitra Komcad</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Login Mitra Admin</h1>
                        <p className="text-muted-foreground">
                            Masuk untuk mengelola data anggota komcad dari instansi Anda.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="code">Kode Mitra</Label>
                            <Input
                                id="code"
                                type="text"
                                name="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                placeholder="MIT-202X-XXXX"
                                autoFocus
                                className={errors.code ? 'border-red-500' : ''}
                            />
                            {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="username"
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                autoComplete="current-password"
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700" size="lg" disabled={processing}>
                            {processing ? 'Memproses...' : 'Masuk'}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Side - Branding */}
            <div className="hidden lg:flex flex-col justify-center p-12 bg-zinc-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
                <div className="relative z-10 max-w-lg mx-auto space-y-6">
                    <h2 className="text-4xl font-bold leading-tight">
                        Platform Manajemen Komponen Cadangan Terintegrasi
                    </h2>
                    <p className="text-lg text-zinc-400">
                        Kelola pendaftaran dan data anggota komponen cadangan dari instansi Anda dengan mudah, aman, dan efisien.
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-8">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-lg mb-1">Terdata</h3>
                            <p className="text-sm text-zinc-400">Data anggota tersimpan aman dan terpusat.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <h3 className="font-semibold text-lg mb-1">Efisien</h3>
                            <p className="text-sm text-zinc-400">Proses pendaftaran massal yang cepat.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
