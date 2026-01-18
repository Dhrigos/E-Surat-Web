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
    Plus,
    Inbox,
    Send,
    User,
    Calendar,
    X
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
    openedMail?: any;
}

export default function MailList({ sentMails, inboxMails, incomingApprovals, alreadyApprovedMails, filters, letterTypes = [], openedMail }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedLetterType, setSelectedLetterType] = useState(filters.letter_type || 'all');
    const [selectedMail, setSelectedMail] = useState<any>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    // Initialize activeTab from URL param or default to 'inbox'
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const [activeTab, setActiveTab] = useState(params.get('tab') || 'inbox');

    // Sync tab changes to URL for sidebar highlighting
    const handleTabChange = (val: string) => {
        setActiveTab(val);
        router.get('/list-surat', {
            ...filters, // Keep existing filters
            search: searchTerm,
            letter_type: selectedLetterType,
            tab: val, // Update tab param
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true // Don't clutter history
        });
    };

    // Handle openedMail from Controller (e.g. from Notifications or Redirects)
    useEffect(() => {
        if (openedMail) {
            setSelectedMail(openedMail);
            setShowDetailDialog(true);
        }
    }, [openedMail]);

    // Simple debounce implementation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters.search || '')) {
                router.get('/list-surat', {
                    search: searchTerm,
                    letter_type: selectedLetterType,
                    tab: activeTab, // Persist current tab
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
            tab: activeTab, // Persist current tab
            [`${activeTab}_page`]: 1
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };
    // ... (rest of code)

    // In render:
    // <Tabs value={activeTab} onValueChange={handleTabChange} ...>

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

    const handleViewDetail = (mail: any, type: 'sent' | 'inbox' | 'approved' | 'approved-history') => {
        setSelectedMail({ ...mail, type });
        setShowDetailDialog(true);
    };

    const MailCard = ({ mail, type }: { mail: any; type: 'sent' | 'inbox' | 'approved' | 'approved-history' }) => {
        // Unified design for all types including inbox and sent
        if (type === 'approved' || type === 'approved-history' || type === 'inbox' || type === 'sent') {
            const isApproved = type === 'approved-history' || mail.status === 'approved';
            // Determine border color based on status/type
            const getBorderColor = () => {
                if (type === 'approved') return 'border-l-orange-500 hover:border-l-orange-500'; // Waiting for approval
                if (isApproved) return 'border-l-green-500 hover:border-l-green-500';
                if (mail.status === 'rejected') return 'border-l-red-500 hover:border-l-red-500';
                return 'border-l-blue-500 hover:border-l-blue-500'; // Default/Pending
            };

            return (
                <div
                    className={`group bg-[#262626] border border-zinc-800 rounded-xl p-5 mb-4 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-2xl border-l-4 cursor-pointer ${getBorderColor()}`}
                    onClick={() => handleViewDetail(mail, type === 'approved-history' ? 'inbox' : type)}
                >
                    <div className="flex justify-between items-start gap-4 mb-3">
                        {/* Left Side: Badges + Title */}
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                {type === 'approved' ? (
                                    <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border-0 px-3 py-1 rounded-full font-medium text-xs flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Menunggu Tanda Tangan Anda
                                    </Badge>
                                ) : isApproved ? (
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
                                    <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0 px-3 py-1 rounded-full font-medium text-xs flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        Menunggu
                                    </Badge>
                                )}
                                <Badge variant="outline" className="border-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-full font-medium text-xs">
                                    {mail.letter_type || mail.category || 'Surat'}
                                </Badge>
                            </div>

                            <h3 className="text-base md:text-lg font-bold text-foreground dark:text-zinc-100">
                                {mail.code || 'BCN/2024/0005'} - {mail.subject}
                            </h3>
                        </div>

                        {/* Right Side: Action Buttons */}
                        <div className="flex flex-col gap-2 items-end shrink-0 hidden md:flex">
                            <div className="flex gap-1 mb-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-6 w-6 transition-colors ${mail.is_starred ? 'text-yellow-500 hover:text-yellow-600' : 'text-zinc-500 hover:text-yellow-500'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.put(route('letters.toggle-star', mail.id), {}, { preserveScroll: true });
                                    }}
                                    title={mail.is_starred ? "Unstar" : "Star"}
                                >
                                    <Star className={`h-4 w-4 ${mail.is_starred ? 'fill-current' : ''}`} />
                                </Button>
                            </div>
                            <Button
                                size="sm"
                                className="h-8 gap-1.5 rounded-lg bg-[#AC0021] hover:bg-[#8c001b] text-white transition-colors text-xs"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetail(mail, type === 'approved-history' ? 'inbox' : type);
                                }}
                            >
                                <Eye className="h-3.5 w-3.5" />
                                Lihat
                            </Button>
                            {type === 'approved' && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 gap-1.5 rounded-lg border-red-600/20 bg-red-500/5 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors text-xs"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        /* Handle reject */
                                    }}
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Tolak
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Metadata Row with Icons */}
                    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span className="text-xs">{type === 'sent' ? 'Kepada: ' : 'Dari: '} <span className="text-foreground font-medium">{type === 'sent' ? mail.recipient : (typeof mail.sender === 'object' ? mail.sender?.name : mail.sender) || 'Unknown'}</span></span>
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
                </div>
            );
        }


        // Original design for inbox and sent types
        return (
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
                            <span className="text-foreground font-medium truncate max-w-[150px]">{type === 'sent' ? mail.recipient : (mail.sender?.name || mail.sender)}</span>
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
                        {/* Archive button removed as per request */}
                    </div>
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
                            ? 'bg-[#AC0021] hover:bg-[#8c001b] text-white border-transparent shadow-md'
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

    const headerConfig: Record<string, { title: string; description: string; icon: any; color: string; shadow: string }> = {
        inbox: {
            title: 'Inbox',
            description: 'Surat masuk yang perlu ditinjau dan ditandatangani',
            icon: Inbox,
            color: 'text-[#007EE7]',
            shadow: 'shadow-[#007EE7]/25'
        },
        approvals: {
            title: 'Approval',
            description: 'Surat yang menunggu persetujuan Anda',
            icon: Clock,
            color: 'text-[#D04438]',
            shadow: 'shadow-[#D04438]/25'
        },
        sent: {
            title: 'Sent',
            description: 'Surat yang telah Anda kirim',
            icon: Send,
            color: 'text-[#659800]',
            shadow: 'shadow-[#659800]/25'
        },
        approved: {
            title: 'Approved',
            description: 'Surat yang telah disetujui',
            icon: CheckCircle,
            color: 'text-[#659800]',
            shadow: 'shadow-[#659800]/25'
        }
    };

    const currentHeader = headerConfig[activeTab as keyof typeof headerConfig] || headerConfig.inbox;
    const HeaderIcon = currentHeader.icon;

    return (
        <AppLayout>
            <Head title={`List Surat - ${currentHeader.title}`} />

            <div className="p-3 md:p-8 space-y-6 md:space-y-8">
                {/* Header Section */}
                <div className="hidden sm:flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#262626] border border-zinc-800 flex items-center justify-center shadow-lg ${currentHeader.shadow} shrink-0`}>
                            <HeaderIcon className={`w-6 h-6 md:w-7 md:h-7 ${currentHeader.color}`} />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{currentHeader.title}</h2>
                            <p className="text-muted-foreground text-xs md:text-sm max-w-md">{currentHeader.description}</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                {/* Search and Filter */}
                {/* Search and Filter */}
                <div className="sticky top-0 z-30 bg-[#262626] p-3 md:p-4 rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(254,252,248,0.15)] transition-all duration-300 border border-white/5 backdrop-blur-xl">

                    {/* Mobile View */}
                    <div className="md:hidden flex gap-3 h-10 w-full items-center">
                        {!isMobileSearchOpen ? (
                            <>
                                <Button
                                    onClick={() => setIsMobileSearchOpen(true)}
                                    className="bg-[#2a2a2a] border border-white/10 shrink-0 w-10 h-10 p-0 rounded-lg hover:bg-[#333] transition-colors"
                                >
                                    <Search className="h-5 w-5 text-gray-400" />
                                </Button>
                                <div className="flex-1 w-full min-w-0">
                                    <Select value={selectedLetterType} onValueChange={handleFilterChange}>
                                        <SelectTrigger className="w-full h-10 bg-[#2a2a2a] border-white/10 text-white focus:ring-1 focus:ring-red-500/50 rounded-lg px-4 shadow-none">
                                            <SelectValue placeholder="Semua Jenis Surat" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white rounded-xl shadow-xl w-[280px]">
                                            <SelectItem value="all" className="focus:bg-white/10 cursor-pointer py-3 font-medium">Semua Jenis Surat</SelectItem>
                                            {letterTypes.map((type) => (
                                                <SelectItem key={type.id} value={type.id.toString()} className="focus:bg-white/10 cursor-pointer py-2.5">
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 relative w-full animate-in fade-in zoom-in-95 duration-200">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        autoFocus
                                        placeholder="Cari surat..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 h-10 shadow-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 rounded-lg transition-all w-full"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsMobileSearchOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className="shrink-0 text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:flex flex-row gap-4 items-center w-full">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Cari berdasarkan perihal atau nama..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-[#2a2a2a] border-white/10 text-white placeholder:text-gray-500 h-10 shadow-none focus-visible:ring-1 focus-visible:ring-red-500/50 focus-visible:border-red-500/50 rounded-lg transition-all"
                            />
                        </div>

                        <div className="w-[280px]">
                            <Select value={selectedLetterType} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-full h-10 bg-[#2a2a2a] border-white/10 text-white focus:ring-1 focus:ring-red-500/50 rounded-lg px-4 shadow-none">
                                    <SelectValue placeholder="Semua Jenis Surat" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white rounded-xl shadow-xl w-[280px]">
                                    <SelectItem value="all" className="focus:bg-white/10 cursor-pointer py-3 font-medium">Semua Jenis Surat</SelectItem>
                                    {letterTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id.toString()} className="focus:bg-white/10 cursor-pointer py-2.5">
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} className="space-y-6 pb-24" onValueChange={handleTabChange}>


                    <TabsContent value="inbox" className="space-y-4 mt-2">
                        {inboxMails.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-800 rounded-2xl bg-[#262626]">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Inbox Kosong</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">Belum ada surat masuk saat ini.</p>
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

                    <TabsContent value="approvals" className="space-y-4 mt-2">
                        {incomingApprovals?.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-800 rounded-2xl bg-[#262626]">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Semua Beres!</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">Tidak ada surat yang menunggu persetujuan Anda saat ini.</p>
                            </div>
                        ) : (
                            <>
                                {incomingApprovals?.data.map((mail) => (
                                    <MailCard key={mail.id} mail={mail} type="approved" />
                                ))}
                                <Pagination links={incomingApprovals?.links || []} />
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="sent" className="space-y-4 mt-2">
                        {sentMails.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-800 rounded-2xl bg-[#262626]">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                    <PenLine className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Belum Ada Surat Terkirim</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">Mulai buat surat pertama Anda. Semua surat yang dikirim akan tersimpan di sini.</p>
                                <Link href="/buat-surat">
                                    <Button className="bg-[#AC0021] hover:bg-[#8c001b] text-white gap-2 rounded-full px-6 transition-all shadow-lg shadow-red-900/20">
                                        <PenLine className="h-4 w-4" />
                                        <span>Tulis Surat Pertama</span>
                                    </Button>
                                </Link>
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

                    <TabsContent value="approved" className="space-y-4 mt-2">
                        {alreadyApprovedMails?.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-zinc-800 rounded-2xl bg-[#262626]">
                                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                    <Star className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Belum Ada Approval</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-6">Surat yang sudah Anda setujui akan ditampilkan di sini.</p>
                            </div>
                        ) : (
                            <>
                                {alreadyApprovedMails?.data.map((mail) => (
                                    <MailCard key={mail.id} mail={mail} type="approved-history" />
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

                {/* Mobile FAB - Only show on Inbox and Sent tabs, and hide when dialog is open */}
                {['inbox', 'sent'].includes(activeTab) && !showDetailDialog && (
                    <Link href="/buat-surat" className="md:hidden fixed bottom-24 right-6 z-[9999]">
                        <Button className="h-14 w-14 rounded-full bg-[#AC0021] hover:bg-[#8f2c00] text-white shadow-xl flex items-center justify-center p-0">
                            <Plus className="h-6 w-6" />
                        </Button>
                    </Link>
                )}
            </div>
        </AppLayout>
    );
}
