import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface Disposition {
    id: number;
    sender: { name: string };
    recipient: { name: string };
    instruction: string;
    note: string | null;
    due_date: string | null;
    status: string;
    created_at: string;
}

interface Props {
    dispositions: Disposition[];
}

export default function DispositionList({ dispositions }: Props) {
    if (dispositions.length === 0) return null;

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-lg">Riwayat Disposisi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {dispositions.map((disp) => (
                        <div key={disp.id} className="flex flex-col space-y-2 border-b pb-4 last:border-0 last:pb-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sm">
                                        {disp.sender.name} <span className="text-muted-foreground font-normal">kepada</span> {disp.recipient.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(disp.created_at), 'dd MMM yyyy HH:mm')}
                                    </p>
                                </div>
                                <Badge variant={disp.status === 'completed' ? 'default' : 'secondary'}>
                                    {disp.status}
                                </Badge>
                            </div>
                            <div className="bg-muted/30 p-3 rounded-md text-sm space-y-1">
                                <p><span className="font-semibold">Instruksi:</span> {disp.instruction}</p>
                                {disp.note && <p><span className="font-semibold">Catatan:</span> {disp.note}</p>}
                                {disp.due_date && <p><span className="font-semibold">Batas Waktu:</span> {format(new Date(disp.due_date), 'dd MMM yyyy')}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
