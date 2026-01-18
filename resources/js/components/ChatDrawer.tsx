
import React, { useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Send, Image as ImageIcon, Search, MoreVertical, Smile, Plus, Check, CheckCheck, FileText, X, Paperclip, ArrowLeft, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import axios from 'axios';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import NewChatModal from '@/Pages/Messages/NewChatModal';
import ConversationInfo from '@/Pages/Messages/ConversationInfo';

interface Message {
    id: number;
    body: string;
    sender: User;
    user_id: number;
    created_at: string;
    read_at?: string;
    delivered_at?: string;
    type?: 'text' | 'file' | 'image';
    attachments?: any[];
}

interface User {
    id: number;
    name: string;
    avatar?: string;
    email: string;
}

interface Conversation {
    id: number;
    name?: string;
    is_group: boolean;
    created_by?: number;
    avatar?: string;
    participants: User[];
    last_message?: Message;
    updated_at: string;
}

export function ChatDrawer({ children, open, onOpenChange }: { children?: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) {
    const { auth } = usePage().props as any;
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [newChatOpen, setNewChatOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Chat Options State
    const [infoOpen, setInfoOpen] = useState(false);
    const [isSearchingMessage, setIsSearchingMessage] = useState(false);
    const [messageSearchTerm, setMessageSearchTerm] = useState('');

    // Fetch conversations when drawer opens
    useEffect(() => {
        if (open) {
            fetchConversations();
        }
    }, [open]);

    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const response = await axios.get(route('api.conversations.index'));
            setConversations(response.data);
        } catch (error) {
            console.error("Failed to load conversations", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Real-time listeners
    useEffect(() => {
        if (selectedConversation) {
            // @ts-ignore
            const channel = window.Echo.private(`conversation.${selectedConversation.id}`);
            
            channel.listen('.message.sent', (e: { message: Message }) => {
                    setMessages(prev => {
                        if (prev.some(m => m.id === e.message.id)) return prev;
                        return [...prev, e.message];
                    });
                    // Mark as read immediately if we are viewing it
                    markAsRead(selectedConversation.id);
                })
                .listen('.message.updated', (e: { message: Message }) => {
                    setMessages(prev => prev.map(m => m.id === e.message.id ? { ...m, ...e.message } : m));
                });

            // Initial mark as read
            markAsRead(selectedConversation.id);

            return () => {
                // @ts-ignore
                window.Echo.leave(`conversation.${selectedConversation.id}`);
            };
        }
    }, [selectedConversation]);

    const markAsRead = async (conversationId: number) => {
        try {
            await axios.post(`/messages/${conversationId}/read`);
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setLoadingMessages(true);
        // Reset search states
        setIsSearchingMessage(false);
        setMessageSearchTerm('');
        try {
            const response = await axios.get(route('messages.show', conversation.id));
            setMessages(response.data.messages);
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedConversation) return;

        const tempId = Date.now();
        // Optimistic update
        const tempMsg: Message = {
            id: tempId,
            body: selectedFile ? (newMessage || 'Sending file...') : newMessage,
            user_id: auth.user.id,
            created_at: new Date().toISOString(),
            sender: auth.user,
            type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
            attachments: selectedFile ? [{
                name: selectedFile.name,
                url: URL.createObjectURL(selectedFile),
                mime_type: selectedFile.type,
                size: selectedFile.size
            }] : []
        };
        setMessages([...messages, tempMsg]);
        const messageText = newMessage;
        const fileToSend = selectedFile;

        setNewMessage('');
        setSelectedFile(null);

        // Send to backend
        try {
            const formData = new FormData();
            formData.append('body', messageText || '');
            if (fileToSend) formData.append('attachments[]', fileToSend);

            const response = await axios.post(`/messages/${selectedConversation.id}`, formData, {
                headers: {
                    // @ts-ignore
                    'X-Socket-Id': window.Echo.socketId(),
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Replace optimistic message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? response.data.message : m));
        } catch (error) {
            console.error('Failed to send message:', error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            setNewMessage(messageText);
            setSelectedFile(fileToSend);
        }
    };

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleConversationCreated = (conversation: Conversation) => {
        setNewChatOpen(false);
        fetchConversations(); // Refresh list
        handleSelectConversation(conversation);
    };

    const getOtherParticipant = (conversation: Conversation) => {
        if (conversation.is_group) return null;
        return conversation.participants.find(p => p.id !== auth.user.id);
    };

    const getConversationName = (conversation: Conversation) => {
        if (conversation.is_group) return conversation.name || 'Group Chat';
        const other = getOtherParticipant(conversation);
        return other ? other.name : 'Unknown User';
    };

    const getConversationAvatar = (conversation: Conversation) => {
        if (conversation.is_group) return conversation.avatar || null;
        const other = getOtherParticipant(conversation);
        return other ? other.avatar : null;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="!w-full w-full sm:!max-w-[440px] p-0 gap-0 border-l border-border bg-background shadow-2xl overflow-hidden [&>button]:hidden">
                <div className="flex flex-col h-full w-full">
                    
                    {/* Main Sidebar View (Conversation List) */}
                    <div className={`flex flex-col h-full w-full absolute inset-0 transition-transform duration-300 ${selectedConversation ? '-translate-x-full' : 'translate-x-0'}`}>
                        {/* Header */}
                        <div className="p-4 h-16 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-10">
                            <h2 className="font-bold text-xl">Pesan</h2>
                            <Button size="icon" variant="ghost" onClick={() => onOpenChange?.(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
        
                        {/* Search Bar & New Chat Button */}
                        <div className="px-4 pb-4 space-y-3 border-b shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari pesan..."
                                    className="pl-9 bg-background border-zinc-700/50 focus-visible:ring-zinc-700"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full bg-[#d04438] hover:bg-[#b9382e] text-white flex items-center justify-center gap-2"
                                onClick={() => setNewChatOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                                Pesan Baru
                            </Button>
                        </div>
        
                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto w-full">
                            <div className="flex flex-col w-full">
                                {loadingConversations ? (
                                    <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
                                ) : (
                                    conversations
                                        .filter(c => getConversationName(c).toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map(conversation => (
                                            <button
                                                key={conversation.id}
                                                onClick={() => handleSelectConversation(conversation)}
                                                className={`flex items-center gap-3 p-4 hover:bg-zinc-800/30 text-left transition-colors border-b border-border/50 w-full`}
                                            >
                                                <Avatar>
                                                    <AvatarImage src={getConversationAvatar(conversation) || undefined} />
                                                    <AvatarFallback>
                                                        {getConversationName(conversation).substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-medium truncate block max-w-[140px] text-foreground">
                                                            {getConversationName(conversation)}
                                                        </span>
                                                        {conversation.last_message && (
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                                {format(new Date(conversation.last_message.created_at), 'HH:mm')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conversation.last_message && (
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {conversation.last_message.sender?.id === auth.user.id ? 'Anda: ' : ''}
                                                            {conversation.last_message.body || 'Mengirim file'}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        ))
                                )}
                                {!loadingConversations && conversations.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center mt-20">
                                        <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                                                <div className="relative">
                                                <MessageSquare className="h-8 w-8 text-zinc-400" />
                                                </div>
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-200 mb-2">Belum ada pesan</h3>
                                        <p className="text-sm text-zinc-500 max-w-[200px]">
                                            Mulai percakapan dengan mengklik tombol Pesan Baru
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Detail View (Sliding in) */}
                     <div className={`flex flex-col h-full w-full absolute inset-0 bg-background transition-transform duration-300 ${selectedConversation ? 'translate-x-0' : 'translate-x-full'}`}>
                        {selectedConversation && (
                            <>
                                {/* Chat Header */}
                                <div className="px-4 h-16 border-b flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-10 w-full">
                                    <div className="flex items-center gap-3 w-full overflow-hidden">
                                        <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                        <Avatar className="cursor-pointer shrink-0" onClick={() => setInfoOpen(true)}>
                                            <AvatarImage src={getConversationAvatar(selectedConversation) || undefined} />
                                            <AvatarFallback>
                                                {getConversationName(selectedConversation).substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="cursor-pointer flex-1 min-w-0" onClick={() => setInfoOpen(true)}>
                                            <h3 className="font-semibold truncate text-foreground">{getConversationName(selectedConversation)}</h3>
                                            {selectedConversation.is_group && (
                                                <p className="text-xs text-muted-foreground">
                                                    {selectedConversation.participants.length} anggota
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1 shrink-0">
                                         {selectedConversation.is_group && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setInfoOpen(true)}>
                                                        Info Kontak
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar w-full bg-background">
                                    <div className="flex flex-col w-full">
                                        {loadingMessages ? (
                                            <div className="text-center p-4 text-muted-foreground">Memuat pesan...</div>
                                        ) : (
                                            messages.map((msg, index) => {
                                                const isMe = msg.user_id === auth.user.id;
                                                const isSameSender = index > 0 && messages[index - 1].user_id === msg.user_id;
                                                const showAvatar = !isMe && !isSameSender;
                                                const spacingClass = isSameSender ? 'mt-1' : 'mt-4';

                                                return (
                                                    <div key={msg.id} className={`flex gap-3 ${spacingClass} ${isMe ? 'items-end justify-end' : 'items-end'}`}>
                                                        {!isMe && (
                                                            <div className="w-8 shrink-0">
                                                                {showAvatar && (
                                                                    <Avatar className="w-8 h-8">
                                                                        <AvatarImage src={msg.sender?.avatar} />
                                                                        <AvatarFallback>{msg.sender?.name?.[0]}</AvatarFallback>
                                                                    </Avatar>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className={`max-w-[70%] rounded-2xl text-sm shadow-sm ${msg.type === 'image' || (msg.attachments && msg.attachments.length > 0) ? 'p-1' : 'px-4 py-2'} ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                                                            {/* Message Content Render Logic */}
                                                            {msg.type === 'file' || msg.type === 'image' || (msg.attachments && msg.attachments.length > 0) ? (
                                                                <div className="space-y-1">
                                                                     {msg.attachments && msg.attachments.length > 0 ? (
                                                                        msg.attachments.map((att: any, i: number) => (
                                                                            <div key={i}>
                                                                                {(att.mime_type?.startsWith('image/') || msg.type === 'image') ? (
                                                                                    <img
                                                                                        src={att.url}
                                                                                        alt={att.name}
                                                                                        className="rounded-lg max-w-full sm:max-w-[200px] max-h-[200px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                                                                        onClick={() => setPreviewImage(att.url)}
                                                                                    />
                                                                                ) : (
                                                                                    <a
                                                                                        href={att.url}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${isMe ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}
                                                                                        download
                                                                                    >
                                                                                        <FileText className="h-4 w-4 shrink-0" />
                                                                                        <div className="overflow-hidden">
                                                                                            <p className="truncate font-medium">{att.name}</p>
                                                                                            <p className="text-[10px] opacity-70">{att.size ? (att.size / 1024).toFixed(1) + ' KB' : 'File'}</p>
                                                                                        </div>
                                                                                    </a>
                                                                                )}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded">
                                                                            <ImageIcon className="h-4 w-4" />
                                                                            <span>Processing...</span>
                                                                        </div>
                                                                    )}
                                                                    {msg.body && msg.body !== 'Sending file...' && (
                                                                        <div className="pt-1">{msg.body}</div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div>{msg.body}</div>
                                                            )}
                                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-blue-100' : 'text-muted-foreground'}`}>
                                                                {format(new Date(msg.created_at), 'HH:mm')}
                                                                {isMe && (
                                                                    <span>
                                                                        {msg.read_at ? <CheckCheck className="h-3 w-3 text-blue-300" /> : <Check className="h-3 w-3" />}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                {/* Input Area */}
                                <div className="p-4 pb-6 border-t bg-background flex flex-col gap-2 shrink-0 w-full">
                                    {selectedFile && (
                                        <div className="flex items-center gap-2 px-2 py-1 bg-accent/50 rounded-lg w-fit">
                                            <span className="text-xs truncate max-w-[200px]">{selectedFile.name}</span>
                                            <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-destructive">x</button>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 w-full">
                                        <Popover>
                                            <PopoverTrigger>
                                                <Smile className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground" />
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0 border-none" side="top">
                                                <EmojiPicker onEmojiClick={onEmojiClick} />
                                            </PopoverContent>
                                        </Popover>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                        />
                                        <input
                                            type="file"
                                            ref={documentInputRef}
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />

                                        <form onSubmit={handleSendMessage} className="flex-1">
                                            <input
                                                className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground"
                                                placeholder="Ketik pesan..."
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                            />
                                        </form>
                                        {newMessage || selectedFile ? (
                                            <button onClick={handleSendMessage} className="text-blue-500 font-semibold text-sm">Kirim</button>
                                        ) : (
                                            <>
                                                <Paperclip
                                                    className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground"
                                                    onClick={() => documentInputRef.current?.click()}
                                                />
                                                <ImageIcon
                                                    className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground"
                                                    onClick={() => fileInputRef.current?.click()}
                                                />
                                                <Send className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground" />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </SheetContent>

             <NewChatModal
                open={newChatOpen}
                onOpenChange={setNewChatOpen}
                onConversationCreated={handleConversationCreated}
            />

            {/* Image Preview Modal Helper (Global or Local?) - For now simplified */}
             <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-10 -right-0 text-white hover:bg-white/20 rounded-full"
                            onClick={() => setPreviewImage(null)}
                        >
                            <X className="h-6 w-6" />
                        </Button>
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Preview"
                                className="max-h-[85vh] max-w-full rounded-lg object-contain"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

        </Sheet>
    );
}
