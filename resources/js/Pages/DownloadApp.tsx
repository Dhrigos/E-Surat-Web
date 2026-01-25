import React from 'react';
import { Head } from '@inertiajs/react';

export default function DownloadApp() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden relative selection:bg-red-500/30">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] animate-pulse delay-700 pointer-events-none" />

            <Head title="Download Aplikasi" />

            <div className="z-10 flex flex-col items-center max-w-lg w-full text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Header Logos */}
                <div className="flex items-center justify-center gap-6">
                    <img
                        src="/images/KEMENTERIAN-PERTAHANAN.png"
                        alt="Logo Kementerian Pertahanan"
                        className="h-24 md:h-28 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                    <img
                        src="/images/BADAN-CADANGAN-NASIONAL.png"
                        alt="Logo Badan Cadangan Nasional"
                        className="h-20 md:h-24 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Text Content */}
                <div className="space-y-4 px-4">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent pb-2">
                        E-Surat BCN
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl leading-relaxed font-light">
                        Sistem persuratan digital Badan Cadangan Nasional. <br className="hidden md:block" />
                        Unduh aplikasi mobile untuk akses yang lebih mudah.
                    </p>
                </div>

                {/* Download Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4 sm:px-0">
                    {/* App Store Button */}
                    <a href="#" className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#1a1a1a] to-black border border-white/10 hover:border-white/20 transition-all p-4 flex items-center justify-center sm:justify-start gap-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <svg className="w-8 h-8 fill-white shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.5 1.55-.03 2.99 1.05 3.93 1.05.94 0 2.75-1.29 4.63-1.1 1.55.06 2.75.64 3.71 2.05-3.27 1.99-2.7 6.43.37 8.1-.81 1.77-1.89 3.65-2.75 4.96v-.01zM13 3.5c.86-1.09 1.53-2.5 1.36-4.05-1.31.06-2.9.89-3.83 2-1.02 1.13-1.87 2.93-1.63 4.28 1.48.11 3.03-.78 4.1-2.23z" />
                        </svg>

                        <div className="text-left z-10">
                            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-medium">Download on the</div>
                            <div className="text-lg md:text-xl font-bold text-white leading-none tracking-tight">App Store</div>
                        </div>
                    </a>

                    {/* Google Play Button */}
                    <a href="/Komcad.apk" download className="group relative overflow-hidden rounded-xl bg-gradient-to-b from-[#1a1a1a] to-black border border-white/10 hover:border-white/20 transition-all p-4 flex items-center justify-center sm:justify-start gap-4 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-1">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.60868 2.3789C3.42442 2.59384 3.29871 2.87974 3.29871 3.2201V20.7797C3.29871 21.1192 3.42442 21.4051 3.60868 21.6218L3.68962 21.7107L13.2505 12.1481V11.8517L3.68962 2.28906L3.60868 2.3789Z" fill="url(#paint0_linear)" />
                            <path d="M16.4257 15.3218L13.2505 12.1481L13.2505 11.8517L16.4257 8.67796L20.2541 10.8529C21.3411 11.4704 21.3411 12.4764 20.2541 13.0948L16.4257 15.3218Z" fill="url(#paint1_linear)" />
                            <path d="M13.2505 12.1481L16.4257 15.3218L16.4257 15.3227L10.0718 21.6775C9.72895 22.0194 9.17228 22.0006 8.52042 21.6299L3.60868 18.8359L13.2505 12.1481Z" fill="url(#paint2_linear)" />
                            <path d="M13.2505 11.8517L3.60868 5.16388L8.52042 2.3699C9.17228 1.99913 9.72895 1.98031 10.0718 2.32227L16.4257 8.67796L13.2505 11.8517Z" fill="url(#paint3_linear)" />
                            <defs>
                                <linearGradient id="paint0_linear" x1="10.8732" y1="13.2104" x2="0.67137" y2="10.7417" gradientUnits="userSpaceOnUse"><stop stopColor="#00A0FF" /><stop offset="0.0066" stopColor="#00A1FF" /><stop offset="0.2601" stopColor="#00BEFF" /><stop offset="0.5122" stopColor="#00D2FF" /><stop offset="0.7604" stopColor="#00DFFF" /><stop offset="1" stopColor="#00E3FF" /></linearGradient>
                                <linearGradient id="paint1_linear" x1="21.5794" y1="12" x2="10.8549" y2="12" gradientUnits="userSpaceOnUse"><stop stopColor="#FFE000" /><stop offset="0.4087" stopColor="#FFBD00" /><stop offset="0.7754" stopColor="#FFA500" /><stop offset="1" stopColor="#FF9C00" /></linearGradient>
                                <linearGradient id="paint2_linear" x1="14.2882" y1="13.1856" x2="6.62637" y2="20.8475" gradientUnits="userSpaceOnUse"><stop stopColor="#FF3A44" /><stop offset="1" stopColor="#C31162" /></linearGradient>
                                <linearGradient id="paint3_linear" x1="6.57863" y1="3.21528" x2="14.3364" y2="10.973" gradientUnits="userSpaceOnUse"><stop stopColor="#32A071" /><stop offset="0.0685" stopColor="#2DA771" /><stop offset="0.4762" stopColor="#15CF74" /><stop offset="0.8009" stopColor="#06E775" /><stop offset="1" stopColor="#00F076" /></linearGradient>
                            </defs>
                        </svg>

                        <div className="text-left z-10">
                            <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider font-medium">UNDUH</div>
                            <div className="text-lg md:text-xl font-bold text-white leading-none tracking-tight">Komcad.apk</div>
                        </div>
                    </a>
                </div>

            </div>

            {/* Bypass Link */}
            <div className="pt-8">
                <a href="/login?bypass=true" className="text-gray-400 hover:text-white text-sm transition-colors border-b border-transparent hover:border-white pb-0.5">
                    Lanjutkan ke Login
                </a>
            </div>

            {/* Footer/Info */}
            <div className="pt-12 text-center space-y-2">
                <p className="text-sm text-gray-500 font-medium">
                    Versi 1.0.0
                </p>
                <p className="text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} Badan Cadangan Nasional. All rights reserved.
                </p>
            </div>
        </div>
    );
}
