import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search,
    Eye,
    Archive,
    FileText,
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
                    <Badge variant="outline" className={`${getStatusColor(mail.status)} border-0 px-4 py-1 rounded-full font-medium`}>
                        Archived
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
        <AppLayout breadcrumbs={[
            { title: 'List Surat', href: '/list-surat' },
            { title: 'Archive', href: '/archived-mails' },
        ]}>
            <Head title="Archived Mails" />
            <div className="p-4 md:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">📦 Archived Mails</h2>
                        <p className="text-muted-foreground">Surat yang telah diarsipkan</p>
                    </div>
                    <Link href="/list-surat">
                        <Button variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Kembali ke List Surat</span>
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
