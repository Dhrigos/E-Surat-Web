import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Download, Monitor, Smartphone } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ActivityLog {
    id: number;
    action: string;
    description: string;
    created_at: string;
    ip_address: string;
    user_agent?: string;
    properties?: any;
}

interface ActivityTimelineProps {
    logs: ActivityLog[];
    className?: string; // Added className prop
}

// Placeholder for formatActivityDescription if not provided elsewhere
const formatActivityDescription = (description: string) => {
    // Implement your formatting logic here, or just return the description
    return description;
};

export default function ActivityTimeline({ logs, className }: ActivityTimelineProps) {
    const handleDownload = () => {
        window.location.href = route('profile.download-activity');
    };

    // Sort logs by created_at in descending order
    const sortedLogs = useMemo(() => {
        return [...logs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [logs]);

    return (
        <Card className={cn("border-0 shadow-[0_0_20px_rgba(0,0,0,0.3)] bg-white dark:bg-[#262626] text-zinc-900 dark:text-white rounded-t-xl rounded-b-xl", className)}>
            <CardHeader className="bg-transparent pb-6 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl shadow-sm bg-blue-500/10 border border-blue-500/20">
                        <Activity className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">Riwayat Aktifitas</CardTitle>
                        <CardDescription className="text-zinc-400">Memantau aktifitas login dan tindakan lainnya di akun Anda.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[500px] w-full p-6">
                    <div className="relative border-l border-zinc-800 ml-3 space-y-8">
                        {sortedLogs.map((log, index) => {
                            const date = new Date(log.created_at);
                            const isToday = new Date().toDateString() === date.toDateString();

                            return (
                                <div key={log.id || index} className="mb-8 ml-6 relative group">
                                    <span className={cn(
                                        "absolute flex items-center justify-center w-6 h-6 rounded-full -left-[37px] ring-4 ring-white dark:ring-[#262626]",
                                        isToday ? "bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                                    )}>
                                        <div className={cn("w-2 h-2 rounded-full", isToday ? "bg-blue-500" : "bg-zinc-500")} />
                                    </span>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={cn(
                                                "text-xs font-semibold px-2 py-0.5 rounded-full border",
                                                isToday
                                                    ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/30"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700"
                                            )}>
                                                {format(date, 'HH:mm')}
                                            </span>
                                            <time className="text-xs text-zinc-500">
                                                {format(date, 'EEEE, d MMMM yyyy', { locale: id })}
                                            </time>
                                        </div>

                                        <h4 className="text-base font-medium text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {formatActivityDescription(log.description)}
                                        </h4>

                                        {/* Properties info if available */}
                                        {log.properties && Object.keys(log.properties).length > 0 && (
                                            <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-500 bg-zinc-50 dark:bg-[#1f1f22] p-2 rounded border border-zinc-200 dark:border-zinc-800 font-mono overflow-x-auto">
                                                {JSON.stringify(log.properties).slice(0, 100)}
                                                {JSON.stringify(log.properties).length > 100 && '...'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {sortedLogs.length === 0 && (
                            <div className="ml-6 text-zinc-500 italic">Belum ada aktifitas yang tercatat.</div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
