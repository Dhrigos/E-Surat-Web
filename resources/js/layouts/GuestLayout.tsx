import React from 'react';
import { Head } from '@inertiajs/react';
import { Building2 } from 'lucide-react';

interface GuestLayoutProps {
    children: React.ReactNode;
    title: string;
    hideHeader?: boolean;
}

export default function GuestLayout({ children, title, hideHeader = false }: GuestLayoutProps) {
    // Assets
    const bcnLogo = "/images/BADAN-CADANGAN-NASIONAL.png";
    const kemhanLogo = "/images/KEMENTERIAN-PERTAHANAN.png";
    const tniPhoto = "/images/BEGROUND.png";

    return (
        <div className="min-h-screen bg-black relative overflow-hidden font-sans flex flex-col">
            <Head title={title} />

            {/* Background Image with Dark Overlay */}
            <div className="absolute inset-0">
                <img
                    src={tniPhoto}
                    alt="Background"
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
            </div>

            {/* Content Wrapper */}
            <div className="relative z-10 flex-1 flex flex-col">

                {/* Header Section - Institutional Branding */}
                {!hideHeader && (
                    <div className="flex-shrink-0 pt-12 pb-8">
                        <div className="max-w-5xl mx-auto px-4">

                            {/* Large Logos */}
                            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-8">
                                <div className="text-center">
                                    <img
                                        src={bcnLogo}
                                        alt="Badan Cadangan Nasional"
                                        className="h-40 w-40 object-contain drop-shadow-2xl mx-auto mb-3"
                                    />
                                    <p className="text-white/80 text-sm font-bold tracking-wide">BADAN CADANGAN NASIONAL</p>
                                </div>

                                <div className="h-px w-24 md:h-36 md:w-px bg-gradient-to-r md:bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>

                                <div className="text-center">
                                    <img
                                        src={kemhanLogo}
                                        alt="Kementerian Pertahanan"
                                        className="h-36 w-36 object-contain drop-shadow-2xl mx-auto mb-3"
                                    />
                                    <p className="text-white/80 text-sm font-bold tracking-wide">KEMENTERIAN PERTAHANAN</p>
                                </div>
                            </div>

                            {/* Institutional Name - Very Prominent */}
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-4">
                                    <Building2 className="h-5 w-5 text-red-600" />
                                    <span className="text-white/90 text-sm font-bold tracking-widest">REPUBLIK INDONESIA</span>
                                </div>

                                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-tight drop-shadow-2xl">
                                    KEMENTERIAN<br />
                                    PERTAHANAN
                                </h1>

                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                                    <p className="text-2xl md:text-3xl font-bold text-red-600 drop-shadow-lg">
                                        REPUBLIK INDONESIA
                                    </p>
                                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
                                </div>

                                <p className="text-xl text-gray-300 mt-6 tracking-wide">
                                    Portal Sistem Manajemen Dokumen
                                </p>
                            </div>
                        </div>
                    </div>
                )}

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
