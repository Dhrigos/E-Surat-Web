import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbItem, SharedData } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { Bell, ChevronDown, LogOut, Menu, UserCog } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    showSidebarTrigger?: boolean;
}

export function AppHeader({ breadcrumbs = [], showSidebarTrigger = true }: AppHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const notifications = auth.notifications || [];

    const unreadCount = notifications.length;

    const markAsRead = (id: string) => {
        router.post(route('notifications.read', id), {}, {
            preserveScroll: true,
        });
    };

    const clearAllNotifications = () => {
        router.post(route('notifications.clear-all'), {}, {
            preserveScroll: true,
        });
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    return (
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm border-b border-border flex items-center justify-between h-16 md:h-20 px-4 md:px-6 lg:px-8 shrink-0 z-50 fixed top-0 left-0 right-0 w-full transition-colors duration-200">
            <div className="flex items-center gap-2 md:gap-6">
                {showSidebarTrigger && (
                    <SidebarTrigger className="hidden md:flex text-foreground hover:bg-accent hover:text-accent-foreground">
                        <Menu className="h-6 w-6" />
                    </SidebarTrigger>
                )}

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg hidden md:block">
                        <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="BCN Logo" className="h-6 w-6 md:h-8 md:w-8 object-contain" />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-foreground">Badan Cadangan Nasional</h1>
                        <p className="text-muted-foreground text-xs md:text-sm lg:text-base">Sistem Manajemen Dokumen Elektronik</p>
                    </div>
                    <div className="sm:hidden">
                        <h1 className="text-sm font-bold text-foreground">BCN</h1>
                        <p className="text-muted-foreground text-xs">Sistem Dokumen</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
                <ThemeToggle />

                {/* Notifications */}
                <div className="md:hidden">
                    <Link href={route('notifications.index')}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <Bell className="h-5 w-5 md:h-6 md:w-6" />
                            {unreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </Link>
                </div>
                <Popover>
                    <PopoverTrigger asChild className="hidden md:flex">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            <Bell className="h-5 w-5 md:h-6 md:w-6" />
                            {unreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-80 md:w-96 lg:w-[420px] bg-popover border-border text-popover-foreground" align="end">
                        <div className="p-3 md:p-4 border-b border-border">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Notifikasi</h3>
                                {notifications.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllNotifications}
                                        className="text-xs h-7 text-muted-foreground hover:text-foreground hover:bg-accent"
                                    >
                                        Tandai Semua Dibaca
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="overflow-y-auto max-h-80">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    Tidak ada notifikasi baru
                                </div>
                            ) : (
                                notifications.map((notification: any) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 md:p-4 border-b border-border cursor-pointer hover:bg-accent/50 active:bg-accent transition-colors bg-accent/20`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate text-foreground">{notification.data.subject}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-2">{notification.data.message}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                                            </div>
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* User greeting - enhanced for desktop */}
                <div className="text-right text-foreground hidden lg:block xl:block">
                    <p className="text-sm text-muted-foreground">{getGreeting()}</p>
                    <p className="font-semibold text-lg xl:text-xl">{user.name}</p>
                    <p className="text-xs xl:text-sm text-muted-foreground">{user.detail?.jabatan?.nama || 'Staff'}</p>
                </div>

                <div className="h-8 md:h-12 w-px bg-border hidden md:block"></div>

                {/* Profile - Mobile: Link to profile page */}
                <div className="md:hidden">
                    <Link href={route('profile.edit')}>
                        <Button variant="ghost" className="relative text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl h-10 gap-2 px-2">
                            <Avatar className="h-8 w-8 border-2 border-border">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-background text-foreground font-semibold text-xs">
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </Link>
                </div>

                {/* Profile - Desktop: Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="hidden md:flex">
                        <Button variant="ghost" className="relative text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl h-10 md:h-12 lg:h-14 gap-2 md:gap-3 px-2 md:px-4 lg:px-6">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 border-2 border-border">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-background text-foreground font-semibold text-xs md:text-sm lg:text-base">
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="text-left hidden md:block">
                                <p className="text-sm lg:text-base font-medium">{user.name.split(' ')[0]}</p>
                                <p className="text-xs lg:text-sm text-muted-foreground capitalize">{user.role || 'User'}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 hidden md:block" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 md:w-96 bg-popover border-border text-popover-foreground p-0" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-red-600 text-white font-bold">
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-bold leading-none truncate text-foreground">{user.name}</p>
                                    <p className="text-sm leading-none text-muted-foreground mt-1 truncate">
                                        NIP: {user.nip_nik || '-'}
                                    </p>
                                    <p className="text-sm leading-none text-muted-foreground mt-1 truncate">
                                        NIK: {user.detail?.nik || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-accent/50 rounded-lg p-4 space-y-3 border border-border">
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Email:</p>
                                    <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Jabatan:</p>
                                    <p className="text-sm font-semibold text-foreground truncate">{user.detail?.jabatan?.nama || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Unit Kerja:</p>
                                    <p className="text-sm font-semibold text-foreground truncate">{user.detail?.unit_kerja?.nama || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-0.5">Role:</p>
                                    <p className="text-sm font-semibold text-foreground capitalize">{user.role || 'User'}</p>
                                </div>
                            </div>
                        </DropdownMenuLabel>

                        <div className="p-2 space-y-1">
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-accent focus:text-accent-foreground">
                                <Link href={route('profile.edit')} className="w-full flex items-center py-2">
                                    <UserCog className="mr-2 h-4 w-4" />
                                    <span>Edit Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-border my-1" />

                            <DropdownMenuItem asChild className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                <Link href={route('logout')} method="post" as="button" className="w-full flex items-center py-2">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Keluar dari Sistem</span>
                                </Link>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
