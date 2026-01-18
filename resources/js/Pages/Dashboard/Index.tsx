import React, { Suspense, lazy } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Mail, Send, Clock, FileText, CheckCircle2, XCircle, Download, MapPin, Building2 } from 'lucide-react';
import { SharedData } from '@/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const IndonesiaMap = lazy(() => import('@/components/IndonesiaMap'));
import DashboardBackground from '@/components/DashboardBackground';
import MobileDashboard from '@/components/MobileDashboard';

interface DashboardProps {
    stats: {
        sent: number;
        inbox: number;
        pending: number;
    };
    chartData: {
        name: string;
        total: number;
    }[];
    activities: {
        id: number;
        action: string;
        description: string;
        created_at: string;
        user: {
            name: string;
            avatar?: string;
        };
    }[];
    usersByProvince: {
        province_code: string;
        province: string;
        total: number;
    }[];
    totalUsers: number;
    adminStats?: {
        totalLetters: number;
        totalUnits: number;
        topSenders: { name: string; avatar: string | null; total: number }[];
        status: { approved: number; rejected: number; pending: number; draft: number };
        performance: { approvalRate: number };
    };
}

export default function Dashboard({ stats, chartData, activities, usersByProvince, totalUsers, adminStats }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.roles?.some(r => r.name === 'super-admin') ?? false;

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'create': return <Send className="h-4 w-4 text-blue-500" />;
            case 'update': return <FileText className="h-4 w-4 text-amber-500" />;
            case 'delete': return <XCircle className="h-4 w-4 text-red-500" />;
            case 'approve': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'download': return <Download className="h-4 w-4 text-purple-500" />;
            default: return <Activity className="h-4 w-4 text-zinc-500" />;
        }
    };

    const formatActivity = (action: string, description: string) => {
        // Map common actions to friendly Indonesian text
        const map: Record<string, string> = {
            'auth.login': 'Login Berhasil',
            'auth.logout': 'Logout Berhasil',
            'model.created': 'Data Ditambahkan',
            'model.updated': 'Data Diperbarui',
            'model.deleted': 'Data Dihapus',
            'create': 'Item Dibuat',
            'update': 'Item Diubah',
            'delete': 'Item Dihapus',
            'approve': 'Persetujuan',
        };

        const title = map[action] || action;
        let desc = description;

        // Try to translate common english descriptions if possible, simplistic approach
        if (description.includes('User Super Admin logged in')) desc = 'Anda berhasil masuk ke sistem';
        if (description.includes('User updated')) desc = 'Data pengguna telah diperbarui';
        if (description.includes('Updated User')) desc = 'Data pengguna telah diperbarui';

        return { title, desc };
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 3 && hour < 11) return 'Selamat Pagi';
        if (hour >= 11 && hour < 15) return 'Selamat Siang';
        if (hour >= 15 && hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    return (
        <AppLayout className="min-h-full">
            <DashboardBackground />
            <Head title="Dashboard" />


            {/* Mobile View */}
            <div className="md:hidden">
                <MobileDashboard
                    stats={stats}
                    chartData={chartData}
                    activities={activities}
                    isSuperAdmin={isSuperAdmin}
                    adminStats={adminStats}
                    totalUsers={totalUsers}
                />
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex flex-col gap-4 md:gap-6 p-4 md:p-6">
                {/* Welcome Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 bg-transparent border-transparent rounded-xl md:rounded-2xl p-3 md:p-6 text-foreground shadow-sm relative overflow-hidden">
                    <div className="relative z-10 space-y-1">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-[#FEFCF8]">{getGreeting()}, {auth.user.name}! 👋</h2>
                        <p className="text-sm md:text-base text-gray-500 dark:text-zinc-400">
                            Berikut adalah ringkasan aktivitas surat Anda hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                        </p>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-500/5 dark:bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-red-500/5 dark:bg-white/5 rounded-full blur-2xl"></div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {/* Sent Letters Stats */}
                    <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] group bg-[#262626] text-[#FEFCF8] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl transition-colors group-hover:bg-blue-500/20">
                                    <Send className="h-6 w-6 text-blue-400" />
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <h3 className="text-sm font-medium text-blue-400">Total Surat Keluar</h3>
                                <div className="text-4xl font-bold text-[#FEFCF8]">{stats.sent}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle2 className="h-3 w-3 text-blue-400" />
                                <span>Surat aktif</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inbox Stats */}
                    <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] group bg-[#262626] text-[#FEFCF8] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#659800]/10 rounded-xl transition-colors group-hover:bg-[#659800]/20">
                                    <Mail className="h-6 w-6 text-[#659800]" />
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <h3 className="text-sm font-medium text-[#659800]">Surat Masuk</h3>
                                <div className="text-4xl font-bold text-[#FEFCF8]">{stats.inbox}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle2 className="h-3 w-3 text-[#659800]" />
                                <span>Terbaru</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Approval Stats */}
                    <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] group bg-[#262626] text-[#FEFCF8] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#d04438]/10 rounded-xl transition-colors group-hover:bg-[#d04438]/20">
                                    <Clock className="h-6 w-6 text-[#d04438] group-hover:animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <h3 className="text-sm font-medium text-[#d04438]">Menunggu Approval</h3>
                                <div className="text-4xl font-bold text-[#FEFCF8]">{stats.pending}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Activity className="h-3 w-3 text-[#d04438]" />
                                <span>Perlu tindakan</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Unit Kerja Stats */}
                    <Card className="relative overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] group bg-[#262626] text-[#FEFCF8] transition-all duration-300 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:-translate-y-1">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-[#AC0021]/10 rounded-xl transition-colors group-hover:bg-[#AC0021]/20">
                                    <Building2 className="h-6 w-6 text-[#AC0021]" />
                                </div>
                            </div>
                            <div className="space-y-1 mb-4">
                                <h3 className="text-sm font-medium text-[#AC0021]">Unit Kerja</h3>
                                <div className="text-4xl font-bold text-[#FEFCF8]">{adminStats?.totalUnits || 0}</div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <CheckCircle2 className="h-3 w-3 text-[#AC0021]" />
                                <span>Total unit</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Distribution Map - Only for Super Admin */}
                {isSuperAdmin && (
                    <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-[#262626] text-[#FEFCF8]">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2 text-[#FEFCF8]">
                                        <MapPin className="h-5 w-5 text-[#007EE7]" />
                                        Distribusi Pengguna
                                    </CardTitle>
                                    <CardDescription className="text-[#B0B0B0]">
                                        Peta sebaran {totalUsers.toLocaleString()} pengguna di seluruh Indonesia
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Suspense fallback={
                                <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
                                    <div className="text-center">
                                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2 animate-pulse" />
                                        <p className="text-sm text-muted-foreground">Loading map...</p>
                                    </div>
                                </div>
                            }>
                                <IndonesiaMap data={usersByProvince} totalUsers={totalUsers} />
                            </Suspense>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                    {/* Chart */}
                    <Card className="col-span-1 lg:col-span-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-none bg-[#262626] text-[#AC0021] order-2 lg:order-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-[#FEFCF8]">
                                <Activity className="h-5 w-5 text-[#007EE7]" />
                                Aktivitas Surat Keluar
                            </CardTitle>
                            <CardDescription className="text-[#B0B0B0]">
                                Jumlah surat yang Anda buat per bulan tahun ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[250px] md:h-[300px] w-full mt-4 min-w-0">
                                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/10" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'currentColor', fontSize: 12 }}
                                            dy={10}
                                            className="text-gray-400"
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'currentColor', fontSize: 12 }}
                                            allowDecimals={false}
                                            className="text-gray-400"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'currentColor', opacity: 0.1 }}
                                            contentStyle={{
                                                backgroundColor: '#262626',
                                                borderColor: '#404040',
                                                borderRadius: '8px',
                                                color: '#ffffff'
                                            }}
                                            itemStyle={{ color: '#dc2626', fontWeight: 600 }}
                                            labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="url(#colorTotal)"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={50}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="col-span-1 lg:col-span-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-none bg-[#262626] text-[#FEFCF8] order-1 lg:order-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-[#FEFCF8]">
                                <Clock className="h-5 w-5 text-[#007EE7]" />
                                Aktivitas Terbaru
                            </CardTitle>
                            <CardDescription className="text-[#B0B0B0]">
                                Log aktivitas terakhir Anda di sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-0 max-h-[400px] overflow-y-auto pr-2">
                                {activities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                        <div className="p-3 bg-white/10 rounded-full">
                                            <Activity className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-[#FEFCF8]">Belum ada aktivitas</p>
                                            <p className="text-sm text-gray-400">Aktifitas Anda akan muncul di sini.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative pl-4 border-l border-border space-y-8 my-2">
                                        {activities.map((activity) => {
                                            const { title, desc } = formatActivity(activity.action, activity.description);
                                            return (
                                                <div key={activity.id} className="relative group">
                                                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#262626] bg-blue-500 ring-2 ring-gray-700 group-hover:scale-110 transition-transform" />
                                                    <div className="flex flex-col gap-1.5 -mt-0.5 ml-2">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm font-medium leading-none text-[#FEFCF8] group-hover:text-primary transition-colors">
                                                                {title}
                                                            </p>
                                                            <span className="text-[10px] text-gray-400 font-mono bg-white/10 px-1.5 py-0.5 rounded">
                                                                {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 line-clamp-2">
                                                            {desc}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
