import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, ArrowRight } from 'lucide-react';

declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}

export default function VerificationVideoCall() {
    const [isCallStarted, setIsCallStarted] = useState(false);
    const jitsiContainerRef = useRef<HTMLDivElement>(null);
    const { auth } = usePage().props as any;
    const user = auth.user;

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        // Poll status every 3 seconds
        pollInterval = setInterval(async () => {
            try {
                const response = await fetch(route('verification.status'));
                const data = await response.json();

                if (data.verifikasi) {
                    // User verified, redirect to dashboard
                    window.location.href = route('dashboard');
                } else if (data.rejection_reason) {
                    // User rejected, redirect to complete profile to fix data
                    window.location.href = route('complete-profile.create');
                } else if (data.verification_locked_by) {
                    // Admin is ready (locked the user), start call if not started
                    if (!isCallStarted) {
                        setIsCallStarted(true);
                    }
                } else {
                    // Admin not ready or left (unlocked), stop call if started
                    if (isCallStarted) {
                        setIsCallStarted(false);
                    }
                }
            } catch (error) {
                console.error('Error polling status:', error);
            }
        }, 3000);

        if (isCallStarted) {
            const script = document.createElement('script');
            script.src = 'https://8x8.vc/external_api.js';
            script.async = true;
            script.onload = () => {
                if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
                    const domain = '8x8.vc';
                    const options = {
                        roomName: `vpaas-magic-cookie-28ed8eb749bf4baaa08a0d979cf0df98/ProjectDevVerification_${user.id}`,
                        width: '100%',
                        height: 600,
                        parentNode: jitsiContainerRef.current,
                        userInfo: {
                            displayName: user.name,
                            email: user.email
                        },
                        configOverwrite: {
                            startWithAudioMuted: false,
                            startWithVideoMuted: false,
                            prejoinPageEnabled: false,
                            skipMeetingPrejoin: true,
                            disableDeepLinking: true,
                            disableThirdPartyRequests: true,
                            analytics: {
                                disabled: true,
                            },
                            filmstrip: {
                                enabled: false
                            }
                        },
                        interfaceConfigOverwrite: {
                            TOOLBAR_BUTTONS: ['microphone', 'camera'],
                            hideConferenceTimer: true,
                        },
                    };
                    const api = new window.JitsiMeetExternalAPI(domain, options);

                    const handleClose = () => {
                        api.dispose();
                        // Don't set isCallStarted(false) here immediately, let polling handle it 
                        // or just keep it true until admin unlocks. 
                        // But if user hangs up, maybe we should just let them rejoin?
                        // For now, let's keep it simple: if they hang up, they see waiting screen until polling restarts it?
                        // Actually, better to just let polling control it.
                    };

                    api.addEventListeners({
                        videoConferenceLeft: handleClose,
                        readyToClose: handleClose
                    });
                }
            };
            document.body.appendChild(script);

            return () => {
                document.body.removeChild(script);
                if (pollInterval) clearInterval(pollInterval);
            };
        } else {
            return () => {
                if (pollInterval) clearInterval(pollInterval);
            };
        }
    }, [isCallStarted, user.id, user.name, user.email]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] animate-pulse delay-700" />

            <Head title="Verifikasi Video Call" />

            <div className={`w-full ${isCallStarted ? 'max-w-5xl' : 'max-w-md'} space-y-8 relative z-10 transition-all duration-500`}>
                {!isCallStarted && (
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                            <Video className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-red-600 tracking-tight">Ruang Tunggu</h1>
                        <p className="text-gray-400">Mohon tunggu, Admin akan segera memulai verifikasi.</p>
                    </div>
                )}

                <Card className="bg-[#1a1a1a]/95 border-red-900/30 backdrop-blur-xl shadow-2xl overflow-hidden">
                    {!isCallStarted ? (
                        <>
                            <CardHeader className="text-center pb-2">
                                <CardTitle className="text-xl font-bold text-white">Menunggu Admin...</CardTitle>
                                <CardDescription className="text-gray-400">
                                    Tetap di halaman ini. Panggilan video akan otomatis dimulai saat giliran Anda tiba.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                            </CardContent>
                        </>
                    ) : (
                        <div className="w-full h-[600px] bg-black" ref={jitsiContainerRef}>
                            {/* Jitsi Meet will be mounted here */}
                        </div>
                    )}
                </Card>
            </div>

            <div className="absolute top-8 right-8">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-white/60 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
                >
                    Logout <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
