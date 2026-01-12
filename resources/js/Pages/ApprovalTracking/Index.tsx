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
    avg_verification_time_hours: number;
    total_letter_approvals: number;
    avg_letter_approval_time_hours: number;
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
    admins: Admin[];
    filters: {
        start_date: string;
        end_date: string;
        admin_id: number | null;
        action: string | null;
    };
}

export default function Index({ statistics, recent_verifications, recent_letter_approvals, admins, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [adminId, setAdminId] = useState(filters.admin_id?.toString() || 'all');
    const [action, setAction] = useState(filters.action || 'all');

    const handleFilter = () => {
        router.get(route('approval-tracking.index'), {
            start_date: startDate,
            end_date: endDate,
            admin_id: adminId === 'all' ? null : adminId,
            action: action === 'all' ? null : action,
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">End Date</label>
                                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Admin</label>
                                <Select value={adminId} onValueChange={setAdminId}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Admins</SelectItem>
                                        {admins.map(admin => (
                                            <SelectItem key={admin.id} value={admin.id.toString()}>{admin.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Action</label>
                                <Select value={action} onValueChange={setAction}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Actions</SelectItem>
                                        <SelectItem value="approved">Approved</SelectItem>
                                        <SelectItem value="rejected">Rejected</SelectItem>
                                        <SelectItem value="returned">Returned</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleFilter} className="mt-4">Apply Filters</Button>
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
                            <CardTitle className="text-sm font-medium">Avg Verification Time</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.avg_verification_time_hours.toFixed(2)}h</div>
                            <p className="text-xs text-muted-foreground">Average handling time</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Letter Approvals</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_letter_approvals}</div>
                            <p className="text-xs text-muted-foreground">Letters processed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Approval Time</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.avg_letter_approval_time_hours}h</div>
                            <p className="text-xs text-muted-foreground">Average letter approval time</p>
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
                                                <TableCell>{verification.time_taken_hours}h</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Letter Approvals Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Recent Letter Approvals
                        </CardTitle>
                        <CardDescription>Latest letter approval actions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Letter Subject</TableHead>
                                        <TableHead>Approver</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recent_letter_approvals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground">No letter approvals found</TableCell>
                                        </TableRow>
                                    ) : (
                                        recent_letter_approvals.map((approval) => (
                                            <TableRow key={approval.id}>
                                                <TableCell className="font-medium max-w-xs truncate">{approval.letter_subject}</TableCell>
                                                <TableCell>{approval.approver_name}</TableCell>
                                                <TableCell>{getStatusBadge(approval.status)}</TableCell>
                                                <TableCell>{new Date(approval.approved_at).toLocaleString()}</TableCell>
                                                <TableCell>{approval.time_taken_hours}h</TableCell>
                                                <TableCell className="max-w-xs truncate">{approval.remarks || '-'}</TableCell>
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
