import React, { useState, Suspense } from 'react';
import { Send, Mail, Clock, BarChart2, History, Map as MapIcon, Database, Grid, ChevronRight } from 'lucide-react';
import DashboardIcon from '@/components/DashboardIcon';
import IndonesiaMap from '@/components/IndonesiaMap-calon';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, FileText, CheckCircle2, Download } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { router, Link, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';

// Props matching DashboardProps
interface MobileDashboardProps {
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
    isSuperAdmin: boolean;
    adminStats?: {
        totalLetters: number;
        totalUnits: number;
        topSenders: { name: string; avatar: string | null; total: number }[];
        status: { approved: number; rejected: number; pending: number; draft: number };
        performance: { approvalRate: number };
    };
    totalUsers: number;
    usersByProvince?: any[];
    onProvinceClick?: (province: string, code: string) => void;
}

export default function MobileDashboard({ stats, chartData, activities, isSuperAdmin, adminStats, totalUsers, usersByProvince, onProvinceClick }: MobileDashboardProps) {
    const { auth } = usePage<SharedData>().props;
    const [openDrawer, setOpenDrawer] = useState<string | null>(null);

    const handleOpen = (name: string) => setOpenDrawer(name);
    const handleClose = () => setOpenDrawer(null);

    // Helpers from Index.tsx
    const formatActivity = (action: string, description: string) => {
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

        if (description.includes('User Super Admin logged in')) desc = 'Anda berhasil masuk ke sistem';
        if (description.includes('User updated')) desc = 'Data pengguna telah diperbarui';
        if (description.includes('Updated User')) desc = 'Data pengguna telah diperbarui';

        return { title, desc };
    };

    return (
        <div className="flex flex-col w-full bg-transparent pb-6">
            {/* Header / Summary Card */}
            <div className="p-4 bg-transparent shadow-none rounded-b-3xl pb-6 z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hai, {auth.user.name.split(' ')[0]}! 👋</h2>
                        <p className="text-xs text-muted-foreground">Selamat bekerja kembali.</p>
                    </div>
                </div>

                {/* "Gopay" style Card */}
                <div className="bg-[#262626] rounded-2xl p-4 text-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4),0_4px_6px_-2px_rgba(0,0,0,0.2)] flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Perlu Persetujuan</p>
                        <p className="text-2xl font-bold">{stats.pending}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Surat Masuk</p>
                        <p className="text-2xl font-bold">{stats.inbox}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Surat Keluar</p>
                        <p className="text-2xl font-bold">{stats.sent}</p>
                    </div>
                </div>
            </div>

            {/* Main Menu Grid */}
            <div className="p-4 -mt-2">
                <div className="grid grid-cols-5 gap-y-6 gap-x-2">
                    {/* Merged E-Surat - Green */}
                    <DashboardIcon
                        icon={Mail}
                        label="E-Surat"
                        bgColor="#007ee7"
                        onClick={() => handleOpen('esurat')}
                    />

                    {/* Statistik - Red */}
                    <DashboardIcon
                        icon={BarChart2}
                        label="Statistik"
                        bgColor="#659800"
                        onClick={() => handleOpen('stats')}
                    />

                    {/* Peta - Super Admin - Indigo */}
                    {isSuperAdmin && (
                        <DashboardIcon
                            icon={MapIcon}
                            label="Peta"
                            bgColor="#ef4444"
                            onClick={() => router.visit('/location')}
                        />
                    )}

                    {/* Data Master - Admin - Pink */}
                    {(isSuperAdmin) && (
                        <DashboardIcon
                            icon={Database}
                            label="Data Master"
                            bgColor="#d04438"
                            onClick={() => router.visit('/data-master')}
                        />
                    )}

                    {/* Lainnya - Gray */}
                    <DashboardIcon
                        icon={Grid}
                        label="Lainnya"
                        bgColor="#6b7280"
                        onClick={() => handleOpen('menu')}
                    />
                </div>
            </div>

            {/* Map Section - Only for Super Admin */}
            {isSuperAdmin && usersByProvince && (
                <div className="px-4 mt-2 mb-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Distribusi Calon Anggota</h3>
                    <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-zinc-800">
                        <Suspense fallback={
                            <div className="w-full h-[250px] flex items-center justify-center bg-gray-100 dark:bg-[#1F2937]">
                                <p className="text-xs text-muted-foreground">Memuat peta...</p>
                            </div>
                        }>
                            <IndonesiaMap
                                data={usersByProvince}
                                totalUsers={totalUsers}
                                onProvinceClick={onProvinceClick}
                                enableZoom={true}
                            />
                        </Suspense>
                    </div>
                </div>
            )}

            {/* Quick Activity Feed */}
            <div className="px-4 mt-2">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Aktivitas Terbaru</h3>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600" onClick={() => handleOpen('activity')}>
                        Lihat Semua
                    </Button>
                </div>

                <div className="space-y-3">
                    {activities.slice(0, 3).map((activity, index) => {
                        const { title, desc } = formatActivity(activity.action, activity.description);
                        return (
                            <div key={activity.id || `activity-recent-${index}`} className="flex gap-3 items-start bg-white dark:bg-[#262626] p-3 rounded-xl shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4),0_4px_6px_-2px_rgba(0,0,0,0.2)] border border-gray-100 dark:border-zinc-800/50">
                                <div className="mt-0.5 min-w-[32px] min-h-[32px] rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold truncate">{title}</p>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                            {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Drawers */}

            {/* E-Surat Drawer (Merged) */}
            <Drawer open={openDrawer === 'esurat'} onOpenChange={(o) => !o && handleClose()}>
                <DrawerContent>
                    <div className="mx-auto mt-2 h-1.5 w-[100px] rounded-full bg-[#FEFCF8]/50" />

                    <DrawerHeader>
                        <DrawerTitle>Layanan E-Surat</DrawerTitle>
                        <DrawerDescription>Kelola surat masuk, keluar, dan approval.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 grid grid-cols-3 gap-4">
                        <Link href="/mail-management/inbox" className="flex flex-col items-center gap-2 p-2">
                            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-700">
                                <Mail className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-center font-medium">Surat Masuk</span>
                        </Link>
                        <Link href="/mail-management/sent" className="flex flex-col items-center gap-2 p-2">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
                                <Send className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-center font-medium">Surat Keluar</span>
                        </Link>
                        <Link href="/approval" className="flex flex-col items-center gap-2 p-2">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-700">
                                <Clock className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-center font-medium">Approval</span>
                        </Link>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Stats Drawer (Enhanced) */}
            <Drawer open={openDrawer === 'stats'} onOpenChange={(o) => !o && handleClose()}>
                <DrawerContent className="max-h-[90vh]">
                    <div className="mx-auto mt-2 h-1.5 w-[100px] rounded-full bg-[#FEFCF8]/50" />
                    <div className="mx-auto w-full max-w-sm overflow-y-auto">
                        <DrawerHeader>
                            <DrawerTitle>Statistik Sistem</DrawerTitle>
                            <DrawerDescription>
                                {isSuperAdmin ? "Monitor kinerja sistem secara global." : "Statistik penggunaan surat."}
                            </DrawerDescription>
                        </DrawerHeader>

                        <div className="p-4 space-y-6">
                            {/* Admin Global Stats */}
                            {adminStats && (
                                <>
                                    {/* 4-Grid Summary */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <Card className="border-none shadow-sm bg-blue-50 dark:bg-blue-900/10 cursor-pointer active:scale-95 transition-transform" onClick={() => router.visit('/staff-mapping')}>
                                            <CardContent className="p-3 flex flex-col justify-between h-full">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-[10px] text-blue-600/80 dark:text-blue-400/80 uppercase font-semibold">Pengguna</p>
                                                    <div className="p-1 rounded bg-blue-100/50 dark:bg-blue-900/30">
                                                        <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                </div>
                                                <p className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-2">
                                                    {totalUsers.toLocaleString()}
                                                </p>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-none shadow-sm bg-purple-50 dark:bg-purple-900/10 cursor-pointer active:scale-95 transition-transform" onClick={() => router.visit('/list-surat')}>
                                            <CardContent className="p-3 flex flex-col justify-between h-full">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-[10px] text-purple-600/80 dark:text-purple-400/80 uppercase font-semibold">Total Surat</p>
                                                    <div className="p-1 rounded bg-purple-100/50 dark:bg-purple-900/30">
                                                        <Mail className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                </div>
                                                <p className="text-xl font-bold text-purple-700 dark:text-purple-400">{adminStats.totalLetters}</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-none shadow-sm bg-orange-50 dark:bg-orange-900/10 col-span-2 cursor-pointer active:scale-95 transition-transform" onClick={() => router.visit('/data-master')}>
                                            <CardContent className="p-3 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-orange-600/80 dark:text-orange-400/80 uppercase font-semibold">Unit Kerja Aktif</p>
                                                    <p className="text-xl font-bold text-orange-700 dark:text-orange-400 mt-1">{adminStats.totalUnits}</p>
                                                </div>
                                                <div className="p-2 rounded-full bg-orange-100/50 dark:bg-orange-900/30">
                                                    <Grid className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Top Senders */}
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                                            <Send className="w-3 h-3" /> Top Pengirim Minggu Ini
                                        </h4>
                                        <div className="space-y-3 bg-white dark:bg-zinc-900/50 p-3 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800">
                                            {adminStats.topSenders.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                                    <p className="text-xs text-muted-foreground italic">Belum ada data pengiriman surat minggu ini.</p>
                                                </div>
                                            ) : (
                                                adminStats.topSenders.map((sender, i) => (
                                                    <div key={i} className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2
                                                                ${i === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                                    i === 1 ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                                                        'bg-orange-100 text-orange-700 border-orange-200'}`}>
                                                                {sender.name.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-xs truncate max-w-[150px]">{sender.name}</span>
                                                                <span className="text-[10px] text-muted-foreground">Peringkat #{i + 1}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-mono font-bold text-sm">{sender.total}</span>
                                                            <span className="text-[10px] text-muted-foreground">surat</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Performance & Status */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground">Status Global</h4>
                                            <div className="space-y-2 text-xs mt-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div> Approved</span>
                                                    <span className="font-bold text-green-600">{adminStats.status.approved}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div> Rejected</span>
                                                    <span className="font-bold text-red-600">{adminStats.status.rejected}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Pending</span>
                                                    <span className="font-bold text-orange-600">{adminStats.status.pending}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg flex flex-col justify-center">
                                            <h4 className="text-xs font-semibold uppercase text-muted-foreground text-center mb-2">Approval Rate</h4>
                                            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-4 border-gray-100 dark:border-zinc-800"></div>
                                                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent -rotate-45" style={{
                                                    clipPath: `polygon(0 0, 100% 0, 100% ${adminStats.performance.approvalRate}%, 0 ${adminStats.performance.approvalRate}%)` // Simple visual hack, better use SVG or Recharts if converting to component
                                                }}></div>
                                                {/* Using a simple circular display for now */}
                                                <div className="text-center">
                                                    <span className="text-2xl font-bold text-green-600">{Math.round(adminStats.performance.approvalRate)}%</span>
                                                    <p className="text-[9px] text-muted-foreground">Target: 95%</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warnings */}
                                    {adminStats.status.pending > 0 && (
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 flex gap-3 items-center">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                                                <Activity className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-amber-800 dark:text-amber-400">Peringatan Sistem</p>
                                                <p className="text-[10px] text-amber-700/80 dark:text-amber-500/80 leading-tight mt-0.5">
                                                    Ada <span className="font-bold">{adminStats.status.pending} surat</span> menunggu persetujuan. Segera tindak lanjuti agar target terpenuhi.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Original Chart - Moved to Bottom */}
                            <div className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-4">Statistik Keaktifan (Anda)</h4>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-zinc-800" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} allowDecimals={false} />
                                            <Tooltip
                                                cursor={{ fill: 'currentColor', opacity: 0.1 }}
                                                contentStyle={{ borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="total" fill="url(#colorTotal)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Tutup</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Activity Drawer (Full List) */}
            <Drawer open={openDrawer === 'activity'} onOpenChange={(o) => !o && handleClose()}>
                <DrawerContent className="max-h-[80vh]">
                    <div className="mx-auto mt-2 h-1.5 w-[100px] rounded-full bg-[#FEFCF8]/50" />
                    <div className="mx-auto w-full max-w-md">
                        <DrawerHeader>
                            <DrawerTitle>Aktivitas Lengkap</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 overflow-y-auto max-h-[50vh]">
                            <div className="space-y-6">
                                {activities.length === 0 ? (
                                    <p className="text-center text-muted-foreground">Tidak ada aktivitas.</p>
                                ) : (
                                    activities.map((activity, index) => {
                                        const { title, desc } = formatActivity(activity.action, activity.description);
                                        return (
                                            <div key={activity.id || `activity-all-${index}`} className="relative pl-4 border-l border-zinc-200 dark:border-zinc-800">
                                                <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-zinc-950" />
                                                <div className="flex flex-col gap-1 ml-2">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-semibold">{title}</p>
                                                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                            {new Date(activity.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                        <DrawerFooter>
                            <DrawerClose asChild>
                                <Button variant="outline">Tutup</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </div>
                </DrawerContent>
            </Drawer>

            {/* Master Data Drawer */}
            <Drawer open={openDrawer === 'master'} onOpenChange={(o) => !o && handleClose()}>
                <DrawerContent>
                    <div className="mx-auto mt-2 h-1.5 w-[100px] rounded-full bg-[#FEFCF8]/50" />
                    <DrawerHeader>
                        <DrawerTitle>Data Master</DrawerTitle>
                        <DrawerDescription>Kelola data referensi sistem.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 grid grid-cols-2 gap-3">
                        {/* Staff Mapping - Users */}
                        <Link href="/staff-mapping" className="flex flex-col p-3 rounded-lg border border-pink-100 dark:border-pink-900 bg-pink-50 dark:bg-pink-900/20 shadow-sm active:opacity-80">
                            <div className="flex items-center gap-2 mb-1 text-pink-600 dark:text-pink-400">
                                <Database className="w-4 h-4" />
                                <span className="text-xs font-bold">Pengguna (Mapping)</span>
                            </div>
                            <p className="text-[10px] text-pink-700/70 dark:text-pink-400/70 mr-1">Kelola data pengguna.</p>
                        </Link>

                        {/* Jabatan */}
                        <Link href="/jabatan" className="flex flex-col p-3 rounded-lg border border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/20 shadow-sm active:opacity-80">
                            <div className="flex items-center gap-2 mb-1 text-purple-600 dark:text-purple-400">
                                <Database className="w-4 h-4" />
                                <span className="text-xs font-bold">Jabatan</span>
                            </div>
                            <p className="text-[10px] text-purple-700/70 dark:text-purple-400/70 mr-1">Data jabatan & peran.</p>
                        </Link>

                        {/* Jenis Surat */}
                        <Link href="/jenis-surat" className="flex flex-col p-3 rounded-lg border border-orange-100 dark:border-orange-900 bg-orange-50 dark:bg-orange-900/20 shadow-sm active:opacity-80">
                            <div className="flex items-center gap-2 mb-1 text-orange-600 dark:text-orange-400">
                                <Database className="w-4 h-4" />
                                <span className="text-xs font-bold">Jenis Surat</span>
                            </div>
                            <p className="text-[10px] text-orange-700/70 dark:text-orange-400/70 mr-1">Tipe & kode jenis surat.</p>
                        </Link>

                        {/* Golongan / Pangkat */}
                        <Link href="/master-data" className="flex flex-col p-3 rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 shadow-sm active:opacity-80">
                            <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-400">
                                <Database className="w-4 h-4" />
                                <span className="text-xs font-bold">Golongan & Pangkat</span>
                            </div>
                            <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 mr-1">Data pangkat kepegawaian.</p>
                        </Link>

                        {/* Roles */}
                        <Link href="/roles" className="flex flex-col p-3 rounded-lg border border-teal-100 dark:border-teal-900 bg-teal-50 dark:bg-teal-900/20 shadow-sm active:opacity-80">
                            <div className="flex items-center gap-2 mb-1 text-teal-600 dark:text-teal-400">
                                <Database className="w-4 h-4" />
                                <span className="text-xs font-bold">Roles & Permissions</span>
                            </div>
                            <p className="text-[10px] text-teal-700/70 dark:text-teal-400/70 mr-1">Hak akses sistem.</p>
                        </Link>

                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* Menu Drawer */}
            <Drawer open={openDrawer === 'menu'} onOpenChange={(o) => !o && handleClose()}>
                <DrawerContent>
                    <div className="mx-auto mt-4 h-1.5 w-[40px] rounded-full bg-[#FEFCF8]/50" />
                    <DrawerHeader>
                        <DrawerTitle>Menu Lainnya</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 grid grid-cols-3 gap-4">

                        <Link href="/settings" className="flex flex-col items-center gap-2 p-2">
                            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-xs text-center">Pengaturan</span>
                        </Link>
                        <Link href="/logout" method="post" as="button" className="flex flex-col items-center gap-2 p-2 text-red-600">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Activity className="w-5 h-5" />
                            </div>
                            <span className="text-xs text-center">Logout</span>
                        </Link>
                    </div>
                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline">Tutup</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
}
