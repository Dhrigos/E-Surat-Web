import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface StaffDetailModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: {
        name: string;
        email: string;
        role: string;
        unit: string;
        jabatan: string;
        pangkat: string;
        nip: string;
        nik: string;
        join_date: string;
        status: string;
        profile_photo_url?: string;
    } | null;
}

export default function StaffDetailModal({ open, onOpenChange, staff }: StaffDetailModalProps) {
    if (!staff) return null;

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'super-admin': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'user': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle>Detail Staff</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-zinc-800">
                            {staff.profile_photo_url ? (
                                <AvatarImage src={staff.profile_photo_url} alt={staff.name} />
                            ) : (
                                <AvatarFallback className="text-xl bg-zinc-800">
                                    {staff.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            )}
                        </Avatar>
                        <div>
                            <h3 className="font-bold text-lg">{staff.name}</h3>
                            <p className="text-zinc-400 text-sm">{staff.email}</p>
                            <Badge className={getRoleColor(staff.role) + " mt-2 border-0"}>{staff.role}</Badge>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm border-t border-zinc-800 pt-4">
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-zinc-500">Unit</span>
                            <span className="col-span-2 font-medium text-zinc-200">{staff.unit}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <span className="text-zinc-500">Jabatan</span>
                            <span className="col-span-2 font-medium text-zinc-200">{staff.jabatan}</span>
                        </div>


                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
