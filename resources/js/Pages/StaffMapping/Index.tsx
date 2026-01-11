import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, ArrowRightLeft, Shield, Key } from 'lucide-react';
import StaffList from './StaffList';
import RoleList from './RoleList';
import PermissionList from './PermissionList';
import { usePermission } from '@/hooks/usePermission';

interface Props {
    staff: any[];
    jabatan: any[];
    roles?: any[];
    permissions?: any[];
    filters?: {
        search?: string;
    };
}

export default function Index({ staff, jabatan, roles, permissions, filters }: Props) {
    const [activeTab, setActiveTab] = useState<'staff-list' | 'mutations' | 'roles' | 'permissions'>('staff-list');
    const { hasPermission } = usePermission();

    const tabs = [
        { id: 'staff-list' as const, label: 'Staff List', icon: Users, show: true, href: route('staff-mapping') },
        { id: 'verification-queue' as const, label: 'Verification Queue', icon: Shield, show: hasPermission('manager') || hasPermission('view staff'), href: route('verification-queue.index') },
        { id: 'roles' as const, label: 'Role Management', icon: Shield, show: hasPermission('manage roles'), href: undefined },
        { id: 'permissions' as const, label: 'Permission Management', icon: Key, show: hasPermission('manage permissions'), href: undefined },
    ].filter(tab => tab.show);

    return (
        <AppLayout>
            <Head title="Mapping Staff" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Mapping Staff</h1>
                    <p className="text-muted-foreground mt-2">
                        Kelola tim dan mapping staff di bawah Anda
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-border">
                    <nav className="-mb-px flex gap-5">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (tab.href) {
                                            router.get(tab.href);
                                        } else {
                                            setActiveTab(tab.id as any);
                                        }
                                    }}
                                    className={`${isActive
                                        ? 'border-primary text-primary border-b-2'
                                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                                        } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors duration-200`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'staff-list' && (
                        <StaffList
                            staff={staff}
                            jabatan={jabatan}
                            filters={filters}
                        />
                    )}
                    {activeTab === 'roles' && (
                        <RoleList roles={roles || []} allPermissions={permissions || []} />
                    )}
                    {activeTab === 'permissions' && (
                        <PermissionList permissions={permissions || []} />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
