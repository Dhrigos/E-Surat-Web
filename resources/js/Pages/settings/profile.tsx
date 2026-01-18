import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import AppearanceTabs from '@/components/appearance-tabs';
import { send } from '@/routes/verification';
import { type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage, router } from '@inertiajs/react';
import { useRef, useState, type ChangeEvent } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, FileText, Lock, Palette, CheckCircle2, Camera, Activity, AlertTriangle } from 'lucide-react';
import ActivityTimeline from '@/Pages/settings/partials/activity-timeline';
import AppLayout from '@/layouts/app-layout';
import { edit } from '@/routes/profile';
import UpdateProfileDetailsForm from './partials/update-profile-details-form';

export default function Profile({
    mustVerifyEmail,
    userDetail,
    jabatans,
    activityLogs,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    userDetail: any;
    jabatans: any[];
    activityLogs: any[];
}) {
    const { auth } = usePage<SharedData>().props;
    const initials = auth.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <AppLayout>
            <Head title="Profile settings" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Pengaturan Akun</h1>
                    <p className="text-muted-foreground mt-1">
                        Pusat pengaturan profil, keamanan, dan preferensi aplikasi Anda.
                    </p>
                </div>

                <Tabs defaultValue="account" className="flex flex-col gap-0">
                    {/* Tabs Navigation */}
                    <div className="bg-white dark:bg-[#262626] border-t border-x border-zinc-200 dark:border-zinc-800 rounded-none mb-0 overflow-visible z-10 relative">
                        <TabsList className="flex w-full justify-start h-auto p-0 bg-transparent rounded-none border-b border-zinc-200 dark:border-zinc-700">
                            <TabsTrigger
                                value="account"
                                className="relative inline-flex items-center justify-center py-3 px-6 text-sm font-semibold transition-all duration-200 whitespace-nowrap gap-2 -mb-px rounded-t-lg rounded-b-none border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-700 data-[state=active]:border-b-white dark:data-[state=active]:border-b-[#262626] data-[state=active]:bg-white dark:data-[state=active]:bg-[#262626] data-[state=active]:text-[#ac3500] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 data-[state=active]:z-10"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden md:inline">Akun</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="details"
                                className="relative inline-flex items-center justify-center py-3 px-6 text-sm font-semibold transition-all duration-200 whitespace-nowrap gap-2 -mb-px rounded-t-lg rounded-b-none border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-700 data-[state=active]:border-b-white dark:data-[state=active]:border-b-[#262626] data-[state=active]:bg-white dark:data-[state=active]:bg-[#262626] data-[state=active]:text-[#ac3500] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 data-[state=active]:z-10"
                            >
                                <FileText className="w-4 h-4" />
                                <span className="hidden md:inline">Detail Profil</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="password"
                                className="relative inline-flex items-center justify-center py-3 px-6 text-sm font-semibold transition-all duration-200 whitespace-nowrap gap-2 -mb-px rounded-t-lg rounded-b-none border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-700 data-[state=active]:border-b-white dark:data-[state=active]:border-b-[#262626] data-[state=active]:bg-white dark:data-[state=active]:bg-[#262626] data-[state=active]:text-[#ac3500] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 data-[state=active]:z-10"
                            >
                                <Lock className="w-4 h-4" />
                                <span className="hidden md:inline">Password</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="activity"
                                className="relative inline-flex items-center justify-center py-3 px-6 text-sm font-semibold transition-all duration-200 whitespace-nowrap gap-2 -mb-px rounded-t-lg rounded-b-none border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-700 data-[state=active]:border-b-white dark:data-[state=active]:border-b-[#262626] data-[state=active]:bg-white dark:data-[state=active]:bg-[#262626] data-[state=active]:text-[#ac3500] text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 data-[state=active]:z-10"
                            >
                                <Activity className="w-4 h-4" />
                                <span className="hidden md:inline">Aktifitas</span>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="min-h-[500px]">
                        {/* ACCOUNT TAB */}
                        <TabsContent value="account" className="space-y-8 mt-0">
                            <div className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-none rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group min-h-[500px]">
                                <div className="border-0 relative overflow-hidden bg-[#262626] text-white rounded-none h-full">
                                    {/* Banner */}
                                    <div className="h-48 relative border-none">
                                        <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/50 to-transparent opacity-50"></div>
                                    </div>

                                    <CardContent className="pt-0 px-8 pb-8">
                                        <form
                                            action={ProfileController.update.url()}
                                            method="post"
                                            encType="multipart/form-data"
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const formData = new FormData(e.currentTarget);
                                                formData.append('_method', 'PATCH');
                                                router.post(ProfileController.update.url(), formData, {
                                                    preserveScroll: true,
                                                    forceFormData: true,
                                                });
                                            }}
                                            className="space-y-6 w-full"
                                        >
                                            {(() => {
                                                const [preview, setPreview] = useState<string | null>(null);
                                                const fileInputRef = useRef<HTMLInputElement>(null);

                                                const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        setPreview(url);
                                                    }
                                                };

                                                // Determine avatar source: Preview -> Auth User Avatar (via accessor) -> Fallback
                                                const avatarSrc = preview || auth.user.avatar || '';

                                                return (
                                                    <>
                                                        {/* Floating Avatar */}
                                                        <div className="flex flex-col md:flex-row gap-6 items-center md:items-end -mt-20 relative z-30 px-2">
                                                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                                <Avatar className="h-32 w-32 border-4 border-[#262626] shadow-xl transition-transform group-hover:scale-105 duration-300">
                                                                    <AvatarImage src={avatarSrc} alt={auth.user.name} className="object-cover" />
                                                                    <AvatarFallback className="text-3xl font-bold bg-[#AC0021] text-white">{initials}</AvatarFallback>
                                                                </Avatar>

                                                                {/* Camera Overlay */}
                                                                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                                                    <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                                                                </div>

                                                                <input
                                                                    type="file"
                                                                    ref={fileInputRef}
                                                                    name="profile"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={handleFileChange}
                                                                />

                                                                <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-[#262626] p-2 rounded-full shadow-sm z-10" title="Active"></div>
                                                            </div>

                                                            <div className="flex-1 space-y-1 pb-2 text-center md:text-left">
                                                                <div className="flex items-center gap-2 justify-center md:justify-start">
                                                                    <h3 className="text-2xl font-bold text-white">{auth.user.name}</h3>
                                                                    {auth.user.email_verified_at && (
                                                                        <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500/10" />
                                                                    )}
                                                                </div>
                                                                <p className="text-zinc-400">{auth.user.email}</p>
                                                                <div className="flex gap-2 mt-2 justify-center md:justify-start">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3f3f46]/30 text-zinc-300 border border-[#3f3f46]/50">
                                                                        Super Admin
                                                                    </span>
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-900/30">
                                                                        Verified
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-8 border-t border-zinc-800 pt-8">
                                                            <div className="grid gap-6 md:grid-cols-3">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor="name" className="text-zinc-400">Nama Lengkap</Label>
                                                                    <Input
                                                                        id="name"
                                                                        className="mt-1 block w-full bg-[#18181b] border-zinc-500 text-zinc-100 focus:bg-[#18181b] focus:border-[#AC0021] focus:ring-1 focus:ring-[#AC0021] transition-colors placeholder:text-zinc-500"
                                                                        defaultValue={auth.user.name}
                                                                        name="name"
                                                                        required
                                                                        autoComplete="name"
                                                                        placeholder="Nama Lengkap"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="email" className="text-zinc-400">Alamat Email</Label>
                                                                    <Input
                                                                        id="email"
                                                                        type="email"
                                                                        className="mt-1 block w-full bg-[#18181b] border-zinc-500/50 text-zinc-400 focus:bg-[#18181b] transition-colors cursor-not-allowed opacity-80"
                                                                        defaultValue={auth.user.email}
                                                                        name="email"
                                                                        readOnly
                                                                        autoComplete="username"
                                                                        placeholder="Email address"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor="username" className="text-zinc-400">Username</Label>
                                                                    <Input
                                                                        id="username"
                                                                        className="mt-1 block w-full bg-[#18181b] border-zinc-500/50 text-zinc-400 focus:bg-[#18181b] transition-colors cursor-not-allowed opacity-80"
                                                                        defaultValue={auth.user.username as string}
                                                                        name="username"
                                                                        readOnly
                                                                        disabled
                                                                        autoComplete="username"
                                                                        placeholder="Username"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {mustVerifyEmail &&
                                                                auth.user.email_verified_at === null && (
                                                                    <div className="p-4 bg-orange-900/10 border border-orange-900/20 rounded-lg flex gap-3 mt-6">
                                                                        <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
                                                                        <div>
                                                                            <p className="text-sm text-orange-200">
                                                                                Alamat email Anda belum terverifikasi.
                                                                            </p>
                                                                            <Link
                                                                                href={send()}
                                                                                as="button"
                                                                                className="mt-1 text-sm font-medium text-orange-400 underline hover:text-orange-300"
                                                                            >
                                                                                Klik di sini untuk kirim ulang email verifikasi.
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                            <div className="flex items-center gap-4 pt-6">
                                                                <Button
                                                                    type="submit"
                                                                    className="w-full bg-[#AC0021] hover:bg-[#8a2b00] text-white font-medium py-2.5 transition-colors"
                                                                >
                                                                    Simpan Perubahan
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </form>
                                    </CardContent>
                                </div>
                            </div>
                        </TabsContent>

                        {/* DETAILS TAB */}
                        <TabsContent value="details" className="mt-0">
                            <div className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-none rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden min-h-[500px] p-6">
                                <UpdateProfileDetailsForm
                                    userDetail={userDetail}
                                    jabatans={jabatans}
                                />
                            </div>
                        </TabsContent>

                        {/* PASSWORD TAB */}
                        <TabsContent value="password" className="mt-0">
                            <div className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-none rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden min-h-[500px]">
                                <CardHeader className="bg-transparent pb-6 border-b border-zinc-700/50">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl shadow-sm bg-[#AC0021]/10 border border-[#AC0021]/20">
                                            <Lock className="w-6 h-6 text-[#AC0021]" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-bold text-white">Ganti Password</CardTitle>
                                            <CardDescription className="text-zinc-400">Pastikan akun Anda aman dengan password yang kuat.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <Form
                                        {...PasswordController.update.form()}
                                        options={{ preserveScroll: true }}
                                        resetOnError={['password', 'password_confirmation', 'current_password']}
                                        resetOnSuccess
                                        onError={(errors) => {
                                            if (errors.password) passwordInput.current?.focus();
                                            if (errors.current_password) currentPasswordInput.current?.focus();
                                        }}
                                        className="space-y-6 max-w-xl"
                                    >
                                        {({ errors, processing, recentlySuccessful }) => (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="current_password" className="text-zinc-300 font-medium">Password Saat Ini</Label>
                                                    <PasswordInput
                                                        id="current_password"
                                                        ref={currentPasswordInput}
                                                        name="current_password"
                                                        autoComplete="current-password"
                                                        placeholder="Masukkan password lama"
                                                        className="bg-[#18181b] border-zinc-500 text-zinc-100 focus:bg-[#18181b] focus:border-[#AC0021] focus:ring-1 focus:ring-[#AC0021]"
                                                    />
                                                    <InputError message={errors.current_password} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password" className="text-zinc-300 font-medium">Password Baru</Label>
                                                    <PasswordInput
                                                        id="password"
                                                        ref={passwordInput}
                                                        name="password"
                                                        autoComplete="new-password"
                                                        placeholder="Masukkan password baru"
                                                        className="bg-[#18181b] border-zinc-500 text-zinc-100 focus:bg-[#18181b] focus:border-[#AC0021] focus:ring-1 focus:ring-[#AC0021]"
                                                    />
                                                    <InputError message={errors.password} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="password_confirmation" className="text-zinc-300 font-medium">Konfirmasi Password</Label>
                                                    <PasswordInput
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        autoComplete="new-password"
                                                        placeholder="Ulangi password baru"
                                                        className="bg-[#18181b] border-zinc-500 text-zinc-100 focus:bg-[#18181b] focus:border-[#AC0021] focus:ring-1 focus:ring-[#AC0021]"
                                                    />
                                                    <InputError message={errors.password_confirmation} />
                                                </div>

                                                <div className="flex items-center gap-4 pt-4">
                                                    <Button disabled={processing} className="w-full md:w-auto bg-[#AC0021] hover:bg-[#8a2b00] text-white transition-colors font-medium py-2.5">Update Password</Button>
                                                    <Transition
                                                        show={recentlySuccessful}
                                                        enter="transition ease-in-out"
                                                        enterFrom="opacity-0"
                                                        leave="transition ease-in-out"
                                                        leaveTo="opacity-0"
                                                    >
                                                        <p className="text-sm text-green-500 font-medium flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4" /> Tersimpan
                                                        </p>
                                                    </Transition>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </div>
                        </TabsContent>

                        {/* APPEARANCE TAB */}


                        {/* ACTIVITY TAB */}
                        <TabsContent value="activity" className="mt-0">
                            <ActivityTimeline
                                logs={activityLogs || []}
                                className="bg-white dark:bg-[#262626] border-x border-b border-t-0 dark:border-zinc-800 rounded-b-none rounded-t-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden min-h-[500px]"
                            />
                        </TabsContent>

                    </div>
                </Tabs>
            </div>
        </AppLayout >
    );
}
