import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Send, Image as ImageIcon, Search, MoreVertical, Smile, Plus, Check, CheckCheck, FileText, X, Paperclip, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sheet } from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import ConversationInfo from './ConversationInfo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { ScrollArea } from '@/components/ui/scroll-area'; // Removed to use native scroll
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import axios from 'axios';
import NewChatModal from './NewChatModal';

import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

export default function MessagesIndex({ conversations, initialConversationId }: { conversations: Conversation[], initialConversationId?: string }) {
    const { auth } = usePage().props as any;
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
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

    // Auto-select conversation from prop
    useEffect(() => {
        if (initialConversationId && conversations.length > 0) {
            const target = conversations.find(c => c.id === parseInt(initialConversationId));
            if (target) {
                handleSelectConversation(target);
            }
        }
    }, [initialConversationId, conversations]);

    // Hide bottom navigation when chat is active on mobile
    useEffect(() => {
        const isMobile = window.innerWidth < 768; // md breakpoint
        if (isMobile && selectedConversation) {
            document.body.classList.add('hide-bottom-nav');
        } else {
            document.body.classList.remove('hide-bottom-nav');
        }

        return () => {
            document.body.classList.remove('hide-bottom-nav');
        };
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Real-time listeners
    useEffect(() => {
        if (selectedConversation) {
            // @ts-ignore
            window.Echo.private(`conversation.${selectedConversation.id}`)
                .listen('.message.sent', (e: { message: Message }) => {
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
        }

        return () => {
            if (selectedConversation) {
                // @ts-ignore
                window.Echo.leave(`conversation.${selectedConversation.id}`);
            }
        };
    }, [selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

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
            // URL update without reload
            window.history.replaceState({}, '', route('messages.index', { conversation_id: conversation.id }));
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
        router.visit(route('messages.index', { conversation_id: conversation.id }));
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
        <AppLayout className="!pb-0 !overflow-hidden">
            <Head title="Messages" />

            <div className="flex h-[100vh] md:h-[calc(100vh-5rem)] overflow-hidden md:rounded-lg border bg-background">
                {/* Sidebar */}
                <div className={`w-full md:w-80 border-r flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 h-16 flex items-center justify-between shrink-0">
                        <h2 className="font-semibold text-lg">Messages</h2>
                        <Button size="icon" variant="ghost" onClick={() => setNewChatOpen(true)}>
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Search Bar */}
                    <div className="px-4 pb-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search messages..."
                                className="pl-9 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Sidebar List - Using native scroll for consistency */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="flex flex-col">
                            {conversations
                                .filter(c => getConversationName(c).toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(conversation => (
                                    <button
                                        key={conversation.id}
                                        onClick={() => handleSelectConversation(conversation)}
                                        className={`flex items-center gap-3 p-4 hover:bg-accent/50 text-left transition-colors border-b ${selectedConversation?.id === conversation.id ? 'bg-accent' : ''}`}
                                    >
                                        <Avatar>
                                            <AvatarImage src={getConversationAvatar(conversation) || undefined} />
                                            <AvatarFallback>
                                                {getConversationName(conversation).substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium truncate block max-w-[140px]">
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
                                                    {conversation.last_message.sender?.id === auth.user.id ? 'You: ' : ''}
                                                    {conversation.last_message.body || 'Sent a file'}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            {conversations.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    No conversations yet. Start a new chat!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col min-w-0 ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversation ? (
                        <>
                            {/* Header */}
                            <div className="px-4 h-16 border-b flex items-center justify-between shrink-0">
                                {isSearchingMessage ? (
                                    <div className="flex items-center gap-2 w-full animate-in fade-in slide-in-from-top-2 duration-200">
                                        <Button variant="ghost" size="icon" onClick={() => { setIsSearchingMessage(false); setMessageSearchTerm(''); }}>
                                            <ArrowLeft className="h-5 w-5" />
                                        </Button>
                                        <Input
                                            autoFocus
                                            placeholder="Search in conversation..."
                                            className="bg-transparent border-none focus-visible:ring-0 px-0 h-9"
                                            value={messageSearchTerm}
                                            onChange={(e) => setMessageSearchTerm(e.target.value)}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConversation(null)}>
                                                <ArrowLeft className="h-5 w-5" />
                                            </Button>
                                            <Avatar className="cursor-pointer" onClick={() => setInfoOpen(true)}>
                                                <AvatarImage src={getConversationAvatar(selectedConversation) || undefined} />
                                                <AvatarFallback>
                                                    {getConversationName(selectedConversation).substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="cursor-pointer flex-1 min-w-0" onClick={() => setInfoOpen(true)}>
                                                <h3 className="font-semibold truncate">{getConversationName(selectedConversation)}</h3>
                                                {selectedConversation.is_group && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {selectedConversation.participants.length} members
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => setIsSearchingMessage(true)}>
                                                <Search className="h-5 w-5 text-muted-foreground" />
                                            </Button>
                                            {selectedConversation.is_group && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-5 w-5 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setInfoOpen(true)}>
                                                            Contact Info
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setIsSearchingMessage(true)}>
                                                            Search Messages
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Messages - Native Scroll Implementation */}
                            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                <div className="flex flex-col">
                                    {loadingMessages ? (
                                        <div className="text-center p-4">Loading messages...</div>
                                    ) : (
                                        messages
                                            .filter(msg => {
                                                if (!messageSearchTerm) return true;
                                                const lowerTerm = messageSearchTerm.toLowerCase();
                                                // Search body
                                                if (msg.body && msg.body.toLowerCase().includes(lowerTerm)) return true;
                                                // Search attachments name
                                                if (msg.attachments?.some((att: any) => att.name.toLowerCase().includes(lowerTerm))) return true;
                                                return false;
                                            })
                                            .map((msg, index, filteredMessages) => {
                                                const isMe = msg.user_id === auth.user.id;
                                                // Check relative to filtered list or original? Usually filtered list for visual continuity
                                                const isSameSender = index > 0 && filteredMessages[index - 1].user_id === msg.user_id;
                                                const showAvatar = !isMe && !isSameSender;

                                                // Dynamic spacing: larger gap between different senders
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
                                                            {msg.type === 'file' || msg.type === 'image' || (msg.attachments && msg.attachments.length > 0) ? (
                                                                <div className="space-y-1">
                                                                    {msg.attachments && msg.attachments.length > 0 ? (
                                                                        msg.attachments.map((att: any, i: number) => (
                                                                            <div key={i}>
                                                                                {(att.mime_type?.startsWith('image/') || msg.type === 'image') ? (
                                                                                    <img
                                                                                        src={att.url}
                                                                                        alt={att.name}
                                                                                        className="rounded-lg max-w-full sm:max-w-[240px] max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
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

                            {/* Input - Docked at bottom, full width, no margin gaps */}
                            <div className="p-4 pb-6 md:pb-4 border-t bg-background flex flex-col gap-2 shrink-0">
                                {selectedFile && (
                                    <div className="flex items-center gap-2 px-2 py-1 bg-accent/50 rounded-lg w-fit">
                                        <span className="text-xs truncate max-w-[200px]">{selectedFile.name}</span>
                                        <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-destructive">x</button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
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
                                            placeholder="Message..."
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                        />
                                    </form>
                                    {newMessage || selectedFile ? (
                                        <button onClick={handleSendMessage} className="text-blue-500 font-semibold text-sm">Send</button>
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
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                                <Send className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <p className="text-lg font-medium">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>

                {/* Image Preview Modal */}
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
            </div>


            <NewChatModal
                open={newChatOpen}
                onOpenChange={setNewChatOpen}
                onConversationCreated={handleConversationCreated}
            />

            {selectedConversation && (
                <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
                    <ConversationInfo
                        conversation={selectedConversation}
                        files={messages.filter(m => m.type === 'image' || m.type === 'file' || (m.attachments && m.attachments.length > 0))}
                        currentUser={auth.user}
                    />
                </Sheet>
            )}
        </AppLayout>
    );
}
