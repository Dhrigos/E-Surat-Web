import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';

interface LetterTemplate {
    id: number;
    name: string;
    type: string;
    content: string;
}

interface Props {
    template: LetterTemplate;
}

export default function LetterTemplateEdit({ template }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: template.name,
        type: template.type,
        content: template.content,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('letter-templates.update', template.id));
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Letter Templates', href: '/letter-templates' },
            { title: 'Edit', href: `/letter-templates/${template.id}/edit` }
        ]}>
            <Head title="Edit Letter Template" />

            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('letter-templates.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Edit Template</h2>
                        <p className="text-muted-foreground">Modify existing letter template.</p>
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
                                {processing ? 'Saving...' : 'Update Template'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
