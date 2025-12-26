import React, { Suspense, lazy } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Mail, Send, Clock, FileText, CheckCircle2, XCircle, Download, MapPin } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Lazy load map component to avoid SSR issues with Leaflet
const IndonesiaMap = lazy(() => import('@/components/IndonesiaMap'));

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
        province: string;
        total: number;
        coordinates: [number, number] | null;
    }[];
    totalUsers: number;
}

export default function Dashboard({ stats, chartData, activities, usersByProvince, totalUsers }: DashboardProps) {

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

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Surat Keluar</CardTitle>
                                <Send className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.sent}</div>
                                <p className="text-xs text-muted-foreground">
                                    Surat yang Anda buat
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Surat Masuk</CardTitle>
                                <Mail className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.inbox}</div>
                                <p className="text-xs text-muted-foreground">
                                    Surat ditujukan kepada Anda
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Menunggu Approval</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pending}</div>
                                <p className="text-xs text-muted-foreground">
                                    Perlu persetujuan Anda
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* User Distribution Map */}
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

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Chart */}
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Aktivitas Surat Keluar</CardTitle>
                                <CardDescription>
                                    Jumlah surat yang Anda buat per bulan tahun ini.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                            <XAxis dataKey="name" className="text-xs" />
                                            <YAxis className="text-xs" allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--popover-foreground))' }}
                                                itemStyle={{ color: 'hsl(var(--primary))' }}
                                            />
                                            <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Aktivitas Terbaru</CardTitle>
                                <CardDescription>
                                    Log aktivitas terakhir Anda di sistem.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-8">
                                    {activities.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas.</p>
                                    ) : (
                                        activities.map((activity) => (
                                            <div key={activity.id} className="flex items-start">
                                                <div className="mt-1 mr-4 bg-muted p-2 rounded-full">
                                                    {getActionIcon(activity.action)}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {activity.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(activity.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
