import React, { useState, useRef } from 'react';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Image as ImageIcon, Video, User as UserIcon, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';
import { router } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    roles?: { name: string }[];
}

interface Message {
    id: number;
    type?: 'text' | 'file' | 'image';
    attachments?: any[];
    created_at: string;
}

interface Conversation {
    id: number;
    name?: string;
    is_group: boolean;
    created_by?: number;
    avatar?: string;
    participants: User[];
    created_at?: string;
}

interface ConversationInfoProps {
    conversation: Conversation;
    files: Message[]; // Messages that ARE files/images or HAVE attachments
    currentUser: User;
}

export default function ConversationInfo({ conversation, files, currentUser }: ConversationInfoProps) {
    const isGroup = conversation.is_group;

    // Extract all attachments from the file messages
    const allAttachments = files.flatMap(msg => {
        if (msg.attachments && msg.attachments.length > 0) {
            return msg.attachments.map(att => ({ ...att, created_at: msg.created_at, msg_id: msg.id }));
        }
        return [];
    });

    const images = allAttachments.filter(att => att.mime_type?.startsWith('image/') || att.type === 'image'); // fallback if no mime_type
    const documents = allAttachments.filter(att => !att.mime_type?.startsWith('image/') && att.type !== 'image');

    const getAvatarFallback = (name: string) => name.substring(0, 2).toUpperCase();

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(conversation.name || '');
    const [isLoading, setIsLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const avatarInputRef = React.useRef<HTMLInputElement>(null);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            if (editName !== conversation.name) {
                formData.append('name', editName);
            }
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }
            formData.append('_method', 'PATCH');

            await axios.post(route('conversations.update', conversation.id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsEditing(false);
            setAvatarFile(null);
            router.reload({ only: ['conversations'] });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SheetContent className="w-full sm:w-[400px] p-0 flex flex-col">
            <SheetHeader className="p-6 border-b shrink-0">
                <SheetTitle>Contact Info</SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1">
                    <div className="flex flex-col items-center p-6 pb-2">
                        <div className="relative group/avatar mb-4">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={isGroup ? (avatarFile ? URL.createObjectURL(avatarFile) : conversation.avatar) : conversation.participants.find(p => p.id !== currentUser?.id)?.avatar} />
                                <AvatarFallback className="text-2xl">
                                    {getAvatarFallback(
                                        isGroup
                                            ? (conversation.name || 'Group')
                                            : (conversation.participants.find(p => p.id !== currentUser?.id)?.name || 'User')
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            {isGroup && (currentUser?.id === conversation.created_by || currentUser?.roles?.some((r: any) => r.name === 'super-admin')) && (
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                                    onClick={() => avatarInputRef.current?.click()}
                                    title="Change Group Avatar"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            )}
                            <input
                                ref={avatarInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        setAvatarFile(file);
                                        setIsLoading(true);
                                        try {
                                            const formData = new FormData();
                                            formData.append('avatar', file);
                                            formData.append('_method', 'PATCH');

                                            await axios.post(route('conversations.update', conversation.id), formData, {
                                                headers: { 'Content-Type': 'multipart/form-data' }
                                            });
                                            router.reload({ only: ['conversations'] });
                                        } catch (error) {
                                            console.error(error);
                                            setAvatarFile(null);
                                        } finally {
                                            setIsLoading(false);
                                        }
                                    }
                                }}
                            />
                        </div>

                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-2 w-full">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="text-center"
                                />
                                <Button size="sm" onClick={handleSave} disabled={isLoading}>
                                    Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-1 justify-center">
                                <h2 className="text-xl font-semibold text-center">
                                    {isGroup
                                        ? (conversation.name || 'Unknown')
                                        : (conversation.participants.find(p => p.id !== currentUser?.id)?.name || 'Unknown')
                                    }
                                </h2>
                                {isGroup && (currentUser?.id === conversation.created_by || currentUser?.roles?.some(r => r.name === 'super-admin')) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            setEditName(conversation.name || '');
                                            setIsEditing(true);
                                        }}
                                        title="Edit Group Name"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {!isGroup && (
                            <p className="text-muted-foreground text-center">
                                {conversation.participants.find(p => p.id !== currentUser?.id)?.email || 'No email'}
                            </p>
                        )}
                        {isGroup && (
                            <p className="text-muted-foreground text-center">
                                Group · {conversation.participants.length} participants
                            </p>
                        )}
                    </div>

                    {isGroup && (
                        <div className="p-4">
                            <Tabs defaultValue="media" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="media">Media & Docs</TabsTrigger>
                                    <TabsTrigger value="members">Members</TabsTrigger>
                                </TabsList>

                                <TabsContent value="media" className="mt-0">
                                    <div className="space-y-6">
                                        {/* Images Section */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                                                <ImageIcon className="h-4 w-4" /> Media
                                            </h3>
                                            {images.length > 0 ? (
                                                <div className="grid grid-cols-3 gap-2">
                                                    {images.map((img, i) => (
                                                        <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-muted group cursor-pointer">
                                                            <img
                                                                src={img.url}
                                                                alt={img.name}
                                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground py-8">No media shared</div>
                                            )}
                                        </div>

                                        {/* Documents Section */}
                                        <div>
                                            <h3 className="text-sm font-medium mb-3 flex items-center gap-2 text-muted-foreground">
                                                <FileText className="h-4 w-4" /> Documents
                                            </h3>
                                            {documents.length > 0 ? (
                                                <div className="space-y-2">
                                                    {documents.map((doc, i) => (
                                                        <a
                                                            key={i}
                                                            href={doc.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                                                        >
                                                            <div className="h-10 w-10 shrink-0 bg-primary/10 rounded flex items-center justify-center text-primary">
                                                                <FileText className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium truncate">{doc.name}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {doc.size ? (doc.size / 1024).toFixed(1) + ' KB' : 'File'} · {format(new Date(doc.created_at), 'dd MMM yyyy')}
                                                                </p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground py-8">No documents shared</div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                {isGroup && (
                                    <TabsContent value="members" className="mt-0">
                                        <div className="space-y-1">
                                            {conversation.participants.map(user => (
                                                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.avatar} />
                                                        <AvatarFallback>{getAvatarFallback(user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm truncate">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </SheetContent>
    );
}
