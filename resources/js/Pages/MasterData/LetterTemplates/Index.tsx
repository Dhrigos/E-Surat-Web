import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
    id: number;
    name: string;
    type: string;
    updated_at: string;
}

interface Props {
    templates: Template[];
}

export default function Index({ templates }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(route('letter-templates.destroy', id), {
                onSuccess: () => toast.success('Template deleted successfully'),
                onError: () => toast.error('Failed to delete template'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Master Data', href: '/master-data' },
            { title: 'Letter Templates', href: '#' }
        ]}>
            <Head title="Letter Templates" />

            <div className="p-6 space-y-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Letter Templates</h2>
                        <p className="text-muted-foreground">Manage dynamic templates for your letters.</p>
                    </div>
                    <Link href={route('letter-templates.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Template
                        </Button>
                    </Link>
                </div>

                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type Code</TableHead>
                                <TableHead>Last Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {templates.map((template) => (
                                <TableRow key={template.id}>
                                    <TableCell className="font-medium">{template.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{template.type}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(template.updated_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={route('letter-templates.edit', template.id)}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(template.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {templates.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No templates found. Create one to get started.
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
