import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
    can: string[];
    notifications: any[];
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
    items?: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    verifikasi?: boolean;
    rejection_reason?: string | null;
    is_active?: boolean;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    role?: string;
    jabatan?: string;
    unitKerja?: string;
    nip?: string;
    nip_nik?: string;
    nia_nrp?: string;
    roles?: { name: string;[key: string]: any }[];
    permissions?: { name: string;[key: string]: any }[];
    detail?: {
        jabatan?: { nama: string };
        jabatan_role?: { nama: string };
        unit_kerja?: { nama: string };
        nip?: string;
        nik?: string;
        nia_nrp?: string;
        pangkat?: { nama: string };
    };
    [key: string]: unknown; // This allows for additional properties...
}

export interface PaginatedData<T> {
    data: T[];
    links: any[];
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    path: string;
    per_page: number;
    to: number;
    total: number;
    current_page: number;
    from: number;
    last_page: number;
}
