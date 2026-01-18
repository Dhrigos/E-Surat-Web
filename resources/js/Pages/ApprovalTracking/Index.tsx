import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, FileText, Users, TrendingUp, Filter } from 'lucide-react';

interface Statistics {
    total_verifications: number;
    total_approved: number;
    total_rejected: number;
    avg_verification_time_seconds: number;
}

interface Verification {
    id: number;
    name: string;
    email: string;
    nia_nrp: string;
    verified_at: string;
    verified_by_name: string;
    status: string;
    time_taken_hours: number;
}

interface LetterApproval {
    id: number;
    letter_subject: string;
    approver_name: string;
    status: string;
    approved_at: string;
    remarks: string | null;
    time_taken_hours: number;
}

interface Admin {
    id: number;
    name: string;
}

interface Props {
    statistics: Statistics;
    recent_verifications: Verification[];
    recent_letter_approvals: LetterApproval[];
    filters: {
        start_date: string;
        end_date: string;
    };
}

export default function Index({ statistics, recent_verifications, recent_letter_approvals, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);

    const handleFilter = () => {
        router.get(route('approval-tracking.index'), {
            start_date: startDate,
            end_date: endDate,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            approved: { variant: 'default', label: 'Approved' },
            rejected: { variant: 'destructive', label: 'Rejected' },
            returned: { variant: 'secondary', label: 'Returned' },
        };
        const config = variants[status] || { variant: 'secondary', label: status };
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return '0m';
        const hours = seconds / 3600;
        if (hours < 1) {
            return `${Math.round(seconds / 60)}m`;
        }
        return `${hours.toFixed(1)}h`;
    };

    return (
        <AppLayout>
            <Head title="Approval Tracking" />

            <div className="p-4 md:p-8 space-y-6 w-full">
                {/* Header */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Approval Tracking</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base">Monitor approval performance and statistics</p>
                </div>

                {/* Filters */}
                <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#262626] text-zinc-900 dark:text-zinc-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 md:items-end">
                            <div className="space-y-2 flex-1 w-full">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Date</label>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 w-full"
                                />
                            </div>
                            <div className="space-y-2 flex-1 w-full">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End Date</label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 w-full"
                                />
                            </div>
                            <Button onClick={handleFilter} className="w-full md:w-auto bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-900/90 dark:hover:bg-zinc-100/90">
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#262626] text-zinc-900 dark:text-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Total Verifications</CardTitle>
                            <Users className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_verifications}</div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">User verifications processed</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#262626] text-zinc-900 dark:text-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Total Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{statistics.total_approved}</div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Verifications approved</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#262626] text-zinc-900 dark:text-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Total Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-500">{statistics.total_rejected}</div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Verifications rejected</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#262626] text-zinc-900 dark:text-zinc-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-400">Avg Verification Time</CardTitle>
                            <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDuration(statistics.avg_verification_time_seconds)}</div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Average handling time</p>
                        </CardContent>
                    </Card>

                </div>

                {/* Recent Verifications Table */}
                <Card className="border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#262626] text-zinc-900 dark:text-zinc-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                            Recent User Verifications
                        </CardTitle>
                        <CardDescription className="text-zinc-500 dark:text-zinc-400">Latest user verification approvals and rejections</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
                                        <TableHead className="text-zinc-500 dark:text-zinc-400">User</TableHead>
                                        <TableHead className="text-zinc-500 dark:text-zinc-400">NRP</TableHead>
                                        <TableHead className="text-zinc-500 dark:text-zinc-400">Verified By</TableHead>
                                        <TableHead className="text-zinc-500 dark:text-zinc-400">Status</TableHead>
                                        <TableHead className="text-zinc-500 dark:text-zinc-400">Time</TableHead>
                                        <TableHead className="text-zinc-500 dark:text-zinc-400">Handling Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recent_verifications.length === 0 ? (
                                        <TableRow className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
                                            <TableCell colSpan={6} className="text-center text-zinc-500 dark:text-zinc-400">No verifications found</TableCell>
                                        </TableRow>
                                    ) : (
                                        recent_verifications.map((verification) => (
                                            <TableRow key={verification.id} className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50">
                                                <TableCell className="font-medium text-zinc-900 dark:text-zinc-200">{verification.name}</TableCell>
                                                <TableCell className="text-zinc-700 dark:text-zinc-300">{verification.nia_nrp}</TableCell>
                                                <TableCell className="text-zinc-700 dark:text-zinc-300">{verification.verified_by_name}</TableCell>
                                                <TableCell>{getStatusBadge(verification.status)}</TableCell>
                                                <TableCell className="text-zinc-700 dark:text-zinc-300">{new Date(verification.verified_at).toLocaleString()}</TableCell>
                                                <TableCell className="text-zinc-700 dark:text-zinc-300">
                                                    {verification.time_taken_hours < 1
                                                        ? `${Math.round(verification.time_taken_hours * 60)}m`
                                                        : `${verification.time_taken_hours.toFixed(1)}h`
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}
