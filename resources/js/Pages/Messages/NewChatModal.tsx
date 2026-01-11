import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Search, X } from 'lucide-react';
import axios from 'axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

interface NewChatModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConversationCreated: (conversation: any) => void;
}

export default function NewChatModal({ open, onOpenChange, onConversationCreated }: NewChatModalProps) {
    const { auth } = usePage().props as any;
    const isSuperAdmin = auth.user?.roles?.some((r: any) => r.name === 'super-admin');

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleSearch = async () => {
        try {
            const response = await axios.get(`/api/users/search?query=${searchQuery}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    const toggleUser = (user: User) => {
        if (selectedUsers.find(u => u.id === user.id)) {
            setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
        } else {
            // Restriction logic: Only Super Admin can select more than 1 user
            if (!isSuperAdmin && selectedUsers.length >= 1) {
                toast.warning("Only Super Admins can create group chats.");
                return;
            }
            setSelectedUsers(prev => [...prev, user]);
        }
    };

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) return;

        const isGroup = selectedUsers.length > 1;
        // Group name is now optional

        setLoading(true);
        try {
            const response = await axios.post('/conversations', {
                users: selectedUsers.map(u => u.id),
                is_group: isGroup,
                name: groupName || null, // Send null if empty
            });
            onConversationCreated(response.data.conversation);
            handleClose();
        } catch (error) {
            console.error('Failed to create conversation:', error);
            // Optionally handle 403 error specifically if needed, though toast logic usually covers it via global handlers or manually here
            if (axios.isAxiosError(error) && error.response?.status === 403) {
                toast.error("You are not authorized to create group chats.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
        setGroupName('');
        onOpenChange(false);
    };

    const isGroupMode = selectedUsers.length > 1;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                    <DialogDescription>
                        {isSuperAdmin
                            ? "Search for users to start a new chat or create a group."
                            : "Search for a user to start a new chat."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Selected Users Tags */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                    {user.name}
                                    <X className="h-3 w-3 cursor-pointer" onClick={() => toggleUser(user)} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Group Name Input (Only for Super Admin) */}
                    {isGroupMode && isSuperAdmin && (
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Group Name</Label>
                            <Input
                                id="group-name"
                                placeholder="Enter group name..."
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search people..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Results List */}
                    <ScrollArea className="h-64">
                        <div className="space-y-1">
                            {searchResults.length === 0 && searchQuery && (
                                <div className="text-center text-sm text-muted-foreground py-4">
                                    No users found.
                                </div>
                            )}
                            {searchResults.map(user => {
                                const isSelected = selectedUsers.some(u => u.id === user.id);
                                return (
                                    <div
                                        key={user.id}
                                        onClick={() => toggleUser(user)}
                                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50 ${isSelected ? 'bg-accent' : ''}`}
                                    >
                                        <Avatar className="h-10 w-10">
                                            {/* Assuming avatar URL might be added later, using fallback for now */}
                                            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={selectedUsers.length === 0 || loading || (isGroupMode && !groupName.trim())}>
                        {loading ? 'Creating...' : (isGroupMode ? 'Create Group' : 'Chat')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
