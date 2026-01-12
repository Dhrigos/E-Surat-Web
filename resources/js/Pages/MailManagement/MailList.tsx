import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search,
    Eye,
    Download,
    Edit,
    Clock,
    CheckCircle,
    XCircle,
    Archive,
    FileText,
    PenLine,
    ChevronLeft,
    ChevronRight,
    Star,
    Plus
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
    sentMails: PaginatedData;
    inboxMails: PaginatedData;
    incomingApprovals: PaginatedData;
    alreadyApprovedMails: PaginatedData; // Add this line
    filters: {
        search?: string;
        category?: string;
        letter_type?: string;
        status?: string;
    };
    letterTypes: { id: number; name: string }[];
}

export default function MailList({ sentMails, inboxMails, incomingApprovals, alreadyApprovedMails, filters, letterTypes = [] }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedLetterType, setSelectedLetterType] = useState(filters.letter_type || 'all');
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('inbox');

    // Simple debounce implementation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get('/list-surat', {
                    search: searchTerm,
                    letter_type: selectedLetterType,
                    [`${activeTab}_page`]: 1
                }, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true
                });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleFilterChange = (value: string) => {
        setSelectedLetterType(value);
        router.get('/list-surat', {
            search: searchTerm,
            letter_type: value,
            [`${activeTab}_page`]: 1
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
            case 'new': return 'bg-purple-900 text-purple-200 border border-purple-700';
            case 'read': return 'bg-gray-800 text-gray-200 border border-gray-700';
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'approved': return <CheckCircle className="h-4 w-4" />;
            case 'rejected': return <XCircle className="h-4 w-4" />;
            case 'revision': return <Edit className="h-4 w-4" />;
            case 'new': return <FileText className="h-4 w-4" />;
            case 'read': return <Archive className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const handleViewDetail = (mail: any, type: 'sent' | 'inbox') => {
        setSelectedMail({ ...mail, type });
        setShowDetailDialog(true);
    };

    const MailCard = ({ mail, type }: { mail: any; type: 'sent' | 'inbox' }) => (
        <div className="group bg-card dark:bg-[#18181b]/80 backdrop-blur-sm border border-border/50 dark:border-zinc-800/50 rounded-xl p-6 mb-4 hover:border-red-500/30 transition-all shadow-sm hover:shadow-md hover:bg-zinc-50 dark:hover:bg-zinc-900/40">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2.5 rounded-full shrink-0 transition-colors ${mail.status === 'approved' ? 'bg-green-500/10 text-green-600 dark:text-green-500' :
                        mail.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-500' :
                            mail.status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-500' :
                                'bg-blue-500/10 text-blue-600 dark:text-blue-500'
                        }`}>
                        {getStatusIcon(mail.status)}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-foreground dark:text-zinc-100 truncate group-hover:text-red-500 transition-colors">{mail.subject}</h3>
                        <div className="flex items-center gap-2 mt-1 md:hidden">
                            <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-0">
                                {mail.letter_type || mail.category}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:text-base items-center">
                    <div className="hidden md:flex gap-2 items-center">
                        <Badge variant="secondary" className="px-2.5 py-1 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-0 capitalize">
                            {mail.letter_type || mail.category}
                        </Badge>
                    </div>
                    <div className="flex gap-2 items-center text-xs sm:text-sm">
                        <span className="text-muted-foreground/60">{type === 'sent' ? 'Penerima:' : 'Pengirim:'}</span>
                        <span className="text-foreground font-medium truncate max-w-[150px]">{type === 'sent' ? mail.recipient : mail.sender}</span>
                    </div>
                    <div className="flex gap-2 items-center text-xs sm:text-sm">
                        <span className="text-muted-foreground/60">Tanggal:</span>
                        <span className="text-foreground">{mail.date}</span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 line-clamp-2 pl-[3.25rem]">{mail.description}</p>

            <div className="flex items-center justify-between pl-[3.25rem]">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`${getStatusColor(mail.status)} border-0 px-3 py-1 rounded-full font-medium text-xs`}>
                        {mail.status.charAt(0).toUpperCase() + mail.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={`${getPriorityColor(mail.priority)} border-0 px-3 py-1 rounded-full font-medium text-xs`}>
                        {mail.priority.charAt(0).toUpperCase() + mail.priority.slice(1)}
                    </Badge>
                </div>

                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-2 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                        onClick={() => handleViewDetail(mail, type)}
                    >
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                    </Button>
                    {mail.status === 'approved' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-2 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors"
                            onClick={() => router.put(route('letters.archive', mail.id), {}, { preserveScroll: true })}
                        >
                            <Archive className="h-4 w-4" />
                            <span className="hidden sm:inline">Archive</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );

    const Pagination = ({ links }: { links: PaginationLinks[] }) => (
        <div className="flex items-center justify-center gap-1 mt-8">
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
                        className={`h-9 min-w-9 px-2 rounded-lg transition-all ${link.active
                            ? 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-md'
                            : 'border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-muted-foreground'
                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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
        <AppLayout>
            <Head title="List Surat" />

            <div className="p-3 md:p-8 space-y-6 md:space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Surat</h2>
                        <p className="text-muted-foreground text-xs md:text-sm">Kelola semua surat masuk dan keluar anda di sini.</p>
                    </div>
                    <div className="hidden md:block">
                        <Link href="/buat-surat">
                            <Button className="bg-red-600 hover:bg-red-700 text-white gap-2 rounded-full px-6 h-11 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 transition-all font-medium">
                                <PenLine className="h-4 w-4" />
                                <span className="hidden sm:inline">Tulis Surat</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-xl p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col sm:flex-row gap-2 shadow-sm items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-red-500 transition-colors" />
                        <Input
                            placeholder="Cari berdasarkan perihal atau nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 bg-white dark:bg-zinc-950/50 border-transparent text-foreground placeholder:text-muted-foreground h-10 shadow-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 rounded-xl transition-all hover:bg-white/80 dark:hover:bg-zinc-900"
                        />
                    </div>

                    <div className="w-full sm:w-[280px]">
                        <Select value={selectedLetterType} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-full h-10 bg-white dark:bg-zinc-950/50 border-transparent text-zinc-700 dark:text-zinc-300 focus:ring-1 focus:ring-red-500/50 rounded-xl px-4 hover:bg-white/80 dark:hover:bg-zinc-900 transition-all shadow-none">
                                <SelectValue placeholder="FILTER JENIS SURAT" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl shadow-xl w-[280px]">
                                <SelectItem value="all" className="focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer py-3 font-medium">Semua Jenis Surat</SelectItem>
                                {letterTypes.map((type) => (
                                    <SelectItem key={type.id} value={type.id.toString()} className="focus:bg-zinc-100 dark:focus:bg-zinc-800 cursor-pointer py-2.5">
                                        {type.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="inbox" className="space-y-6" onValueChange={(val) => {
                    setActiveTab(val);
                }}>
                    <TabsList className="w-full bg-transparent p-0 h-auto border-b border-zinc-200 dark:border-zinc-800 flex justify-start gap-8 rounded-none shadow-none">
                        <TabsTrigger
                            value="inbox"
                            className="rounded-none px-0 py-3 text-sm font-medium text-muted-foreground bg-transparent ring-0 outline-none border-0 border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-foreground hover:bg-transparent"
                        >
                            Inbox {inboxMails.total > 0 ? `(${inboxMails.total})` : ''}
                        </TabsTrigger>
                        <TabsTrigger
                            value="approvals"
                            className="rounded-none px-0 py-3 text-sm font-medium text-muted-foreground bg-transparent ring-0 outline-none border-0 border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-foreground hover:bg-transparent"
                        >
                            Approval {(incomingApprovals?.total > 0) ? `(${incomingApprovals.total})` : ''}
                        </TabsTrigger>
                        <TabsTrigger
                            value="sent"
                            className="rounded-none px-0 py-3 text-sm font-medium text-muted-foreground bg-transparent ring-0 outline-none border-0 border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-foreground hover:bg-transparent"
                        >
                            Sent {sentMails.total > 0 ? `(${sentMails.total})` : ''}
                        </TabsTrigger>
                        <TabsTrigger
                            value="approved"
                            className="rounded-none px-0 py-3 text-sm font-medium text-muted-foreground bg-transparent ring-0 outline-none border-0 border-b-2 border-transparent data-[state=active]:border-red-600 data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all hover:text-foreground hover:bg-transparent"
                        >
                            Approved {alreadyApprovedMails?.total > 0 ? `(${alreadyApprovedMails.total})` : ''}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inbox" className="space-y-4 mt-6">
                        {inboxMails.data.length === 0 ? (
                            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-blue-950/20 dark:via-[#18181b] dark:to-purple-950/20 rounded-2xl border border-border dark:border-zinc-800 shadow-lg">
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10">
                                    <div className="inline-flex p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl mb-6 animate-pulse">
                                        <FileText className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Inbox Kosong</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto mb-6">Belum ada surat masuk. Surat yang diterima akan muncul di sini.</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                        <span>Menunggu surat masuk...</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {inboxMails.data.map((mail) => (
                                    <MailCard key={mail.id} mail={mail} type="inbox" />
                                ))}
                                <Pagination links={inboxMails.links} />
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="approvals" className="space-y-4 mt-6">
                        {incomingApprovals?.data.length === 0 ? (
                            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-green-50/50 via-white to-emerald-50/50 dark:from-green-950/20 dark:via-[#18181b] dark:to-emerald-950/20 rounded-2xl border border-border dark:border-zinc-800 shadow-lg">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 dark:bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10">
                                    <div className="inline-flex p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-2xl mb-6">
                                        <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">Semua Beres!</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto mb-6">Tidak ada surat yang menunggu persetujuan Anda saat ini.</p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="font-medium">Semua approval selesai</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {incomingApprovals?.data.map((mail) => (
                                    <MailCard key={mail.id} mail={mail} type="inbox" />
                                ))}
                                <Pagination links={incomingApprovals?.links || []} />
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="sent" className="space-y-4 mt-6">
                        {sentMails.data.length === 0 ? (
                            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-orange-50/50 via-white to-red-50/50 dark:from-orange-950/20 dark:via-[#18181b] dark:to-red-950/20 rounded-2xl border border-border dark:border-zinc-800 shadow-lg">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 dark:bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10">
                                    <div className="inline-flex p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 rounded-2xl mb-6">
                                        <PenLine className="h-16 w-16 text-red-600 dark:text-red-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">Belum Ada Surat Terkirim</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto mb-6">Mulai buat surat pertama Anda. Semua surat yang dikirim akan tersimpan di sini.</p>
                                    <Link href="/buat-surat">
                                        <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white gap-2 rounded-full px-6 shadow-lg hover:shadow-red-600/30 transition-all">
                                            <PenLine className="h-4 w-4" />
                                            <span>Tulis Surat Pertama</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                {sentMails.data.map((mail) => (
                                    <MailCard key={mail.id} mail={mail} type="sent" />
                                ))}
                                <Pagination links={sentMails.links} />
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="approved" className="space-y-4 mt-6">
                        {alreadyApprovedMails?.data.length === 0 ? (
                            <div className="relative overflow-hidden text-center py-16 bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50 dark:from-teal-950/20 dark:via-[#18181b] dark:to-cyan-950/20 rounded-2xl border border-border dark:border-zinc-800 shadow-lg">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                                <div className="relative z-10">
                                    <div className="inline-flex p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20 rounded-2xl mb-6">
                                        <Star className="h-16 w-16 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">Belum Ada Approval</h3>
                                    <p className="text-muted-foreground max-w-md mx-auto">Surat yang sudah Anda setujui akan ditampilkan di sini untuk referensi.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {alreadyApprovedMails?.data.map((mail) => (
                                    <MailCard key={mail.id} mail={mail} type="inbox" />
                                ))}
                                <Pagination links={alreadyApprovedMails?.links || []} />
                            </>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Detail Dialog */}
                <MailDetail
                    open={showDetailDialog}
                    onOpenChange={setShowDetailDialog}
                    mail={selectedMail}
                />

                {/* Mobile FAB */}
                <Link href="/buat-surat" className="md:hidden fixed bottom-24 right-6 z-[9999]">
                    <Button className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl flex items-center justify-center p-0">
                        <Plus className="h-6 w-6" />
                    </Button>
                </Link>
            </div>
        </AppLayout>
    );
}
