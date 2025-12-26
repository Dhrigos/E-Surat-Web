import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

export default function LetterTemplateCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        type: '',
        content: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 20px; }
        .content { margin-top: 20px; }
        .footer { margin-top: 50px; }
    </style>
</head>
<body>
    <div class="header">
        <h2>KOP SURAT</h2>
        <p>Alamat Instansi</p>
        <hr>
    </div>
    <div class="content">
        <p>Nomor: {{nomor_surat}}</p>
        <p>Perihal: {{perihal}}</p>
        <br>
        <p>Kepada Yth,</p>
        <p>{{penerima}}</p>
        <br>
        <p>Dengan hormat,</p>
        <p>Isi surat disini...</p>
    </div>
    <div class="footer">
        <p>Hormat Kami,</p>
        <br><br><br>
        <p>{{pengirim}}</p>
    </div>
</body>
</html>`,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('letter-templates.store'));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Letter Templates', href: '/letter-templates' },
            { title: 'Create', href: '/letter-templates/create' }
        ]}>
            <Head title="Create Letter Template" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('letter-templates.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Create Template</h2>
                        <p className="text-muted-foreground">Design a new letter template.</p>
                    </div>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Template Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Surat Dinas Standard"
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Template Type (Unique Code)</Label>
                                <Input
                                    id="type"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                    placeholder="e.g. surat_dinas_v1"
                                    required
                                />
                                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">HTML Content</Label>
                            <p className="text-xs text-muted-foreground mb-2">
                                Use placeholders like <code>{'{{nomor_surat}}'}</code>, <code>{'{{perihal}}'}</code>, <code>{'{{penerima}}'}</code>, <code>{'{{pengirim}}'}</code>.
                            </p>
                            <Textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                className="font-mono min-h-[400px]"
                                required
                            />
                            {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Create Template'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
