import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Shield, Key } from 'lucide-react';
import { useState } from 'react';
import { usePermission } from '@/hooks/usePermission';

interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions: Permission[];
}

interface Props {
    roles: Role[];
    allPermissions?: Permission[];
}

export default function RoleList({ roles, allPermissions = [] }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPermissionOpen, setIsPermissionOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Role | null>(null);
    const { hasPermission } = usePermission();

    const createForm = useForm({
        name: '',
        guard_name: 'web',
    });

    const editForm = useForm({
        name: '',
        guard_name: 'web',
    });

    const permissionForm = useForm({
        permissions: [] as string[],
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/roles', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (item: Role) => {
        setEditingItem(item);
        editForm.setData({
            name: item.name,
            guard_name: item.guard_name,
        });
        setIsEditOpen(true);
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        editForm.put(`/roles/${editingItem.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                setEditingItem(null);
                editForm.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this role?')) {
            router.delete(`/roles/${id}`);
        }
    };

    const handleManagePermissions = (item: Role) => {
        setEditingItem(item);
        permissionForm.setData({
            permissions: item.permissions.map(p => p.name),
        });
        setIsPermissionOpen(true);
    };

    const handleUpdatePermissions = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        permissionForm.put(`/roles/${editingItem.id}`, {
            onSuccess: () => {
                setIsPermissionOpen(false);
                setEditingItem(null);
                permissionForm.reset();
            },
        });
    };

    const togglePermission = (permissionName: string) => {
        const currentPermissions = permissionForm.data.permissions;
        if (currentPermissions.includes(permissionName)) {
            permissionForm.setData('permissions', currentPermissions.filter(p => p !== permissionName));
        } else {
            permissionForm.setData('permissions', [...currentPermissions, permissionName]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
                    <p className="text-muted-foreground">
                        Manage system roles and access levels.
                    </p>
                </div>
                {hasPermission('manage roles') && (
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Role
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Roles List</CardTitle>
                    <CardDescription>
                        Total {roles.length} roles found.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Guard Name</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="w-32 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No roles found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    roles.map((role, index) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                                    {role.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{role.guard_name}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {role.permissions.length} permissions
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {hasPermission('manage permissions') && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleManagePermissions(role)} title="Manage Permissions">
                                                            <Key className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('manage roles') && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(role)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {hasPermission('manage roles') && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(role.id)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Role</DialogTitle>
                        <DialogDescription>
                            Create a new role for the system.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="create-name">Role Name *</Label>
                            <Input
                                id="create-name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="e.g. manager, staff"
                                className={createForm.errors.name ? 'border-destructive' : ''}
                            />
                            {createForm.errors.name && <p className="text-sm text-destructive">{createForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="create-guard">Guard Name</Label>
                            <Input
                                id="create-guard"
                                value={createForm.data.guard_name}
                                onChange={(e) => createForm.setData('guard_name', e.target.value)}
                                placeholder="web"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Saving...' : 'Save'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Update role information.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Role Name *</Label>
                            <Input
                                id="edit-name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                placeholder="e.g. manager"
                                className={editForm.errors.name ? 'border-destructive' : ''}
                            />
                            {editForm.errors.name && <p className="text-sm text-destructive">{editForm.errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-guard">Guard Name</Label>
                            <Input
                                id="edit-guard"
                                value={editForm.data.guard_name}
                                onChange={(e) => editForm.setData('guard_name', e.target.value)}
                                placeholder="web"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" disabled={editForm.processing}>
                                {editForm.processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Permission Modal */}
            <Dialog open={isPermissionOpen} onOpenChange={setIsPermissionOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Manage Permissions for {editingItem?.name}</DialogTitle>
                        <DialogDescription>
                            Assign permissions to this role.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdatePermissions} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {allPermissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`permission-${permission.id}`}
                                        checked={permissionForm.data.permissions.includes(permission.name)}
                                        onCheckedChange={() => togglePermission(permission.name)}
                                    />
                                    <Label
                                        htmlFor={`permission-${permission.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                        {permission.name}
                                    </Label>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4 border-t mt-4">
                            <Button type="submit" disabled={permissionForm.processing}>
                                {permissionForm.processing ? 'Saving...' : 'Save Permissions'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setIsPermissionOpen(false)}>Cancel</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
