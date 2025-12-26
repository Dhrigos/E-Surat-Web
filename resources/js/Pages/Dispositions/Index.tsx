import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

interface Disposition {
    id: number;
    letter: {
        id: number;
        subject: string;
        letter_number: string;
    };
    sender: {
        name: string;
    };
    instruction: string;
    status: string;
    created_at: string;
}

interface Props {
    dispositions: Disposition[];
}

export default function DispositionIndex({ dispositions }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Disposisi Masuk', href: '/dispositions' }]}>
            <Head title="Disposisi Masuk" />

            <div className="p-6 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Disposisi Masuk</h2>
                    <p className="text-muted-foreground">Daftar surat yang didisposisikan kepada Anda.</p>
                </div>

                <div className="bg-card rounded-xl border shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Dari</TableHead>
                                <TableHead>Perihal Surat</TableHead>
                                <TableHead>Instruksi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dispositions.map((disp) => (
                                <TableRow key={disp.id}>
                                    <TableCell className="whitespace-nowrap">
                                        {format(new Date(disp.created_at), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell>{disp.sender.name}</TableCell>
                                    <TableCell className="font-medium">{disp.letter.subject}</TableCell>
                                    <TableCell>{disp.instruction}</TableCell>
                                    <TableCell>
                                        <Badge variant={disp.status === 'completed' ? 'default' : 'secondary'}>
                                            {disp.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('letters.index', { search: disp.letter.subject })}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Lihat Surat
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {dispositions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Tidak ada disposisi masuk.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
