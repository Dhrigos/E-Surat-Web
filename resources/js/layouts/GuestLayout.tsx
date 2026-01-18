import React from 'react';
import { Head } from '@inertiajs/react';

interface GuestLayoutProps {
    children: React.ReactNode;
    title: string;
    hideHeader?: boolean;
}

export default function GuestLayout({ children, title, hideHeader = false }: GuestLayoutProps) {
    // Assets
    const tniPhoto = "/images/Background_final.png";

    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-sans flex flex-col overscroll-none">
            <Head title={title} />

            {/* Background Image with Dark Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img
                    src={tniPhoto}
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.3),rgba(0,0,0,95))]" />
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">

                {/* Header Section - Institutional Branding Removed */}

                {/* Main Content Area */}
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 pb-6">
                    <div className="text-center space-y-2">
                        <p className="text-white/60 text-sm font-bold">
                            © {new Date().getFullYear()} Kementerian Pertahanan Republik Indonesia
                        </p>
                        <p className="text-white/40 text-xs">
                            Badan Cadangan Nasional • Sistem Manajemen Dokumen Digital
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
