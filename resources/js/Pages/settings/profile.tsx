import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import AppearanceTabs from '@/components/appearance-tabs';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
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
import { User, FileText, Lock, Palette, CheckCircle2, Camera, Activity, Shield, AlertTriangle } from 'lucide-react';
import ActivityTimeline from '@/Pages/settings/partials/activity-timeline';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import UpdateProfileDetailsForm from './partials/update-profile-details-form';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit().url,
    },
];

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <HeadingSmall
                            title="Pengaturan Akun"
                            description="Pusat pengaturan profil, keamanan, dan preferensi aplikasi Anda."
                        />
                    </div>

                    <Tabs defaultValue="account" className="flex flex-col lg:flex-row gap-8 w-full">
                        <TabsList className="grid grid-cols-5 lg:flex lg:flex-col w-full lg:w-64 h-auto bg-transparent p-0 gap-2 lg:space-y-2 lg:sticky lg:top-6 self-start">
                            <TabsTrigger
                                value="account"
                                className="w-full justify-center lg:justify-start px-2 lg:px-4 py-3 h-auto text-base font-medium rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all duration-200 gap-3"
                            >
                                <User className="w-5 h-5 lg:w-4 lg:h-4" />
                                <span className="hidden lg:inline">Akun</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="details"
                                className="w-full justify-center lg:justify-start px-2 lg:px-4 py-3 h-auto text-base font-medium rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all duration-200 gap-3"
                            >
                                <Shield className="w-5 h-5 lg:w-4 lg:h-4" />
                                <span className="hidden lg:inline">Detail Profil</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="password"
                                className="w-full justify-center lg:justify-start px-2 lg:px-4 py-3 h-auto text-base font-medium rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all duration-200 gap-3"
                            >
                                <Lock className="w-5 h-5 lg:w-4 lg:h-4" />
                                <span className="hidden lg:inline">Password</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="appearance"
                                className="w-full justify-center lg:justify-start px-2 lg:px-4 py-3 h-auto text-base font-medium rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all duration-200 gap-3"
                            >
                                <Palette className="w-5 h-5 lg:w-4 lg:h-4" />
                                <span className="hidden lg:inline">Tampilan</span>
                            </TabsTrigger>

                            <TabsTrigger
                                value="activity"
                                className="w-full justify-center lg:justify-start px-2 lg:px-4 py-3 h-auto text-base font-medium rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none hover:bg-muted/50 transition-all duration-200 gap-3"
                            >
                                <Activity className="w-5 h-5 lg:w-4 lg:h-4" />
                                <span className="hidden lg:inline">Aktifitas</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex-1 min-w-0">

                            {/* ACCOUNT TAB */}
                            <TabsContent value="account" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-white rounded-2xl opacity-20 group-hover:opacity-30 transition duration-500 blur-xl"></div>
                                    <Card className="border-0 shadow-lg relative overflow-hidden">
                                        {/* Banner */}
                                        <div className="h-32 bg-gradient-to-r from-red-600 to-white relative">
                                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
                                            {/* Decorative Circles */}
                                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
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
                                                            <div className="flex flex-col md:flex-row gap-6 items-start -mt-12 relative z-30">
                                                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                                    <Avatar className="h-32 w-32 border-4 border-gray-200 dark:border-gray-700 shadow-2xl ring-4 ring-black/5 dark:ring-white/10 transition-transform group-hover:scale-105 duration-300">
                                                                        <AvatarImage src={avatarSrc} alt={auth.user.name} className="object-cover" />
                                                                        <AvatarFallback className="text-3xl font-bold bg-red-600 text-white">{initials}</AvatarFallback>
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

                                                                    <div className="absolute bottom-2 right-2 bg-green-500 border-4 border-background p-2 rounded-full shadow-sm z-10" title="Active"></div>
                                                                </div>

                                                                <div className="flex-1 mt-14 md:mt-12 space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <h3 className="text-2xl font-bold">{auth.user.name}</h3>
                                                                        {auth.user.email_verified_at && (
                                                                            <CheckCircle2 className="w-5 h-5 text-blue-500 fill-blue-500/10" />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-muted-foreground">{auth.user.email}</p>
                                                                    <div className="flex gap-2 mt-2">
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                                            Super Admin
                                                                        </span>
                                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                                                            Verified
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-8 border-t pt-8">
                                                                <div className="grid gap-6 md:grid-cols-3">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="name">Nama Lengkap</Label>
                                                                        <Input
                                                                            id="name"
                                                                            className="mt-1 block w-full bg-background transition-colors"
                                                                            defaultValue={auth.user.name}
                                                                            name="name"
                                                                            required
                                                                            autoComplete="name"
                                                                            placeholder="Nama Lengkap"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="email">Alamat Email</Label>
                                                                        <Input
                                                                            id="email"
                                                                            type="email"
                                                                            className="mt-1 block w-full bg-muted/50 text-muted-foreground focus:bg-background transition-colors cursor-not-allowed"
                                                                            defaultValue={auth.user.email}
                                                                            name="email"
                                                                            readOnly
                                                                            autoComplete="username"
                                                                            placeholder="Email address"
                                                                        />
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="username">Username</Label>
                                                                        <Input
                                                                            id="username"
                                                                            className="mt-1 block w-full bg-muted/50 text-muted-foreground focus:bg-background transition-colors cursor-not-allowed"
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
                                                                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg dark:bg-orange-900/20 dark:border-orange-800/50 flex gap-3">
                                                                            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                                                            <div>
                                                                                <p className="text-sm text-orange-800 dark:text-orange-200">
                                                                                    Alamat email Anda belum terverifikasi.
                                                                                </p>
                                                                                <Link
                                                                                    href={send()}
                                                                                    as="button"
                                                                                    className="mt-1 text-sm font-medium text-orange-900 underline hover:text-orange-700 dark:text-orange-100"
                                                                                >
                                                                                    Klik di sini untuk kirim ulang email verifikasi.
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                <div className="flex items-center gap-4 pt-2">
                                                                    <Button
                                                                        type="submit"
                                                                        className="w-full md:min-w-[120px] bg-red-600 hover:bg-red-700 transition-colors"
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
                                    </Card>
                                </div>


                            </TabsContent>

                            {/* DETAILS TAB */}
                            <TabsContent value="details" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <UpdateProfileDetailsForm
                                    userDetail={userDetail}
                                    jabatans={jabatans}
                                />
                            </TabsContent>

                            {/* PASSWORD TAB */}
                            <TabsContent value="password" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-0 shadow-sm ring-1 ring-border/40">
                                    <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl shadow-sm bg-gradient-to-br from-rose-500 to-pink-600">
                                                <Lock className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">Ganti Password</CardTitle>
                                                <CardDescription>Pastikan akun Anda aman dengan password yang kuat.</CardDescription>
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
                                                        <Label htmlFor="current_password">Password Saat Ini</Label>
                                                        <PasswordInput
                                                            id="current_password"
                                                            ref={currentPasswordInput}
                                                            name="current_password"
                                                            autoComplete="current-password"
                                                            placeholder="Masukkan password lama"
                                                        />
                                                        <InputError message={errors.current_password} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="password">Password Baru</Label>
                                                        <PasswordInput
                                                            id="password"
                                                            ref={passwordInput}
                                                            name="password"
                                                            autoComplete="new-password"
                                                            placeholder="Masukkan password baru"
                                                        />
                                                        <InputError message={errors.password} />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                                        <PasswordInput
                                                            id="password_confirmation"
                                                            name="password_confirmation"
                                                            autoComplete="new-password"
                                                            placeholder="Ulangi password baru"
                                                        />
                                                        <InputError message={errors.password_confirmation} />
                                                    </div>

                                                    <div className="flex items-center gap-4 pt-2">
                                                        <Button disabled={processing} className="w-full md:w-auto bg-red-600 hover:bg-red-700 transition-colors">Update Password</Button>
                                                        <Transition
                                                            show={recentlySuccessful}
                                                            enter="transition ease-in-out"
                                                            enterFrom="opacity-0"
                                                            leave="transition ease-in-out"
                                                            leaveTo="opacity-0"
                                                        >
                                                            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
                                                                <CheckCircle2 className="w-4 h-4" /> Tersimpan
                                                            </p>
                                                        </Transition>
                                                    </div>
                                                </>
                                            )}
                                        </Form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* APPEARANCE TAB */}
                            <TabsContent value="appearance" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-0 shadow-sm ring-1 ring-border/40">
                                    <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-xl shadow-sm bg-gradient-to-br from-amber-500 to-yellow-600">
                                                <Palette className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">Tampilan Aplikasi</CardTitle>
                                                <CardDescription>Sesuaikan tema gelap/terang sesuai preferensi Anda.</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-6">
                                        <AppearanceTabs />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* ACTIVITY TAB */}
                            <TabsContent value="activity" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <ActivityTimeline logs={activityLogs || []} />
                            </TabsContent>

                        </div>
                    </Tabs>
                </div>
            </SettingsLayout >
        </AppLayout >
    );
}
