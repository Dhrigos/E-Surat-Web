import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';

interface Notification {
    id: string;
    data: {
        subject: string;
        message: string;
    };
    created_at: string;
    read_at: string | null;
}

interface PaginatedNotifications {
    data: Notification[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    notifications: PaginatedNotifications;
}

export default function Index({ notifications }: Props) {
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

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={[
            { title: 'Notifikasi', href: '/notifications' },
        ]}>
            <Head title="Notifikasi" />
            <div className="p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">Notifikasi</h2>
                        <p className="text-muted-foreground">Semua notifikasi Anda</p>
                    </div>
                    {notifications.total > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearAllNotifications}
                            className="text-xs h-9"
                        >
                            Tandai Semua Dibaca
                        </Button>
                    )}
                </div>

                <div className="space-y-2">
                    {notifications.data.length === 0 ? (
                        <div className="text-center py-12 bg-card dark:bg-[#18181b] rounded-xl border border-border dark:border-zinc-800">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">Tidak ada notifikasi</h3>
                            <p className="text-muted-foreground">Notifikasi baru akan muncul di sini</p>
                        </div>
                    ) : (
                        <>
                            {notifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${!notification.read_at ? 'bg-accent/20' : 'bg-card'}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate text-foreground">{notification.data.subject}</p>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{notification.data.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{new Date(notification.created_at).toLocaleString()}</p>
                                        </div>
                                        {!notification.read_at && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Pagination */}
                            {notifications.last_page > 1 && (
                                <div className="flex items-center justify-center gap-1 mt-6">
                                    {notifications.links.map((link, i) => {
                                        let content;
                                        if (link.label.includes('Previous') || link.label.includes('&laquo;')) {
                                            content = <ChevronLeft className="h-4 w-4" />;
                                        } else if (link.label.includes('Next') || link.label.includes('&raquo;')) {
                                            content = <ChevronRight className="h-4 w-4" />;
                                        } else {
                                            content = <span dangerouslySetInnerHTML={{ __html: link.label }} />;
                                        }

                                        return (
                                            <Button
                                                key={i}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                className={`h-8 min-w-8 px-2 ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => handlePageChange(link.url)}
                                                disabled={!link.url}
                                            >
                                                {content}
                                            </Button>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}
