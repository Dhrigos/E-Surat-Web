import React, { useState, useEffect, useRef } from 'react';
import { usePage, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Send, Image as ImageIcon, Search, MoreVertical, Smile, Plus, Check, CheckCheck, FileText, X, Paperclip, ArrowLeft, MessageSquare, UserCog, File, Video, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import axios from 'axios';
import { toast } from 'sonner';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

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
    jabatan?: { name: string };
    roles?: { name: string }[];
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
    unread_count?: number;
    can_manage?: boolean;
}


export function ChatDrawer() {
    const { auth } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [view, setView] = useState<'list' | 'chat' | 'new' | 'info' | 'search' | 'media' | 'edit_group' | 'add_member'>('list');

    // Data States
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [foundUsers, setFoundUsers] = useState<User[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]); // Track online user IDs

    // Selection States
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

    // Form States
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [chatType, setChatType] = useState<'personal' | 'group'>('personal');
    const [groupName, setGroupName] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // UI States
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingConversations, setLoadingConversations] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [messageSearchTerm, setMessageSearchTerm] = useState('');
    const [infoTab, setInfoTab] = useState<'info' | 'media' | 'manage'>('info');

    const handleUpdateGroup = async () => {
        if (!selectedConversation) return;

        try {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            if (groupName && groupName !== selectedConversation.name) {
                formData.append('name', groupName);
            }
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await axios.post(`/chat/conversations/${selectedConversation.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setConversations(conversations.map(c =>
                c.id === selectedConversation.id ? response.data.conversation : c
            ));
            setSelectedConversation(response.data.conversation);
            setAvatarFile(null); // Reset file input
            toast.success('Grup berhasil diperbarui');
            setView('info');
        } catch (error) {
            console.error('Failed to update group:', error);
            toast.error('Gagal memperbarui grup');
        }
    };

    const handleAddParticipant = async (userId: number) => {
        if (!selectedConversation) return;
        try {
            await axios.post(route('conversations.participants.add', selectedConversation.id), {
                users: [userId]
            });
            toast.success('Member added');
            fetchConversations();
            // Refetch specific conversation
            const res = await axios.get(route('messages.show', selectedConversation.id));
            setSelectedConversation(res.data.conversation);
            setFoundUsers([]);
            setUserSearchTerm('');
        } catch (error) {
            toast.error('Failed to add member');
        }
    };

    const handleRemoveParticipant = async (userId: number) => {
        if (!selectedConversation || !confirm('Hapus anggota ini?')) return;
        try {
            await axios.delete(route('conversations.participants.remove', {
                conversation: selectedConversation.id,
                user: userId
            }));
            toast.success('Member removed');
            const res = await axios.get(route('messages.show', selectedConversation.id));
            setSelectedConversation(res.data.conversation);
        } catch (error) {
            toast.error('Failed to remove member');
        }
    };

    const handleRenameGroup = async () => {
        if (!selectedConversation || !groupName.trim()) return;
        try {
            const res = await axios.patch(route('conversations.update', selectedConversation.id), {
                name: groupName
            });
            toast.success('Group updated');
            setSelectedConversation(res.data.conversation);
            fetchConversations();
        } catch (error) {
            toast.error('Failed to update group');
        }
    };

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const documentInputRef = useRef<HTMLInputElement>(null);
    const isOpeningFromEvent = useRef(false);

    // Fetch conversations when drawer opens
    useEffect(() => {
        if (open) {
            fetchConversations();

            // Only reset if NOT opening from event
            if (!isOpeningFromEvent.current) {
                setView('list');
                setMessages([]);
                setSelectedConversation(null);
                setSelectedUsers([]);
                setGroupName('');
                setUserSearchTerm('');
            }

            // Reset flag
            isOpeningFromEvent.current = false;
        } else {
            // When drawer closes, ensure we reset the selected conversation ref
            // So that background notifications count as unread!
            setSelectedConversation(null);
        }
    }, [open]);

    // Join presence channel for online status tracking
    useEffect(() => {
        if (!window.Echo || !open) {
            return;
        }

        const channel = (window as any).Echo.join('chat.online')
            .here((users: any[]) => {
                // Set initial online users
                setOnlineUsers(users.map((u: any) => u.id));
            })
            .joining((user: any) => {
                // Add user to online list
                setOnlineUsers(prev => [...prev, user.id]);
            })
            .leaving((user: any) => {
                // Remove user from online list
                setOnlineUsers(prev => prev.filter(id => id !== user.id));
            });

        return () => {
            (window as any).Echo.leave('chat.online');
        };
    }, [open]);

    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const response = await axios.get(route('api.conversations.index'));
            setConversations(response.data);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setLoadingConversations(false);
        }
    };

    // Use Ref to track selected conversation ID without triggering re-renders/re-subscriptions
    const selectedConversationIdRef = useRef<number | null>(null);

    useEffect(() => {
        selectedConversationIdRef.current = selectedConversation?.id || null;
    }, [selectedConversation]);

    // Real-time listener
    useEffect(() => {
        if (!auth.user?.id) return;

        // Listen for notifications
        // @ts-ignore
        const channel = window.Echo.private(`App.Models.User.${auth.user.id}`);

        channel.notification((notification: any) => {
            // Check for both possible type formats (custom 'message' or Class Name)
            // Also check if it has conversation_id to be sure it's a chat message
            const isChatMessage =
                notification.type === 'message' ||
                notification.type === 'App\\Notifications\\NewMessageReceived' ||
                (notification.conversation_id && notification.body); // Fallback check

            if (isChatMessage) {
                // Play sound
                const audio = new Audio('/sounds/message.mp3');
                audio.play().catch(e => console.log('Audio play failed', e));

                // Update conversations list
                setConversations(prev => {
                    const convId = parseInt(notification.conversation_id);
                    const existingConvIndex = prev.findIndex(c => c.id === convId);

                    if (existingConvIndex > -1) {
                        // Update existing conversation
                        const updatedConv = { ...prev[existingConvIndex] };

                        // Update last message preview
                        updatedConv.last_message = {
                            id: notification.message_id,
                            body: notification.body,
                            sender: { id: notification.sender_id, name: notification.sender_name, email: '' },
                            user_id: notification.sender_id,
                            created_at: new Date().toISOString(),
                            conversation_id: notification.conversation_id
                        } as any;

                        updatedConv.updated_at = new Date().toISOString();

                        // Increment unread count ONLY if not currently viewing this conversation
                        if (selectedConversationIdRef.current !== convId) {
                            updatedConv.unread_count = (updatedConv.unread_count || 0) + 1;
                        } else {
                            // If currently viewing, ensure count is 0
                            updatedConv.unread_count = 0;
                        }

                        // Move to top
                        const newConversations = [...prev];
                        newConversations.splice(existingConvIndex, 1);
                        return [updatedConv, ...newConversations];
                    } else {
                        // New conversation, fetch fresh list to be safe
                        fetchConversations();
                        return prev;
                    }
                });
            }
        });

        return () => {
            channel.stopListening('.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated');
        };
    }, [auth.user?.id]); // Removed selectedConversation dependency to prevent re-subscribing

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (selectedConversation) {
            // @ts-ignore
            window.Echo.private(`conversation.${selectedConversation.id}`)
                .listen('.message.sent', (e: { message: Message }) => {
                    setMessages(prev => {
                        if (prev.some(m => m.id === e.message.id)) return prev;
                        return [...prev, e.message];
                    });
                    markAsRead(selectedConversation.id);
                })
                .listen('.message.updated', (e: { message: Message }) => {
                    setMessages(prev => prev.map(m => m.id === e.message.id ? { ...m, ...e.message } : m));
                });

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

    // Load users when entering new chat view
    useEffect(() => {
        if (view === 'new') {
            handleSearchUsers('');
        }
    }, [view]);

    // Listener for opening chat from notification click (Global Access)
    useEffect(() => {
        const handleOpenChat = async (event: CustomEvent) => {
            const { conversationId } = event.detail;
            if (!conversationId) return;

            // Set flag so the 'open' useEffect doesn't reset our state
            isOpeningFromEvent.current = true;
            setOpen(true);

            // We need to fetch the conversation details to open it properly
            try {
                // First, ensure we're not already loading it (use Ref for stability)
                if (selectedConversationIdRef.current === parseInt(conversationId)) return;

                setLoadingMessages(true); // Show loading state immediately

                // Fetch full conversation details + messages
                const response = await axios.get(route('messages.show', conversationId));
                const { conversation, messages } = response.data;

                // Update conversation list if needed
                setConversations(prev => {
                    const exists = prev.find(c => c.id === conversation.id);
                    if (exists) return prev;
                    return [conversation, ...prev];
                });

                // Set state directly to open chat
                setMessages(messages);
                setSelectedConversation(conversation);
                setView('chat');

                // Mark as read logic
                if ((conversation.unread_count ?? 0) > 0) {
                    await axios.post(route('messages.read', conversation.id));
                    window.dispatchEvent(new CustomEvent('conversation-opened', {
                        detail: { conversationId: conversation.id }
                    }));
                }

            } catch (error) {
                console.error("Failed to open conversation from notification", error);
                isOpeningFromEvent.current = false; // Reset on error
            } finally {
                setLoadingMessages(false);
            }
        };

        window.addEventListener('open-chat-conversation' as any, handleOpenChat as any);
        return () => {
            window.removeEventListener('open-chat-conversation' as any, handleOpenChat as any);
        };
    }, []); // Empty dependency array ensures listener is bound ONCE and stable

    // Listener for generic drawer open (from sidebar/header buttons)
    useEffect(() => {
        const handleOpenDrawer = () => setOpen(true);
        window.addEventListener('open-chat-drawer', handleOpenDrawer);
        return () => window.removeEventListener('open-chat-drawer', handleOpenDrawer);
    }, []);

    const handleSearchUsers = async (query: string) => {
        setUserSearchTerm(query);
        setLoadingUsers(true);
        try {
            const response = await axios.get(route('api.users.search'), { params: { query } });
            setFoundUsers(response.data);
        } catch (error) {
            console.error("Failed to search users", error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setLoadingMessages(true);
        try {
            const response = await axios.get(route('messages.show', conversation.id));
            setMessages(response.data.messages);
            setView('chat');

            // Auto mark as read when conversation is opened (WhatsApp style)
            if ((conversation.unread_count ?? 0) > 0) {
                await axios.post(route('messages.read', conversation.id));

                // Dispatch event to notify AppHeader to clear notifications
                window.dispatchEvent(new CustomEvent('conversation-opened', {
                    detail: { conversationId: conversation.id }
                }));

                // Update local state to reflect read status
                setConversations(prev => prev.map(c =>
                    c.id === conversation.id ? { ...c, unread_count: 0 } : c
                ));
            }
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleStartChat = async () => {
        if (selectedUsers.length === 0) return;

        try {
            const response = await axios.post(route('conversations.store'), {
                users: selectedUsers.map(u => u.id),
                is_group: chatType === 'group',
                name: chatType === 'group' ? groupName : undefined
            });

            const newConv = response.data.conversation || response.data; // Adjust based on API response

            // Refresh conversations
            await fetchConversations();

            // Open the new conversation
            handleSelectConversation(newConv);

            // Reset states
            setSelectedUsers([]);
            setGroupName('');
            setUserSearchTerm('');
            setChatType('personal');
        } catch (error) {
            console.error("Failed to create conversation", error);
        }
    };

    const toggleUserSelection = (user: User) => {
        if (chatType === 'personal') {
            setSelectedUsers([user]);
        } else {
            setSelectedUsers(prev =>
                prev.find(u => u.id === user.id)
                    ? prev.filter(u => u.id !== user.id)
                    : [...prev, user]
            );
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !selectedConversation) return;

        const tempId = Date.now();
        const tempMsg: Message = {
            id: tempId,
            body: selectedFile ? (newMessage || 'Mengirim file...') : newMessage,
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

        try {
            const formData = new FormData();
            formData.append('body', messageText || '');
            if (fileToSend) formData.append('attachments[]', fileToSend);

            const response = await axios.post(`/messages/${selectedConversation.id}`, formData, {
                headers: {
                    'X-Socket-Id': (window as any).Echo.socketId(),
                    'Content-Type': 'multipart/form-data'
                }
            });

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

    const getConversationName = (conversation: Conversation) => {
        if (conversation.is_group) return conversation.name || 'Group Chat';
        const other = conversation.participants.find(p => p.id !== auth.user.id);
        return other ? other.name : 'Unknown User';
    };

    const getConversationAvatar = (conversation: Conversation) => {
        if (conversation.is_group) return conversation.avatar || null;
        const other = conversation.participants.find(p => p.id !== auth.user.id);
        return other ? other.avatar : null;
    };

    const isUserOnline = (conversation: Conversation) => {
        if (conversation.is_group) return false;
        const other = conversation.participants.find(p => p.id !== auth.user.id);
        return other ? onlineUsers.includes(other.id) : false;
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-md p-0 flex flex-col bg-background border-l border-border">
                <SheetTitle className="sr-only">Chat</SheetTitle>
                <SheetDescription className="sr-only">Chat Drawer</SheetDescription>

                {view === 'list' && (
                    <div className="flex-1 flex flex-col h-full bg-[#262626] text-zinc-100">
                        {/* Header */}
                        <div className="px-5 py-4 flex items-center justify-between shrink-0">
                            <h2 className="font-bold text-2xl tracking-tight">Pesan</h2>
                        </div>

                        {/* Search & New Chat Action */}
                        <div className="px-5 pb-2 space-y-3 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    placeholder="Cari pesan..."
                                    className="pl-9 h-10 bg-[#1e1e1e] border-zinc-800 text-sm placeholder:text-zinc-500 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 rounded-lg text-zinc-200"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full h-10 bg-[#d04438] hover:bg-[#b9382e] text-white font-medium flex items-center justify-center gap-2 rounded-lg transition-all"
                                onClick={() => { setView('new'); }}
                            >
                                <Plus className="h-4 w-4" />
                                Pesan Baru
                            </Button>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-zinc-800 mx-5 my-2"></div>

                        {/* Conversation List */}
                        <div className="flex-1 overflow-y-auto px-2">
                            {loadingConversations ? (
                                <div className="p-8 text-center text-zinc-500 text-sm">Memuat percakapan...</div>
                            ) : (
                                <div className="flex flex-col space-y-1 pb-4">
                                    {conversations
                                        .filter(c => getConversationName(c).toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map(conversation => (
                                            <button
                                                key={conversation.id}
                                                onClick={() => handleSelectConversation(conversation)}
                                                className={`flex items-center gap-3 p-3 mx-2 rounded-xl hover:bg-[#1e1e1e] transition-colors text-left group ${(conversation.unread_count ?? 0) > 0 ? 'bg-[#1a1a1a]' : ''
                                                    }`}
                                            >
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-12 w-12 border border-white/5">
                                                        <AvatarImage src={getConversationAvatar(conversation) || undefined} />
                                                        <AvatarFallback className="bg-orange-600 text-white font-medium text-sm">
                                                            {getConversationName(conversation).substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {!conversation.is_group && isUserOnline(conversation) && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#262626]">
                                                            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                                                        </div>
                                                    )}
                                                    {conversation.is_group && (
                                                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-zinc-700 rounded-full border-2 border-[#262626] flex items-center justify-center">
                                                            <UserCog className="h-3 w-3 text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {/* Name and Time on same line */}
                                                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                                        <span className={`truncate text-[15px] ${(conversation.unread_count ?? 0) > 0
                                                            ? 'font-bold text-white'
                                                            : 'font-semibold text-zinc-100'
                                                            }`}>
                                                            {getConversationName(conversation)}
                                                        </span>
                                                        {conversation.last_message && (
                                                            <span className="text-xs text-zinc-500 shrink-0">
                                                                {format(new Date(conversation.last_message.created_at), 'HH:mm')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Message preview below */}
                                                    <div className="flex items-center gap-1.5">
                                                        <p className={`text-sm truncate group-hover:text-zinc-400 flex items-center gap-1 flex-1 min-w-0 ${(conversation.unread_count ?? 0) > 0
                                                            ? 'text-zinc-200 font-semibold'
                                                            : 'text-zinc-500'
                                                            }`}>
                                                            {conversation.last_message ? (
                                                                <>
                                                                    {conversation.last_message.type === 'image' || conversation.last_message.attachments?.some(att => att.mime_type?.startsWith('image/')) ? (
                                                                        <>
                                                                            <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                                                                            <span className="truncate">
                                                                                {conversation.last_message.sender?.id === auth.user.id ? 'Anda: ' : ''}
                                                                                Foto
                                                                            </span>
                                                                        </>
                                                                    ) : conversation.last_message.type === 'file' || (conversation.last_message.attachments && conversation.last_message.attachments.length > 0) ? (
                                                                        <>
                                                                            <FileText className="h-3.5 w-3.5 shrink-0" />
                                                                            <span className="truncate">
                                                                                {conversation.last_message.sender?.id === auth.user.id ? 'Anda: ' : ''}
                                                                                {conversation.last_message.attachments?.[0]?.name || 'File'}
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <span className="truncate">
                                                                            {conversation.last_message.sender?.id === auth.user.id && 'Anda: '}
                                                                            {conversation.last_message.body || 'Pesan'}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                'Belum ada pesan'
                                                            )}
                                                        </p>
                                                        {(conversation.unread_count ?? 0) > 0 && (
                                                            <div className="shrink-0 bg-green-600 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                                                                {(conversation.unread_count ?? 0) > 99 ? '99+' : conversation.unread_count}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    {conversations.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-70">
                                            <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-4">
                                                <MessageSquare className="h-8 w-8 text-zinc-600" />
                                            </div>
                                            <h3 className="text-zinc-300 font-medium mb-1">Belum ada percakapan</h3>
                                            <p className="text-sm text-zinc-500 max-w-[200px]">
                                                Mulai chat baru dengan rekan kerja Anda
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'new' && (
                    <div className="flex-1 flex flex-col h-full">
                        <div className="p-4 h-16 flex items-center gap-3 shrink-0 border-b">
                            <Button variant="ghost" size="icon" onClick={() => setView('list')} className="-ml-2">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h2 className="font-bold text-xl">Pesan Baru</h2>
                        </div>

                        <div className="flex flex-col flex-1 min-h-0">
                            {/* Fixed Header Section (Tabs & Search) */}
                            <div className="p-4 space-y-4 shrink-0">
                                {/* Tabs */}
                                <div className="grid grid-cols-2 gap-2 bg-zinc-800/50 p-1 rounded-full">
                                    <button
                                        onClick={() => { setChatType('personal'); setSelectedUsers([]); }}
                                        className={`flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${chatType === 'personal' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                    >
                                        <UserCog className="h-4 w-4" />
                                        Chat Personal
                                    </button>
                                    <button
                                        onClick={() => { setChatType('group'); setSelectedUsers([]); }}
                                        className={`flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all ${chatType === 'group' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Buat Grup
                                    </button>
                                </div>

                                {chatType === 'group' && (
                                    <>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-zinc-100">
                                                Nama Grup <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                placeholder="Masukkan nama grup..."
                                                className="bg-zinc-900/50 border-zinc-700/50 focus-visible:ring-zinc-700 placeholder:text-zinc-600"
                                                value={groupName}
                                                onChange={(e) => setGroupName(e.target.value)}
                                            />
                                        </div>

                                        <div className="bg-yellow-950/20 border border-yellow-600/30 rounded-lg p-3 flex gap-3">
                                            <div className="shrink-0 mt-0.5">
                                                <div className="bg-blue-500 text-white rounded-[2px] w-4 h-4 flex items-center justify-center text-[10px] font-bold">i</div>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-yellow-500 text-xs font-bold">Informasi Penting</h4>
                                                <p className="text-zinc-300 text-[11px] leading-tight">
                                                    Admin (Dr. Ahmad Wijaya) dan Superadmin (Siti Nurhaliza) akan otomatis ditambahkan ke setiap grup yang dibuat.
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Media & File Tab Content */}
                                {infoTab === 'media' && (
                                    <div className="space-y-4">
                                        {/* Images */}
                                        {messages.filter(msg => msg.type === 'image' || msg.attachments?.some(att => att.mime_type?.startsWith('image/'))).length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Gambar</h3>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {messages
                                                        .filter(msg => msg.type === 'image' || msg.attachments?.some(att => att.mime_type?.startsWith('image/')))
                                                        .flatMap(msg => msg.attachments || [])
                                                        .filter(att => att.mime_type?.startsWith('image/'))
                                                        .map((att, idx) => (
                                                            <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-[#1e1e1e] border border-white/5">
                                                                <img src={att.url} alt={att.name} className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" />
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Files */}
                                        {messages.filter(msg => msg.type === 'file' || msg.attachments?.some(att => !att.mime_type?.startsWith('image/'))).length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-zinc-400 mb-3">Dokumen</h3>
                                                <div className="space-y-2">
                                                    {messages
                                                        .filter(msg => msg.type === 'file' || msg.attachments?.some(att => !att.mime_type?.startsWith('image/')))
                                                        .flatMap(msg => msg.attachments || [])
                                                        .filter(att => !att.mime_type?.startsWith('image/'))
                                                        .map((att, idx) => (
                                                            <a
                                                                key={idx}
                                                                href={att.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 p-3 rounded-lg bg-[#1e1e1e] border border-white/5 hover:bg-[#252525] transition-colors"
                                                            >
                                                                <div className="bg-red-500/20 p-2 rounded">
                                                                    <FileText className="h-5 w-5 text-red-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-medium text-sm text-zinc-200 truncate">{att.name}</p>
                                                                    <p className="text-xs text-zinc-500 uppercase">{att.mime_type?.split('/')[1] || 'FILE'}</p>
                                                                </div>
                                                            </a>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        {messages.filter(msg => msg.attachments && msg.attachments.length > 0).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-4">
                                                    <FileText className="h-8 w-8 text-zinc-600" />
                                                </div>
                                                <h3 className="text-zinc-300 font-medium mb-1">Belum ada media</h3>
                                                <p className="text-sm text-zinc-500">Media dan file akan muncul di sini</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Search */}
                                <div className="space-y-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari kontak..."
                                            className="pl-9 bg-background border-zinc-700/50 focus-visible:ring-zinc-700"
                                            value={userSearchTerm}
                                            onChange={(e) => handleSearchUsers(e.target.value)}
                                        />
                                    </div>

                                    {chatType === 'group' && (
                                        <div className="border border-red-900/50 bg-red-950/10 rounded-lg p-3">
                                            <p className="text-zinc-200 text-sm font-medium">
                                                <span className="text-white font-bold">{selectedUsers.length} anggota dipilih</span> + Anda + Admin + Superadmin =
                                                <span className="text-white font-bold ml-1">{selectedUsers.length + 3} total anggota</span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Scrollable User List */}
                            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
                                {loadingUsers ? (
                                    <div className="text-center text-muted-foreground py-8 text-sm">
                                        Memuat kontak...
                                    </div>
                                ) : (
                                    <>
                                        {foundUsers.map(user => {
                                            const isSelected = !!selectedUsers.find(u => u.id === user.id);
                                            return (
                                                <div
                                                    key={user.id}
                                                    onClick={() => toggleUserSelection(user)}
                                                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-gradient-to-r from-[#AC0021]/20 to-transparent border-[#AC0021] shadow-[inset_0_0_20px_-10px_rgba(172,53,0,0.3)]' : 'bg-transparent border-zinc-800 hover:bg-zinc-800/50'}`}
                                                >
                                                    {/* Checkbox for Group Mode */}
                                                    {chatType === 'group' && (
                                                        <div className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#AC0021] border-[#AC0021]' : 'border-zinc-600 group-hover:border-zinc-500'}`}>
                                                            {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                                                        </div>
                                                    )}

                                                    <div className="relative">
                                                        <Avatar className={`border-2 ${isSelected ? 'border-[#AC0021]' : 'border-transparent'} w-10 h-10`}>
                                                            <AvatarImage src={user.avatar} />
                                                            <AvatarFallback className={`${isSelected ? 'bg-[#AC0021] text-white' : 'bg-zinc-700 text-zinc-300'} font-medium`}>
                                                                {user.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-zinc-200'}`}>{user.name}</p>
                                                        <p className="text-xs text-zinc-500 truncate">{user.jabatan?.name || user.email}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {foundUsers.length === 0 && (
                                            <div className="text-center text-muted-foreground py-8 text-sm">
                                                Tidak ada user ditemukan
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer Button */}
                        <div className="mt-auto p-4 border-t bg-background">
                            <Button
                                className="w-full bg-[#AC0021] hover:bg-[#8f2b00] text-white h-12 text-base font-semibold shadow-lg shadow-orange-900/20"
                                disabled={selectedUsers.length === 0 || (chatType === 'group' && !groupName)}
                                onClick={handleStartChat}
                            >
                                {loadingConversations ? 'Membuat...' : 'Mulai Chat'}
                            </Button>
                        </div>
                    </div>
                )}

                {view === 'chat' && selectedConversation && (
                    <div className="flex-1 flex flex-col h-full min-w-0 bg-background">
                        {/* Header */}
                        <div className="px-4 h-16 border-b border-white/10 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur z-10">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" onClick={() => setView('list')} className="-ml-2 hover:bg-transparent text-zinc-400 hover:text-white">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarImage src={getConversationAvatar(selectedConversation) || undefined} />
                                            <AvatarFallback className="bg-orange-600 text-white font-bold">
                                                {getConversationName(selectedConversation).substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {!selectedConversation.is_group && isUserOnline(selectedConversation) && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background">
                                                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
                                            </div>
                                        )}
                                        {selectedConversation.is_group && (
                                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-zinc-700 rounded-full border-2 border-background flex items-center justify-center">
                                                <UserCog className="h-2.5 w-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-base text-zinc-100 truncate leading-tight">
                                            {getConversationName(selectedConversation)}
                                        </h3>
                                        <p className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                                            {selectedConversation.is_group ? (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-zinc-500">
                                                        <UserCog className="h-3 w-3 inline mr-0.5" />
                                                    </span>
                                                    {selectedConversation.participants?.length || 0} anggota
                                                </span>
                                            ) : (
                                                <span className={isUserOnline(selectedConversation) ? "text-green-500" : "text-zinc-500"}>
                                                    {isUserOnline(selectedConversation) ? "Online" : "Offline"}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                                    <Search className="h-5 w-5" />
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                                            <MoreVertical className="h-5 w-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 bg-[#1e1e1e] border-zinc-700 text-zinc-200 z-[9999]" sideOffset={5}>
                                        <DropdownMenuItem
                                            className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2"
                                            onClick={() => setView('info')}
                                        >
                                            <div className="w-5 h-5 flex items-center justify-center border border-zinc-500 rounded-full">
                                                <span className="text-[10px] font-bold">i</span>
                                            </div>
                                            Info {selectedConversation.is_group ? 'Grup' : 'Kontak'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2"
                                            onClick={() => setView('search')}
                                        >
                                            <Search className="h-4 w-4" />
                                            Cari Pesan
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-2"
                                            onClick={() => setView('media')}
                                        >
                                            <FileText className="h-4 w-4" />
                                            Media & File
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                            {loadingMessages ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                                    <p className="text-sm text-zinc-500">Memuat pesan...</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center opacity-0 animate-in fade-in duration-500">
                                    <div className="w-20 h-20 rounded-full bg-transparent flex items-center justify-center mb-4">
                                        <Search className="h-16 w-16 text-zinc-700 stroke-1" />
                                    </div>
                                    <p className="text-zinc-500 text-sm">Belum ada pesan</p>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-4">
                                    {messages.map((msg, index) => {
                                        const isMe = msg.user_id === auth.user.id;
                                        const isSameSender = index > 0 && messages[index - 1].user_id === msg.user_id;

                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm text-sm ${isMe
                                                    ? 'bg-[#005c4b] text-white rounded-tr-none'
                                                    : 'bg-[#202c33] text-zinc-100 rounded-tl-none'
                                                    }`}>
                                                    {msg.type === 'file' || msg.type === 'image' || (msg.attachments && msg.attachments.length > 0) ? (
                                                        <div className="space-y-2">
                                                            {msg.attachments?.map((att: any, i: number) => (
                                                                <div key={i}>
                                                                    {(att.mime_type?.startsWith('image/') || msg.type === 'image') ? (
                                                                        <img src={att.url} alt={att.name} className="rounded-lg max-w-full max-h-[300px] object-cover" />
                                                                    ) : (
                                                                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors">
                                                                            <div className="bg-red-500/20 p-2 rounded">
                                                                                <FileText className="h-6 w-6 text-red-400" />
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="font-medium truncate">{att.name}</p>
                                                                                <p className="text-xs opacity-70 uppercase">{att.mime_type?.split('/')[1] || 'FILE'}</p>
                                                                            </div>
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            ))}
                                                            {msg.body && <p className="mt-2 text-[15px] leading-relaxed">{msg.body}</p>}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[15px] leading-relaxed">{msg.body}</p>
                                                    )}
                                                    <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-white/70' : 'text-zinc-400'}`}>
                                                        {format(new Date(msg.created_at), 'HH:mm')}
                                                        {isMe && (
                                                            <span>
                                                                {msg.read_at ? (
                                                                    <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                                                                ) : (msg.delivered_at || (selectedConversation?.participants.some(p => p.id !== auth.user.id && onlineUsers.includes(p.id)))) ? (
                                                                    <CheckCheck className="h-3.5 w-3.5 text-zinc-500" />
                                                                ) : (
                                                                    <Check className="h-3.5 w-3.5 text-zinc-500" />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Footer / Input Area */}
                        <div className="p-3 bg-background flex items-end gap-2 shrink-0 relative z-20">
                            {selectedFile && (
                                <div className="absolute bottom-full left-0 right-0 p-3 bg-[#1e1e1e] border-t border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-zinc-800 p-2 rounded-lg">
                                            {selectedFile.type.startsWith('image/') ? <ImageIcon className="h-5 w-5 text-blue-400" /> : <FileText className="h-5 w-5 text-green-400" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200 truncate max-w-[200px]">{selectedFile.name}</p>
                                            <p className="text-xs text-zinc-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-500/20 hover:text-red-400 rounded-full" onClick={() => setSelectedFile(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-zinc-400 hover:text-zinc-300 hover:bg-white/5 rounded-full h-10 w-10 shrink-0"
                                    >
                                        <Paperclip className="h-5 w-5 -rotate-45" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" side="top" className="w-56 bg-[#1e1e1e] border-zinc-700 text-zinc-200" sideOffset={8}>
                                    <DropdownMenuItem
                                        className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-3 py-2.5"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center">
                                            <ImageIcon className="h-4 w-4 text-blue-400" />
                                        </div>
                                        <span className="font-medium">Gambar & Video</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-3 py-2.5"
                                        onClick={() => documentInputRef.current?.click()}
                                    >
                                        <div className="w-8 h-8 rounded-sm bg-red-500/20 flex items-center justify-center">
                                            <FileText className="h-4 w-4 text-red-400" />
                                        </div>
                                        <span className="font-medium">Dokumen PDF/Word</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-3 py-2.5"
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.accept = '.zip,.rar,.7z';
                                            input.onchange = (e) => handleFileSelect(e as any);
                                            input.click();
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-md bg-yellow-500/20 flex items-center justify-center">
                                            <Archive className="h-4 w-4 text-yellow-400" />
                                        </div>
                                        <span className="font-medium">File ZIP/RAR</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="focus:bg-zinc-800 focus:text-white cursor-pointer gap-3 py-2.5"
                                        onClick={() => {
                                            const input = document.createElement('input');
                                            input.type = 'file';
                                            input.onchange = (e) => handleFileSelect(e as any);
                                            input.click();
                                        }}
                                    >
                                        <div className="w-8 h-8 rounded-sm bg-zinc-500/20 flex items-center justify-center">
                                            <File className="h-4 w-4 text-zinc-400" />
                                        </div>
                                        <span className="font-medium">File Lainnya</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                            <input type="file" ref={documentInputRef} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" onChange={handleFileSelect} />

                            <div className="flex-1 bg-[#2a3942]/50 hover:bg-[#2a3942] focus-within:bg-[#2a3942] transition-colors rounded-3xl flex items-center px-4 py-2 gap-2 min-h-[44px]">
                                <form onSubmit={handleSendMessage} className="flex-1">
                                    <input
                                        className="w-full bg-transparent border-none focus:outline-none text-[15px] placeholder:text-zinc-500 text-zinc-100"
                                        placeholder="Ketik pesan..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                </form>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button className="text-zinc-400 hover:text-zinc-300 transition-colors">
                                            <Smile className="h-6 w-6" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0 border-none" side="top" align="end">
                                        <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} width={300} height={400} />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <Button
                                size="icon"
                                className={`h-11 w-11 rounded-full shrink-0 shadow-lg transition-all ${newMessage || selectedFile ? 'bg-[#AC0021] hover:bg-[#8f2b00] text-white' : 'bg-[#2a3942] text-zinc-400'}`}
                                onClick={handleSendMessage}
                            >
                                <Send className="h-5 w-5 ml-0.5" />
                            </Button>
                        </div>
                    </div>
                )}

                {view === 'info' && selectedConversation && (
                    <div className="flex-1 flex flex-col h-full bg-[#262626]">
                        {/* Header */}
                        <div className="px-4 h-16 border-b border-white/10 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" onClick={() => setView('chat')} className="-ml-2 hover:bg-transparent text-zinc-400 hover:text-white">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <h2 className="font-bold text-lg text-zinc-100">Info Chat</h2>
                            </div>
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1">
                            <div className="p-6 space-y-6">
                                {/* Avatar & Name */}
                                <div className="flex flex-col items-center text-center space-y-3">
                                    <Avatar className="h-24 w-24 border-2 border-white/10">
                                        <AvatarImage src={getConversationAvatar(selectedConversation) || undefined} />
                                        <AvatarFallback className="bg-orange-600 text-white font-bold text-2xl">
                                            {getConversationName(selectedConversation).substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2 justify-center">
                                            <h3 className="font-bold text-xl text-zinc-100">{getConversationName(selectedConversation)}</h3>
                                            {selectedConversation.is_group && selectedConversation.can_manage && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 text-zinc-400 hover:text-white"
                                                    onClick={() => {
                                                        setGroupName(selectedConversation.name || '');
                                                        setView('edit_group');
                                                    }}
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </Button>
                                            )}
                                        </div>
                                        {selectedConversation.is_group ? (
                                            <p className="text-sm text-zinc-400 flex items-center justify-center gap-1 mt-1">
                                                <UserCog className="h-3.5 w-3.5" />
                                                Grup • {selectedConversation.participants?.length || 0} anggota
                                            </p>
                                        ) : (
                                            <p className="text-sm text-teal-400 flex items-center justify-center gap-1 mt-1">
                                                <UserCog className="h-3.5 w-3.5" />
                                                Chat Personal
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                {/* Stats */}
                                <div className={`grid gap-4 ${selectedConversation.is_group ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                    {selectedConversation.is_group && (
                                        <div className="bg-[#1e1e1e] rounded-lg p-4 text-center border border-white/5">
                                            <div className="text-2xl font-bold text-zinc-100">
                                                {selectedConversation.participants?.length || 0}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1">Anggota</div>
                                        </div>
                                    )}
                                    <div className="bg-[#1e1e1e] rounded-lg p-4 text-center border border-white/5">
                                        <div className="text-2xl font-bold text-zinc-100">
                                            {messages.filter(msg => msg.attachments && msg.attachments.length > 0).length}
                                        </div>
                                        <div className="text-xs text-zinc-500 mt-1">Media</div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-4 border-b border-white/10">
                                    <button
                                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors text-center border-b-2 ${infoTab === 'info'
                                            ? 'text-white border-white'
                                            : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                                            }`}
                                        onClick={() => setInfoTab('info')}
                                    >
                                        Info
                                    </button>
                                    <button
                                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors text-center border-b-2 ${infoTab === 'media'
                                            ? 'text-white border-white'
                                            : 'text-zinc-500 hover:text-zinc-300 border-transparent'
                                            }`}
                                        onClick={() => setInfoTab('media')}
                                    >
                                        Media
                                    </button>
                                </div>


                                {/* Tab Content */}
                                {infoTab === 'info' && (
                                    <>
                                        {selectedConversation.is_group ? (
                                            <>
                                                {/* Description */}
                                                <div className="bg-[#1e1e1e] rounded-lg p-4 border border-white/5">
                                                    <h4 className="text-sm font-semibold text-zinc-300 mb-2">Deskripsi Grup</h4>
                                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                                        Grup untuk komunikasi tim dalam sistem Badan Cadangan Nasional
                                                    </p>
                                                </div>

                                                {/* Members List */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-4 px-1">
                                                        <h4 className="text-sm font-semibold text-zinc-300">
                                                            Anggota Grup ({selectedConversation.participants?.length || 0})
                                                        </h4>
                                                        {selectedConversation.can_manage && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-6 w-6 p-0 text-zinc-400 hover:text-white"
                                                                onClick={() => setView('add_member')}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-2">
                                                        {selectedConversation.participants?.map((participant, index) => {
                                                            const isCreator = participant.id === selectedConversation.created_by;
                                                            const isCurrentUser = participant.id === auth.user.id;

                                                            return (
                                                                <div key={participant.id} className="flex items-center gap-3 p-3 rounded-lg bg-[#1e1e1e] border border-white/5 hover:bg-[#252525] transition-colors">
                                                                    <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                                                                        <AvatarImage src={participant.avatar || undefined} />
                                                                        <AvatarFallback className="bg-zinc-700 text-white font-medium text-sm">
                                                                            {participant.name.substring(0, 2).toUpperCase()}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="font-medium text-sm text-zinc-200 truncate">
                                                                                {participant.name}
                                                                            </p>
                                                                            {isCurrentUser && (
                                                                                <span className="text-xs text-orange-500">(Anda)</span>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-xs text-zinc-500 truncate">
                                                                            {participant.jabatan?.name || participant.email}
                                                                        </p>
                                                                    </div>
                                                                    {index === 0 && (
                                                                        <div className="shrink-0">
                                                                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                                                                <span className="text-xs">✉️</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {selectedConversation.can_manage && !isCurrentUser &&
                                                                        !participant.roles?.some(r => ['admin', 'super-admin'].includes(r.name)) &&
                                                                        participant.id !== selectedConversation.created_by && (
                                                                            <Button
                                                                                size="icon"
                                                                                variant="ghost"
                                                                                className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 shrink-0"
                                                                                onClick={() => handleRemoveParticipant(participant.id)}
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                {/* Personal Contact Info */}
                                                {(() => {
                                                    const otherUser = selectedConversation.participants?.find(p => p.id !== auth.user.id);
                                                    if (!otherUser) return null;

                                                    return (
                                                        <div className="bg-[#1e1e1e] rounded-lg p-4 border border-white/5 space-y-4">
                                                            {/* Name */}
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                                                    <UserCog className="h-5 w-5 text-zinc-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-teal-400 mb-1">Nama Lengkap</p>
                                                                    <p className="text-sm font-medium text-zinc-200">{otherUser.name}</p>
                                                                </div>
                                                            </div>

                                                            {/* Position */}
                                                            {otherUser.jabatan?.name && (
                                                                <div className="flex items-start gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                                                        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs text-teal-400 mb-1">Jabatan</p>
                                                                        <p className="text-sm font-medium text-zinc-200">{otherUser.jabatan.name}</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Unit */}
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                                                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-teal-400 mb-1">Unit Kerja</p>
                                                                    <p className="text-sm font-medium text-zinc-200">Bagian Administrasi</p>
                                                                </div>
                                                            </div>

                                                            {/* Email */}
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                                                    <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-teal-400 mb-1">Email</p>
                                                                    <p className="text-sm font-medium text-zinc-200 break-all">{otherUser.email}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                            </>
                                        )}

                                        {/* Created Date */}
                                        <div className="bg-[#1e1e1e] rounded-lg p-4 border border-white/5 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                                <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-zinc-500">{selectedConversation.is_group ? 'Dibuat pada' : 'Chat dimulai'}</p>
                                                <p className="text-sm font-medium text-zinc-200">
                                                    {format(new Date(selectedConversation.updated_at), 'dd MMMM yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {
                    view === 'add_member' && selectedConversation && (
                        <div className="flex-1 flex flex-col h-full bg-[#262626]">
                            {/* Header */}
                            <div className="px-4 h-16 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" onClick={() => setView('info')} className="-ml-2 hover:bg-transparent text-zinc-400 hover:text-white">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <h2 className="font-bold text-lg text-zinc-100">Tambah Anggota</h2>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Cari pengguna..."
                                        className="pl-9 bg-[#1e1e1e] border-white/10 text-white"
                                        value={userSearchTerm}
                                        onChange={(e) => handleSearchUsers(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-1">
                                    {userSearchTerm.length > 1 && foundUsers.map(user => {
                                        const isMember = selectedConversation.participants.some(p => p.id === user.id);
                                        return (
                                            <div
                                                key={user.id}
                                                className={`flex items-center justify-between p-2 rounded transition-colors ${!isMember ? 'hover:bg-white/10 cursor-pointer' : 'opacity-50'}`}
                                                onClick={() => !isMember && handleAddParticipant(user.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm text-zinc-200">{user.name}</p>
                                                        <p className="text-xs text-zinc-500">{user.jabatan?.name}</p>
                                                    </div>
                                                </div>
                                                {isMember ? (
                                                    <span className="text-xs text-zinc-500">Anggota</span>
                                                ) : (
                                                    <Plus className="h-4 w-4 text-teal-400" />
                                                )}
                                            </div>
                                        );
                                    })}
                                    {userSearchTerm.length > 1 && foundUsers.length === 0 && (
                                        <p className="text-sm text-zinc-500 text-center py-4">Tidak ditemukan pengguna</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }


                {
                    view === 'edit_group' && selectedConversation && (
                        <div className="flex-1 flex flex-col h-full bg-[#262626]">
                            {/* Header */}
                            <div className="px-4 h-16 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" onClick={() => setView('info')} className="-ml-2 hover:bg-transparent text-zinc-400 hover:text-white">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <h2 className="font-bold text-lg text-zinc-100">Edit Grup</h2>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Avatar Upload */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('group-avatar-upload')?.click()}>
                                        <Avatar className="h-24 w-24 border-2 border-white/10 group-hover:opacity-75 transition-opacity">
                                            <AvatarImage src={avatarFile ? URL.createObjectURL(avatarFile) : (getConversationAvatar(selectedConversation) || undefined)} />
                                            <AvatarFallback className="bg-orange-600 text-white font-bold text-2xl">
                                                {getConversationName(selectedConversation).substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <UserCog className="h-8 w-8 text-white drop-shadow-md" />
                                        </div>
                                        <input
                                            type="file"
                                            id="group-avatar-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) setAvatarFile(file);
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500">Klik foto untuk mengubah</p>
                                </div>

                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-zinc-300">Nama Grup</label>
                                    <Input
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="Nama Grup"
                                        className="bg-black/20 border-white/10 text-white"
                                    />
                                </div>

                                <Button onClick={handleUpdateGroup} className="w-full bg-[#AC0021] hover:bg-[#8f2b00] text-white">
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </div>
                    )
                }

                {
                    view === 'search' && selectedConversation && (
                        <div className="flex-1 flex flex-col h-full bg-[#262626]">
                            {/* Header */}
                            <div className="px-4 h-16 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" onClick={() => setView('chat')} className="-ml-2 hover:bg-transparent text-zinc-400 hover:text-white">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <h2 className="font-bold text-lg text-zinc-100">Cari Pesan</h2>
                                </div>
                            </div>

                            {/* Search Input */}
                            <div className="p-4 border-b border-white/10">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Cari dalam percakapan..."
                                        className="pl-9 bg-[#1e1e1e] border-zinc-800 text-sm placeholder:text-zinc-500 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 rounded-lg text-zinc-200"
                                        value={messageSearchTerm}
                                        onChange={(e) => setMessageSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Search Results */}
                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-2">
                                    {messages
                                        .filter(msg =>
                                            messageSearchTerm &&
                                            msg.body?.toLowerCase().includes(messageSearchTerm.toLowerCase())
                                        )
                                        .map((msg) => (
                                            <div
                                                key={msg.id}
                                                className="bg-[#1e1e1e] rounded-lg p-3 border border-white/5 hover:bg-[#252525] transition-colors cursor-pointer"
                                                onClick={() => {
                                                    setView('chat');
                                                    setMessageSearchTerm('');
                                                }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={msg.sender?.avatar || undefined} />
                                                        <AvatarFallback className="bg-zinc-700 text-white text-xs">
                                                            {msg.sender?.name?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-sm font-medium text-zinc-200">{msg.sender?.name}</span>
                                                            <span className="text-xs text-zinc-500">
                                                                {format(new Date(msg.created_at), 'dd/MM/yy HH:mm')}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-zinc-400 line-clamp-2">{msg.body}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {messageSearchTerm && messages.filter(msg =>
                                        msg.body?.toLowerCase().includes(messageSearchTerm.toLowerCase())
                                    ).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                                <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-4">
                                                    <Search className="h-8 w-8 text-zinc-600" />
                                                </div>
                                                <h3 className="text-zinc-300 font-medium mb-1">Tidak ada hasil</h3>
                                                <p className="text-sm text-zinc-500">Coba kata kunci lain</p>
                                            </div>
                                        )}
                                    {!messageSearchTerm && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-4">
                                                <Search className="h-8 w-8 text-zinc-600" />
                                            </div>
                                            <h3 className="text-zinc-300 font-medium mb-1">Cari pesan</h3>
                                            <p className="text-sm text-zinc-500">Ketik untuk mencari dalam percakapan</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )
                }

                {
                    view === 'media' && selectedConversation && (
                        <div className="flex-1 flex flex-col h-full bg-[#262626]">
                            {/* Header */}
                            <div className="px-4 h-16 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" onClick={() => setView('chat')} className="-ml-2 hover:bg-transparent text-zinc-400 hover:text-white">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <h2 className="font-bold text-lg text-zinc-100">Media & File</h2>
                                </div>
                            </div>

                            {/* Media Grid */}
                            <ScrollArea className="flex-1">
                                <div className="p-4">
                                    {/* Images */}
                                    {messages.filter(msg => msg.type === 'image' || msg.attachments?.some(att => att.mime_type?.startsWith('image/'))).length > 0 && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-semibold text-zinc-400 mb-3">Gambar</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {messages
                                                    .filter(msg => msg.type === 'image' || msg.attachments?.some(att => att.mime_type?.startsWith('image/')))
                                                    .flatMap(msg => msg.attachments || [])
                                                    .filter(att => att.mime_type?.startsWith('image/'))
                                                    .map((att, idx) => (
                                                        <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-[#1e1e1e] border border-white/5">
                                                            <img src={att.url} alt={att.name} className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer" />
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Files */}
                                    {messages.filter(msg => msg.type === 'file' || msg.attachments?.some(att => !att.mime_type?.startsWith('image/'))).length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-400 mb-3">Dokumen</h3>
                                            <div className="space-y-2">
                                                {messages
                                                    .filter(msg => msg.type === 'file' || msg.attachments?.some(att => !att.mime_type?.startsWith('image/')))
                                                    .flatMap(msg => msg.attachments || [])
                                                    .filter(att => !att.mime_type?.startsWith('image/'))
                                                    .map((att, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-3 rounded-lg bg-[#1e1e1e] border border-white/5 hover:bg-[#252525] transition-colors"
                                                        >
                                                            <div className="bg-red-500/20 p-2 rounded">
                                                                <FileText className="h-5 w-5 text-red-400" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm text-zinc-200 truncate">{att.name}</p>
                                                                <p className="text-xs text-zinc-500 uppercase">{att.mime_type?.split('/')[1] || 'FILE'}</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.filter(msg => msg.attachments && msg.attachments.length > 0).length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 rounded-full bg-[#1e1e1e] flex items-center justify-center mb-4">
                                                <FileText className="h-8 w-8 text-zinc-600" />
                                            </div>
                                            <h3 className="text-zinc-300 font-medium mb-1">Belum ada media</h3>
                                            <p className="text-sm text-zinc-500">Media dan file akan muncul di sini</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )
                }
            </SheetContent >
        </Sheet >
    );
}
