import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, ArrowRightLeft, Shield, Key } from 'lucide-react';
import StaffList from './StaffList';

interface Props {
    staff: any[];
    jabatan: any[];
    filters?: {
        search?: string;
    };
    pendingCount?: number;
}

export default function Index({ staff, jabatan, filters, pendingCount }: Props) {
    const [activeTab, setActiveTab] = useState<'staff-list' | 'roles'>('staff-list');
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth.user.roles.some((r: any) => r.name === 'super-admin');

    const tabs = [
        { id: 'staff-list' as const, label: 'Staff List', icon: Users, show: true, href: route('staff-mapping') },
        { id: 'verification-queue' as const, label: 'Antrian', icon: Shield, show: true, href: route('verification-queue.index') },
    ].filter(tab => tab.show);

    return (
        <AppLayout>
            <Head title="Mapping Staff" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">


                {/* Tab Content */}
                <div>
                    {activeTab === 'staff-list' && (
                        <StaffList
                            staff={staff}
                            jabatan={jabatan}
                            filters={filters}
                            pendingCount={pendingCount}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
