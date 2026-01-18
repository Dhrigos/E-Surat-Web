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
    PenLine,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    User,
    Calendar
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
    starredMails: PaginatedData;
    filters: {
        search?: string;
        category?: string;
    };
}

export default function StarredMails({ starredMails, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get('/starred-mails', {
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
        router.get('/starred-mails', {
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

    const handleViewDetail = (mail: any) => {
        setSelectedMail(mail);
        setShowDetailDialog(true);
    };

    const MailCard = ({ mail }: { mail: any }) => {
        const getBorderColor = () => {
            if (mail.status === 'approved') return 'border-l-green-500 hover:border-l-green-500';
            if (mail.status === 'rejected') return 'border-l-red-500 hover:border-l-red-500';
            return 'border-l-yellow-500 hover:border-l-yellow-500'; // Starred mails
        };

        return (
            <div className={`group bg-[#262626] border border-zinc-800 rounded-xl p-5 mb-4 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-2xl border-l-4 ${getBorderColor()}`}>
                <div className="flex justify-between items-start gap-4 mb-3">
                    {/* Left Side: Badges + Title */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            {mail.status === 'approved' ? (
                                <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0 px-3 py-1 rounded-full font-medium text-xs flex items-center gap-1.5">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Disetujui
                                </Badge>
                            ) : mail.status === 'rejected' ? (
                                <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-0 px-3 py-1 rounded-full font-medium text-xs flex items-center gap-1.5">
                                    <XCircle className="h-3.5 w-3.5" />
                                    Ditolak
                                </Badge>
                            ) : (
                                <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-0 px-3 py-1 rounded-full font-medium text-xs flex items-center gap-1.5">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    Berbintang
                                </Badge>
                            )}
                            <Badge variant="outline" className="border-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full font-medium text-xs">
                                {mail.category || 'Surat'}
                            </Badge>
                        </div>

                        <h3 className="text-base md:text-lg font-bold text-foreground dark:text-zinc-100">
                            {mail.code || 'N/A'} - {mail.subject}
                        </h3>
                    </div>

                    {/* Right Side: Action Buttons */}
                    <div className="flex flex-col gap-2 items-end shrink-0 hidden md:flex">
                        <div className="flex gap-1 mb-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                                onClick={() => router.put(route('letters.toggle-star', mail.id), {}, { preserveScroll: true })}
                                title="Unstar"
                            >
                                <Star className="h-4 w-4 fill-current" />
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            className="h-8 gap-1.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-colors text-xs"
                            onClick={() => handleViewDetail(mail)}
                        >
                            <Eye className="h-3.5 w-3.5" />
                            Lihat
                        </Button>
                    </div>
                </div>

                {/* Metadata Row with Icons */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span className="text-xs">Dari: <span className="text-foreground font-medium">{(typeof mail.sender === 'object' ? mail.sender?.name : mail.sender) || mail.recipient || 'Unknown'}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs text-foreground">{mail.date ? new Date(mail.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                    </div>
                </div>

                {/* Content Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {mail.description || mail.content}
                </p>

                {/* Mobile Actions */}
                <div className="flex md:hidden gap-2 mt-4 justify-end">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10"
                        onClick={() => router.put(route('letters.toggle-star', mail.id), {}, { preserveScroll: true })}
                    >
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-xs">Unstar</span>
                    </Button>
                    <Button
                        size="sm"
                        className="h-8 gap-1.5 bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => handleViewDetail(mail)}
                    >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">Lihat</span>
                    </Button>
                </div>
            </div>
        );
    };

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
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white border-transparent shadow-md'
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
            <Head title="Starred Mails" />
            <div className="p-3 md:p-8 space-y-6 md:space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#AC0021] rounded-xl shadow-lg shadow-[#AC0021]/20 flex items-center justify-center shrink-0">
                            <Star className="w-6 h-6 md:w-7 md:h-7 text-[#FEFCF8] fill-current" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Starred Mails</h2>
                            <p className="text-muted-foreground text-xs md:text-sm max-w-md">Surat yang Anda tandai bintang</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-[#262626] p-4 rounded-xl flex flex-col sm:flex-row gap-4 shadow-lg hover:shadow-[0_0_25px_rgba(254,252,248,0.15)] transition-all duration-300 items-center relative z-20">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Cari berdasarkan perihal atau nama..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 h-10 shadow-none focus-visible:ring-1 focus-visible:ring-yellow-500/50 focus-visible:border-yellow-500/50 rounded-lg transition-all"
                        />
                    </div>

                    <div className="w-full sm:w-[280px]">
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full h-10 bg-[#2a2a2a] border-white/10 text-white focus:ring-1 focus:ring-yellow-500/50 rounded-lg px-4 shadow-none">
                                <SelectValue placeholder="Filter kategori" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1a1a] border-white/10 text-white rounded-xl shadow-xl w-[280px]">
                                <SelectItem value="all" className="focus:bg-white/10 cursor-pointer py-3 font-medium">Semua Kategori</SelectItem>
                                <SelectItem value="internal" className="focus:bg-white/10 cursor-pointer py-2.5">Internal</SelectItem>
                                <SelectItem value="external" className="focus:bg-white/10 cursor-pointer py-2.5">Eksternal</SelectItem>
                                <SelectItem value="report" className="focus:bg-white/10 cursor-pointer py-2.5">Laporan</SelectItem>
                                <SelectItem value="finance" className="focus:bg-white/10 cursor-pointer py-2.5">Keuangan</SelectItem>
                                <SelectItem value="hr" className="focus:bg-white/10 cursor-pointer py-2.5">SDM</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Mail List */}
                <div className="space-y-4">
                    {starredMails.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-800 rounded-2xl bg-[#262626]">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Star className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Tidak ada surat berbintang</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-6">Surat yang Anda tandai bintang akan muncul di sini</p>
                        </div>
                    ) : (
                        <>
                            {starredMails.data.map((mail) => (
                                <MailCard key={mail.id} mail={mail} />
                            ))}
                            <Pagination links={starredMails.links} />
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
