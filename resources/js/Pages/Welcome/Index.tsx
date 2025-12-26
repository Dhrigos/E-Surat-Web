import { Link, Head } from '@inertiajs/react';
import GuestLayout from '@/layouts/GuestLayout';
import { Button } from '@/components/ui/button';
import { Shield, LogIn, UserPlus } from 'lucide-react';

export default function Welcome({ auth }: { auth: { user: any } }) {
    return (
        <GuestLayout title="Selamat Datang" hideHeader={false}>
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 bg-[#252525] border-2 border-red-600/30 rounded-full px-8 py-3 shadow-lg mb-6">
                    <Shield className="h-6 w-6 text-red-600" />
                    <span className="text-white font-black text-lg">PORTAL RESMI</span>
                </div>

                <h2 className="text-3xl font-black text-white mb-4">
                    Sistem Manajemen Dokumen
                </h2>
                <p className="text-gray-400 max-w-md mx-auto">
                    Platform terintegrasi untuk pengelolaan surat, disposisi, dan administrasi kepegawaian di lingkungan Kementerian Pertahanan.
                </p>
            </div>

            <div className="bg-[#252525]/95 backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 shadow-2xl space-y-4">
                {auth.user ? (
                    <Link href={route('dashboard')} className="block w-full">
                        <Button className="w-full h-14 bg-red-600 hover:bg-red-700 text-white text-lg font-bold shadow-lg">
                            <LogIn className="mr-2 h-5 w-5" />
                            KEMBALI KE DASHBOARD
                        </Button>
                    </Link>
                ) : (
                    <>
                        <Link href={route('login')} className="block w-full">
                            <Button className="w-full h-14 bg-white text-black hover:bg-gray-200 text-lg font-bold shadow-lg">
                                <LogIn className="mr-2 h-5 w-5" />
                                MASUK KE SISTEM
                            </Button>
                        </Link>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#252525] px-2 text-gray-500 font-bold">
                                    ATAU
                                </span>
                            </div>
                        </div>

                        <Link href={route('register')} className="block w-full">
                            <Button variant="outline" className="w-full h-14 border-2 border-white/20 text-white hover:bg-white/10 hover:text-white text-lg font-bold">
                                <UserPlus className="mr-2 h-5 w-5" />
                                DAFTAR AKUN BARU
                            </Button>
                        </Link>
                    </>
                )}
            </div>

            <div className="mt-8 text-center space-y-2">
                <p className="text-white/40 text-xs">
                    Versi Aplikasi v1.0.0
                </p>
            </div>
        </GuestLayout>
    );
}
