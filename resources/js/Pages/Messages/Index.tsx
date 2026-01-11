import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Send, Image as ImageIcon, Search, Phone, Video, Info, MoreVertical, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import axios from 'axios';

// Types
interface Message {
    id: number;
    body: string;
    user_id: number;
    created_at: string;
    sender: User;
    type: 'text' | 'image' | 'file';
}

interface User {
    id: number;
    name: string;
    avatar?: string;
}

interface Conversation {
    id: number;
    name?: string;
    participants: User[];
    last_message?: Message;
    updated_at: string;
}

export default function MessagesIndex({ conversations }: { conversations: Conversation[] }) {
    const { auth } = usePage().props as any;
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Listen for real-time messages
    useEffect(() => {
        if (!selectedConversation) return;

        const channel = window.Echo.private(`conversation.${selectedConversation.id}`)
            .listen('.message.sent', (e: { message: Message }) => {
                console.log('New message received:', e.message);
                setMessages(prev => [...prev, e.message]);
            });

        return () => {
            channel.stopListening('.message.sent');
            window.Echo.leave(`conversation.${selectedConversation.id}`);
        };
    }, [selectedConversation]);

    const handleSelectConversation = async (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setLoadingMessages(true);
        try {
            const response = await fetch(`/messages/${conversation.id}`);
            const data = await response.json();
            setMessages(data.messages);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        // Optimistic update
        const tempMsg: Message = {
            id: Date.now(),
            body: newMessage,
            user_id: auth.user.id,
            created_at: new Date().toISOString(),
            sender: auth.user,
            type: 'text'
        };
        setMessages([...messages, tempMsg]);
        const messageText = newMessage;
        setNewMessage('');

        // Send to backend
        try {
            await axios.post(`/messages/${selectedConversation.id}`, {
                body: messageText
            });
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove optimistic message on error
            setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
            setNewMessage(messageText);
        }
    };

    const getOtherParticipant = (convo: Conversation) => {
        return convo.participants.find(p => p.id !== auth.user.id) || convo.participants[0];
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Messages', href: '/messages' }]}>
            <Head title="Direct Messages" />

            <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-background">
                {/* Sidebar - Conversation List */}
                <div className="w-full md:w-96 border-r border-border flex flex-col bg-card/50">
                    <div className="p-4 flex items-center justify-between border-b border-border h-16">
                        <div className="font-bold text-lg flex items-center gap-2">
                            <span>{auth.user.name}</span>
                            <span className="text-xs text-muted-foreground">▼</span>
                        </div>
                        <Button variant="ghost" size="icon">
                            <Send className="h-5 w-5 rotate-45 text-muted-foreground" />
                        </Button>
                    </div>

                    <div className="p-4 pt-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search" className="pl-9 bg-muted/50 border-none h-9" />
                        </div>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="space-y-1 p-2">
                            {conversations.map(convo => {
                                const otherUser = getOtherParticipant(convo);
                                const isSelected = selectedConversation?.id === convo.id;
                                return (
                                    <div
                                        key={convo.id}
                                        onClick={() => handleSelectConversation(convo)}
                                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-accent' : 'hover:bg-accent/50'}`}
                                    >
                                        <Avatar className="h-12 w-12 border border-border">
                                            <AvatarImage src={otherUser.avatar} />
                                            <AvatarFallback>{otherUser.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <div className="font-medium text-sm truncate">{otherUser.name}</div>
                                            <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                {convo.last_message?.user_id === auth.user.id && <span>You: </span>}
                                                <span className={convo.last_message ? '' : 'italic'}>
                                                    {convo.last_message?.body || 'Start a conversation'}
                                                </span>
                                                <span className="text-[10px] ml-auto whitespace-nowrap">
                                                    • {convo.last_message ? format(new Date(convo.last_message.created_at), 'MMM d') : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-background">
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={getOtherParticipant(selectedConversation).avatar} />
                                        <AvatarFallback>{getOtherParticipant(selectedConversation).name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-sm">{getOtherParticipant(selectedConversation).name}</div>
                                        <div className="text-xs text-muted-foreground">Active now</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <Phone className="h-6 w-6 cursor-pointer hover:text-foreground" />
                                    <Video className="h-6 w-6 cursor-pointer hover:text-foreground" />
                                    <Info className="h-6 w-6 cursor-pointer hover:text-foreground" />
                                </div>
                            </div>

                            {/* Messages List */}
                            <ScrollArea className="flex-1 p-4 bg-background/50">
                                <div className="space-y-4 flex flex-col">
                                    {loadingMessages ? (
                                        <div className="flex justify-center items-center h-full text-muted-foreground">Loading...</div>
                                    ) : (
                                        <>
                                            {messages.map((msg) => {
                                                const isMe = msg.user_id === auth.user.id;
                                                return (
                                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-blue-600 text-white' : 'bg-muted text-foreground'}`}>
                                                            {msg.body}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Input Area */}
                            <div className="p-4 m-4 mt-0 bg-card rounded-3xl border border-border flex items-center gap-2">
                                <Smile className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground" />
                                <form onSubmit={handleSendMessage} className="flex-1">
                                    <input
                                        className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground"
                                        placeholder="Message..."
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                    />
                                </form>
                                {newMessage ? (
                                    <button onClick={handleSendMessage} className="text-blue-500 font-semibold text-sm">Send</button>
                                ) : (
                                    <>
                                        <ImageIcon className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground" />
                                        <Send className="h-6 w-6 text-muted-foreground cursor-pointer hover:text-foreground" />
                                    </>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <div className="bg-muted p-6 rounded-full mb-4">
                                <Send className="h-10 w-10 rotate-12" />
                            </div>
                            <h3 className="text-xl font-medium text-foreground">Your Messages</h3>
                            <p className="mt-2">Send private photos and messages to a friend.</p>
                            <Button className="mt-4" onClick={() => { }}>Send Message</Button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
