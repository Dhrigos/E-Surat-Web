import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose
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
import { Badge } from '@/components/ui/badge';
import { Send, X, FileText, User, Calendar, AlertCircle, Users, MapPin, Building2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mail: any;
}

interface User {
    id: number;
    name: string;
    jabatan: string;
}

export default function DispositionModal({ isOpen, onClose, mail }: Props) {
    const [recipients, setRecipients] = useState<User[]>([]);
    const [inputType, setInputType] = useState<'personal' | 'wilayah' | 'unit' | 'mako'>('personal');
    const [provinces, setProvinces] = useState<any[]>([]);
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');

    const { data, setData, post, processing, reset, errors } = useForm({
        recipient_id: '',
        disposition_type: 'personal',
        instruction: '',
        priority: 'normal',
        note: '',
        due_date: '',
        province_id: '', // For Mako cascading
    });

    useEffect(() => {
        if (isOpen) {
            handleTypeChange(inputType);
        }
    }, [isOpen]);

    const handleTypeChange = (type: 'personal' | 'wilayah' | 'unit' | 'mako') => {
        setInputType(type);
        setData(prev => ({ ...prev, disposition_type: type, recipient_id: '', province_id: '' }));
        setRecipients([]);
        if (type === 'mako') {
            // Fetch Provinces first for Mako
            fetchProvinces();
        } else {
            fetchRecipients(type);
        }
    }

    const fetchProvinces = () => {
        axios.get(route('dispositions.recipients'), { params: { type: 'province' } })
            .then(response => setProvinces(response.data))
            .catch(error => console.error("Failed to fetch provinces", error));
    }

    const handleProvinceChange = (provIds: string) => {
        setSelectedProvinceId(provIds);
        setData('province_id', provIds);
        // Fetch Makos for this province
        axios.get(route('dispositions.recipients'), { params: { type: 'mako', province_code: provIds } })
            .then(response => setRecipients(response.data))
            .catch(error => console.error("Failed to fetch makos", error));
    }

    const fetchRecipients = (type: string) => {
        axios.get(route('dispositions.recipients'), { params: { type } })
            .then(response => {
                setRecipients(response.data);
            })
            .catch(error => console.error("Failed to fetch recipients", error));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dispositions.store', mail.id), {
            onSuccess: () => {
                toast.success('Disposisi berhasil dikirim');
                reset();
                onClose();
            },
            onError: () => {
                toast.error('Gagal mengirim disposisi');
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

    if (!mail) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full sm:max-w-xl bg-[#1e1e1e] border-zinc-800 text-zinc-100 p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between shrink-0 space-y-0">
                    <div className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-red-500" />
                        <DialogTitle className="text-lg font-bold">Disposisi Surat</DialogTitle>
                    </div>
                    <DialogClose className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 transition-colors">
                        <X className="h-5 w-5" />
                    </DialogClose>
                </DialogHeader>

                <div className="p-4 border-b border-zinc-800 bg-[#262626]/50">
                    <p className="text-sm text-zinc-400 mb-4">Teruskan surat ini ke pihak lain untuk ditindaklanjuti</p>

                    <div className="bg-[#262626] border border-zinc-800 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-zinc-400" />
                            <h4 className="text-sm font-semibold text-zinc-200">Informasi Surat</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-zinc-500 font-medium mb-1">Nomor Surat</p>
                                <p className="text-sm font-semibold text-zinc-200 truncate">{mail.code || mail.letter_number || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium mb-1">Jenis Surat</p>
                                <p className="text-sm font-semibold text-zinc-200 truncate">{mail.category || mail.letter_type || '-'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium mb-1">Pengirim</p>
                                <p className="text-sm font-semibold text-zinc-200 truncate">
                                    {typeof mail.sender === 'object' ? mail.sender?.name : (mail.sender || '-')}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500 font-medium mb-1">Tanggal</p>
                                <p className="text-sm font-semibold text-zinc-200 truncate">
                                    {mail.date ? new Date(mail.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-3">
                        <Label className="text-zinc-300 flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Tujuan Disposisi <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex gap-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="disposition_type"
                                        value="personal"
                                        checked={inputType === 'personal'}
                                        onChange={() => handleTypeChange('personal')}
                                        className="peer appearance-none h-4 w-4 border border-zinc-600 rounded-full checked:border-red-500 checked:bg-red-500 transition-all"
                                    />
                                    <div className="absolute h-2 w-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">Personal</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="disposition_type"
                                        value="wilayah"
                                        checked={inputType === 'wilayah'}
                                        onChange={() => handleTypeChange('wilayah')}
                                        className="peer appearance-none h-4 w-4 border border-zinc-600 rounded-full checked:border-red-500 checked:bg-red-500 transition-all"
                                    />
                                    <div className="absolute h-2 w-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">Wilayah</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="disposition_type"
                                        value="unit"
                                        checked={inputType === 'unit'}
                                        onChange={() => handleTypeChange('unit')}
                                        className="peer appearance-none h-4 w-4 border border-zinc-600 rounded-full checked:border-red-500 checked:bg-red-500 transition-all"
                                    />
                                    <div className="absolute h-2 w-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">Unit</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="radio"
                                        name="disposition_type"
                                        value="mako"
                                        checked={inputType === 'mako'}
                                        onChange={() => handleTypeChange('mako')}
                                        className="peer appearance-none h-4 w-4 border border-zinc-600 rounded-full checked:border-red-500 checked:bg-red-500 transition-all"
                                    />
                                    <div className="absolute h-2 w-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                                <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">Mako</span>
                            </label>
                        </div>
                    </div>

                    {inputType === 'mako' && (
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Pilih Provinsi</Label>
                            <Select onValueChange={handleProvinceChange} value={selectedProvinceId}>
                                <SelectTrigger className="bg-[#262626] border-zinc-700 text-zinc-100">
                                    <SelectValue placeholder="Pilih Provinsi" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#262626] border-zinc-700 text-zinc-100">
                                    {provinces.map(prov => (
                                        <SelectItem key={prov.id} value={prov.id.toString()}>
                                            {prov.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="recipient" className="text-zinc-300 flex items-center gap-1">
                            {inputType === 'personal' ? <User className="h-4 w-4" /> : inputType === 'wilayah' ? <MapPin className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                            {inputType === 'mako' ? 'Pilih Mako' : 'Disposisi Kepada'} <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={data.recipient_id}
                            onValueChange={(val) => setData('recipient_id', val)}
                            disabled={inputType === 'mako' && !selectedProvinceId}
                        >
                            <SelectTrigger className="bg-[#262626] border-zinc-700 text-zinc-100 focus:ring-red-500/50">
                                <SelectValue placeholder={inputType === 'mako' ? (selectedProvinceId ? "Pilih Mako" : "Pilih Provinsi Terlebih Dahulu") : "Pilih Penerima / Unit"} />
                            </SelectTrigger>
                            <SelectContent className="bg-[#262626] border-zinc-700 text-zinc-100">
                                {recipients.map(item => (
                                    <SelectItem key={item.id} value={item.id.toString()} className="focus:bg-red-500/10 focus:text-red-500">
                                        {item.name} {item.jabatan ? `- ${item.jabatan}` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.recipient_id && <p className="text-xs text-red-500">{errors.recipient_id}</p>}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-zinc-300 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            Prioritas
                        </Label>
                        <div className="flex gap-3">
                            <div
                                onClick={() => setData('priority', 'urgent')}
                                className={`flex-1 cursor-pointer rounded-lg border p-3 flex items-center justify-center gap-2 transition-all ${data.priority === 'urgent' ? 'bg-[#AC0021]/20 border-[#AC0021] text-[#AC0021]' : 'bg-[#262626] border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                            >
                                <div className={`w-3 h-3 rounded-full ${data.priority === 'urgent' ? 'bg-[#AC0021]' : 'bg-[#AC0021]/30'}`} />
                                <span className="text-sm font-medium">Urgent</span>
                            </div>
                            <div
                                onClick={() => setData('priority', 'normal')}
                                className={`flex-1 cursor-pointer rounded-lg border p-3 flex items-center justify-center gap-2 transition-all ${data.priority === 'normal' ? 'bg-[#007EE7]/20 border-[#007EE7] text-[#007EE7]' : 'bg-[#262626] border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                            >
                                <div className={`w-3 h-3 rounded-full ${data.priority === 'normal' ? 'bg-[#007EE7]' : 'bg-[#007EE7]/30'}`} />
                                <span className="text-sm font-medium">Normal</span>
                            </div>
                            <div
                                onClick={() => setData('priority', 'low')}
                                className={`flex-1 cursor-pointer rounded-lg border p-3 flex items-center justify-center gap-2 transition-all ${data.priority === 'low' ? 'bg-[#659800]/20 border-[#659800] text-[#659800]' : 'bg-[#262626] border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
                            >
                                <div className={`w-3 h-3 rounded-full ${data.priority === 'low' ? 'bg-[#659800]' : 'bg-[#659800]/30'}`} />
                                <span className="text-sm font-medium">Rendah</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instruction" className="text-zinc-300">Instruksi Disposisi <span className="text-red-500">*</span></Label>
                        <Select
                            value={data.instruction}
                            onValueChange={(val) => setData('instruction', val)}
                        >
                            <SelectTrigger className="bg-[#262626] border-zinc-700 text-zinc-100 focus:ring-red-500/50">
                                <SelectValue placeholder="Pilih instruksi" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#262626] border-zinc-700 text-zinc-100">
                                {instructions.map(inst => (
                                    <SelectItem key={inst} value={inst} className="focus:bg-red-500/10 focus:text-red-500">
                                        {inst}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.instruction && <p className="text-xs text-red-500">{errors.instruction}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note" className="text-zinc-300">Catatan Disposisi</Label>
                        <Textarea
                            id="note"
                            value={data.note}
                            onChange={(e) => setData('note', e.target.value)}
                            placeholder="Tambahkan catatan atau instruksi khusus..."
                            className="bg-[#262626] border-zinc-700 text-zinc-100 min-h-[100px] focus:ring-red-500/50 focus:border-red-500/50"
                        />
                    </div>
                </form>

                <div className="p-4 border-t border-zinc-800 bg-[#1e1e1e] flex justify-between items-center text-xs text-zinc-500">
                    <span>Catatan ini akan dilihat oleh penerima disposisi</span>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-[#AC0021] hover:bg-[#8f2c00] text-white gap-2"
                        >
                            <Send className="h-4 w-4" />
                            {processing ? 'Mengirim...' : 'Kirim Disposisi'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
