import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    letterId: number;
}

interface User {
    id: number;
    name: string;
    jabatan: string;
}

export default function DispositionModal({ isOpen, onClose, letterId }: Props) {
    const [recipients, setRecipients] = useState<User[]>([]);

    const { data, setData, post, processing, reset, errors } = useForm({
        recipient_id: '',
        instruction: '',
        note: '',
        due_date: '',
    });

    useEffect(() => {
        if (isOpen) {
            axios.get(route('dispositions.recipients'))
                .then(response => setRecipients(response.data))
                .catch(error => console.error("Failed to fetch recipients", error));
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dispositions.store', letterId), {
            onSuccess: () => {
                toast.success('Disposition sent successfully');
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Failed to send disposition');
            }
        });
    };

    const instructions = [
        "Tindak Lanjuti",
        "Untuk Diketahui",
        "Selesaikan",
        "Arsipkan",
        "Siapkan Jawaban",
        "Wakili Saya",
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Disposisi Surat</DialogTitle>
                    <DialogDescription>
                        Teruskan surat ini kepada staff dengan instruksi spesifik.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="recipient">Penerima</Label>
                        <Select
                            value={data.recipient_id}
                            onValueChange={(val) => setData('recipient_id', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Penerima" />
                            </SelectTrigger>
                            <SelectContent>
                                {recipients.map(user => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                        {user.name} - {user.jabatan}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.recipient_id && <p className="text-sm text-destructive">{errors.recipient_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instruction">Instruksi</Label>
                        <Select
                            value={data.instruction}
                            onValueChange={(val) => setData('instruction', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Instruksi" />
                            </SelectTrigger>
                            <SelectContent>
                                {instructions.map(inst => (
                                    <SelectItem key={inst} value={inst}>
                                        {inst}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.instruction && <p className="text-sm text-destructive">{errors.instruction}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due_date">Batas Waktu (Opsional)</Label>
                        <Input
                            type="date"
                            id="due_date"
                            value={data.due_date}
                            onChange={(e) => setData('due_date', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Catatan Tambahan (Opsional)</Label>
                        <Textarea
                            id="note"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="Tambahkan catatan..."
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Mengirim...' : 'Kirim Disposisi'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
