import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import DashboardBackground from '@/components/DashboardBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, UserPlus, Users } from 'lucide-react';
import { SharedData, PaginatedData, User } from '@/types';
import Pagination from '@/components/Pagination';
import { AddMemberDialog } from '@/Components/Mitra/AddMemberDialog';

interface Props {
    members: PaginatedData<User>;
    filters: {
        search?: string;
    };
    // Master data
    jabatans: any[];
    jabatanRoles: any[];
    golongans: any[];
    pangkats: any[];
    sukus: any[];
    bangsas: any[];
    agamas: any[];
    status_pernikahans: any[];
    goldars: any[];
    pendidikans: any[];
    pekerjaans: any[];
}

export default function MemberIndex({ members, filters, ...masterData }: Props) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <AppLayout className="min-h-full">
            <DashboardBackground />
            <Head title="Daftar Anggota Mitra" />

            <div className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Daftar Anggota</h1>
                        <p className="text-gray-400 text-sm">Kelola data anggota komponen cadangan Anda.</p>
                    </div>
                    <Button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[#AC0021] hover:bg-[#8a001a] text-white"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Tambah Anggota
                    </Button>
                </div>

                <AddMemberDialog
                    open={isAddModalOpen}
                    onOpenChange={setIsAddModalOpen}
                    {...masterData}
                />

                <Card className="bg-white dark:bg-[#262626] border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-[#AC0021]" />
                            Data Anggota
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Cari anggota..." className="pl-8 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800">
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.data.length > 0 ? (
                                    members.data.map((member: User, index: number) => (
                                        <TableRow key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800">
                                            <TableCell>{index + 1 + (members.current_page - 1) * members.per_page}</TableCell>
                                            <TableCell className="font-medium">{member.name}</TableCell>
                                            <TableCell>{member.email}</TableCell>
                                            <TableCell>
                                                {member.verifikasi ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        Diterima
                                                    </span>
                                                ) : member.rejection_reason ? (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        Ditolak
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                        Menunggu Verifikasi
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <span className="h-4 w-4">...</span>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            Tidak ada data anggota.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <div className="mt-4">
                            <Pagination links={members.links} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
