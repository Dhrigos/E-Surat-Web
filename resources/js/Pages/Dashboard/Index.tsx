import React, { Suspense, lazy } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Mail, Send, Clock, FileText, CheckCircle2, XCircle, Download, MapPin } from 'lucide-react';
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
}

export default function Dashboard({ stats, chartData, activities, usersByProvince, totalUsers }: DashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.roles?.some(r => r.name === 'super-admin');

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

    return (
        <AppLayout className="min-h-full">
            <DashboardBackground />
            <Head title="Dashboard" />

            <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
                {/* Welcome Banner */}
                {/* Welcome Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 bg-transparent border-transparent rounded-xl md:rounded-2xl p-3 md:p-6 text-foreground shadow-sm relative overflow-hidden">
                    <div className="relative z-10 space-y-1">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Selamat Datang, {auth.user.name}! 👋</h2>
                        <p className="text-sm md:text-base text-gray-500 dark:text-zinc-400">
                            Berikut adalah ringkasan aktivitas surat Anda hari ini, {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                        </p>
                    </div>
                    <div className="relative z-10">

                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-500/5 dark:bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-red-500/5 dark:bg-white/5 rounded-full blur-2xl"></div>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    {/* Sent Letters Stats */}
                    <Card className="relative overflow-hidden border shadow-sm group bg-card transition-colors duration-300">
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Surat Keluar</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center transition-colors">
                                <Send className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-2xl font-bold mb-1 text-foreground">{stats.sent}</div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Surat yang Anda buat</p>
                                <span className="flex items-center text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                    Aktif
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inbox Stats */}
                    <Card className="relative overflow-hidden border shadow-sm group bg-card transition-colors duration-300">
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Surat Masuk</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center transition-colors">
                                <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-2xl font-bold mb-1 text-foreground">{stats.inbox}</div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Ditujukan kepada Anda</p>
                                <span className="flex items-center text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                                    Terbaru
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Approval Stats */}
                    <Card className="relative overflow-hidden border shadow-sm group bg-card transition-colors duration-300">
                        <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Menunggu Approval</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center transition-colors">
                                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400 group-hover:animate-pulse" />
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="text-2xl font-bold mb-1 text-foreground">{stats.pending}</div>
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">Perlu persetujuan</p>
                                <span className="flex items-center text-[10px] font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                                    Penting
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* User Distribution Map - Only for Super Admin */}
                {isSuperAdmin && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        Distribusi Pengguna
                                    </CardTitle>
                                    <CardDescription>
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
                    <Card className="col-span-1 lg:col-span-4 shadow-sm order-2 lg:order-1">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Aktivitas Surat Keluar
                            </CardTitle>
                            <CardDescription>
                                Jumlah surat yang Anda buat per bulan tahun ini.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[250px] md:h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-zinc-800" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'currentColor', fontSize: 12 }}
                                            dy={10}
                                            className="text-gray-500 dark:text-zinc-400"
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'currentColor', fontSize: 12 }}
                                            allowDecimals={false}
                                            className="text-gray-500 dark:text-zinc-400"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'currentColor', opacity: 0.1 }}
                                            contentStyle={{
                                                backgroundColor: 'var(--card)',
                                                borderColor: 'var(--border)',
                                                borderRadius: '8px',
                                                color: 'var(--foreground)'
                                            }}
                                            itemStyle={{ color: '#dc2626', fontWeight: 600 }}
                                            labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}
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
                    <Card className="col-span-1 lg:col-span-3 shadow-sm order-1 lg:order-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-orange-500" />
                                Aktivitas Terbaru
                            </CardTitle>
                            <CardDescription>
                                Log aktivitas terakhir Anda di sistem.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-0 max-h-[400px] overflow-y-auto pr-2">
                                {activities.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                                        <div className="p-3 bg-muted rounded-full">
                                            <Activity className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-foreground">Belum ada aktivitas</p>
                                            <p className="text-sm text-muted-foreground">Aktifitas Anda akan muncul di sini.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative pl-4 border-l border-border space-y-8 my-2">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="relative group">
                                                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-blue-500 ring-2 ring-muted group-hover:scale-110 transition-transform" />
                                                <div className="flex flex-col gap-1.5 -mt-0.5 ml-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                            {activity.action}
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">
                                                            {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                        {activity.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
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
