import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox"
import { DateSelect } from '@/components/ui/date-select';
import { toast } from 'sonner';
import { CalendarCog, Save, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Golongan {
    id: number;
    nama: string;
}

interface Props {
    settings: {
        registration_open: boolean;
        registration_start_date: string | null;
        registration_end_date: string | null;
        [key: string]: any; // Allow dynamic keys like quota_ad_1, quota_al_2, etc.
    };
    golongans: Golongan[];
}

export default function Registration({ settings, golongans }: Props) {
    const { data, setData, post, processing } = useForm<{
        settings: {
            registration_open: boolean;
            registration_start_date: string | null;
            registration_end_date: string | null;
            [key: string]: any;
        }
    }>({
        settings: {
            ...settings, // Spread all dynamic keys
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();

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

                <div className="space-y-4">
                    <Card className="bg-[#262626] border-white/10 text-white">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-white">Tanggal Mulai</Label>
                                        <DateSelect
                                            value={data.settings.registration_start_date ? data.settings.registration_start_date.substring(0, 10) : undefined}
                                            onChange={(date: string) => setData('settings', { ...data.settings, registration_start_date: date ? `${date} 00:00:00` : null })}
                                            className="w-full"
                                            triggerClassName="bg-[#1a1a1a] border-white/10 text-white"
                                            placeholder="Pilih tanggal mulai..."
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div className="space-y-2">
                                        <Label className="text-white">Tanggal Selesai</Label>
                                        <DateSelect
                                            value={data.settings.registration_end_date ? data.settings.registration_end_date.substring(0, 10) : undefined}
                                            onChange={(date: string) => setData('settings', { ...data.settings, registration_end_date: date ? `${date} 23:59:59` : null })}
                                            className="w-full"
                                            triggerClassName="bg-[#1a1a1a] border-white/10 text-white"
                                            placeholder="Pilih tanggal selesai..."
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Opsional. Kosongkan jika ingin dibuka tanpa jadwal otomatis.</p>

                                <div className="border-t border-white/10 my-4"></div>

                                {/* Quota Matrix Section */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                                        <Users className="h-5 w-5 text-[#AC0021]" />
                                        Kuota Per Matra & Jenjang
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        Batasi jumlah pendaftar untuk setiap matra dan jenjang pangkat. Kosongkan untuk tidak membatasi.
                                    </p>

                                    <div className="rounded-lg border border-white/10 overflow-hidden">
                                        <div className="grid grid-cols-4 gap-6 p-4 bg-[#1a1a1a]/50 border-b border-white/10">
                                            <div className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Jenjang</div>
                                            <div className="font-semibold text-xs text-gray-400 uppercase tracking-wider text-center">Matra AD</div>
                                            <div className="font-semibold text-xs text-gray-400 uppercase tracking-wider text-center">Matra AL</div>
                                            <div className="font-semibold text-xs text-gray-400 uppercase tracking-wider text-center">Matra AU</div>
                                        </div>

                                        <div className="divide-y divide-white/10">
                                            {golongans.map((golongan) => (
                                                <div key={golongan.id} className="grid grid-cols-4 gap-6 p-4 items-center hover:bg-white/5 transition-colors duration-200">
                                                    <div className="text-white font-medium text-sm">{golongan.nama}</div>

                                                    {['ad', 'al', 'au'].map((matra) => {
                                                        const key = `quota_${matra}_${golongan.id}`;
                                                        return (
                                                            <div key={matra}>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="Unlimited"
                                                                    value={data.settings[key] || ''}
                                                                    onChange={(e) => setData('settings', { ...data.settings, [key]: e.target.value })}
                                                                    className="bg-[#1a1a1a] border-white/10 text-white text-center focus:ring-1 focus:ring-[#AC0021] focus:border-[#AC0021] h-9 text-sm"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
