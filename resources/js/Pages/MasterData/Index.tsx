import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GolonganTab from './Components/GolonganTab';
import PangkatTab from './Components/PangkatTab';

interface Golongan {
    id: number;
    nama: string;
    keterangan?: string;
}

interface Pangkat {
    id: number;
    nama: string;
    golongan_id: number | null;
    golongan?: Golongan;
}

interface Props {
    golongans: Golongan[];
    pangkats: Pangkat[];
}

export default function MasterDataIndex({ golongans = [], pangkats = [] }: Props) {
    return (
        <AppLayout>
            <Head title="Master Data Management" />

            <div className="flex h-full flex-1 flex-col gap-8 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Master Data Golongan dan Pangkat</h2>
                        <p className="text-muted-foreground mt-1">Konfigurasi sistem untuk Golongan dan Pangkat.</p>
                    </div>
                </div>

                <Tabs defaultValue="golongan" className="w-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="golongan">Golongan</TabsTrigger>
                        <TabsTrigger value="pangkat">Pangkat</TabsTrigger>
                    </TabsList>

                    <TabsContent value="golongan">
                        <GolonganTab golongans={golongans} />
                    </TabsContent>

                    <TabsContent value="pangkat">
                        <PangkatTab pangkats={pangkats} golongans={golongans} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
