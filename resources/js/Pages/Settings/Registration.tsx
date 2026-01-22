import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { DateSelect } from '@/components/ui/date-select';
import { toast } from 'sonner';
import { CalendarCog, Save } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
    settings: {
        registration_open: boolean;
        registration_start_date: string | null;
        registration_end_date: string | null;
    };
}

export default function Registration({ settings }: Props) {
    const { data, setData, post, processing } = useForm({
        settings: {
            registration_open: settings.registration_open,
            registration_start_date: settings.registration_start_date,
            registration_end_date: settings.registration_end_date,
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

        // Transform data for backend (key-value pairs)
        // Controller expects settings: { key: value, ... } ? No, logic was array of keys.
        // Let's adjust form submission to match Controller expectation:
        // Controller expects: settings: { key: value, ... } or array?
        // Let's re-read controller logic.
        // Controller iterates: foreach ($data['settings'] as $key => $value)
        // So payload should be: settings: { 'registration_open': true, ... }

        post(route('settings.update'), {
            onSuccess: () => toast.success('Pengaturan berhasil disimpan'),
            onError: () => toast.error('Gagal menyimpan pengaturan'),
        });
    };

    return (
        <AppLayout>
            <Head title="Setting Pendaftaran" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Setting Pendaftaran</h2>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="col-span-1 md:col-span-2 bg-[#262626] border-white/10 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarCog className="h-5 w-5 text-[#AC0021]" />
                                Konfigurasi Pendaftaran
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                                Atur jadwal dan status pendaftaran calon anggota baru.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSave} className="space-y-6">

                                {/* Registration Toggle */}
                                <div className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4">
                                    <div className="space-y-0.5">
                                        <Label className="text-base text-white">Buka Pendaftaran</Label>
                                        <p className="text-sm text-gray-400">
                                            Jika dimatikan, calon anggota tidak akan bisa mendaftar.
                                        </p>
                                    </div>
                                    <Switch
                                        checked={data.settings.registration_open}
                                        onCheckedChange={(checked) => setData('settings', { ...data.settings, registration_open: checked })}
                                        className="data-[state=checked]:bg-[#AC0021]"
                                    />
                                </div>

                                {/* Start Date */}
                                <div className="space-y-2">
                                    <DateSelect
                                        value={data.settings.registration_start_date ? data.settings.registration_start_date.substring(0, 10) : undefined}
                                        onChange={(date: string) => setData('settings', { ...data.settings, registration_start_date: date ? `${date} 00:00:00` : null })}
                                        className="w-full bg-[#1a1a1a] border-white/10 text-white"
                                        placeholder="Pilih tanggal mulai..."
                                    />
                                    <p className="text-xs text-gray-500">Opsional. Kosongkan jika ingin dibuka tanpa jadwal otomatis.</p>
                                </div>

                                {/* End Date */}
                                <div className="space-y-2">
                                    <Label className="text-white">Tanggal Selesai</Label>
                                    <DateSelect
                                        value={data.settings.registration_end_date ? data.settings.registration_end_date.substring(0, 10) : undefined}
                                        onChange={(date: string) => setData('settings', { ...data.settings, registration_end_date: date ? `${date} 23:59:59` : null })}
                                        className="w-full bg-[#1a1a1a] border-white/10 text-white"
                                        placeholder="Pilih tanggal selesai..."
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={processing} className="bg-[#AC0021] hover:bg-[#AC0021]/90 text-white">
                                        <Save className="mr-2 h-4 w-4" />
                                        Simpan Perubahan
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
