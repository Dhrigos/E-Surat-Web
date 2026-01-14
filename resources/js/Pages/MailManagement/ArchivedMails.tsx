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
    Search,
    Eye,
    Archive,
    FileText,
    ChevronLeft,
    ChevronRight,
    Star,
    Plus,
    Upload,
    Type
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
    };
}

export default function ArchivedMails({ archivedMails, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
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
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        router.get('/archived-mails', {
            search: searchTerm,
            category: value,
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-900 text-yellow-200 border border-yellow-700';
            case 'approved': return 'bg-green-900 text-green-200 border border-green-700';
            case 'rejected': return 'bg-red-900 text-red-200 border border-red-700';
            case 'revision': return 'bg-blue-900 text-blue-200 border border-blue-700';
            case 'archived': return 'bg-gray-800 text-gray-200 border border-gray-700';
            default: return 'bg-gray-800 text-gray-200 border border-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-900 text-red-200 border border-red-700';
            case 'high': return 'bg-orange-900 text-orange-200 border border-orange-700';
            case 'normal': return 'bg-blue-900 text-blue-200 border border-blue-700';
            case 'low': return 'bg-gray-800 text-gray-200 border border-gray-700';
            default: return 'bg-gray-800 text-gray-200 border border-gray-700';
        }
    };

    const handleViewDetail = (mail: any) => {
        setSelectedMail(mail);
        setShowDetailDialog(true);
    };

    const MailCard = ({ mail }: { mail: any }) => (
        <div className="bg-card dark:bg-[#18181b] border border-border dark:border-zinc-800 rounded-xl p-6 mb-4 hover:border-primary/50 transition-colors shadow-sm opacity-75">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Archive className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-bold text-foreground dark:text-white">{mail.subject}</h3>
                </div>

                <div className="flex gap-2">
                    {mail.is_starred && (
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                    <span className="text-muted-foreground/70">Pengirim/Penerima:</span>
                    <span className="ml-2 text-foreground">{mail.sender || mail.recipient}</span>
                </div>
                <div>
                    <span className="text-muted-foreground/70">Tanggal:</span>
                    <span className="ml-2 text-foreground">{mail.date}</span>
                </div>
                <div>
                    <span className="text-muted-foreground/70">Kategori:</span>
                    <span className="ml-2 text-foreground">{mail.category}</span>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{mail.description}</p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`${getStatusColor(mail.status)} border-0 px-4 py-1 rounded-full font-medium capitalize`}>
                        {mail.status === 'archived' ? 'Archived' : mail.status}
                    </Badge>
                    <Badge variant="outline" className={`${getPriorityColor(mail.priority)} border-0 px-4 py-1 rounded-full font-medium`}>
                        {mail.priority.charAt(0).toUpperCase() + mail.priority.slice(1)}
                    </Badge>
                </div>

                <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                    onClick={() => handleViewDetail(mail)}
                >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                </Button>
            </div>
        </div>
    );

    const Pagination = ({ links }: { links: PaginationLinks[] }) => (
        <div className="flex items-center justify-center gap-1 mt-6">
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
                        className={`h-8 min-w-8 px-2 ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <Head title="Archived Mails" />
            <div className="p-4 md:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">📦 Archived Mails</h2>
                        <p className="text-muted-foreground">Surat yang telah diarsipkan</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm">
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah Arsip Eksternal</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Tambah Arsip Eksternal</DialogTitle>
                                    <DialogDescription>
                                        Tambahkan surat manual ke arsip (Upload Gambar/PDF atau Ketik Ulang).
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleExternalSubmit} className="space-y-4 mt-2">


                                    <Tabs defaultValue="upload" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="upload" className="gap-2"><Upload className="w-4 h-4" /> Upload File</TabsTrigger>
                                            <TabsTrigger value="text" className="gap-2"><Type className="w-4 h-4" /> Ketik Ulang</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="upload" className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Perihal / Judul Surat</Label>
                                                <Input
                                                    value={data.subject}
                                                    onChange={e => setData('subject', e.target.value)}
                                                    placeholder="Contoh: Surat Penawaran Kerjasama"
                                                // required - validasi di backend
                                                />
                                                {errors.subject && <p className="text-destructive text-xs">{errors.subject}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Pengirim / Keterangan</Label>
                                                <Input
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    placeholder="Contoh: PT. Maju Jaya"
                                                />
                                                {errors.description && <p className="text-destructive text-xs">{errors.description}</p>}
                                            </div>
                                            <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                                                <div className="p-4 bg-muted rounded-full mb-3">
                                                    <Upload className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Input
                                                        type="file"
                                                        id="file-upload"
                                                        className="hidden"
                                                        onChange={e => setData('attachment', e.target.files?.[0] || null)}
                                                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                    />
                                                    <Label htmlFor="file-upload" className="block text-sm font-medium text-primary hover:underline cursor-pointer">
                                                        Klik untuk upload file
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 10MB)</p>
                                                    {data.attachment && (
                                                        <div className="mt-2 text-sm font-medium text-emerald-600 flex items-center justify-center gap-1">
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
                                                <Label>Perihal Surat <span className="text-red-500">*</span></Label>
                                                <Input
                                                    value={data.subject}
                                                    onChange={e => setData('subject', e.target.value)}
                                                    placeholder="Masukkan perihal surat"
                                                />
                                                {errors.subject && <p className="text-destructive text-xs">{errors.subject}</p>}
                                            </div>

                                            {/* Row 2: Recipient & Priority */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Penerima <span className="text-red-500">*</span></Label>
                                                    <Input
                                                        value={data.recipient}
                                                        onChange={e => setData('recipient', e.target.value)}
                                                        placeholder="Ketik nama atau username..."
                                                    />
                                                    {errors.recipient && <p className="text-destructive text-xs">{errors.recipient}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Prioritas</Label>
                                                    <Select value={data.priority} onValueChange={val => setData('priority', val)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Prioritas" />
                                                        </SelectTrigger>
                                                        <SelectContent>
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
                                                    <Label>Kategori</Label>
                                                    <Select value={data.category} onValueChange={val => setData('category', val)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih Kategori" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="internal">Internal</SelectItem>
                                                            <SelectItem value="external">External</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Jenis Surat (Opsional)</Label>
                                                    <Select onValueChange={val => setData('letter_type_id', val)}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih jenis surat (Opsional)" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="placeholder" disabled>Coming Soon</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Row 4: Content */}
                                            <div className="space-y-2">
                                                <Label>Isi Surat</Label>
                                                <Textarea
                                                    rows={6}
                                                    value={data.content}
                                                    onChange={e => setData('content', e.target.value)}
                                                    placeholder="Tulis isi surat di sini..."
                                                    className="resize-y"
                                                />
                                            </div>

                                            {/* Row 5: Attachments (Drag & Drop UI simplified) */}
                                            <div className="space-y-2">
                                                <Label>Lampiran (PDF/Word)</Label>
                                                <div className="border-2 border-dashed border-zinc-700/50 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg p-8 flex flex-col items-center justify-center text-center relative hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                                                    <p className="text-sm font-medium text-foreground">Drag & drop files atau klik untuk upload</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Support: PDF, DOC, DOCX (Max 10MB)</p>
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

                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)}>Batal</Button>
                                        <Button type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700 text-white">
                                            {processing ? 'Menyimpan...' : 'Simpan ke Arsip'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>


                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white dark:bg-black p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-2 shadow-sm items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-2.5 h-5 w-5 text-zinc-500 dark:text-muted-foreground" />
                        <Input
                            placeholder="Cari berdasarkan perihal atau nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 bg-zinc-100 dark:bg-[#18181b] border-transparent text-zinc-900 dark:text-foreground placeholder:text-zinc-500 dark:placeholder:text-muted-foreground h-10 focus-visible:ring-blue-600 focus-visible:border-blue-600 rounded-lg transition-all hover:bg-zinc-200/50 dark:hover:bg-zinc-900"
                        />
                    </div>

                    <div className="w-full sm:w-56">
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full h-10 bg-zinc-100 dark:bg-[#18181b] border-transparent dark:border-blue-900/30 text-zinc-900 dark:text-zinc-300 focus:ring-blue-600 focus:border-blue-600 rounded-lg px-4 hover:bg-zinc-200/50 dark:hover:bg-zinc-900 transition-all data-[state=open]:border-blue-600">
                                <SelectValue placeholder="Filter kategori" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-popover border-zinc-200 dark:border-border text-zinc-900 dark:text-popover-foreground">
                                <SelectItem value="all">Semua Kategori</SelectItem>
                                <SelectItem value="internal">Internal</SelectItem>
                                <SelectItem value="external">Eksternal</SelectItem>
                                <SelectItem value="report">Laporan</SelectItem>
                                <SelectItem value="finance">Keuangan</SelectItem>
                                <SelectItem value="hr">SDM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Mail List */}
                <div className="space-y-4">
                    {archivedMails.data.length === 0 ? (
                        <div className="text-center py-12 bg-card dark:bg-[#18181b] rounded-xl border border-border dark:border-zinc-800 shadow-sm">
                            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2 text-foreground">Tidak ada surat di arsip</h3>
                            <p className="text-muted-foreground">Surat yang diarsipkan akan muncul di sini</p>
                        </div>
                    ) : (
                        <>
                            {archivedMails.data.map((mail) => (
                                <MailCard key={mail.id} mail={mail} />
                            ))}
                            <Pagination links={archivedMails.links} />
                        </>
                    )}
                </div>

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
