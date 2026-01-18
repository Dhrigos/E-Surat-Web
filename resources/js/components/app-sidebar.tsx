import { NavMain } from '@/components/nav-main';
import { resolveUrl } from '@/lib/utils';
import {
    Sidebar,
    SidebarContent,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { Activity, FileText, Home, List, Mail, Users, Share2, Star, Archive, MoreHorizontal, MapPin, Inbox, Clock, Send, CheckCircle, SquarePen, LogOut } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const suratItems = [
        {
            title: 'Buat Surat',
            href: '/buat-surat',
            icon: SquarePen,
        },
        {
            title: 'Inbox',
            href: '/list-surat?tab=inbox',
            icon: Inbox,
        },
        {
            title: 'Approval',
            href: '/list-surat?tab=approvals',
            icon: Clock,
        },
        {
            title: 'Sent',
            href: '/list-surat?tab=sent',
            icon: Send,
        },
        {
            title: 'Approved',
            href: '/list-surat?tab=approved',
            icon: CheckCircle,
        },
    ];

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: Home,
        },
        {
            title: 'Surat',
            href: '#',
            icon: Mail,
            items: suratItems,
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




    const hasManagerRole = user.roles?.some((role: any) => ['admin', 'super-admin'].includes(role.name));

    if (hasManagerRole) {
        mainNavItems.push({
            title: 'Mapping Staff',
            href: '/staff-mapping',
            icon: Users,
        });
        mainNavItems.push({
            title: 'Data Master',
            href: '/data-master',
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
            <Sidebar collapsible="icon" className="hidden md:flex top-16 md:top-20 h-[calc(100svh-4rem)] md:h-[calc(100svh-5rem)] fixed left-0 z-40 bg-sidebar border-r border-neutral-800 shadow-sm">
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

            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-sidebar-border dark:border-white/10 z-50 flex justify-around items-center h-16 px-2 pb-safe bg-white dark:bg-sidebar">
                {/* Primary Items */}
                {[
                    mainNavItems.find(i => i.title === 'Dashboard'),
                    ...suratItems.filter(i => ['Inbox', 'Approval', 'Sent'].includes(i.title)),
                    mainNavItems.find(i => i.title === 'Arsip')
                ].filter(Boolean).map((item) => {
                    if (!item) return null;
                    const Icon = item.icon;
                    const targetHref = resolveUrl(item.href || '');
                    const currentUrl = usePage().url;

                    // Improved isActive logic for query params
                    const isActive =
                        currentUrl === targetHref ||
                        (targetHref !== '/' && !targetHref.includes('?') && currentUrl.startsWith(targetHref)) ||
                        (item.title === 'Inbox' && currentUrl === '/list-surat') ||
                        (targetHref.includes('?') && currentUrl.includes(targetHref.substring(targetHref.indexOf('?'))));

                    return (
                        <Link
                            key={item.title}
                            href={targetHref}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive
                                ? 'text-red-600'
                                : 'text-muted-foreground hover:text-[#ac0021]'
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
                        <button className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-[#ac0021] transition-colors">
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
                        <DropdownMenuItem
                            onClick={() => router.post(route('logout'))}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    );
}
