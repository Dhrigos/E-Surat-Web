import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Download, Monitor, Smartphone } from "lucide-react";

interface ActivityLog {
    id: number;
    action: string;
    description: string;
    created_at: string;
    ip_address: string;
    user_agent?: string;
}

interface ActivityTimelineProps {
    logs: ActivityLog[];
}

export default function ActivityTimeline({ logs }: ActivityTimelineProps) {
    const handleDownload = () => {
        window.location.href = route('profile.download-activity');
    };

    return (
        <Card className="border-0 shadow-sm ring-1 ring-border/40">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-xl shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600">
                        <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-base">Aktifitas Akun</CardTitle>
                        <CardDescription>Riwayat aktifitas login dan perubahan pada akun Anda.</CardDescription>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                    <Download className="w-4 h-4" />
                    Download Riwayat
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[500px] p-6">
                    {logs.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                            Tidak ada aktifitas tercatat.
                        </div>
                    ) : (
                        <div className="relative pl-6 border-l border-border space-y-8">
                            {logs.map((log) => (
                                <div key={log.id} className="relative">
                                    {/* Dot Indicator */}
                                    <span className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background bg-blue-500 ring-4 ring-muted" />

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-foreground">{log.action}</p>
                                            <span className="text-xs text-muted-foreground">{log.created_at}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{log.description}</p>

                                        {log.ip_address && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground w-fit">
                                                    <Monitor className="w-3 h-3" />
                                                    IP Address: {log.ip_address}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
