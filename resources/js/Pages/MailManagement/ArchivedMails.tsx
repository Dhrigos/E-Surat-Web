import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    Eye,
    Archive,
    FileText,
    ChevronLeft,
    ChevronRight,
    Star,
    Plus,
    Upload,
    Type,
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    Filter
} from 'lucide-react';
import MailDetail from './MailDetail';

interface PaginationLinks {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: any[];
    links: PaginationLinks[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    archivedMails: PaginatedData;
    filters: {
        search?: string;
        category?: string;
        letter_type?: string;
    };
    letterTypes: { id: number; name: string }[];
}

export default function ArchivedMails({ archivedMails, filters, letterTypes }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedLetterType, setSelectedLetterType] = useState(filters.letter_type || 'all');
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    // Form for External Archive
    const { data, setData, post, processing, errors, reset } = useForm({
        subject: '',
        recipient: '',
        priority: 'normal',
        category: 'external',
        letter_type_id: '',
        description: '', // Used for "Pengirim" in simple upload
        content: '',
        attachment: null as File | null, // Single file for simple upload
        attachments: [] as File[], // Array for detailed form
    });

    const handleExternalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('letters.store-external'), {
            onSuccess: () => {
                reset();
                setShowUploadDialog(false);
            }
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get('/archived-mails', {
                    search: searchTerm,
                    category: selectedCategory,
                    letter_type: selectedLetterType
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleFilterChange = (key: string, value: string) => {
        if (key === 'category') setSelectedCategory(value);
        if (key === 'letter_type') setSelectedLetterType(value);

        router.get('/archived-mails', {
            search: searchTerm,
            category: key === 'category' ? value : selectedCategory,
            letter_type: key === 'letter_type' ? value : selectedLetterType
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true, preserveScroll: true });
        }
    };

    const handleViewDetail = (mail: any) => {
        setSelectedMail(mail);
        setShowDetailDialog(true);
    };

    const Pagination = ({ links }: { links: PaginationLinks[] }) => (
        <div className="flex items-center justify-end gap-1 mt-4">
            {links.map((link, i) => {
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
                        className={`h-8 w-8 p-0 rounded-md transition-all ${link.active
                            ? 'bg-zinc-800 text-white hover:bg-zinc-700'
                            : 'border-zinc-800 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white'
                            } ${!link.url ? 'opacity-50 cursor-not-allowed hidden' : ''}`}
                        onClick={() => handlePageChange(link.url)}
                        disabled={!link.url}
                    >
                        {content}
                    </Button>
                );
            })}
        </div>
    );

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="Arsip Surat" />
            <div className="p-6 w-full space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Arsip Surat</h1>
                        <p className="text-gray-400 text-sm mt-1">Kelola dan cari arsip surat dengan mudah.</p>
                    </div>
                    <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Arsip
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Tambah Arsip Eksternal</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Tambahkan surat manual ke arsip (Upload Gambar/PDF atau Ketik Ulang).
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleExternalSubmit} className="space-y-4 mt-2">
                                <Tabs defaultValue="upload" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 bg-[#2a2a2a]">
                                        <TabsTrigger value="upload" className="gap-2 data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white"><Upload className="w-4 h-4" /> Upload File</TabsTrigger>
                                        <TabsTrigger value="text" className="gap-2 data-[state=active]:bg-[#3a3a3a] data-[state=active]:text-white"><Type className="w-4 h-4" /> Ketik Ulang</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload" className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Perihal / Judul Surat</Label>
                                            <Input
                                                value={data.subject}
                                                onChange={e => setData('subject', e.target.value)}
                                                placeholder="Contoh: Surat Penawaran Kerjasama"
                                                className="bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 focus:ring-red-500"
                                            />
                                            {errors.subject && <p className="text-destructive text-xs">{errors.subject}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Pengirim / Keterangan</Label>
                                            <Input
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                placeholder="Contoh: PT. Maju Jaya"
                                                className="bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 focus:ring-red-500"
                                            />
                                            {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
                                        </div>
                                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors">
                                            <div className="p-4 bg-white/5 rounded-full mb-3">
                                                <Upload className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <Input
                                                    type="file"
                                                    id="file-upload"
                                                    className="hidden"
                                                    onChange={e => setData('attachment', e.target.files?.[0] || null)}
                                                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                />
                                                <Label htmlFor="file-upload" className="block text-sm font-medium text-blue-400 hover:text-blue-300 cursor-pointer">
                                                    Klik untuk upload file
                                                </Label>
                                                <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 10MB)</p>
                                                {data.attachment && (
                                                    <div className="mt-2 text-sm font-medium text-emerald-500 flex items-center justify-center gap-1">
                                                        <FileText className="w-3 h-3" />
                                                        {data.attachment.name}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="text" className="space-y-4 pt-4">
                                        {/* Row 1: Subject */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Perihal Surat <span className="text-red-500">*</span></Label>
                                            <Input
                                                value={data.subject}
                                                onChange={e => setData('subject', e.target.value)}
                                                placeholder="Masukkan perihal surat"
                                                className="bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 focus:ring-red-500"
                                            />
                                            {errors.subject && <p className="text-destructive text-xs">{errors.subject}</p>}
                                        </div>

                                        {/* Row 2: Recipient & Priority */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Penerima <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={data.recipient}
                                                    onChange={e => setData('recipient', e.target.value)}
                                                    placeholder="Ketik nama atau username..."
                                                    className="bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 focus:ring-red-500"
                                                />
                                                {errors.recipient && <p className="text-destructive text-xs">{errors.recipient}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Prioritas</Label>
                                                <Select value={data.priority} onValueChange={val => setData('priority', val)}>
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white">
                                                        <SelectValue placeholder="Pilih Prioritas" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                        <SelectItem value="low">Low</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="high">High</SelectItem>
                                                        <SelectItem value="urgent">Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Row 3: Category & Letter Type */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Kategori</Label>
                                                <Select value={data.category} onValueChange={val => setData('category', val)}>
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white">
                                                        <SelectValue placeholder="Pilih Kategori" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                        <SelectItem value="internal">Internal</SelectItem>
                                                        <SelectItem value="external">External</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-300">Jenis Surat (Opsional)</Label>
                                                <Select onValueChange={val => setData('letter_type_id', val)}>
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white">
                                                        <SelectValue placeholder="Pilih jenis surat (Opsional)" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                        <SelectItem value="placeholder" disabled>Coming Soon</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Row 4: Content */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Isi Surat</Label>
                                            <Textarea
                                                rows={6}
                                                value={data.content}
                                                onChange={e => setData('content', e.target.value)}
                                                placeholder="Tulis isi surat di sini..."
                                                className="resize-y bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 focus:ring-red-500"
                                            />
                                        </div>

                                        {/* Row 5: Attachments (Drag & Drop UI simplified) */}
                                        <div className="space-y-2">
                                            <Label className="text-gray-300">Lampiran (PDF/Word)</Label>
                                            <div className="border-2 border-dashed border-white/10 bg-white/5 rounded-lg p-8 flex flex-col items-center justify-center text-center relative hover:bg-white/10 transition-colors">
                                                <Upload className="h-6 w-6 text-gray-400 mb-2" />
                                                <p className="text-sm font-medium text-gray-300">Drag & drop files atau klik untuk upload</p>
                                                <p className="text-xs text-gray-500 mt-1">Support: PDF, DOC, DOCX (Max 10MB)</p>
                                                <Input
                                                    type="file"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    id="detailed-upload"
                                                    multiple
                                                    onChange={e => {
                                                        if (e.target.files) {
                                                            setData('attachments', Array.from(e.target.files));
                                                        }
                                                    }}
                                                />
                                                {data.attachments && data.attachments.length > 0 && (
                                                    <div className="mt-4 space-y-1 w-full max-w-xs z-10 relative pointer-events-none">
                                                        {data.attachments.map((file, i) => (
                                                            <div key={i} className="text-xs text-emerald-500 flex items-center gap-1 justify-center bg-emerald-500/10 py-1 px-2 rounded">
                                                                <FileText className="w-3 h-3" /> {file.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                                    <Button type="button" variant="ghost" onClick={() => setShowUploadDialog(false)} className="text-gray-400 hover:text-white">Batal</Button>
                                    <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                        {processing ? 'Menyimpan...' : 'Simpan ke Arsip'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Main Card */}
                <div className="bg-[#1a1a1a] rounded-xl border border-white/10 overflow-hidden shadow-2xl">
                    {/* Filters Section */}
                    <div className="p-4 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between bg-white/5 relative z-20 shadow-md">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                                placeholder="Cari berdasarkan nomor surat, perihal,..."
                                className="pl-9 bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 focus:ring-red-500/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <Select value={selectedLetterType} onValueChange={(val) => handleFilterChange('letter_type', val)}>
                                <SelectTrigger className="w-full md:w-40 bg-[#2a2a2a] border-white/10 text-white">
                                    <SelectValue placeholder="Semua Jenis" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectItem value="all">Semua Jenis</SelectItem>
                                    {letterTypes.map(type => (
                                        <SelectItem key={type.id} value={String(type.id)}>{type.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCategory} onValueChange={(val) => handleFilterChange('category', val)}>
                                <SelectTrigger className="w-full md:w-40 bg-[#2a2a2a] border-white/10 text-white">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    <SelectItem value="internal">Internal</SelectItem>
                                    <SelectItem value="external">External</SelectItem>
                                    <SelectItem value="report">Report</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center px-4 py-2 bg-[#2a2a2a] border border-white/10 rounded-md text-sm text-gray-400 whitespace-nowrap">
                                Total: {archivedMails.total}
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto relative z-10">
                        <Table>
                            <TableHeader className="bg-white/5 border-b border-white/10 shadow-sm relative z-10">
                                <TableRow className="border-white/10 hover:bg-white/5">
                                    <TableHead className="w-[180px] text-gray-400 pl-4 md:pl-6 h-12">Nomor Surat</TableHead>
                                    <TableHead className="text-gray-400 h-12">Perihal</TableHead>
                                    <TableHead className="w-[200px] text-gray-400 h-12 hidden md:table-cell">Pengirim</TableHead>
                                    <TableHead className="w-[150px] text-gray-400 h-12 hidden sm:table-cell">Tanggal</TableHead>
                                    <TableHead className="w-[150px] text-gray-400 h-12 hidden lg:table-cell">Jenis/Kategori</TableHead>
                                    <TableHead className="w-[80px] md:w-[100px] text-right text-gray-400 pr-4 md:pr-6 h-12">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {archivedMails.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Archive className="w-8 h-8 opacity-20" />
                                                <p>Tidak ada surat ditemukan</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    archivedMails.data.map((mail) => (
                                        <TableRow key={mail.id} className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                                            <TableCell className="font-medium text-white py-4 pl-4 md:pl-6">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-gray-200 text-sm md:text-base">{mail.code || 'NO-CODE'}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">REF-{mail.id}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-300 py-4 max-w-[150px] md:max-w-none">
                                                <div className="line-clamp-2 md:line-clamp-1 font-medium group-hover:text-blue-400 transition-colors text-sm md:text-base">{mail.subject}</div>
                                                {/* Mobile-only date/sender info could go here if needed, but keeping it clean for now */}
                                            </TableCell>
                                            <TableCell className="py-4 hidden md:table-cell">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-xs text-gray-300 shrink-0">
                                                        {(typeof mail.sender === 'object' ? mail.sender.name : (mail.sender || '?')).charAt(0)}
                                                    </div>
                                                    <span className="text-gray-400 text-sm truncate">
                                                        {typeof mail.sender === 'object' ? mail.sender.name : (mail.sender || mail.recipient)}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-400 text-sm py-4 hidden sm:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-gray-500" />
                                                    {mail.date}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 hidden lg:table-cell">
                                                <div className="flex flex-col gap-1.5">
                                                    {mail.letter_type?.name && (
                                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 w-fit">
                                                            {mail.letter_type.name}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline" className="border-white/10 text-gray-500 w-fit text-[10px] hover:bg-white/5">
                                                        {mail.category}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right py-4 pr-4 md:pr-6">
                                                <Button
                                                    size="sm"
                                                    className="bg-red-600 hover:bg-red-700 text-white h-8 w-8 p-0 rounded-lg shadow-lg shadow-red-900/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:translate-x-2 md:group-hover:translate-x-0"
                                                    onClick={() => handleViewDetail(mail)}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <Pagination links={archivedMails.links} />

                {/* Detail Dialog */}
                <MailDetail
                    open={showDetailDialog}
                    onOpenChange={setShowDetailDialog}
                    mail={selectedMail}
                />
            </div>
        </AppLayout>
    );
}
