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
import { Bell, ChevronDown, LogOut, Menu, UserCog, Trash2, Mail, MessageSquare, UserCheck, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';


interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    showSidebarTrigger?: boolean;
}

export function AppHeader({ breadcrumbs = [], showSidebarTrigger = true }: AppHeaderProps) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;
    const notifications = auth.notifications || [];

    const [localNotifications, setLocalNotifications] = useState(notifications);
    const [activeTab, setActiveTab] = useState<'surat' | 'pesan'>('surat');

    useEffect(() => {
        setLocalNotifications(notifications);
    }, [notifications]);

    // Listener for when conversation is opened in ChatDrawer
    useEffect(() => {
        const handleConversationOpened = (event: CustomEvent) => {
            const { conversationId } = event.detail;
            setLocalNotifications(prev => prev.map((n: any) => {
                // Check if notification belongs to this conversation
                // Handle both structure formats (broadcast vs database) just in case
                const nConvId = n.data?.conversation_id || n.conversation_id;

                if (nConvId && parseInt(nConvId) === parseInt(conversationId) && (!n.read_at)) {
                    return { ...n, read_at: new Date().toISOString() };
                }
                return n;
            }));
        };

        window.addEventListener('conversation-opened' as any, handleConversationOpened as any);
        return () => {
            window.removeEventListener('conversation-opened' as any, handleConversationOpened as any);
        };
    }, []);

    useEffect(() => {
        if (user?.id) {
            // @ts-ignore
            const channel = window.Echo.private(`App.Models.User.${user.id}`);

            channel.notification((notification: any) => {
                setLocalNotifications((prev: any[]) => {
                    // Normalize broadcast notification to match database structure
                    // Broadcast notifications have data at root, database has it in 'data' property
                    const normalizedNotification = {
                        id: notification.id,
                        type: notification.type,
                        // Wrap the flat broadcast data into 'data' object if it's missing
                        data: notification.data || notification,
                        created_at: notification.created_at || new Date().toISOString(),
                        read_at: null,
                        created_at_human: 'Baru saja'
                    };

                    // Check if already exists to prevent duplicates (though typically new ID)
                    if (prev.find(n => n.id === notification.id)) return prev;
                    return [normalizedNotification, ...prev];
                });
            });

            return () => {
                channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
            };
        }
    }, [user?.id]);

    const localUnreadCount = localNotifications.filter((n: any) => !n.read_at).length;

    const markAsRead = (id: string, onSuccess?: () => void) => {
        if (!id) return;

        // Optimistic Update
        setLocalNotifications((prev: any[]) => prev.map((n: any) =>
            n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        ));

        router.post(route('notifications.read', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                if (onSuccess) onSuccess();
            }
        });
    };

    const clearAllNotifications = () => {
        // Optimistic Update
        setLocalNotifications((prev: any[]) => prev.map((n: any) => ({ ...n, read_at: new Date().toISOString() })));

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

    const formatTimeAgo = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Baru saja';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
        if (diffInSeconds < 172800) return 'Kemarin';

        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        }).format(date);
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
                    <div className="hidden md:block">
                        <img src="/images/BADAN-CADANGAN-NASIONAL.png" alt="BCN Logo" className="h-10 w-10 md:h-14 md:w-14 object-contain" />
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


                {/* Messages - Mobile */}
                <div className="md:hidden">
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-10 w-10 md:h-12 md:w-12 text-foreground hover:bg-accent hover:text-[#AC0021]"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-chat-drawer'))}
                        >
                            <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
                        </Button>
                    </div>
                </div>
                {/* Messages - Desktop */}

                {/* <div className="hidden md:block">
                    <div className="hidden md:block">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-10 w-10 md:h-12 md:w-12 text-foreground hover:bg-accent hover:text-[#AC0021]"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-chat-drawer'))}
                        >
                            <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />
                        </Button>
                    </div>
                </div> */}

                {/* Notifications */}
                <div className="md:hidden">
                    <Link href={route('notifications.index')}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-10 w-10 md:h-12 md:w-12 text-foreground hover:bg-accent hover:text-[#AC0021]"
                        >
                            <Bell className="h-5 w-5 md:h-6 md:w-6" />
                            {localUnreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 bg-[#AC0021] text-white text-xs">
                                    {localUnreadCount > 9 ? '9+' : localUnreadCount}
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
                            className="relative h-10 w-10 md:h-12 md:w-12 text-foreground hover:bg-accent hover:text-[#AC0021]"
                        >
                            <Bell className="h-5 w-5 md:h-6 md:w-6" />
                            {localUnreadCount > 0 && (
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 bg-[#AC0021] text-white text-xs">
                                    {localUnreadCount > 9 ? '9+' : localUnreadCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 w-80 md:w-96 lg:w-[420px] bg-[#262626] border-neutral-800 text-neutral-200" align="end">
                        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                            <h3 className="font-semibold text-white">Notifikasi</h3>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={clearAllNotifications}
                                    className="text-xs text-neutral-400 hover:text-white transition-colors"
                                >
                                    Tandai Dibaca
                                </button>
                                {localNotifications.length > 0 && (
                                    <button
                                        onClick={() => {
                                            setLocalNotifications([]);
                                            router.delete(route('notifications.delete-all'), { preserveScroll: true });
                                        }}
                                        className="text-neutral-400 hover:text-red-500 transition-colors"
                                        title="Hapus Semua"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>



                        {/* Category Tabs */}
                        <div className="p-4 border-b border-neutral-800 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setActiveTab('surat')}
                                className={`flex flex-col items-center justify-center gap-2 h-[84px] w-full p-2 rounded-2xl border transition-all duration-200 ${activeTab === 'surat'
                                    ? 'bg-[#d04438]/10 border-[#d04438]/20 shadow-[0_0_15px_-3px_rgba(208,68,56,0.1)]'
                                    : 'bg-neutral-800/40 border-transparent hover:bg-neutral-800 hover:border-neutral-700'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${activeTab === 'surat' ? 'text-[#d04438]' : 'text-neutral-400'}`}>
                                    <Mail className="h-6 w-6" />
                                </div>
                                <span className={`text-xs font-medium ${activeTab === 'surat' ? 'text-[#d04438]' : 'text-neutral-400'}`}>Surat</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('pesan')}
                                className={`flex flex-col items-center justify-center gap-2 h-[84px] w-full p-2 rounded-2xl border transition-all duration-200 ${activeTab === 'pesan'
                                    ? 'bg-[#659800]/10 border-[#659800]/20 shadow-[0_0_15px_-3px_rgba(101,152,0,0.1)]'
                                    : 'bg-neutral-800/40 border-transparent hover:bg-neutral-800 hover:border-neutral-700'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${activeTab === 'pesan' ? 'text-[#659800]' : 'text-neutral-400'}`}>
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <span className={`text-xs font-medium ${activeTab === 'pesan' ? 'text-[#659800]' : 'text-neutral-400'}`}>Pesan</span>
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[400px]">
                            {localNotifications.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500 text-sm">
                                    Tidak ada notifikasi
                                </div>
                            ) : (
                                localNotifications
                                    .filter((n: any) => {
                                        const isMessage = n.data?.type === 'message' || n.type === 'message';
                                        if (activeTab === 'pesan') return isMessage;
                                        // Default or 'surat' -> show non-messages
                                        return !isMessage;
                                    })
                                    .map((notification: any) => {
                                        // Determine icon and color based on content
                                        let Icon = Bell;
                                        let iconColor = "text-[#007ee7]";
                                        let dotColor = "bg-[#007ee7]";
                                        const subject = notification.data?.subject || "";
                                        const message = notification.data?.message || "";

                                        if (subject.toLowerCase().includes('verifikasi') || message.toLowerCase().includes('verifikasi')) {
                                            Icon = UserCheck;
                                            iconColor = "text-[#007ee7]";
                                            dotColor = "bg-[#007ee7]";
                                        } else if (subject.toLowerCase().includes('surat') || message.toLowerCase().includes('surat')) {
                                            Icon = Mail;
                                            iconColor = "text-[#d04438]";
                                            dotColor = "bg-[#d04438]";
                                        } else if (subject.toLowerCase().includes('persetujuan') || message.toLowerCase().includes('persetujuan')) {
                                            Icon = Clock;
                                            iconColor = "text-[#007ee7]";
                                            dotColor = "bg-[#007ee7]";
                                        } else if (notification.data?.type === 'message' || notification.type === 'message') {
                                            Icon = MessageSquare;
                                            iconColor = "text-[#659800]";
                                            dotColor = "bg-[#659800]";
                                        }

                                        return (
                                            <div
                                                key={notification.id}
                                                className={`p-4 border-b border-neutral-800 hover:bg-white/5 transition-colors cursor-pointer group flex gap-4 ${!notification.read_at ? 'bg-white/[0.02]' : ''}`}
                                                onClick={() => {
                                                    const isMessage = notification.data?.type === 'message' || notification.type === 'message';

                                                    const handleAction = () => {
                                                        if (isMessage) {
                                                            // For messages, open the chat drawer instead of navigating
                                                            const conversationId = notification.data?.conversation_id || notification.conversation_id;
                                                            window.dispatchEvent(new CustomEvent('open-chat-conversation', {
                                                                detail: { conversationId }
                                                            }));
                                                        } else {
                                                            // For other notifications, navigate to URL
                                                            const targetUrl = notification.data?.url
                                                                ? notification.data.url
                                                                : route('notifications.index');
                                                            router.visit(targetUrl);
                                                        }
                                                    };

                                                    if (!notification.read_at) {
                                                        markAsRead(notification.id, handleAction);
                                                    } else {
                                                        handleAction();
                                                    }
                                                }}
                                            >
                                                <div className="mt-1 flex-shrink-0">
                                                    <Icon className={`h-5 w-5 ${iconColor}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {notification.data?.type === 'message' ? notification.data?.sender_name : notification.data?.subject}
                                                    </p>
                                                    <p className="text-sm text-neutral-400 line-clamp-2 mt-0.5">
                                                        {notification.data?.type === 'message' ? notification.data?.body : notification.data?.message}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 mt-2">
                                                        {notification.created_at_human || formatTimeAgo(notification.created_at)}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex-shrink-0">
                                                    {!notification.read_at && (
                                                        <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {/* User greeting - enhanced for desktop */}

                <div className="h-6 md:h-8 w-px bg-[#FEFCF8] hidden md:block"></div>

                {/* Profile - Mobile: Link to profile page */}
                <div className="md:hidden">
                    <Link href={route('profile.edit')}>
                        <Button variant="ghost" className="group relative text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl h-10 gap-2 ">
                            <Avatar className="h-8 w-8 border-2 border-border">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-transparent text-foreground group-hover:text-[#AC0021] font-semibold text-xs transition-colors duration-200">
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </Link>
                </div>

                {/* Profile - Desktop: Dropdown Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="hidden md:flex">
                        <Button variant="outline" className="group relative text-foreground hover:bg-accent hover:text-accent-foreground rounded-xl h-10 md:h-12 lg:h-14 gap-2 md:gap-3 px-2 md:px-4 lg:px-6 ">
                            <Avatar className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 border-2 border-border">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-transparent text-foreground group-hover:text-[#AC0021] font-semibold text-xs md:text-sm lg:text-base transition-colors duration-200">
                                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>

                            <ChevronDown className="h-4 w-4 hidden md:block group-hover:text-[#AC0021] transition-colors duration-200" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 md:w-96 bg-[#262626] border-neutral-800 text-white p-0 shadow-xl" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal p-5">
                            <div className="flex items-center gap-4 mb-5">
                                <Avatar className="h-14 w-14 border-2 border-[#AC0021]">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="bg-red-600 text-white font-bold text-lg">
                                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                    <p className="text-lg font-bold leading-none truncate text-white">{user.name}</p>
                                    <p className="text-sm leading-none text-neutral-400 mt-1.5 truncate">
                                        {user.detail?.nia_nrp ? `NRP: ${user.detail.nia_nrp}` : `NIP: ${user.nip_nik || '-'}`}
                                    </p>
                                    <p className="text-sm leading-none text-neutral-400 mt-1 truncate">
                                        NIK: {user.detail?.nik || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-neutral-900/50 rounded-xl p-4 space-y-3 border border-neutral-800">
                                <div>
                                    <p className="text-xs text-neutral-500 mb-0.5 uppercase tracking-wider font-medium">Email:</p>
                                    <p className="text-sm font-medium text-neutral-200 truncate">{user.email}</p>
                                </div>
                                <div className="h-px bg-neutral-800/50"></div>
                                <div>
                                    <p className="text-xs text-neutral-500 mb-0.5 uppercase tracking-wider font-medium">Jabatan:</p>
                                    <p className="text-sm font-medium text-neutral-200 truncate">{user.detail?.jabatan_role?.nama || '-'}</p>
                                </div>
                                <div className="h-px bg-neutral-800/50"></div>
                                <div>
                                    <p className="text-xs text-neutral-500 mb-0.5 uppercase tracking-wider font-medium">Unit Kerja:</p>
                                    <p className="text-sm font-medium text-neutral-200 truncate">{user.detail?.jabatan?.nama || '-'}</p>
                                </div>

                            </div>
                        </DropdownMenuLabel>

                        <div className="p-2 space-y-1 border-t border-neutral-800">
                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-black/40 focus:text-white text-neutral-300 h-11 rounded-lg transition-colors duration-200">
                                <Link href={route('profile.edit')} className="w-full flex items-center px-3">
                                    <UserCog className="mr-3 h-4 w-4 text-neutral-400" />
                                    <span>Edit Profile</span>
                                </Link>
                            </DropdownMenuItem>

                            {/* <DropdownMenuSeparator className="bg-neutral-800 my-1" /> */}

                            <DropdownMenuItem asChild className="text-red-500 focus:text-red-400 focus:bg-red-950/30 cursor-pointer h-11 rounded-lg transition-colors duration-200">
                                <Link href={route('logout')} method="post" as="button" className="w-full flex items-center px-3">
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <span>Keluar dari Sistem</span>
                                </Link>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header >
    );
}
