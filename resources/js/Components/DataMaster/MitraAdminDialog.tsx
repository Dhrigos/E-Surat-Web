import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, UserPlus, Users, Loader2, Check, X } from 'lucide-react';
import { useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import axios from 'axios';

interface Admin {
    id: number;
    name: string;
    username: string;
    email: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    mitraId: number;
    mitraName: string;
}

export default function MitraAdminDialog({ isOpen, onClose, mitraId, mitraName }: Props) {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Form for creating new admin
    const form = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
    });

    const [passwordCriteria, setPasswordCriteria] = useState({
        minLength: false,
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    useEffect(() => {
        const pwd = form.data.password;
        setPasswordCriteria({
            minLength: pwd.length >= 8,
            hasUpperCase: /[A-Z]/.test(pwd),
            hasNumber: /[0-9]/.test(pwd),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
        });
    }, [form.data.password]);

    const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(route('master-data.mitra.admins.index', mitraId));
            setAdmins(response.data.admins);
        } catch (error) {
            toast.error('Gagal memuat data admin');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && mitraId) {
            fetchAdmins();
        }
    }, [isOpen, mitraId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('master-data.mitra.admins.store', mitraId), {
            onSuccess: () => {
                toast.success('Admin berhasil ditambahkan');
                form.reset();
                fetchAdmins(); // Refresh list
            },
            preserveScroll: true,
        });
    };

    const handleDelete = (userId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus admin ini?')) {
            router.delete(route('master-data.mitra.admins.destroy', { mitra: mitraId, user: userId }), {
                onSuccess: () => {
                    toast.success('Admin berhasil dihapus');
                    fetchAdmins();
                },
                preserveScroll: true,
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-card border-none shadow-2xl">
                <div className="px-6 py-6 border-b bg-white dark:bg-[#262626]">
                    <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Kelola Admin Mitra
                    </DialogTitle>
                    <DialogDescription className="mt-1.5 text-muted-foreground">
                        {mitraName}
                    </DialogDescription>
                </div>

                <div className="p-6 space-y-6">
                    {/* List Existing Admins */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Daftar Admin</h3>

                        {isLoading ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : admins.length > 0 ? (
                            <div className="space-y-2">
                                {admins.map((admin) => (
                                    <div key={admin.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                        <div>
                                            <div className="font-medium text-sm">{admin.name}</div>
                                            <div className="text-xs text-muted-foreground">{admin.email} • @{admin.username}</div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(admin.id)}
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                                <p className="text-sm text-muted-foreground">Belum ada admin</p>
                            </div>
                        )}
                    </div>

                    {/* Add New Admin Form */}
                    <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <UserPlus className="w-4 h-4" /> Tambah Admin Baru
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-name" className="text-xs">Nama Lengkap</Label>
                                        <Input
                                            id="admin-name"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            placeholder="Nama Admin"
                                            className="h-9 text-sm"
                                        />
                                        {form.errors.name && <p className="text-xs text-red-500">{form.errors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="admin-username" className="text-xs">Username</Label>
                                        <Input
                                            id="admin-username"
                                            value={form.data.username}
                                            onChange={(e) => form.setData('username', e.target.value)}
                                            placeholder="username"
                                            className="h-9 text-sm"
                                        />
                                        {form.errors.username && <p className="text-xs text-red-500">{form.errors.username}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="admin-email" className="text-xs">Email</Label>
                                    <Input
                                        id="admin-email"
                                        type="email"
                                        value={form.data.email}
                                        onChange={(e) => form.setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                        className="h-9 text-sm"
                                    />
                                    {form.errors.email && <p className="text-xs text-red-500">{form.errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="admin-password" className="text-xs">Password</Label>
                                    <Input
                                        id="admin-password"
                                        type="password"
                                        value={form.data.password}
                                        onChange={(e) => form.setData('password', e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className="h-9 text-sm"
                                    />
                                    {form.errors.password && <p className="text-xs text-red-500">{form.errors.password}</p>}

                                    <div className="mt-2 space-y-1 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 tracking-wider">Persyaratan Password:</p>
                                        <div className={`flex items-center gap-2 text-xs ${passwordCriteria.minLength ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                            {passwordCriteria.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            <span>Minimal 8 karakter</span>
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${passwordCriteria.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                            {passwordCriteria.hasUpperCase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            <span>Huruf besar (A-Z)</span>
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${passwordCriteria.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                            {passwordCriteria.hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            <span>Angka (0-9)</span>
                                        </div>
                                        <div className={`flex items-center gap-2 text-xs ${passwordCriteria.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                                            {passwordCriteria.hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            <span>Karakter spesial (!@#$...)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    disabled={form.processing || !isPasswordValid}
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
                                >
                                    {form.processing ? 'Menambahkan...' : 'Tambah Admin'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                    <Button variant="outline" onClick={onClose} size="sm">
                        Tutup
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
