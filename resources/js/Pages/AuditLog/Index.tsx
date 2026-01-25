import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/Pagination';
import { Search, RotateCcw, Activity, Clock, CheckCircle, XCircle, LogIn, Edit, Trash2, Eye, FileSignature, Send, Download } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AuditLog {
    id: number;
    user: {
        name: string;
    } | null;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
    subject_type: string | null;
}

interface Links {
    url: string | null;
    label: string;
    active: boolean;
}

interface Meta {
    current_page: number;
    from: number;
    last_page: number;
    links: Links[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface ActivityStats {
    total_activities: number;
    today_activities: number;
    success_count: number;
    failed_count: number;
}

interface AuditLogIndexProps {
    logs: {
        data: AuditLog[];
        links: Links[];
        meta: Meta;
    };
    filters: {
        search?: string;
        action?: string;
        start_date?: string;
        end_date?: string;
    };
    actions: string[];
    stats: ActivityStats;
}

export default function AuditLogIndex({ logs, filters, actions, stats }: AuditLogIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || 'all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentSearch = search || '';
            const filterSearch = filters.search || '';

            if (currentSearch !== filterSearch) {
                applyFilters();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filters.search]);

    const applyFilters = () => {
        router.get(route('audit-logs.index'), {
            search,
            action: action === 'all' ? '' : action,
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const getActionIcon = (action: string) => {
        const iconProps = { className: "h-5 w-5" };
        switch (action.toLowerCase()) {
            case 'login': return <LogIn {...iconProps} className="text-blue-500 h-5 w-5" />;
            case 'create': return <Edit {...iconProps} className="text-green-500 h-5 w-5" />;
            case 'update': return <Edit {...iconProps} className="text-yellow-500 h-5 w-5" />;
            case 'delete': return <Trash2 {...iconProps} className="text-red-500 h-5 w-5" />;
            case 'view': return <Eye {...iconProps} className="text-gray-400 h-5 w-5" />;
            case 'sign': return <FileSignature {...iconProps} className="text-purple-500 h-5 w-5" />;
            case 'send': return <Send {...iconProps} className="text-indigo-500 h-5 w-5" />;
            case 'approve': return <CheckCircle {...iconProps} className="text-green-600 h-5 w-5" />;
            default: return <Activity {...iconProps} className="text-gray-400 h-5 w-5" />;
        }
    };

    const getActionLabel = (action: string) => {
        switch (action.toLowerCase()) {
            case 'login': return 'Login Sistem';
            case 'create': return 'Membuat Data';
            case 'update': return 'Update Data Master';
            case 'delete': return 'Hapus Data';
            case 'view': return 'Melihat Data';
            case 'sign': return 'Menandatangani Dokumen';
            case 'send': return 'Mengirim Surat';
            case 'approve': return 'Menyetujui Dokumen';
            default: return action.charAt(0).toUpperCase() + action.slice(1);
        }
    };

    return (
        <AppLayout>
            <Head title="Activity Log" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
                {/* Header */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Activity className="h-8 w-8 text-red-500" />
                        Activity Log
                    </h2>
                    <p className="text-muted-foreground ml-10">
                        Monitor semua aktivitas sistem secara real-time
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-[#262626] border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Total Aktivitas</p>
                                <p className="text-2xl font-bold text-white">{stats.total_activities}</p>
                            </div>
                            <div className="p-3 bg-[#1a1a1a] rounded-xl">
                                <Activity className="h-6 w-6 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#262626] border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Hari Ini</p>
                                <p className="text-2xl font-bold text-white">{stats.today_activities}</p>
                            </div>
                            <div className="p-3 bg-[#1a1a1a] rounded-xl">
                                <Clock className="h-6 w-6 text-cyan-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#262626] border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Sukses</p>
                                <p className="text-2xl font-bold text-white">{stats.success_count}</p>
                            </div>
                            <div className="p-3 bg-[#1a1a1a] rounded-xl">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-[#262626] border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-300">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-muted-foreground">Gagal</p>
                                <p className="text-2xl font-bold text-white">{stats.failed_count}</p>
                            </div>
                            <div className="p-3 bg-[#1a1a1a] rounded-xl">
                                <XCircle className="h-6 w-6 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-[#262626] p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-none">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Cari user, aksi, atau target..."
                            className="pl-9 bg-[#1a1a1a] border-none text-white placeholder:text-gray-500 focus-visible:ring-gray-700"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 md:w-[200px]">
                            <Select value={action} onValueChange={(value) => { setAction(value); setTimeout(applyFilters, 100); }}>
                                <SelectTrigger className="bg-[#1a1a1a] border-none text-white focus:ring-gray-700">
                                    <SelectValue placeholder="Semua Tipe" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-gray-800 text-white">
                                    <SelectItem value="all">Semua Tipe</SelectItem>
                                    {actions.map((act) => (
                                        <SelectItem key={act} value={act} className="capitalize">
                                            {act}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1 md:w-[200px]">
                            <Select defaultValue="all">
                                <SelectTrigger className="bg-[#1a1a1a] border-none text-white focus:ring-gray-700">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-gray-800 text-white">
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Activity List */}
                <div className="space-y-4">
                    {logs.data.length > 0 ? (
                        logs.data.map((log) => (
                            <div key={log.id} className="bg-[#262626] p-4 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-none group hover:translate-y-[-2px] transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    <div className={cn("p-3 rounded-xl bg-[#1a1a1a] mt-1")}>
                                        {getActionIcon(log.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-white font-medium flex items-center gap-2">
                                                    {log.user ? log.user.name : 'System'}
                                                    <span className="text-gray-500">•</span>
                                                    <span className="text-gray-300">{getActionLabel(log.action)}</span>
                                                </h4>
                                                <div className="mt-1 space-y-1">
                                                    <p className="text-sm text-gray-400">
                                                        <span className="text-gray-500">Target:</span> {log.subject_type ? log.subject_type.split('\\').pop() : '-'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {log.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                                                Success
                                            </Badge>
                                        </div>
                                        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                                            <p className="flex items-center gap-1">
                                                <span>{format(new Date(log.created_at), 'dd MMM yyyy', { locale: id })}</span>
                                                <span>{format(new Date(log.created_at), 'HH.mm', { locale: id })}</span>
                                            </p>
                                            <p>IP: {log.ip_address || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-[#262626] rounded-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                            Tidak ada data log aktivitas.
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <Pagination links={logs.links} />
                </div>
            </div>
        </AppLayout>
    );
}
