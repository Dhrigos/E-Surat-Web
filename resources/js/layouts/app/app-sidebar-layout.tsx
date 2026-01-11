import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { useEffect, type PropsWithChildren } from 'react';
import { toast } from 'sonner';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
    ...props
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] } & React.HTMLAttributes<HTMLDivElement>>) {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    useEffect(() => {
        if (user?.id) {
            // @ts-ignore
            window.Echo.private(`App.Models.User.${user.id}`)
                .notification((notification: any) => {
                    if (notification.type === 'message') {
                        // Check if current URL matches the conversation URL to avoid toast if already chatting
                        const currentPath = window.location.pathname;
                        // Determine conversation ID from URL if possible, or just string match
                        // Assuming URL is /messages/{id}
                        const isOnConversation = currentPath === `/messages/${notification.conversation_id}` || currentPath.startsWith(`/messages?conversation_id=${notification.conversation_id}`);

                        if (!isOnConversation) {
                            toast.info(`${notification.sender_name}: ${notification.body}`, {
                                action: {
                                    label: 'Reply',
                                    onClick: () => router.visit(notification.url)
                                }
                            });
                        }
                    } else {
                        // Legacy letter notification
                        toast.info(notification.message, {
                            action: {
                                label: 'View',
                                onClick: () => router.visit(route('letters.show', notification.letter_id))
                            }
                        });
                    }
                });
        }

        return () => {
            if (user?.id) {
                // @ts-ignore
                window.Echo.leave(`App.Models.User.${user.id}`);
            }
        };
    }, [user?.id]);

    return (
        <AppShell variant="sidebar">
            <AppHeader />
            <AppSidebar />
            <AppContent variant="sidebar" {...props} className={`overflow-x-hidden mt-16 md:mt-20 h-[calc(100vh-8rem)] md:h-[calc(100vh-5rem)] pb-16 md:pb-0 overflow-y-auto ${props.className || ''}`}>
                {breadcrumbs.length > 0 && (
                    <div className="px-4 py-4 md:px-6 md:py-6">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                )}
                {children}
            </AppContent>
        </AppShell>
    );
}
