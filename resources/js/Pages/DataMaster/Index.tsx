import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, Shield, FileText, ArrowRight, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import RankTab from '@/Components/DataMaster/RankTab';
import UnitTab from '@/Components/DataMaster/UnitTab';
import JabatanRoleTab from '@/Components/DataMaster/JabatanRoleTab';
import TemplateTab from '@/Components/DataMaster/TemplateTab';

interface Props {
    activeTab: 'ranks' | 'units' | 'roles' | 'templates';
    stats: {
        total_ranks: number;
        total_units: number;
        total_roles: number;
        total_templates: number;
    };
    data: any; // Dynamic based on tab
    filters: any;
}

export default function Index({ activeTab, stats, data, filters }: Props) {
    const tabs = [
        { id: 'ranks', label: 'Golongan & Pangkat', icon: Award },
        { id: 'units', label: 'Unit & Organisasi', icon: Building2 },
        { id: 'roles', label: 'Role & Jabatan', icon: Shield },
        { id: 'templates', label: 'Jenis Surat', icon: FileText },
    ];

    const statsCards = [
        {
            title: 'Setup Golongan & Pangkat',
            value: stats.total_ranks,
            icon: Award,
            color: 'text-[#007ee7]',
            bg: 'bg-[#007ee7]/10',
        },
        {
            title: 'Total Unit Kerja',
            value: stats.total_units,
            icon: Building2,
            color: 'text-[#659800]',
            bg: 'bg-[#659800]/10',
        },
        {
            title: 'Setup Jabatan',
            value: stats.total_roles,
            icon: Shield,
            color: 'text-[#d04438]',
            bg: 'bg-[#d04438]/10',
        },
        {
            title: 'Template Surat',
            value: stats.total_templates,
            icon: FileText,
            color: 'text-[#007ee7]',
            bg: 'bg-[#007ee7]/10',
        },
    ];

    const handleTabChange = (tabId: string) => {
        router.get('/data-master', { tab: tabId }, { preserveState: true });
    };

    return (
        <AppLayout>
            <Head title="Data Master & Konfigurasi" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Master</h1>
                        <p className="text-muted-foreground mt-1">
                            Pusat pengelolaan data referensi sistem, struktur organisasi, dan pengguna.
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statsCards.map((stat, index) => (
                        <Card key={index} className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#262626] text-zinc-900 dark:text-[#FEFCF8]">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="space-y-1 mb-4">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <h3 className="text-4xl font-bold">{stat.value}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className={cn("w-2 h-2 rounded-full", stat.bg.replace('/10', ''))} />
                                    <span>Data Aktif</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs & Content Container */}
                <div className="flex flex-col gap-0">
                    {/* Tabs Navigation */}
                    <div className="bg-white dark:bg-[#262626] border-t border-x border-zinc-200 dark:border-zinc-800 rounded-t-2xl mb-0 overflow-hidden z-10 relative">
                        <nav className="flex overflow-x-auto no-scrollbar" aria-label="Tabs">
                            {tabs.map((tab, index) => {
                                const isActive = activeTab === tab.id;
                                const isFirst = index === 0;
                                const isLast = index === tabs.length - 1;

                                let shadowClass = "";
                                if (isActive) {
                                    if (isFirst) shadowClass = "shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.5)]";
                                    else if (isLast) shadowClass = "shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.5)]";
                                    else shadowClass = "shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.5),inset_-10px_0_20px_-10px_rgba(0,0,0,0.5)]";
                                }

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={cn(
                                            "flex-1 inline-flex items-center justify-center py-4 px-4 border-b-0 font-medium text-sm transition-all duration-200 whitespace-nowrap gap-2",
                                            isActive
                                                ? `text-white bg-[#AC0021] ${shadowClass}`
                                                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                        )}
                                    >
                                        <tab.icon className={cn("w-4 h-4", isActive ? "text-white" : "")} />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[500px]">
                        {activeTab === 'ranks' && (
                            <RankTab
                                data={data}
                                filters={filters}
                            />
                        )}
                        {activeTab === 'units' && (
                            <UnitTab
                                jabatan={data.units}
                                filters={filters}
                                currentParent={data.current_parent}
                                breadcrumbs={data.breadcrumbs}
                            />
                        )}
                        {activeTab === 'roles' && (
                            <JabatanRoleTab
                                roles={data.roles}
                                filters={filters}
                            />
                        )}
                        {activeTab === 'templates' && (
                            <TemplateTab
                                templates={data.templates}
                                filters={filters}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
