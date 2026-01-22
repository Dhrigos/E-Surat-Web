import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import ScreenProtection from '@/components/ScreenProtection';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        {/* <ScreenProtection /> */}
        {children}
    </AppLayoutTemplate>
);
