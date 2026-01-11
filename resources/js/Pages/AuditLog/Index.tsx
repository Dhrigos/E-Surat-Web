import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import Pagination from '@/components/Pagination';
import { Search, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
    id: number;
    user: {
        name: string;
    } | null;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
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
}

export default function AuditLogIndex({ logs, filters, actions }: AuditLogIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            // Normalize values to prevent unnecessary updates that reset pagination
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
            start_date: startDate,
            end_date: endDate
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleReset = () => {
        setSearch('');
        setAction('all');
        setStartDate('');
        setEndDate('');
        router.get(route('audit-logs.index'));
    };

    const breadcrumbs = [
        {
            title: 'Audit Log',
            href: '/audit-logs',
        },
    ];

    const getActionColor = (action: string) => {
        switch (action) {
            case 'create': return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
            case 'update': return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
            case 'delete': return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Audit Log</h2>
                        <p className="text-muted-foreground">
                            Pantau aktivitas pengguna dalam sistem.
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Riwayat Aktivitas</CardTitle>
                        <CardDescription>
                            Daftar lengkap log aktivitas pengguna.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Cari deskripsi atau user..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div>
                                <Select value={action} onValueChange={(value) => { setAction(value); setTimeout(applyFilters, 100); }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Aksi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Aksi</SelectItem>
                                        {actions.map((act) => (
                                            <SelectItem key={act} value={act}>{act}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setTimeout(applyFilters, 100); }}
                                />
                            </div>

                            <div>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setTimeout(applyFilters, 100); }}
                                />
                            </div>

                            <div className="flex items-center">
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    className="w-full md:w-auto"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Waktu</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Aksi</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>IP Address</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap">
                                                    {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {log.user ? log.user.name : 'System'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getActionColor(log.action)}>
                                                        {log.action.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {log.description}
                                                </TableCell>
                                                <TableCell className="whitespace-nowrap text-muted-foreground">
                                                    {log.ip_address || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">
                                                Tidak ada data log aktivitas.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="mt-4">
                            <Pagination links={logs.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
