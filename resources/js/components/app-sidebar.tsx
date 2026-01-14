import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Activity, FileText, Home, List, Mail, Users, Share2, Star, Archive, MoreHorizontal, MapPin } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: Home,
        },

        {
            title: 'Surat',
            href: '/list-surat',
            icon: Mail,
        },
        {
            title: 'Pesan Berbintang',
            href: '/starred-mails',
            icon: Star,
        },
        {
            title: 'Arsip',
            href: '/archived-mails',
            icon: Archive,
        },
        {
            title: 'Disposisi Masuk',
            href: '/dispositions',
            icon: Share2,
        },
        {
            title: 'Lokasi GPS',
            href: '/location',
            icon: MapPin,
        },
    ];

    const isSuperAdmin = user?.roles?.some((role: any) => role.name === 'super-admin');

    if (isSuperAdmin) {
        mainNavItems.push({
            title: 'Data Master',
            href: '#',
            icon: Users,
            items: [
                { title: 'Unit', href: '/jabatan', icon: FileText },
                { title: 'Jabatan', href: '/jabatan-roles', icon: Users },
                { title: 'Jenis Surat', href: '/jenis-surat', icon: FileText },
                { title: 'Golongan & Pangkat', href: '/master-data', icon: FileText },
            ]
        });
    }


    const hasManagerRole = user.roles?.some((role: any) => ['admin', 'super-admin'].includes(role.name));

    if (hasManagerRole) {
        mainNavItems.push({
            title: 'Mapping Staff',
            href: '/staff-mapping',
            icon: Users,
        });
        mainNavItems.push({
            title: 'Audit Log',
            href: '/audit-logs',
            icon: Activity,
        });
    }

    // Approval Tracking - Super Admin Only
    if (isSuperAdmin) {
        mainNavItems.push({
            title: 'Approval Tracking',
            href: '/approval-tracking',
            icon: Activity,
        });
    }

    return (
        <>
            <Sidebar collapsible="icon" className="hidden md:flex top-16 md:top-20 h-[calc(100svh-4rem)] md:h-[calc(100svh-5rem)] fixed left-0 z-40 bg-sidebar border-r border-sidebar-border">
                <div className="flex items-center gap-3 p-4 border-b border-sidebar-border md:hidden">
                    <div className="bg-sidebar-accent p-2 rounded-lg">
                        <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="BCN Logo" className="h-6 w-6 object-contain" />
                    </div>
                    <div>
                        <h2 className="font-bold text-red-600 text-base">Badan Cadangan Nasional</h2>
                        <p className="text-xs text-muted-foreground">Sistem Dokumen</p>
                    </div>
                </div>
                <SidebarContent>
                    <NavMain items={mainNavItems} />
                </SidebarContent>
            </Sidebar>

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-sidebar-border z-50 flex justify-around items-center h-16 px-2 pb-safe bg-white dark:bg-sidebar">
                {/* Primary Items */}
                {mainNavItems.filter(item => ['Dashboard', 'Surat', 'Pesan Berbintang', 'Arsip'].includes(item.title)).map((item) => {
                    const Icon = item.icon;
                    const targetHref = item.href as string;
                    const currentUrl = usePage().url;

                    const isActive =
                        currentUrl === targetHref ||
                        (targetHref !== '/' && currentUrl.startsWith(targetHref)) ||
                        (item.title === 'Surat' && (currentUrl.startsWith('/list-surat') || currentUrl.startsWith('/buat-surat')));

                    return (
                        <Link
                            key={item.title}
                            href={targetHref}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive
                                ? 'text-red-600'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {Icon && <Icon className="h-5 w-5" />}
                            <span className="text-[10px] font-medium truncate max-w-[60px]">{item.title}</span>
                        </Link>
                    );
                })}

                {/* Lain-lain Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                            <span className="text-[10px] font-medium">Lain-lain</span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 mb-2">
                        {mainNavItems.filter(item => !['Dashboard', 'Surat', 'Pesan Berbintang', 'Arsip'].includes(item.title)).map((item) => {
                            const Icon = item.icon;
                            return (
                                <DropdownMenuItem key={item.title} asChild>
                                    <Link href={item.href as string} className="flex items-center gap-2 cursor-pointer">
                                        {Icon && <Icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
