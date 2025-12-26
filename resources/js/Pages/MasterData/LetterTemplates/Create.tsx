import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import { toast } from 'sonner';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        content: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('letter-templates.store'), {
            onSuccess: () => toast.success('Template created successfully'),
            onError: () => toast.error('Failed to create template'),
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Master Data', href: '/master-data' },
            { title: 'Letter Templates', href: '/master-data/letter-templates' },
            { title: 'Create', href: '#' }
        ]}>
            <Head title="Create Letter Template" />

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('letter-templates.index')}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Letter Template</h2>
                        <p className="text-muted-foreground">Design a new dynamic letter template.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g. Nota Dinas Standar"
                                required
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Template Type (Code)</Label>
                            <Input
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                placeholder="e.g. nota_dinas"
                                required
                            />
                            {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Template Content</Label>
                        <div className="prose-sm max-w-none">
                            <RichTextEditor
                                content={data.content}
                                onChange={(content) => setData('content', content)}
                            />
                        </div>
                        {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                        <p className="text-xs text-muted-foreground">
                            Use the "Insert Variable" dropdown to add dynamic placeholders like <code>{`{{nomor_surat}}`}</code>.
                        </p>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Link href={route('letter-templates.index')}>
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Template'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
