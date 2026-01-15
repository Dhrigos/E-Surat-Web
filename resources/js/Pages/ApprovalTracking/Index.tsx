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

            <div className="p-4 md:p-8 space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Approval Tracking</h2>
                    <p className="text-muted-foreground text-sm md:text-base">Monitor approval performance and statistics</p>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2 flex-1">
                                <label className="text-sm font-medium">End Date</label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <Button onClick={handleFilter}>Apply Filters</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_verifications}</div>
                            <p className="text-xs text-muted-foreground">User verifications processed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Approved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.total_approved}</div>
                            <p className="text-xs text-muted-foreground">Verifications approved</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Rejected</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{statistics.total_rejected}</div>
                            <p className="text-xs text-muted-foreground">Verifications rejected</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Verification Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatDuration(statistics.avg_verification_time_seconds)}</div>
                            <p className="text-xs text-muted-foreground">Average handling time</p>
                        </CardContent>
                    </Card>

                </div>

                {/* Recent Verifications Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Recent User Verifications
                        </CardTitle>
                        <CardDescription>Latest user verification approvals and rejections</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>NRP</TableHead>
                                        <TableHead>Verified By</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Handling Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recent_verifications.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">No verifications found</TableCell>
                                        </TableRow>
                                    ) : (
                                        recent_verifications.map((verification) => (
                                            <TableRow key={verification.id}>
                                                <TableCell className="font-medium">{verification.name}</TableCell>
                                                <TableCell>{verification.nia_nrp}</TableCell>
                                                <TableCell>{verification.verified_by_name}</TableCell>
                                                <TableCell>{getStatusBadge(verification.status)}</TableCell>
                                                <TableCell>{new Date(verification.verified_at).toLocaleString()}</TableCell>
                                                <TableCell>
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
