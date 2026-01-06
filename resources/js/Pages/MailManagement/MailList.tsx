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
    Star
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
        status?: string;
    };
}

export default function MailList({ sentMails, inboxMails, incomingApprovals, alreadyApprovedMails, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [activeTab, setActiveTab] = useState('inbox');

    // Simple debounce implementation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get('/list-surat', {
                    search: searchTerm,
                    category: selectedCategory,
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

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        router.get('/list-surat', {
            search: searchTerm,
            category: value,
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
        <div className="bg-card dark:bg-[#18181b] border border-border dark:border-zinc-800 rounded-xl p-6 mb-4 hover:border-primary/50 transition-colors shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full bg-muted shrink-0 ${mail.status === 'approved' ? 'text-green-600 dark:text-green-500' :
                        mail.status === 'pending' ? 'text-yellow-600 dark:text-yellow-500' : 'text-blue-600 dark:text-blue-500'
                        }`}>
                        {getStatusIcon(mail.status)}
                    </div>
                    <h3 className="text-lg font-bold text-foreground dark:text-white truncate">{mail.subject}</h3>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm md:text-base">
                    <div className="flex gap-2 items-center">
                        <span className="text-muted-foreground/70">{type === 'sent' ? 'Penerima:' : 'Pengirim:'}</span>
                        <span className="text-foreground font-medium truncate max-w-[150px]">{type === 'sent' ? mail.recipient : mail.sender}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-muted-foreground/70">Tanggal:</span>
                        <span className="text-foreground">{mail.date}</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        <span className="text-muted-foreground/70">Kategori:</span>
                        <span className="text-foreground capitalize">{mail.category}</span>
                    </div>
                </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6 line-clamp-2">{mail.description}</p>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className={`${getStatusColor(mail.status)} border-0 px-4 py-1 rounded-full font-medium`}>
                        {mail.status.charAt(0).toUpperCase() + mail.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={`${getPriorityColor(mail.priority)} border-0 px-4 py-1 rounded-full font-medium`}>
                        {mail.priority.charAt(0).toUpperCase() + mail.priority.slice(1)}
                    </Badge>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 rounded-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                        onClick={() => handleViewDetail(mail, type)}
                    >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                    </Button>
                    {mail.status === 'approved' && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2 rounded-lg hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-colors"
                            onClick={() => router.put(route('letters.archive', mail.id), {}, { preserveScroll: true })}
                        >
                            <Archive className="h-4 w-4" />
                            <span>Archive</span>
                        </Button>
                    )}
                </div>
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
        <AppLayout breadcrumbs={[
            { title: 'List Surat', href: '/list-surat' },
        ]}>
            <Head title="List Surat" />
            <div className="p-4 md:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">List Surat</h2>
                        <p className="text-muted-foreground">Daftar surat yang dikirim dan diterima</p>
                    </div>
                    <Link href="/buat-surat">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-full px-6 shadow-lg hover:shadow-blue-600/20 transition-all">
                            <PenLine className="h-4 w-4" />
                            <span>Tulis Surat</span>
                        </Button>
                    </Link>
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

                {/* Tabs */}
                <Tabs defaultValue="inbox" className="space-y-4" onValueChange={(val) => {
                    setActiveTab(val);
                }}>
                    <TabsList className="w-full bg-muted dark:bg-black p-1 h-auto rounded-full border border-border dark:border-zinc-800 flex flex-wrap">
                        <TabsTrigger
                            value="inbox"
                            className="flex-1 rounded-full py-2 text-muted-foreground data-[state=active]:!bg-red-600 data-[state=active]:!text-white transition-all hover:text-foreground"
                        >
                            Inbox {inboxMails.total > 0 ? `(${inboxMails.total})` : ''}
                        </TabsTrigger>
                        <TabsTrigger
                            value="approvals"
                            className="flex-1 rounded-full py-2 text-muted-foreground data-[state=active]:!bg-red-600 data-[state=active]:!text-white transition-all hover:text-foreground"
                        >
                            Perlu Persetujuan {(incomingApprovals?.total > 0) ? `(${incomingApprovals.total})` : ''}
                        </TabsTrigger>
                        <TabsTrigger
                            value="sent"
                            className="flex-1 rounded-full py-2 text-muted-foreground data-[state=active]:!bg-red-600 data-[state=active]:!text-white transition-all hover:text-foreground"
                        >
                            Sent {sentMails.total > 0 ? `(${sentMails.total})` : ''}
                        </TabsTrigger>
                        <TabsTrigger
                            value="approved"
                            className="flex-1 rounded-full py-2 text-muted-foreground data-[state=active]:!bg-red-600 data-[state=active]:!text-white transition-all hover:text-foreground"
                        >
                            Sudah di Approve {alreadyApprovedMails?.total > 0 ? `(${alreadyApprovedMails.total})` : ''}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="inbox" className="space-y-4 mt-6">
                        {inboxMails.data.length === 0 ? (
                            <div className="text-center py-12 bg-card dark:bg-[#18181b] rounded-xl border border-border dark:border-zinc-800 shadow-sm">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2 text-foreground">Tidak ada surat masuk</h3>
                                <p className="text-muted-foreground">Surat yang masuk akan muncul di sini</p>
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
                            <div className="text-center py-12 bg-card dark:bg-[#18181b] rounded-xl border border-border dark:border-zinc-800 shadow-sm">
                                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2 text-foreground">Tidak ada persetujuan tertunda</h3>
                                <p className="text-muted-foreground">Surat yang perlu Anda setujui akan muncul di sini</p>
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
                            <div className="text-center py-12 bg-card dark:bg-[#18181b] rounded-xl border border-border dark:border-zinc-800 shadow-sm">
                                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2 text-foreground">Tidak ada surat yang dikirim</h3>
                                <p className="text-muted-foreground">Surat yang Anda kirim akan muncul di sini</p>
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
                            <div className="text-center py-12 bg-card dark:bg-[#18181b] rounded-xl border border-border dark:border-zinc-800 shadow-sm">
                                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2 text-foreground">Belum ada surat yang disetujui</h3>
                                <p className="text-muted-foreground">Surat yang sudah Anda setujui akan muncul di sini</p>
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
            </div>
        </AppLayout>
    );
}
