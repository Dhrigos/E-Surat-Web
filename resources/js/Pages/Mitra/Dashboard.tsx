import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';
import { SharedData } from '@/types';
import DashboardBackground from '@/components/DashboardBackground';

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout className="min-h-full">
            <DashboardBackground />
            <Head title="Dashboard Mitra" />

            <div className="p-6 space-y-6">
                {/* Welcome Banner */}
                <div className="bg-transparent rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">Selamat Datang, Admin Mitra!</h1>
                        <p className="text-gray-300 max-w-2xl">
                            Kelola pendaftaran anggota komponen cadangan dari instansi Anda. Anda dapat mendaftarkan anggota secara satuan atau massal menggunakan fitur import.
                        </p>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#AC0021]/10 rounded-full blur-3xl"></div>
                </div>

                {/* Actions Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Register Single */}
                    <Card className="hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group border-l-4 border-l-[#AC0021] bg-white dark:bg-[#262626] border-y-0 border-r-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-2 bg-[#AC0021]/10 rounded-lg group-hover:bg-[#AC0021]/20 transition-colors">
                                    <Plus className="w-5 h-5 text-[#AC0021]" />
                                </div>
                                Daftar Anggota Baru
                            </CardTitle>
                            <CardDescription>
                                Input data calon anggota satu per satu melalui formulir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full bg-[#AC0021] hover:bg-[#8a001a]">
                                Mulai Pendaftaran
                            </Button>
                        </CardContent>
                    </Card>



                    {/* Stats Mockup */}
                    <Card className="border-l-4 border-l-zinc-700 bg-zinc-50 dark:bg-[#262626] border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />
                                Total Terdaftar
                            </CardTitle>
                            <CardDescription>
                                Jumlah calon anggota yang telah didaftarkan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">0</div>
                            <p className="text-xs text-muted-foreground mt-1">Calon Anggota</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Data Table Placeholder */}
                <Card className="bg-white dark:bg-[#262626] border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                    <CardHeader>
                        <CardTitle>Data Pendaftaran Terbaru</CardTitle>
                        <CardDescription>5 pendaftaran terakhir yang masuk.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Belum ada data pendaftaran.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
