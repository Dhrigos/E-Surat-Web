import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { DateSelect } from '@/components/ui/date-select';
import { ImageCropper } from '@/components/ui/image-cropper';
import { FastInput } from '@/components/ui/fast-input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { JabatanSelectionModal } from '@/components/JabatanSelectionModal';
import { Edit2, Calendar, FileText, Briefcase, User, Building2, CreditCard, BadgeCheck, MapPin, Upload, ArrowRight, ArrowLeft, AlertCircle, Trash2, PenTool, Loader2, RefreshCw, Download, Trophy, Plus, GraduationCap, Send, LogOut } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { CascadingJabatanSelector } from '@/components/CascadingJabatanSelector';
import { SearchableSelect } from '@/components/SearchableSelect';

interface Golongan {
    id: number;
    nama: string;
    keterangan?: string;
}

interface Pangkat {
    id: number;
    nama: string;
    golongan_id: number | null;
}

interface Props {
    auth: any;
    jabatans: Array<{ id: number; nama: string; nama_lengkap?: string }>;
    jabatanRoles: Array<{ id: number; nama: string }>;
    golongans: Golongan[];
    pangkats: Pangkat[];
    rejectionReason?: string;
    sukus: Array<{ id: number; nama: string }>;
    bangsas: Array<{ id: number; nama: string }>;
    agamas: Array<{ id: number; nama: string }>;
    status_pernikahans: Array<{ id: number; nama: string }>;
    goldars: Array<{ id: number; nama: string; rhesus?: string }>; // Added
    pendidikans: Array<{ id: number; singkatan: string }>;
    pekerjaans: Array<{ id: number; name: string }>;
    userWithRelations?: any;
    settings?: Record<string, any>;
    quotaUsage?: Record<string, number>;
}

export default function CompleteProfile({
    auth,
    jabatans,
    jabatanRoles = [],
    golongans = [],
    pangkats = [],
    rejectionReason,
    sukus = [],
    bangsas = [],
    agamas = [],
    status_pernikahans = [],
    goldars = [], // Added
    pendidikans = [],
    pekerjaans = [],
    userWithRelations,
    settings = {},
    quotaUsage = {},
}: Props) {
    // Main Form Step (starts after E-KYC)
    const [step, setStep] = useState(1);

    // Registration Status Check
    const isRegistrationOpen = useMemo(() => {
        if (!settings) return true;
        if (settings.registration_open === '0' || settings.registration_open === false) return false;

        const now = new Date();
        if (settings.registration_start_date && new Date(settings.registration_start_date) > now) return false;
        if (settings.registration_end_date && new Date(settings.registration_end_date) < now) return false;

        return true;
    }, [settings]);

    // Calculate Available Quota
    const isQuotaFull = useCallback((matra: string, golonganId: number | string) => {
        if (!matra || !golonganId) return false;
        const limit = settings[`quota_${matra.toLowerCase()}_${golonganId}`];
        if (limit === undefined || limit === null || limit === '') return false;
        const used = quotaUsage[`${matra.toUpperCase()}_${golonganId}`] || 0;
        return used >= Number(limit);
    }, [settings, quotaUsage]);

    // Block logic
    if (!isRegistrationOpen && auth.user.member_type !== 'anggota' && !rejectionReason) {
        return (
            <AppLayout>
                <Head title="Pendaftaran Tutup" />
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center text-white">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Pendaftaran Ditutup</h1>
                    <p className="text-gray-400 max-w-md">
                        Mohon maaf, pendaftaran Komponen Cadangan saat ini sedang ditutup.
                        {settings.registration_start_date && (
                            <span className="block mt-2 text-sm text-gray-500">
                                Dibuka kembali: {format(new Date(settings.registration_start_date), 'dd MMMM yyyy')}
                            </span>
                        )}
                    </p>
                    <Link href={route('dashboard')}>
                        <Button className="mt-6 bg-[#AC0021]">Kembali ke Dashboard</Button>
                    </Link>
                </div>
            </AppLayout>
        );
    }

    // Initial values logic
    const initialPangkatId = auth.user?.detail?.pangkat_id;
    const initialGolonganId = useMemo(() => {
        if (!initialPangkatId) return undefined;
        // Search in pangkats prop
        const p = pangkats.find(p => p.id === initialPangkatId);
        return p ? p.golongan_id : undefined;
    }, [initialPangkatId, pangkats]);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        nia_nrp: auth.user?.detail?.nia_nrp || '',
        nomor_kk: auth.user?.detail?.nomor_kk || '', // Added nomor_kk
        nik: auth.user?.detail?.nik || '',
        matra: auth.user?.detail?.matra || '', // Added
        tempat_lahir: auth.user?.detail?.tempat_lahir || '',
        birthplace_province_id: auth.user?.detail?.birthplace_province_id || '',
        tanggal_lahir: auth.user?.detail?.tanggal_lahir ? new Date(auth.user.detail.tanggal_lahir) : undefined,
        jenis_kelamin: auth.user?.detail?.jenis_kelamin || '',
        // New fields
        suku_id: auth.user?.detail?.suku_id || '',
        bangsa_id: auth.user?.detail?.bangsa_id || '',
        agama_id: auth.user?.detail?.agama_id || '',
        status_pernikahan_id: auth.user?.detail?.status_pernikahan_id || '',
        nama_ibu_kandung: auth.user?.detail?.nama_ibu_kandung || '',

        golongan_darah_id: auth.user?.detail?.golongan_darah_id || '',
        tinggi_badan: auth.user?.detail?.tinggi_badan || '',
        berat_badan: auth.user?.detail?.berat_badan || '',
        warna_kulit: auth.user?.detail?.warna_kulit || '',
        warna_mata: auth.user?.detail?.warna_mata || '',
        warna_rambut: auth.user?.detail?.warna_rambut || '',
        bentuk_rambut: auth.user?.detail?.bentuk_rambut || '',

        // Sizes
        ukuran_pakaian: auth.user?.detail?.ukuran_pakaian || '',
        ukuran_sepatu: auth.user?.detail?.ukuran_sepatu || '',
        ukuran_topi: auth.user?.detail?.ukuran_topi || '',
        ukuran_kaos_olahraga: auth.user?.detail?.ukuran_kaos_olahraga || '',
        ukuran_sepatu_olahraga: auth.user?.detail?.ukuran_sepatu_olahraga || '',
        ukuran_kaos_pdl: auth.user?.detail?.ukuran_kaos_pdl || '',
        ukuran_seragam_tactical: auth.user?.detail?.ukuran_seragam_tactical || '',
        ukuran_baju_tidur: auth.user?.detail?.ukuran_baju_tidur || '',
        ukuran_training_pack: auth.user?.detail?.ukuran_training_pack || '',
        ukuran_baju_renang: auth.user?.detail?.ukuran_baju_renang || '',
        ukuran_sepatu_tactical: auth.user?.detail?.ukuran_sepatu_tactical || '',

        alamat_domisili_lengkap: auth.user?.detail?.alamat_domisili_lengkap || '',

        // Step 4: Education
        pendidikan_id: auth.user?.detail?.pendidikan_id || '',
        nama_sekolah: auth.user?.detail?.nama_sekolah || '',
        nama_prodi: auth.user?.detail?.nama_prodi || '',
        nilai_akhir: auth.user?.detail?.nilai_akhir || '',
        status_lulus: auth.user?.detail?.status_lulus || '',

        // Prestasi
        has_prestasi: userWithRelations?.prestasi?.length ? 'ada' : (auth.user?.prestasi?.length ? 'ada' : 'tidak_ada'),
        prestasi: userWithRelations?.prestasi || auth.user?.prestasi || [],

        // Profesi
        is_bekerja: auth.user?.detail?.is_bekerja || 'tidak_bekerja',
        pekerjaan_id: auth.user?.detail?.pekerjaan_id || '',
        nama_perusahaan: auth.user?.detail?.nama_perusahaan || '',
        nama_profesi: auth.user?.detail?.nama_profesi || '',

        // Organisasi
        has_organisasi: userWithRelations?.organisasis?.length ? 'ada' : (auth.user?.organisasis?.length ? 'ada' : 'tidak_ada'),
        organisasi: (userWithRelations?.organisasis || auth.user?.organisasis || []) as Array<{
            nama_organisasi: string;
            posisi: string;
            tanggal_mulai: string;
            tanggal_berakhir: string;
            informasi_tambahan: string;
            is_active: boolean;
        }>,

        jabatan_id: auth.user?.detail?.jabatan_id || '',
        jabatan_role_id: auth.user?.detail?.jabatan_role_id || '',

        golongan_id: initialGolonganId || auth.user?.detail?.golongan_id || '',
        pangkat_id: initialPangkatId,

        tanggal_pengangkatan: auth.user?.detail?.tanggal_pengangkatan ? new Date(auth.user.detail.tanggal_pengangkatan) : undefined,
        nomor_sk: auth.user?.detail?.nomor_sk || '',
        nomor_kta: auth.user?.detail?.nomor_kta || '',
        province_id: auth.user?.detail?.province_id || '',
        city_id: auth.user?.detail?.city_id || '',
        district_id: auth.user?.detail?.district_id || '',
        village_id: auth.user?.detail?.village_id || '',
        jalan: auth.user?.detail?.jalan || '',
        domisili_jalan: auth.user?.detail?.domisili_jalan || '',
        domisili_province_id: auth.user?.detail?.domisili_province_id || '',
        domisili_city_id: auth.user?.detail?.domisili_city_id || '',
        domisili_district_id: auth.user?.detail?.domisili_district_id || '',
        domisili_village_id: auth.user?.detail?.domisili_village_id || '',
        foto_profil: null as File | null,
        scan_ktp: null as File | null,
        scan_kta: null as File | null,
        scan_sk: null as File | null,
        tanda_tangan: null as File | null,

        office_province_id: auth.user?.detail?.office_province_id || '',
        mako_id: auth.user?.detail?.mako_id || '',
        kta_start_date: auth.user?.detail?.kta_start_date ? new Date(auth.user.detail.kta_start_date) : undefined,
        kta_expired_at: auth.user?.detail?.kta_expired_at ? new Date(auth.user.detail.kta_expired_at) : undefined,
        is_kta_lifetime: auth.user?.detail?.is_kta_lifetime === (true as any || 1 as any),

        // Dokumen Pendukung Inputs
        doc_surat_lamaran: null as File | null,
        doc_ktp: null as File | null,
        doc_kk: null as File | null,
        doc_sk_lurah: null as File | null,
        doc_skck: null as File | null,
        doc_ijazah: null as File | null,
        doc_sk_sehat: null as File | null,
        doc_drh: null as File | null,
        doc_latsarmil: null as File | null,
        doc_izin_instansi: null as File | null,
        doc_izin_ortu: null as File | null,
    });

    const filteredPangkats = useMemo(() => {
        if (!data.golongan_id) return [];
        return pangkats.filter(p => p.golongan_id === Number(data.golongan_id));
    }, [data.golongan_id, pangkats]);



    // Region Data States
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [villages, setVillages] = useState<any[]>([]);
    const [birthplaceCities, setBirthplaceCities] = useState<any[]>([]);

    // Domicile address region states
    const [domisiliCities, setDomisiliCities] = useState<any[]>([]);
    const [domisiliDistricts, setDomisiliDistricts] = useState<any[]>([]);
    const [domisiliVillages, setDomisiliVillages] = useState<any[]>([]);

    // Office address region states
    const [makos, setMakos] = useState<any[]>([]);

    // Preview states
    const [previews, setPreviews] = useState<Record<string, string>>({});

    // Checkbox untuk "Alamat Domisili sama dengan KTP"
    const [isSameAsKTP, setIsSameAsKTP] = useState(false);

    // Refs for address textareas (uncontrolled to prevent lag)
    const jalanRef = useRef<HTMLTextAreaElement>(null);
    const domisiliJalanRef = useRef<HTMLTextAreaElement>(null);

    // Refs for high-traffic text inputs (uncontrolled to prevent lag)
    const namaIbuKandungRef = useRef<HTMLInputElement>(null);
    const namaProfesiRef = useRef<HTMLInputElement>(null);
    const namaPerusahaanRef = useRef<HTMLInputElement>(null);
    const namaSekolahRef = useRef<HTMLInputElement>(null);
    const namaProdiRef = useRef<HTMLInputElement>(null);

    // Get authenticated user data
    const { props } = usePage<{ auth: { user: { name: string; username: string } } }>();
    const user = props.auth.user;

    // Signature canvas ref and modal state
    const signatureRef = useRef<SignatureCanvas>(null);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [signatureFilename, setSignatureFilename] = useState<string>(''); // Filename from backend
    const signatureCanvasRef = useRef<any>(null); // Ref for canvas

    // File input refs for custom triggers
    const ktaInputRef = useRef<HTMLInputElement>(null);
    const skInputRef = useRef<HTMLInputElement>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);




    // Validation states for unique fields
    const [nikExists, setNikExists] = useState(false);
    const [niaNrpExists, setNiaNrpExists] = useState(false);
    const [ktaExists, setKtaExists] = useState(false);
    const [isValidatingNik, setIsValidatingNik] = useState(false);
    const [isValidatingNiaNrp, setIsValidatingNiaNrp] = useState(false);
    const [isValidatingKta, setIsValidatingKta] = useState(false);


    const [cropperImage, setCropperImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);

    // Jabatan Modal State
    const [isJabatanModalOpen, setIsJabatanModalOpen] = useState(false);

    // Scroll container ref
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Reset scroll on step change - use instant for better performance
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [step]);

    // Derived Display Logic for the Input Trigger
    const selectedJabatanObj = useMemo(() =>
        jabatans.find((j: any) => j.id.toString() === data.jabatan_id),
        [jabatans, data.jabatan_id]);

    const jabatanDisplayText = useMemo(() => {
        const roleObj = jabatanRoles.find(r => r.id.toString() === data.jabatan_role_id);
        const roleName = roleObj ? roleObj.nama : '';

        if (!selectedJabatanObj) return 'Pilih Jabatan...';

        // Check for duplicates like ANGGOTA - Anggota
        if (roleName && selectedJabatanObj.nama.toLowerCase() === roleName.toLowerCase()) {
            return roleName; // Return just the role name (e.g. "Anggota")
        }

        return `${selectedJabatanObj.nama}${roleName ? ' - ' + roleName : ''}`;
    }, [selectedJabatanObj, data.jabatan_role_id, jabatanRoles]);

    // Handler to prevent re-creation on every render (Optimized for Modal)
    const handleConfirmJabatan = useCallback((unitId: string, roleId: string) => {
        setData((prev: any) => ({ ...prev, jabatan_id: unitId, jabatan_role_id: roleId }));
        clearErrors('jabatan_id');
    }, [setData, clearErrors]);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setCropperImage(imageDataUrl as string);
            setShowCropper(true);
            e.target.value = ''; // Reset input to allow re-selection
        }
    };

    const readFile = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener('load', () => resolve(reader.result), false);
            reader.readAsDataURL(file);
        });
    };

    const onCropComplete = async (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "profile_cropped.jpg", { type: "image/jpeg" });

        // No compression for speed
        const finalFile = file;

        setData('foto_profil', finalFile);
        clearErrors('foto_profil');

        // Update preview manually since handleFileInput is bypassed
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, foto_profil: reader.result as string }));
        };
        reader.readAsDataURL(finalFile);
    };
    // Client-side file size guard to avoid server 413 errors
    const MAX_FILE_SIZE_MB = 10; // Increased limit because we removed compression (Backend supports 15MB)
    const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

    async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, field: string) {
        const file = e.target.files?.[0] || null;
        if (!file) {
            setData(field as any, null);
            setPreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[field];
                return newPreviews;
            });
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            toast.error(`File terlalu besar. Maks ${MAX_FILE_SIZE_MB} MB.`);
            setData(field as any, null);
            // clear the input value so user can re-select (best-effort; uncontrolled input)
            try { e.target.value = ''; } catch (err) { }
            return;
        }

        // Compress image if it's an image
        // Compression removed for performance
        const finalFile = file;

        setData(field as any, finalFile);
        clearErrors(field as any);

        // Check if image or PDF for preview
        if (finalFile.type.startsWith('image/') || finalFile.type === 'application/pdf') {
            const objectUrl = URL.createObjectURL(finalFile);
            setPreviews(prev => ({ ...prev, [field]: objectUrl }));
        } else {
            // For other docs, use a marker
            setPreviews(prev => ({ ...prev, [field]: 'DOC_FILE' }));
        }
    }

    // Handle signature save
    const handleSaveSignature = () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            const dataUrl = signatureRef.current.toDataURL('image/png');
            setSignatureDataUrl(dataUrl);

            // Sanitize filename: use name or username, remove special chars, replace spaces with underscores
            const userName = user.name || user.username || 'user';
            const sanitizedName = userName
                .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
                .replace(/\s+/g, '_') // Replace spaces with underscores
                .trim();
            const filename = `${sanitizedName}.png`;

            // Store filename for display
            setSignatureFilename(filename);

            // Convert data URL to File object
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], filename, { type: 'image/png' });
                    setData('tanda_tangan', file);
                    clearErrors('tanda_tangan');
                    toast.success('Tanda tangan berhasil disimpan');
                    setIsSignatureModalOpen(false); // Close modal
                })
                .catch(() => {
                    toast.error('Gagal menyimpan tanda tangan');
                });
        } else {
            toast.error('Silakan buat tanda tangan terlebih dahulu');
        }
    };

    // Handle signature clear
    const handleClearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setSignatureDataUrl(null);
            setSignatureFilename('');
            setData('tanda_tangan', null);
        }
    };




    useEffect(() => {
        axios.get(route('regions.provinces')).then(res => setProvinces(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));

        const detail = (user as any).detail;
        if (detail) {
            // Load existing documents
            const docFields = [
                'scan_ktp', 'foto_profil', 'doc_surat_lamaran', 'doc_ktp', 'doc_kk', 'doc_sk_lurah',
                'doc_skck', 'doc_ijazah', 'doc_sk_sehat', 'doc_drh', 'doc_latsarmil',
                'doc_izin_instansi', 'doc_izin_ortu'
            ];

            const newPreviews: Record<string, string> = {};
            docFields.forEach(field => {
                const path = detail[field];
                if (path) {
                    const isPdf = path.toLowerCase().endsWith('.pdf');
                    newPreviews[field] = isPdf ? `/storage/${path}` : `/storage/${path}`;
                }
            });
            setPreviews(prev => ({ ...prev, ...newPreviews }));

            // Load signature
            if (detail.tanda_tangan) {
                const sigPath = `/storage/${detail.tanda_tangan}`;
                setSignatureDataUrl(sigPath);
                setSignatureFilename('Tanda Tangan Tersimpan');
            }
        }

        // Trigger fetches for populated region fields
        if (data.birthplace_province_id) fetchBirthplaceCities(data.birthplace_province_id);
        if (data.province_id) fetchCities(data.province_id);
        if (data.city_id) fetchDistricts(data.city_id);
        if (data.district_id) fetchVillages(data.district_id);
        if (data.office_province_id) fetchOfficeCities(data.office_province_id);

    }, []);

    // Effect to copy KTP address to Domicile address when checkbox is checked
    // Only runs when checkbox state changes, not on every keystroke
    useEffect(() => {
        if (isSameAsKTP) {
            // Copy current KTP address data to domicile fields
            setData(prev => ({
                ...prev,
                domisili_jalan: prev.jalan,
                domisili_province_id: prev.province_id,
                domisili_city_id: prev.city_id,
                domisili_district_id: prev.district_id,
                domisili_village_id: prev.village_id,
            }));

            // Sync textarea ref value
            if (jalanRef.current && domisiliJalanRef.current) {
                domisiliJalanRef.current.value = jalanRef.current.value;
            }

            // Sync the region data arrays
            setDomisiliCities(cities);
            setDomisiliDistricts(districts);
            setDomisiliVillages(villages);
        }
    }, [isSameAsKTP]); // Only run when checkbox state changes

    const fetchCities = (provinceCode: string) => {
        setData('province_id', provinceCode);
        clearErrors('province_id');
        setCities([]); setDistricts([]); setVillages([]);
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => setCities(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchBirthplaceCities = (provinceCode: string) => {
        setData('birthplace_province_id', provinceCode);
        clearErrors('birthplace_province_id');
        setBirthplaceCities([]);
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => setBirthplaceCities(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchDistricts = (cityCode: string) => {
        setData('city_id', cityCode);
        clearErrors('city_id');
        setDistricts([]); setVillages([]);
        axios.get(route('regions.districts', { city_code: cityCode })).then(res => setDistricts(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchVillages = (districtCode: string) => {
        setData('district_id', districtCode);
        clearErrors('district_id');
        setVillages([]);
        axios.get(route('regions.villages', { district_code: districtCode })).then(res => setVillages(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    // Domicile address fetch functions
    const fetchDomisiliCities = (provinceCode: string) => {
        setData('domisili_province_id', provinceCode);
        clearErrors('domisili_province_id');
        setDomisiliCities([]); setDomisiliDistricts([]); setDomisiliVillages([]);
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => setDomisiliCities(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchDomisiliDistricts = (cityCode: string) => {
        setData('domisili_city_id', cityCode);
        clearErrors('domisili_city_id');
        setDomisiliDistricts([]); setDomisiliVillages([]);
        axios.get(route('regions.districts', { city_code: cityCode })).then(res => setDomisiliDistricts(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchDomisiliVillages = (districtCode: string) => {
        setData('domisili_district_id', districtCode);
        clearErrors('domisili_district_id');
        setDomisiliVillages([]);
        axios.get(route('regions.villages', { district_code: districtCode })).then(res => setDomisiliVillages(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    // Office address fetch functions
    const fetchOfficeCities = async (provinceCode: string) => {
        setData(data => ({ ...data, office_province_id: provinceCode, mako_id: '' }));
        setMakos([]); // Reset makos

        if (provinceCode) {
            try {
                // Fetch Makos by Province
                const makosRes = await axios.get(route('regions.makos'), { params: { province_code: provinceCode } });
                setMakos(makosRes.data);
            } catch (error) {
                console.error('Error fetching office data:', error);
                toast.error('Gagal memuat data wilayah kantor');
            }
        }
    };
    // E-KYC logic removed (moved to VerificationEkyc page)




    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        // Final validation before submission if needed
        // Final validation before submission
        // Final validation before submission
        if (step === 6) {
            let hasDocError = false;
            const docFields = [
                'doc_surat_lamaran',
                'doc_ktp',
                'doc_kk',
                'doc_sk_lurah',
                'doc_skck',
                'doc_ijazah',
                'doc_sk_sehat',
                'doc_drh',
                'doc_latsarmil',
                'doc_izin_ortu',
            ];

            docFields.forEach(field => {
                // Check if new file is selected OR if existing file (preview) exists
                // data[field] is valid if File object or null. 
                // previews[field] is valid if string URL exists.
                const isFileSelected = data[field as keyof typeof data] instanceof File;

                // Check previews for existing file. 
                // Note: 'DOC_FILE' is used as a marker for non-image files in some logic, 
                // but previews also holds URLs for existing files from `useEffect`.
                const hasExistingFile = previews[field] && previews[field] !== '';

                if (!isFileSelected && !hasExistingFile) {
                    setError(field as any, 'Wajib diupload');
                    hasDocError = true;
                }
            });

            if (!data.tanda_tangan && !signatureDataUrl) {
                setError('tanda_tangan', 'Wajib dibuat');
                toast.error('Harap luruskan tanda tangan digital Anda');
                hasDocError = true;
            }

            if (hasDocError) {
                toast.error('Harap lengkapi semua Dokumen Pendukung dan Tanda Tangan');
                return;
            }
        }

        post(route('complete-profile.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Profil berhasil dilengkapi!');
                // Backend will redirect to pending verification
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                toast.error('Gagal menyimpan data. Periksa input berwarna merah.');

                // Automatically find the first error field and maybe switch step?
                // Ideally, if error is in a previous step, we might want to alert the user.
                const errorFields = Object.keys(errors);
                if (errorFields.length > 0) {
                    // Check if errors belong to earlier steps
                    // Step 1 fields
                    const step1Fields = ['nia_nrp', 'nik', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin'];
                    const hasStep1Error = step1Fields.some(f => errorFields.includes(f));
                    if (hasStep1Error) {
                        toast.warning('Terdapat error pada Data Diri (Step 1)');
                        return;
                    }

                    // Step 2
                    if (errorFields.includes('foto_profil')) {
                        toast.warning('Terdapat error pada Foto Profil (Step 2)');
                        return;
                    }

                    // Step 3
                    const step3Fields = ['jabatan_id', 'jabatan_role_id', 'tanggal_pengangkatan', 'nomor_kta', 'tanda_tangan'];
                    const hasStep3Error = step3Fields.some(f => errorFields.includes(f));
                    if (hasStep3Error) {
                        toast.warning('Terdapat error pada Data Kepegawaian (Step 3)');
                        return;
                    }

                    // Step 5
                    const step5Fields = ['nama_profesi', 'nama_perusahaan', 'pekerjaan_id', 'organisasi'];
                    const hasStep5Error = step5Fields.some(f => errorFields.includes(f) || errorFields.some(ef => ef.startsWith('organisasi.')));
                    if (hasStep5Error) {
                        toast.warning('Terdapat error pada Profesi & Organisasi (Step 5)');
                        return;
                    }
                }
            },
        });
    };

    // Validate NIK uniqueness
    const validateNik = async (nik: string) => {
        if (!nik) {
            setNikExists(false);
            return true;
        }

        if (nik.length !== 16) {
            setError('nik', 'NIK harus 16 digit');
            return false;
        }

        setIsValidatingNik(true);
        try {
            const response = await axios.post(route('api.validate.nik'), { nik });
            const exists = response.data.exists;
            setNikExists(exists);
            if (exists) {
                setError('nik', response.data.message);
                toast.error(response.data.message);
            } else {
                clearErrors('nik');
            }
            return !exists;
        } catch (error) {
            console.error('Error validating NIK:', error);
            return true; // Allow to proceed on error
        } finally {
            setIsValidatingNik(false);
        }
    };

    // Validate NRP uniqueness
    const validateNiaNrp = async (niaNrp: string) => {
        if (!niaNrp) {
            setNiaNrpExists(false);
            return true;
        }

        if (niaNrp.length !== 16) {
            setError('nia_nrp', 'Kartu Keluarga harus 16 digit');
            return false;
        }

        setIsValidatingNiaNrp(true);
        try {
            const response = await axios.post(route('api.validate.nia-nrp'), { nia_nrp: niaNrp });
            const exists = response.data.exists;
            setNiaNrpExists(exists);
            if (exists) {
                setError('nia_nrp', response.data.message);
                toast.error(response.data.message);
            } else {
                clearErrors('nia_nrp');
            }
            return !exists;
        } catch (error) {
            console.error('Error validating NRP:', error);
            return true; // Allow to proceed on error
        } finally {
            setIsValidatingNiaNrp(false);
        }
    };

    // Validate KTA uniqueness
    const validateKta = async (kta: string) => {
        if (!kta) {
            setKtaExists(false);
            return true;
        }

        setIsValidatingKta(true);
        try {
            const response = await axios.post(route('api.validate.nomor-kta'), { nomor_kta: kta });
            const exists = response.data.exists;
            setKtaExists(exists);
            if (exists) {
                setError('nomor_kta', response.data.message);
                toast.error(response.data.message);
            } else {
                clearErrors('nomor_kta');
            }
            return !exists;
        } catch (error) {
            console.error('Error validating KTA:', error);
            return true;
        } finally {
            setIsValidatingKta(false);
        }
    };


    const nextStep = async () => {
        clearErrors();
        let hasError = false;

        if (step === 1) {
            // Validate Matra and Golongan selection
            if (!data.matra) {
                setError('matra', 'Wajib dipilih');
                hasError = true;
            }
            if (!data.golongan_id) {
                setError('golongan_id', 'Wajib dipilih');
                hasError = true;
            }

            if (hasError) {
                toast.error('Harap pilih Matra dan Jenjang Pangkat');
                return;
            }
        } else if (step === 2) {
            const requiredFields = [
                'nomor_kk', 'nik', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin',
                'suku_id', 'bangsa_id', 'agama_id', 'status_pernikahan_id', 'nama_ibu_kandung',
                'golongan_darah_id', 'tinggi_badan', 'berat_badan', 'warna_kulit', 'warna_rambut', 'bentuk_rambut'
            ];
            requiredFields.forEach(field => {
                if (!data[field as keyof typeof data]) {
                    setError(field as any, 'Wajib diisi');
                    hasError = true;
                }
            });

            // Allow if has new file OR has existing preview
            if (!data.foto_profil && !previews.foto_profil) {
                setError('foto_profil', 'Wajib diupload');
                hasError = true;
            }

            if (hasError) {
                toast.error('Harap lengkapi Data Diri dan Foto Profil');
                return;
            }

            // Validate uniqueness based on current state (instant check)
            if (nikExists) {
                setError('nik', 'NIK sudah terdaftar');
                hasError = true;
            }
            if (niaNrpExists) {
                setError('nia_nrp', 'Nomor KK sudah terdaftar');
                hasError = true;
            }

            if (hasError) {
                toast.error('Harap lengkapi Data Diri dan Foto Profil');
                return;
            }
        } else if (step === 3) {
            const requiredFields = [
                'ukuran_pakaian', 'ukuran_sepatu', 'ukuran_topi', 'ukuran_kaos_olahraga', 'ukuran_sepatu_olahraga',
                'jalan', 'province_id', 'city_id', 'district_id', 'village_id'
            ];

            requiredFields.forEach(field => {
                if (!data[field as keyof typeof data]) {
                    setError(field as any, 'Wajib diisi');
                    hasError = true;
                }
            });

            if (hasError) {
                toast.error('Harap lengkapi Ukuran dan Alamat');
                return;
            }
        } else if (step === 4) {
            const requiredFields = ['pendidikan_id', 'nama_sekolah', 'nama_prodi', 'nilai_akhir', 'status_lulus'];
            requiredFields.forEach(field => {
                if (!data[field as keyof typeof data]) {
                    setError(field as any, 'Wajib diisi');
                    hasError = true;
                }
            });

            if (hasError) {
                toast.error('Harap lengkapi Data Pendidikan');
                return;
            }
        } else if (step === 5) {
            if (data.is_bekerja === 'bekerja') {
                const requiredFields = ['pekerjaan_id', 'nama_profesi', 'nama_perusahaan'];
                requiredFields.forEach(field => {
                    if (!data[field as keyof typeof data]) {
                        setError(field as any, 'Wajib diisi');
                        hasError = true;
                    }
                });
            }

            if (data.has_organisasi === 'ada') {
                data.organisasi.forEach((org, index) => {
                    if (!org.nama_organisasi || !org.posisi || !org.tanggal_mulai || (!org.is_active && !org.tanggal_berakhir)) {
                        // We can set a general error effectively or try to target specific fields if possible
                        // Because FastInput inside map doesn't strictly bind to specific error strings easily without index, 
                        // we'll rely on a general toast and maybe setting error on the first field found?
                        // Actually our setError takes string.
                        hasError = true;
                    }
                });

                if (data.organisasi.length === 0) {
                    setError('organisasi' as any, 'Minimal satu organisasi');
                    hasError = true;
                }
            }

            if (hasError) {
                toast.error('Harap lengkapi Data Profesi dan Organisasi');
                return;
            }
        }

        // Default increment (for Step 1, 2, 3, 4, 5)
        setStep(s => Math.min(s + 1, 6));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 p-2 md:p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-red-600/20 rounded-full blur-[80px] md:blur-[120px] fade-in" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] bg-red-900/20 rounded-full blur-[60px] md:blur-[100px] fade-in delay-700" />

            <Head title={rejectionReason?.includes('Terdeteksi login') ? 'Aktifasi Ulang' : 'Lengkapi Profil'} />

            <Card className="w-full max-w-9xl h-[95vh] md:h-[90vh] bg-[#1a1a1a]/95 border-white/10 backdrop-blur-xl shadow-2xl relative z-10 transition-all duration-300 flex flex-col group/card">
                {/* Logout Button - MacBook Folder Style */}
                <div className="absolute top-2 right-2 md:top-4 md:right-4 z-50">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="group flex items-center gap-2 bg-white/5 hover:bg-red-500/20 backdrop-blur-md border border-white/10 hover:border-red-500/50 p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] hover:w-32 w-8 h-8 md:w-10 md:h-10 overflow-hidden hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    >
                        <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center shrink-0 text-white/70 group-hover:text-red-400 transition-colors">
                            <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <span className="text-sm font-medium text-red-100 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 delay-100 hidden md:block">
                            Keluar
                        </span>
                    </Link>
                </div>

                <CardHeader className="space-y-2 md:space-y-4 pb-3 md:pb-6 -mb-4 md:-mb-8 pt-12 md:pt-6">
                    <div className="flex flex-row justify-between items-center gap-1 md:gap-8 border-b border-white/5 pb-3 md:pb-6">
                        {/* Left: Kemhan */}
                        <div className="flex items-center justify-center md:justify-start shrink-0 px-0.5 md:px-1">
                            <img
                                src="/images/KEMENTERIAN-PERTAHANAN.png"
                                alt="Logo Kementerian Pertahanan"
                                className="h-14 w-14 md:h-28 md:w-28 lg:h-30 lg:w-30 object-contain drop-shadow-2xl"
                            />
                        </div>

                        {/* Center: Title */}
                        <div className="flex flex-col items-center flex-1 mx-0 md:mx-4">
                            <CardTitle className="text-xs md:text-2xl lg:text-3xl font-black text-[#AC0021] tracking-tight animate-in fade-in duration-700 delay-200 text-center leading-tight md:leading-normal mb-2 md:mb-4">
                                Calon Anggota Komponen Cadangan
                            </CardTitle>

                            {step > 0 && (
                                <div className="flex justify-between items-center w-full max-w-4xl relative px-1 md:px-10 mt-0.5 md:mt-1 mb-4 md:mb-8">
                                    {[
                                        { num: 1, label: 'Matra' },
                                        { num: 2, label: 'Data Pribadi' },
                                        { num: 3, label: 'Detail Data' },
                                        { num: 4, label: 'Pendidikan & Prestasi' },
                                        { num: 5, label: 'Profesi & Organisasi' },
                                        { num: 6, label: 'Dokumen' }
                                    ].map((s, index) => (
                                        <React.Fragment key={s.num}>
                                            <div className="flex flex-col items-center relative z-10 shrink-0">
                                                <div
                                                    className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-[10px] md:text-sm transition-all duration-300 border-2 ${step >= s.num
                                                        ? 'bg-[#AC0021] border-[#AC0021] text-[#FEFCF8] shadow-[0_0_15px_#AC0021]'
                                                        : 'bg-[#1a1a1a] border-white/20 text-gray-500'
                                                        }`}
                                                >
                                                    {s.num}
                                                </div>
                                                <div className="absolute top-8 md:top-12 w-20 md:w-32 text-center -ml-[calc(50%-0.75rem)] md:-ml-[calc(50%-1rem)] -translate-x-1/2 left-1/2 hidden md:flex justify-center">
                                                    <span className={`text-[8px] md:text-[11px] uppercase tracking-wider font-bold transition-colors duration-300 ${step >= s.num ? 'text-[#AC0021]' : 'text-gray-600'
                                                        }`}>
                                                        {s.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {index < 5 && (
                                                <div className="h-[2px] flex-1 mx-0.5 md:mx-2 bg-white/10 relative rounded-full overflow-hidden">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full bg-[#AC0021] transition-all duration-500 ${step > s.num ? 'w-full' : 'w-0'
                                                            }`}
                                                    />
                                                </div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right: Komcad */}
                        <div className="flex items-center justify-center md:justify-end shrink-0 px-0.5 md:px-1">
                            <img
                                src="/images/BADAN-CADANGAN-NASIONAL.png"
                                alt="Logo Badan Cadangan Nasional"
                                className="h-10 w-10 md:h-20 md:w-auto object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent ref={scrollContainerRef} className="p-2 md:p-8 -mt-4 md:-mt-8 flex-1 overflow-y-auto">
                    {rejectionReason && (
                        <Alert variant="destructive" className="mb-6 border-[#AC0021]/50 bg-red-500/10 text-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Verifikasi Ditolak</AlertTitle>
                            <AlertDescription>
                                {rejectionReason}
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">


                        {/* STEP 1: DATA DIRI */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                                {/* Quota Information */}
                                <Alert className="bg-[#1a1a1a] border-[#AC0021]/30">
                                    <AlertCircle className="h-4 w-4 text-[#AC0021]" />
                                    <AlertTitle className="text-sm md:text-base text-[#FEFCF8] font-bold">Informasi Alokasi Penerimaan Komponen Cadangan {new Date().getFullYear()}</AlertTitle>
                                    <AlertDescription>
                                        <div className="mt-2 md:mt-4 w-full overflow-x-auto">
                                            <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-0 w-full min-w-[280px]">
                                                {/* Header Row */}
                                                <div className="py-1.5 md:py-3 px-2 md:px-4 text-gray-400 font-medium border-b border-white/10 text-xs md:text-base"></div>
                                                <div className="py-1.5 md:py-3 px-2 md:px-4 text-[#FEFCF8] font-bold border-b border-white/10 text-center text-xs md:text-base">AD</div>
                                                <div className="py-1.5 md:py-3 px-2 md:px-4 text-[#FEFCF8] font-bold border-b border-white/10 text-center text-xs md:text-base">AL</div>
                                                <div className="py-1.5 md:py-3 px-2 md:px-4 text-[#FEFCF8] font-bold border-b border-white/10 text-center text-xs md:text-base">AU</div>

                                                {/* Total Row */}
                                                <div className="py-3 md:py-5 px-2 md:px-4 text-[#B0B0B0] border-b border-white/5 flex items-center text-xs md:text-base">Total</div>
                                                <div className="py-3 md:py-5 px-2 md:px-4 border-b border-white/5 flex items-center justify-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg md:text-2xl text-[#FEFCF8] font-bold">
                                                            {(Number(settings.quota_ad_1 || 0) + Number(settings.quota_ad_2 || 0) + Number(settings.quota_ad_3 || 0)).toLocaleString()}
                                                        </span>
                                                        <span className="text-[10px] md:text-xs text-[#B0B0B0]">orang</span>
                                                    </div>
                                                </div>
                                                <div className="py-3 md:py-5 px-2 md:px-4 border-b border-white/5 flex items-center justify-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg md:text-2xl text-[#FEFCF8] font-bold">
                                                            {(Number(settings.quota_al_1 || 0) + Number(settings.quota_al_2 || 0) + Number(settings.quota_al_3 || 0)).toLocaleString()}
                                                        </span>
                                                        <span className="text-[10px] md:text-xs text-[#B0B0B0]">orang</span>
                                                    </div>
                                                </div>
                                                <div className="py-3 md:py-5 px-2 md:px-4 border-b border-white/5 flex items-center justify-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-lg md:text-2xl text-[#FEFCF8] font-bold">
                                                            {(Number(settings.quota_au_1 || 0) + Number(settings.quota_au_2 || 0) + Number(settings.quota_au_3 || 0)).toLocaleString()}
                                                        </span>
                                                        <span className="text-[10px] md:text-xs text-[#B0B0B0]">orang</span>
                                                    </div>
                                                </div>

                                                {/* Perwira Row */}
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-[#B0B0B0] border-b border-white/5 flex items-center text-xs md:text-base">Perwira</div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] border-b border-white/5 flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_ad_1 || '-'}
                                                </div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] border-b border-white/5 flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_al_1 || '-'}
                                                </div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] border-b border-white/5 flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_au_1 || '-'}
                                                </div>

                                                {/* Bintara Row */}
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-[#B0B0B0] border-b border-white/5 flex items-center text-xs md:text-base">Bintara</div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] border-b border-white/5 flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_ad_2 || '-'}
                                                </div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] border-b border-white/5 flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_al_2 || '-'}
                                                </div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] border-b border-white/5 flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_au_2 || '-'}
                                                </div>

                                                {/* Tamtama Row */}
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-[#B0B0B0] flex items-center text-xs md:text-base">Tamtama</div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_ad_3 || '-'}
                                                </div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_al_3 || '-'}
                                                </div>
                                                <div className="py-2 md:py-4 px-2 md:px-4 text-center font-semibold text-[#FEFCF8] flex items-center justify-center text-sm md:text-base">
                                                    {settings.quota_au_3 || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>

                                {/* Matra Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <BadgeCheck className="w-5 h-5 text-[#AC0021]" />
                                        <h3 className="text-lg font-bold text-[#FEFCF8]">Matra</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* AD Card */}
                                        <button
                                            type="button"
                                            onClick={() => setData('matra', 'AD')}
                                            className={`relative p-6 rounded-xl border-2 transition-all ${data.matra === 'AD'
                                                ? 'border-[#AC0021] bg-[#AC0021]/10'
                                                : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-24 h-24 flex items-center justify-center">
                                                    <img
                                                        src="/images/Lambang_TNI_AD.png"
                                                        alt="TNI AD"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-[#FEFCF8] font-bold text-lg">AD</h4>
                                                </div>
                                                {data.matra === 'AD' && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#AC0021] flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* AL Card */}
                                        <button
                                            type="button"
                                            onClick={() => setData('matra', 'AL')}
                                            className={`relative p-6 rounded-xl border-2 transition-all ${data.matra === 'AL'
                                                ? 'border-[#AC0021] bg-[#AC0021]/10'
                                                : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-24 h-24 flex items-center justify-center">
                                                    <img
                                                        src="/images/Lambang_TNI_AL.png"
                                                        alt="TNI AL"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-[#FEFCF8] font-bold text-lg">AL</h4>
                                                </div>
                                                {data.matra === 'AL' && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#AC0021] flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* AU Card */}
                                        <button
                                            type="button"
                                            onClick={() => setData('matra', 'AU')}
                                            className={`relative p-6 rounded-xl border-2 transition-all ${data.matra === 'AU'
                                                ? 'border-[#AC0021] bg-[#AC0021]/10'
                                                : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
                                                }`}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-24 h-24 flex items-center justify-center">
                                                    <img
                                                        src="/images/Lambang_TNI_AU.png"
                                                        alt="TNI AU"
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <h4 className="text-[#FEFCF8] font-bold text-lg">AU</h4>
                                                </div>
                                                {data.matra === 'AU' && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#AC0021] flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                    {errors.matra && <p className="text-[#AC0021] text-sm mt-2">{errors.matra}</p>}
                                </div>

                                {/* Jenjang Pangkat Section */}
                                <div className="space-y-4 -mb-3">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CreditCard className="w-5 h-5 text-[#AC0021]" />
                                        <h3 className="text-lg font-bold text-[#FEFCF8]">Jenjang Pangkat</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Perwira (Golongan ID 1) */}
                                        <button
                                            type="button"
                                            onClick={() => { setData('golongan_id', 1); }}
                                            disabled={isQuotaFull(data.matra, 1)}
                                            className={`relative p-6 rounded-xl border-2 transition-all ${data.golongan_id === 1
                                                ? 'border-[#AC0021] bg-[#AC0021]/10'
                                                : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
                                                } ${isQuotaFull(data.matra, 1) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="text-center">
                                                    <h4 className="text-[#FEFCF8] font-bold text-xl mb-2">Perwira</h4>
                                                    <p className="text-gray-400 text-xs">*Jenjang Pendidikan Sarjana (Selesai)</p>
                                                </div>
                                                {data.golongan_id === 1 && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#AC0021] flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                                {isQuotaFull(data.matra, 1) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-12 border border-white/20">
                                                            KUOTA PENUH
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Bintara (Golongan ID 2) */}
                                        <button
                                            type="button"
                                            onClick={() => { setData('golongan_id', 2); }}
                                            disabled={isQuotaFull(data.matra, 2)}
                                            className={`relative p-6 rounded-xl border-2 transition-all ${data.golongan_id === 2
                                                ? 'border-[#AC0021] bg-[#AC0021]/10'
                                                : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
                                                } ${isQuotaFull(data.matra, 2) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="text-center">
                                                    <h4 className="text-[#FEFCF8] font-bold text-xl mb-2">Bintara</h4>
                                                    <p className="text-gray-400 text-xs">*Jenjang Pendidikan SMA (Selesai)</p>
                                                </div>
                                                {data.golongan_id === 2 && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#AC0021] flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                                {isQuotaFull(data.matra, 2) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-12 border border-white/20">
                                                            KUOTA PENUH
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Tamtama (Golongan ID 3) */}
                                        <button
                                            type="button"
                                            onClick={() => { setData('golongan_id', 3); }}
                                            disabled={isQuotaFull(data.matra, 3)}
                                            className={`relative p-6 rounded-xl border-2 transition-all ${data.golongan_id === 3
                                                ? 'border-[#AC0021] bg-[#AC0021]/10'
                                                : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
                                                } ${isQuotaFull(data.matra, 3) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="text-center">
                                                    <h4 className="text-[#FEFCF8] font-bold text-xl mb-2">Tamtama</h4>
                                                    <p className="text-gray-400 text-xs">*Jenjang Pendidikan SMA/SMK (Selesai)</p>
                                                </div>
                                                {data.golongan_id === 3 && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#AC0021] flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                                {isQuotaFull(data.matra, 3) && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                                                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform -rotate-12 border border-white/20">
                                                            KUOTA PENUH
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                    {errors.golongan_id && <p className="text-[#AC0021] text-sm mt-2">{errors.golongan_id}</p>}
                                </div>

                            </div>
                        )}


                        {/* STEP 2: DETAILS & FOTO */}
                        {step === 2 && (
                            <div className="animate-in fade-in zoom-in duration-500 ease-out space-y-6">
                                {/* Top: Photo & Basic Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                    {/* Left: Photo */}
                                    <div className="flex flex-row items-center justify-start gap-6 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                                        <div className="relative group cursor-pointer w-32 h-32 shrink-0">
                                            <div className={`w-full h-full rounded-full border-4 ${errors.foto_profil ? 'border-[#AC0021]' : 'border-dashed border-gray-600'} flex items-center justify-center bg-[#2a2a2a] overflow-hidden group-hover:border-[#AC0021] transition-all shadow-lg`}>
                                                {previews.foto_profil ? (
                                                    <img src={previews.foto_profil} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-12 h-12 text-[#B0B0B0]" />
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-6 h-6 text-[#FEFCF8]" />
                                            </div>
                                            <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={onFileChange} />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[#FEFCF8] font-bold text-lg">Foto Diri <span className="text-[#AC0021]">*</span></Label>
                                            <p className="text-gray-400 text-sm">Foto 4x6 Latar Belakang Merah</p>
                                            <p className="text-gray-500 text-xs uppercase">(JPG, PNG, JPEG)</p>
                                            {errors.foto_profil && <p className="text-[#AC0021] text-sm mt-2">{errors.foto_profil}</p>}
                                        </div>
                                    </div>

                                    {/* Right: Personal Details Inputs */}
                                    <div className="space-y-4 w-full">
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Nama Lengkap</Label>
                                            <Input
                                                value={auth.user.name}
                                                disabled
                                                className="bg-[#2a2a2a]/50 border-white/10 text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] font-medium">
                                                    Kartu Keluarga <span className="text-[#B0B0B0] text-xs font-normal ml-1">(Min. 16 digit)</span>
                                                </Label>
                                                <FastInput
                                                    value={data.nomor_kk}
                                                    onBlur={(e) => {
                                                        setData('nomor_kk', e.target.value);
                                                        // validateNiaNrp(e.target.value); // Removed validation for now
                                                    }}
                                                    onPaste={(e) => e.preventDefault()}
                                                    onCopy={(e) => e.preventDefault()}
                                                    onCut={(e) => e.preventDefault()}
                                                    minLength={16}
                                                    maxLength={16}
                                                    name="nomor_kk_field"
                                                    id="nomor_kk_field"
                                                    autoComplete="off"
                                                    data-lpignore="true"
                                                    className={`bg-[#2a2a2a] border-white/10 text-[#FEFCF8] focus:border-[#AC0021] ${errors.nomor_kk ? 'border-[#AC0021]' : ''}`}
                                                    placeholder="Nomor KK (16 Digit)"
                                                    onKeyPress={(e) => {
                                                        if (!/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    inputMode="numeric"
                                                />
                                                {errors.nomor_kk && <span className="text-red-500 text-sm">{errors.nomor_kk}</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] font-medium">
                                                    NIK <span className="text-[#B0B0B0] text-xs font-normal ml-1">(Min. 16 digit)</span>
                                                </Label>
                                                <FastInput
                                                    value={data.nik}
                                                    onBlur={(e) => {
                                                        setData('nik', e.target.value);
                                                        validateNik(e.target.value);
                                                    }}
                                                    onPaste={(e) => e.preventDefault()}
                                                    onCopy={(e) => e.preventDefault()}
                                                    onCut={(e) => e.preventDefault()}
                                                    maxLength={16}
                                                    name="nik_field_no_autofill"
                                                    id="nik_field_no_autofill"
                                                    autoComplete="off"
                                                    data-lpignore="true"
                                                    className={`bg-[#2a2a2a] border-white/10 text-[#FEFCF8] focus:border-[#AC0021] ${errors.nik || nikExists ? 'border-[#AC0021]' : ''}`}
                                                    placeholder="Nomor Induk Kependudukan"
                                                    onKeyPress={(e) => {
                                                        if (!/[0-9]/.test(e.key)) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    inputMode="numeric"
                                                />
                                                {errors.nik && <p className="text-[#AC0021] text-sm">{errors.nik}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Row Inputs - Split Layout */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4 border-t border-white/10">

                                    {/* Left Side: 2x2 Grid (Agama, Status, Suku, Bangsa) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Agama</Label>
                                            <Select
                                                value={String(data.agama_id)}
                                                onValueChange={(val) => { setData('agama_id', val); clearErrors('agama_id'); }}
                                            >
                                                <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                    <SelectValue placeholder="Pilih Agama" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {agamas.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.agama_id && <p className="text-[#AC0021] text-sm">{errors.agama_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Status Pernikahan</Label>
                                            <Select
                                                value={String(data.status_pernikahan_id)}
                                                onValueChange={(val) => { setData('status_pernikahan_id', val); clearErrors('status_pernikahan_id'); }}
                                            >
                                                <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                    <SelectValue placeholder="Pilih Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {status_pernikahans.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.status_pernikahan_id && <p className="text-[#AC0021] text-sm">{errors.status_pernikahan_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Suku</Label>
                                            <Select
                                                value={String(data.suku_id)}
                                                onValueChange={(val) => { setData('suku_id', val); clearErrors('suku_id'); }}
                                            >
                                                <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                    <SelectValue placeholder="Pilih Suku" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sukus.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.suku_id && <p className="text-[#AC0021] text-sm">{errors.suku_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Bangsa</Label>
                                            <Select
                                                value={String(data.bangsa_id)}
                                                onValueChange={(val) => { setData('bangsa_id', val); clearErrors('bangsa_id'); }}
                                            >
                                                <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                    <SelectValue placeholder="Pilih Bangsa" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {bangsas.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.bangsa_id && <p className="text-[#AC0021] text-sm">{errors.bangsa_id}</p>}
                                        </div>
                                    </div>

                                    {/* Right Side: 2x2 Grid (Ibu, Gender, Tempat, Tanggal) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Nama Ibu Kandung</Label>
                                            <FastInput
                                                value={data.nama_ibu_kandung}
                                                onBlur={(e) => {
                                                    setData('nama_ibu_kandung', e.target.value);
                                                    clearErrors('nama_ibu_kandung');
                                                }}
                                                className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                placeholder="Nama Ibu Kandung"
                                            />
                                            {errors.nama_ibu_kandung && <p className="text-[#AC0021] text-sm">{errors.nama_ibu_kandung}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Jenis Kelamin</Label>
                                            <div className="flex items-center gap-4 mt-2 h-10">
                                                {['Laki-laki', 'Perempuan'].map((gender) => (
                                                    <div
                                                        key={gender}
                                                        className="flex items-center gap-2 cursor-pointer group"
                                                        onClick={() => { setData('jenis_kelamin', gender); clearErrors('jenis_kelamin'); }}
                                                    >
                                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${data.jenis_kelamin === gender ? 'border-[#AC0021] bg-[#AC0021]' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                                            {data.jenis_kelamin === gender && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                        </div>
                                                        <span className={`text-sm font-medium transition-colors ${data.jenis_kelamin === gender ? 'text-[#FEFCF8]' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                                            {gender}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.jenis_kelamin && <p className="text-[#AC0021] text-sm">{errors.jenis_kelamin}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Tempat Lahir</Label>
                                            <div className="grid grid-cols-2 gap-2"> {/* Side-by-side */}
                                                <SearchableSelect
                                                    value={data.birthplace_province_id}
                                                    onValueChange={fetchBirthplaceCities}
                                                    options={provinces.map(p => ({ value: p.code, label: p.name }))}
                                                    placeholder="Pilih Provinsi"
                                                    searchPlaceholder="Cari Provinsi..."
                                                    error={!!errors.tempat_lahir}
                                                />

                                                <SearchableSelect
                                                    value={data.tempat_lahir}
                                                    onValueChange={val => { setData('tempat_lahir', val); clearErrors('tempat_lahir'); }}
                                                    options={birthplaceCities.map(c => ({ value: c.code, label: c.name }))}
                                                    placeholder="Pilih Kota"
                                                    searchPlaceholder="Cari Kota..."
                                                    disabled={birthplaceCities.length === 0}
                                                    error={!!errors.tempat_lahir}
                                                />
                                            </div>
                                            {errors.tempat_lahir && <p className="text-[#AC0021] text-sm">{errors.tempat_lahir}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Tanggal Lahir</Label>
                                            <DateSelect
                                                value={data.tanggal_lahir ? format(data.tanggal_lahir, 'yyyy-MM-dd') : ''}
                                                onChange={(val) => {
                                                    setData('tanggal_lahir', val ? new Date(val) : undefined);
                                                    clearErrors('tanggal_lahir');
                                                }}
                                                error={!!errors.tanggal_lahir}
                                                startYear={1950}
                                                endYear={new Date().getFullYear()}
                                            />
                                            {errors.tanggal_lahir && <p className="text-[#AC0021] text-sm">{errors.tanggal_lahir}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Physical & Contact Details - Split Layout */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4 border-t border-white/10">

                                    {/* Left Side: 2x2 Grid (Goldar, Phone, Height, Weight) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Golongan Darah</Label>
                                            <Select
                                                value={String(data.golongan_darah_id)}
                                                onValueChange={(val) => { setData('golongan_darah_id', val); clearErrors('golongan_darah_id'); }}
                                            >
                                                <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                    <SelectValue placeholder="Pilih Golongan Darah" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {goldars.map((s) => (
                                                        <SelectItem key={s.id} value={String(s.id)}>{s.nama} {s.rhesus}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.golongan_darah_id && <p className="text-[#AC0021] text-sm">{errors.golongan_darah_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Nomor Handphone</Label>
                                            <FastInput
                                                value={auth.user.phone_number || ''}
                                                disabled
                                                className="bg-[#2a2a2a]/50 border-white/10 text-gray-400 cursor-not-allowed"
                                                placeholder="Nomor Handphone"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Tinggi Badan (cm)</Label>
                                            <div className="relative">
                                                <FastInput
                                                    type="number"
                                                    value={data.tinggi_badan}
                                                    onBlur={(e) => {
                                                        setData('tinggi_badan', e.target.value);
                                                        clearErrors('tinggi_badan');
                                                    }}
                                                    className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8] pr-8"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                                            </div>
                                            {errors.tinggi_badan && <p className="text-[#AC0021] text-sm">{errors.tinggi_badan}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Berat Badan (kg)</Label>
                                            <div className="relative">
                                                <FastInput
                                                    type="number"
                                                    value={data.berat_badan}
                                                    onBlur={(e) => {
                                                        setData('berat_badan', e.target.value);
                                                        clearErrors('berat_badan');
                                                    }}
                                                    className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8] pr-8"
                                                    placeholder="0"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                                            </div>
                                            {errors.berat_badan && <p className="text-[#AC0021] text-sm">{errors.berat_badan}</p>}
                                        </div>
                                    </div>

                                    {/* Right Side: 2x2 Grid (Email, Skin, Hair Color, Hair Type) */}
                                    {/* Right Side Wrapper */}
                                    <div className="flex flex-col gap-6">
                                        {/* Top: Email & Skin (2 cols) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] font-medium">Email</Label>
                                                <FastInput
                                                    value={auth.user.email || ''}
                                                    disabled
                                                    className="bg-[#2a2a2a]/50 border-white/10 text-gray-400 cursor-not-allowed"
                                                    placeholder="Email"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] font-medium">Warna Kulit</Label>
                                                <Select
                                                    value={data.warna_kulit}
                                                    onValueChange={(val) => {
                                                        setData('warna_kulit', val);
                                                        clearErrors('warna_kulit');
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                        <SelectValue placeholder="Pilih Warna Kulit" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['Sawo Matang', 'Kuning Langsat', 'Putih', 'Hitam', 'Coklat'].map((opt) => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.warna_kulit && <p className="text-[#AC0021] text-sm">{errors.warna_kulit}</p>}
                                            </div>
                                        </div>

                                        {/* Bottom: Eyes, Hair Color, Hair Shape (3 cols) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                                            <div className="space-y-2 mt-2">
                                                <Label className="text-[#FEFCF8] font-medium">Warna Rambut</Label>
                                                <Select
                                                    value={data.warna_rambut}
                                                    onValueChange={(val) => {
                                                        setData('warna_rambut', val);
                                                        clearErrors('warna_rambut');
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                        <SelectValue placeholder="Pilih Warna Rambut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['Hitam', 'Coklat', 'Pirang', 'Putih/Uban'].map((opt) => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.warna_rambut && <p className="text-[#AC0021] text-sm">{errors.warna_rambut}</p>}
                                            </div>

                                            <div className="space-y-2 mt-2">
                                                <Label className="text-[#FEFCF8] font-medium">Bentuk Rambut</Label>
                                                <Select
                                                    value={data.bentuk_rambut}
                                                    onValueChange={(val) => {
                                                        setData('bentuk_rambut', val);
                                                        clearErrors('bentuk_rambut');
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                        <SelectValue placeholder="Pilih Bentuk Rambut" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['Lurus', 'Ikal', 'Bergelombang', 'Keriting'].map((opt) => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.bentuk_rambut && <p className="text-[#AC0021] text-sm">{errors.bentuk_rambut}</p>}
                                            </div>

                                            <div className="space-y-2 mt-2">
                                                <Label className="text-[#FEFCF8] font-medium">Warna Mata</Label>
                                                <Select
                                                    value={data.warna_mata}
                                                    onValueChange={(val) => {
                                                        setData('warna_mata', val);
                                                        clearErrors('warna_mata');
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                        <SelectValue placeholder="Pilih Warna Mata" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {['Hitam', 'Cokelat'].map((opt) => (
                                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.warna_mata && <p className="text-[#AC0021] text-sm">{errors.warna_mata}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DATA KEPEGAWAIAN */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                                {/* Clothing Sizes - 4 Columns */}
                                <div className="space-y-2 pt-4 -mt-4">
                                    <Label className="text-[#FEFCF8] font-medium text-lg">Ukuran Pakaian & Sepatu</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {[
                                            { key: 'ukuran_pakaian', label: 'Ukuran Pakaian PDL', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
                                            { key: 'ukuran_kaos_pdl', label: 'Ukuran Kaos PDL', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
                                            { key: 'ukuran_seragam_tactical', label: 'Ukuran Seragam Tactical', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
                                            { key: 'ukuran_kaos_olahraga', label: 'Ukuran Kaos Olahraga', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
                                            { key: 'ukuran_baju_tidur', label: 'Ukuran Baju Tidur', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-2">
                                                <Label className="text-[#FEFCF8] text-sm font-normal">{field.label}</Label>
                                                <Select
                                                    value={(data as any)[field.key]?.toString()}
                                                    onValueChange={(val) => {
                                                        setData(field.key as any, val);
                                                        clearErrors(field.key as any);
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                        <SelectValue placeholder={`Pilih ${field.label}`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                                        {[
                                            { key: 'ukuran_baju_renang', label: 'Ukuran Baju Renang', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
                                            { key: 'ukuran_training_pack', label: 'Ukuran Training Pack', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
                                            { key: 'ukuran_topi', label: 'Ukuran Baret', options: ['S', 'M', 'L', 'XL', '2XL', '3XL'] },
                                            { key: 'ukuran_sepatu', label: 'Ukuran Sepatu PDL', options: Array.from({ length: 14 }, (_, i) => (35 + i).toString()) },
                                            { key: 'ukuran_sepatu_olahraga', label: 'Ukuran Sepatu Olahraga', options: Array.from({ length: 14 }, (_, i) => (35 + i).toString()) },
                                            { key: 'ukuran_sepatu_tactical', label: 'Ukuran Sepatu Tactical', options: Array.from({ length: 14 }, (_, i) => (35 + i).toString()) },
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-2">
                                                <Label className="text-[#FEFCF8] text-sm font-normal">{field.label}</Label>
                                                <Select
                                                    value={(data as any)[field.key]?.toString()}
                                                    onValueChange={(val) => {
                                                        setData(field.key as any, val);
                                                        clearErrors(field.key as any);
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                        <SelectValue placeholder={`Pilih ${field.label}`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {field.options.map((opt) => (
                                                            <SelectItem key={opt} value={opt}>
                                                                {opt}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Address Section - Moved from Step 4 */}
                                <div className="space-y-6 pt-4 border-t border-white/10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[#FEFCF8] font-medium text-lg">Alamat KTP</Label>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        id="sameAsKTP"
                                                        checked={isSameAsKTP}
                                                        onCheckedChange={(checked) => setIsSameAsKTP(checked as boolean)}
                                                        className="border-red/80 data-[state=checked]:bg-red/80 data-[state=checked]:border-red/80"
                                                    />
                                                    <Label
                                                        htmlFor="sameAsKTP"
                                                        className="text-[#FEFCF8] text-sm font-normal cursor-pointer"
                                                    >
                                                        Alamat Domisili sama dengan KTP
                                                    </Label>
                                                </div>
                                            </div>
                                            <Textarea
                                                ref={jalanRef}
                                                defaultValue={data.jalan}
                                                onBlur={(e) => { setData('jalan', e.target.value); clearErrors('jalan'); }}
                                                className={`bg-[#2a2a2a] border-white/10 text-[#FEFCF8] focus:border-[#AC0021] min-h-[100px] ${errors.jalan ? 'border-[#AC0021]' : ''}`}
                                                placeholder="Nama Jalan, No. Rumah, RT/RW"
                                            />
                                            {errors.jalan && <p className="text-[#AC0021] text-sm">{errors.jalan}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Provinsi</Label>
                                            <SearchableSelect
                                                value={data.province_id}
                                                onValueChange={fetchCities}
                                                options={provinces.map(p => ({ value: p.code, label: p.name }))}
                                                placeholder="Pilih Provinsi"
                                                searchPlaceholder="Cari Provinsi..."
                                                error={!!errors.province_id}
                                            />
                                            {errors.province_id && <p className="text-[#AC0021] text-sm">{errors.province_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Kota/Kabupaten</Label>
                                            <SearchableSelect
                                                value={data.city_id}
                                                onValueChange={fetchDistricts}
                                                options={cities.map(c => ({ value: c.code, label: c.name }))}
                                                placeholder="Pilih Kota/Kabupaten"
                                                searchPlaceholder="Cari Kota/Kabupaten..."
                                                disabled={!data.province_id}
                                                error={!!errors.city_id}
                                            />
                                            {errors.city_id && <p className="text-[#AC0021] text-sm">{errors.city_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Kecamatan</Label>
                                            <SearchableSelect
                                                value={data.district_id}
                                                onValueChange={fetchVillages}
                                                options={districts.map(d => ({ value: d.code, label: d.name }))}
                                                placeholder="Pilih Kecamatan"
                                                searchPlaceholder="Cari Kecamatan..."
                                                disabled={!data.city_id}
                                                error={!!errors.district_id}
                                            />
                                            {errors.district_id && <p className="text-[#AC0021] text-sm">{errors.district_id}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium">Kelurahan</Label>
                                            <SearchableSelect
                                                value={data.village_id}
                                                onValueChange={(val) => { setData('village_id', val); clearErrors('village_id'); }}
                                                options={villages.map(v => ({ value: v.code, label: v.name }))}
                                                placeholder="Pilih Kelurahan"
                                                searchPlaceholder="Cari Kelurahan..."
                                                disabled={!data.district_id}
                                                error={!!errors.village_id}
                                            />
                                            {errors.village_id && <p className="text-[#AC0021] text-sm">{errors.village_id}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Domicile Address Section - Hidden when checkbox is checked */}
                                {!isSameAsKTP && (
                                    <div className="space-y-12 pt-4 border-t border-white/10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2 md:col-span-2">
                                                <Label className="text-[#FEFCF8] font-medium text-lg">Alamat Domisili</Label>
                                                <Textarea
                                                    ref={domisiliJalanRef}
                                                    defaultValue={data.domisili_jalan}
                                                    onBlur={(e) => { setData('domisili_jalan', e.target.value); clearErrors('domisili_jalan'); }}
                                                    className={`bg-[#2a2a2a] border-white/10 text-[#FEFCF8] focus:border-[#AC0021] min-h-[100px] ${errors.domisili_jalan ? 'border-[#AC0021]' : ''}`}
                                                    placeholder="Nama Jalan, No. Rumah, RT/RW"
                                                />
                                                {errors.domisili_jalan && <p className="text-[#AC0021] text-sm">{errors.domisili_jalan}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] font-medium">Provinsi</Label>
                                                <SearchableSelect
                                                    value={data.domisili_province_id}
                                                    onValueChange={fetchDomisiliCities}
                                                    options={provinces.map(p => ({ value: p.code, label: p.name }))}
                                                    placeholder="Pilih Provinsi"
                                                    searchPlaceholder="Cari Provinsi..."
                                                    error={!!errors.domisili_province_id}
                                                />
                                                {errors.domisili_province_id && <p className="text-[#AC0021] text-sm">{errors.domisili_province_id}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] font-medium">Kota/Kabupaten</Label>
                                                <SearchableSelect
                                                    value={data.domisili_city_id}
                                                    onValueChange={fetchDomisiliDistricts}
                                                    options={domisiliCities.map(c => ({ value: c.code, label: c.name }))}
                                                    placeholder="Pilih Kota/Kabupaten"
                                                    searchPlaceholder="Cari Kota/Kabupaten..."
                                                    disabled={!data.domisili_province_id}
                                                    error={!!errors.domisili_city_id}
                                                />
                                                {errors.domisili_city_id && <p className="text-[#AC0021] text-sm">{errors.domisili_city_id}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] font-medium">Kecamatan</Label>
                                                <SearchableSelect
                                                    value={data.domisili_district_id}
                                                    onValueChange={fetchDomisiliVillages}
                                                    options={domisiliDistricts.map(d => ({ value: d.code, label: d.name }))}
                                                    placeholder="Pilih Kecamatan"
                                                    searchPlaceholder="Cari Kecamatan..."
                                                    disabled={!data.domisili_city_id}
                                                    error={!!errors.domisili_district_id}
                                                />
                                                {errors.domisili_district_id && <p className="text-[#AC0021] text-sm">{errors.domisili_district_id}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] font-medium">Kelurahan</Label>
                                                <SearchableSelect
                                                    value={data.domisili_village_id}
                                                    onValueChange={(val) => { setData('domisili_village_id', val); clearErrors('domisili_village_id'); }}
                                                    options={domisiliVillages.map(v => ({ value: v.code, label: v.name }))}
                                                    placeholder="Pilih Kelurahan"
                                                    searchPlaceholder="Cari Kelurahan..."
                                                    disabled={!data.domisili_district_id}
                                                    error={!!errors.domisili_village_id}
                                                />
                                                {errors.domisili_village_id && <p className="text-[#AC0021] text-sm">{errors.domisili_village_id}</p>}
                                            </div>
                                        </div>
                                    </div >
                                )}
                            </div>
                        )}

                        {/* STEP 4: Empty / Skipped */}
                        {step === 4 && (
                            <div className="hidden"></div>
                        )}

                        {/* STEP 4: PENDIDIKAN & PRESTASI */}
                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <GraduationCap className="w-5 h-5 text-[#AC0021]" />
                                        <h3 className="text-lg font-bold text-[#FEFCF8]">Pendidikan</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Pendidikan */}
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8]">Pendidikan Terakhir</Label>
                                            <Select
                                                value={data.pendidikan_id?.toString()}
                                                onValueChange={(val) => {
                                                    setData('pendidikan_id', val);
                                                    clearErrors('pendidikan_id');
                                                }}
                                            >
                                                <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                    <SelectValue placeholder="Pilih Pendidikan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {pendidikans.map((p) => (
                                                        <SelectItem key={p.id} value={p.id.toString()}>
                                                            {p.singkatan}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.pendidikan_id && <span className="text-red-500 text-sm">{errors.pendidikan_id}</span>}
                                        </div>

                                        {/* Nama Institusi */}
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8]">Nama Institusi Pendidikan</Label>
                                            <FastInput
                                                value={data.nama_sekolah}
                                                onBlur={(e) => {
                                                    setData('nama_sekolah', e.target.value);
                                                    clearErrors('nama_sekolah');
                                                }}
                                                className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                placeholder="Contoh: Universitas Indonesia"
                                            />
                                            {errors.nama_sekolah && <span className="text-red-500 text-sm">{errors.nama_sekolah}</span>}
                                        </div>

                                        {/* Nama Jurusan */}
                                        <div className="space-y-2">
                                            <Label className="text-[#FEFCF8]">Nama Jurusan / Prodi</Label>
                                            <FastInput
                                                value={data.nama_prodi}
                                                onBlur={(e) => {
                                                    setData('nama_prodi', e.target.value);
                                                    clearErrors('nama_prodi');
                                                }}
                                                className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                placeholder="Contoh: Teknik Informatika"
                                            />
                                            {errors.nama_prodi && <span className="text-red-500 text-sm">{errors.nama_prodi}</span>}
                                        </div>

                                        {/* Nested Grid for Grades & Status */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Nilai Akhir */}
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8]">IPS / IPK / NEM</Label>
                                                <FastInput
                                                    value={data.nilai_akhir}
                                                    onBlur={(e) => {
                                                        setData('nilai_akhir', e.target.value);
                                                        clearErrors('nilai_akhir');
                                                    }}
                                                    className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                    placeholder="Contoh: 3.50"
                                                />
                                                {errors.nilai_akhir && <span className="text-red-500 text-sm">{errors.nilai_akhir}</span>}
                                            </div>

                                            {/* Status Lulus */}
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8]">Status Lulus</Label>
                                                <Select
                                                    value={data.status_lulus}
                                                    onValueChange={(val) => {
                                                        setData('status_lulus', val);
                                                        clearErrors('status_lulus');
                                                    }}
                                                >
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                        <SelectValue placeholder="Pilih Status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Lulus">Lulus</SelectItem>
                                                        <SelectItem value="Tidak Lulus">Tidak Lulus</SelectItem>
                                                        <SelectItem value="Sedang Menempuh">Sedang Menempuh</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.status_lulus && <span className="text-red-500 text-sm">{errors.status_lulus}</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-white/10 my-6"></div>

                                {/* PRESTASI SECTION */}
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Trophy className="w-5 h-5 text-[#AC0021]" />
                                            <h3 className="text-lg font-bold text-[#FEFCF8]">Prestasi</h3>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${data.has_prestasi === 'ada' ? 'border-[#AC0021]' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                                    {data.has_prestasi === 'ada' && <div className="w-3 h-3 rounded-full bg-[#AC0021]" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="has_prestasi"
                                                    value="ada"
                                                    checked={data.has_prestasi === 'ada'}
                                                    onChange={(e) => {
                                                        setData('has_prestasi', 'ada');
                                                        if (data.prestasi.length === 0) {
                                                            setData('prestasi', [{
                                                                jenis_prestasi: '',
                                                                tingkat: '',
                                                                nama_kegiatan: '',
                                                                pencapaian: '',
                                                                tahun: ''
                                                            }]);
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm font-medium transition-colors ${data.has_prestasi === 'ada' ? 'text-[#FEFCF8]' : 'text-gray-400 group-hover:text-gray-300'}`}>Ada</span>
                                            </label>

                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${data.has_prestasi === 'tidak_ada' ? 'border-[#AC0021]' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                                    {data.has_prestasi === 'tidak_ada' && <div className="w-3 h-3 rounded-full bg-[#AC0021]" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="has_prestasi"
                                                    value="tidak_ada"
                                                    checked={data.has_prestasi === 'tidak_ada'}
                                                    onChange={(e) => setData('has_prestasi', 'tidak_ada')}
                                                    className="hidden"
                                                />
                                                <span className={`text-sm font-medium transition-colors ${data.has_prestasi === 'tidak_ada' ? 'text-[#FEFCF8]' : 'text-gray-400 group-hover:text-gray-300'}`}>Tidak Ada</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Prestasi List */}
                                    {data.has_prestasi === 'ada' && (
                                        <div className="space-y-6 pt-2">
                                            {data.prestasi.map((item: any, index: number) => (
                                                <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                    {/* Badge & Remove */}
                                                    <div className="flex justify-between items-center mb-6">
                                                        <div className="text-sm font-bold text-[#AC0021] bg-[#AC0021]/10 px-3 py-1 rounded-full border border-[#AC0021]/20">
                                                            Prestasi {index + 1}
                                                        </div>
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newList = [...data.prestasi];
                                                                    newList.splice(index, 1);
                                                                    setData('prestasi', newList);
                                                                }}
                                                                className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {/* Jenis Prestasi */}
                                                        <div className="space-y-2">
                                                            <Label className="text-[#FEFCF8] flex items-center gap-1">Jenis Prestasi <span className="text-red-500">*</span></Label>
                                                            <Select
                                                                value={item.jenis_prestasi}
                                                                onValueChange={(val) => {
                                                                    const newList = [...data.prestasi];
                                                                    newList[index].jenis_prestasi = val;
                                                                    setData('prestasi', newList);
                                                                }}
                                                            >
                                                                <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                                    <SelectValue placeholder="Pilih Jenis" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Akademik">Akademik</SelectItem>
                                                                    <SelectItem value="Non-Akademik">Non-Akademik / Seni</SelectItem>
                                                                    <SelectItem value="Olahraga">Olahraga</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Tingkat */}
                                                        <div className="space-y-2">
                                                            <Label className="text-[#FEFCF8] flex items-center gap-1">Tingkat <span className="text-red-500">*</span></Label>
                                                            <Select
                                                                value={item.tingkat}
                                                                onValueChange={(val) => {
                                                                    const newList = [...data.prestasi];
                                                                    newList[index].tingkat = val;
                                                                    setData('prestasi', newList);
                                                                }}
                                                            >
                                                                <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                                    <SelectValue placeholder="Pilih Tingkat" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Kabupaten/Kota">Kabupaten / Kota</SelectItem>
                                                                    <SelectItem value="Provinsi">Provinsi</SelectItem>
                                                                    <SelectItem value="Nasional">Nasional</SelectItem>
                                                                    <SelectItem value="Internasional">Internasional</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Nama Kegiatan */}
                                                        <div className="space-y-2 md:col-span-2">
                                                            <Label className="text-[#FEFCF8] flex items-center gap-1">Nama Kegiatan / Perlombaan <span className="text-red-500">*</span></Label>
                                                            <FastInput
                                                                value={item.nama_kegiatan}
                                                                onChange={(e) => {
                                                                    const newList = [...data.prestasi];
                                                                    newList[index].nama_kegiatan = e.target.value;
                                                                    setData('prestasi', newList);
                                                                }}
                                                                className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                                placeholder="Contoh: Olimpiade Sains Nasional"
                                                            />
                                                        </div>

                                                        {/* Pencapaian & Tahun */}
                                                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                                            <div className="space-y-2">
                                                                <Label className="text-[#FEFCF8] flex items-center gap-1">Pencapaian Prestasi <span className="text-red-500">*</span></Label>
                                                                <FastInput
                                                                    value={item.pencapaian}
                                                                    onChange={(e) => {
                                                                        const newList = [...data.prestasi];
                                                                        newList[index].pencapaian = e.target.value;
                                                                        setData('prestasi', newList);
                                                                    }}
                                                                    className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                                    placeholder="Contoh: Juara 1"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[#FEFCF8] flex items-center gap-1">Tahun Prestasi <span className="text-red-500">*</span></Label>
                                                                <SearchableSelect
                                                                    value={item.tahun}
                                                                    onValueChange={(val) => {
                                                                        const newList = [...data.prestasi];
                                                                        newList[index].tahun = val;
                                                                        setData('prestasi', newList);
                                                                    }}
                                                                    options={Array.from({ length: new Date().getFullYear() - 1945 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => ({
                                                                        value: year.toString(),
                                                                        label: year.toString()
                                                                    }))}
                                                                    placeholder="Pilih Tahun"
                                                                    searchPlaceholder="Cari Tahun..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Button */}
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setData('prestasi', [...data.prestasi, {
                                                            jenis_prestasi: '',
                                                            tingkat: '',
                                                            nama_kegiatan: '',
                                                            pencapaian: '',
                                                            tahun: ''
                                                        }]);
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-[#AC0021] text-white rounded-full hover:bg-[#8a001a] transition-colors shadow-lg shadow-red-900/20"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Tambah Prestasi</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 5: PROFESI & ORGANISASI */}
                        {step === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                                {/* Profesi Section */}
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Briefcase className="w-5 h-5 text-[#AC0021]" />
                                            <h3 className="text-lg font-bold text-[#FEFCF8]">Profesi</h3>
                                        </div>

                                        {/* Radio buttons for Bekerja/Tidak Bekerja */}
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="is_bekerja"
                                                    value="bekerja"
                                                    checked={data.is_bekerja === 'bekerja'}
                                                    onChange={(e) => setData('is_bekerja', e.target.value)}
                                                    className="w-4 h-4 text-[#AC0021] bg-[#2a2a2a] border-white/10 focus:ring-[#AC0021] focus:ring-2"
                                                />
                                                <span className="text-[#FEFCF8]">Bekerja</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="is_bekerja"
                                                    value="tidak_bekerja"
                                                    checked={data.is_bekerja === 'tidak_bekerja'}
                                                    onChange={(e) => setData('is_bekerja', e.target.value)}
                                                    className="w-4 h-4 text-[#AC0021] bg-[#2a2a2a] border-white/10 focus:ring-[#AC0021] focus:ring-2"
                                                />
                                                <span className="text-[#FEFCF8]">Tidak Bekerja</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Profession Details (shown when Bekerja is selected) */}
                                    {data.is_bekerja === 'bekerja' && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                            {/* Jenis Profesi */}
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] flex items-center gap-1">
                                                    Jenis Profesi <span className="text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={data.pekerjaan_id?.toString()}
                                                    onValueChange={(val) => setData('pekerjaan_id', val)}
                                                >
                                                    <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]">
                                                        <SelectValue placeholder="Pilih Jenis Profesi" />
                                                    </SelectTrigger>
                                                    <SelectContent side="bottom">
                                                        {pekerjaans.map((pekerjaan) => (
                                                            <SelectItem key={pekerjaan.id} value={pekerjaan.id.toString()}>
                                                                {pekerjaan.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.pekerjaan_id && <p className="text-[#AC0021] text-sm">{errors.pekerjaan_id}</p>}
                                            </div>

                                            {/* Nama Profesi */}
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] flex items-center gap-1">
                                                    Nama Profesi <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    ref={namaProfesiRef}
                                                    name="nama_profesi"
                                                    defaultValue={data.nama_profesi}
                                                    onBlur={(e) => setData('nama_profesi', e.target.value)}
                                                    className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                    placeholder="Masukkan nama profesi"
                                                />
                                                {errors.nama_profesi && <p className="text-[#AC0021] text-sm">{errors.nama_profesi}</p>}
                                            </div>

                                            {/* Nama Perusahaan/Instansi */}
                                            <div className="space-y-2">
                                                <Label className="text-[#FEFCF8] flex items-center gap-1">
                                                    Nama Perusahaan/Instansi <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    ref={namaPerusahaanRef}
                                                    name="nama_perusahaan"
                                                    defaultValue={data.nama_perusahaan}
                                                    onBlur={(e) => setData('nama_perusahaan', e.target.value)}
                                                    className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                    placeholder="Masukkan nama perusahaan/instansi"
                                                />
                                                {errors.nama_perusahaan && <p className="text-[#AC0021] text-sm">{errors.nama_perusahaan}</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 5 CONTINUED: ORGANISASI */}
                        {step === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ease-out mt-6">
                                {/* Divider */}
                                <div className="border-t border-white/10"></div>

                                {/* ORGANISASI SECTION */}
                                <div className="space-y-4">
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Building2 className="w-5 h-5 text-[#AC0021]" />
                                            <h3 className="text-lg font-bold text-[#FEFCF8]">Organisasi</h3>
                                        </div>

                                        {/* Radio buttons for Ada/Tidak Ada */}
                                        <div className="flex items-center gap-6">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="has_organisasi"
                                                    value="ada"
                                                    checked={data.has_organisasi === 'ada'}
                                                    onChange={(e) => {
                                                        setData('has_organisasi', e.target.value);
                                                        if (e.target.value === 'ada' && data.organisasi.length === 0) {
                                                            setData('organisasi', [{
                                                                nama_organisasi: '',
                                                                posisi: '',
                                                                tanggal_mulai: '',
                                                                tanggal_berakhir: '',
                                                                informasi_tambahan: '',
                                                                is_active: false
                                                            }]);
                                                        }
                                                    }}
                                                    className="w-4 h-4 text-[#AC0021] bg-[#2a2a2a] border-white/10 focus:ring-[#AC0021] focus:ring-2"
                                                />
                                                <span className="text-[#FEFCF8]">Ada</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="has_organisasi"
                                                    value="tidak_ada"
                                                    checked={data.has_organisasi === 'tidak_ada'}
                                                    onChange={(e) => setData('has_organisasi', e.target.value)}
                                                    className="w-4 h-4 text-[#AC0021] bg-[#2a2a2a] border-white/10 focus:ring-[#AC0021] focus:ring-2"
                                                />
                                                <span className="text-[#FEFCF8]">Tidak Ada</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Organisasi List */}
                                    {data.has_organisasi === 'ada' && (
                                        <div className="space-y-6 pt-2">
                                            {data.organisasi.map((item: any, index: number) => (
                                                <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 relative space-y-4">
                                                    {/* Delete Button (except first item) */}
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newList = data.organisasi.filter((_: any, i: number) => i !== index);
                                                                setData('organisasi', newList);
                                                            }}
                                                            className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}

                                                    <div className="pr-10">
                                                        <h4 className="text-[#FEFCF8] font-semibold mb-4">Organisasi {index + 1}</h4>
                                                    </div>

                                                    {/* Nama Organisasi/Kegiatan */}
                                                    <div className="space-y-2">
                                                        <Label className="text-[#FEFCF8] flex items-center gap-1">
                                                            Nama Organisasi/Kegiatan <span className="text-red-500">*</span>
                                                        </Label>
                                                        <FastInput
                                                            value={item.nama_organisasi}
                                                            onChange={(e) => {
                                                                const newList = [...data.organisasi];
                                                                newList[index].nama_organisasi = e.target.value;
                                                                setData('organisasi', newList);
                                                            }}
                                                            className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                            placeholder="Contoh: Karang Taruna"
                                                        />
                                                    </div>

                                                    {/* Posisi & Dates Grid */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Posisi */}
                                                        <div className="space-y-2">
                                                            <Label className="text-[#FEFCF8] flex items-center gap-1">
                                                                Posisi <span className="text-red-500">*</span>
                                                            </Label>
                                                            <FastInput
                                                                value={item.posisi}
                                                                onChange={(e) => {
                                                                    const newList = [...data.organisasi];
                                                                    newList[index].posisi = e.target.value;
                                                                    setData('organisasi', newList);
                                                                }}
                                                                className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                                placeholder="Contoh: Ketua"
                                                            />
                                                        </div>

                                                        {/* Tanggal Mulai */}
                                                        <div className="space-y-2">
                                                            <Label className="text-[#FEFCF8] flex items-center gap-1">
                                                                Tanggal Mulai <span className="text-red-500">*</span>
                                                            </Label>
                                                            <FastInput
                                                                type="month"
                                                                value={item.tanggal_mulai?.substring(0, 7)}
                                                                onChange={(e) => {
                                                                    const newList = [...data.organisasi];
                                                                    const val = e.target.value;
                                                                    newList[index].tanggal_mulai = val ? `${val}-01` : '';
                                                                    setData('organisasi', newList);
                                                                }}
                                                                className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                            />
                                                        </div>

                                                        {/* Tanggal Berakhir */}
                                                        <div className="space-y-2 md:col-span-2">
                                                            <Label className="text-[#FEFCF8] flex items-center gap-1">
                                                                Tanggal Berakhir {!item.is_active && <span className="text-red-500">*</span>}
                                                            </Label>
                                                            <FastInput
                                                                type="month"
                                                                value={item.tanggal_berakhir?.substring(0, 7)}
                                                                onChange={(e) => {
                                                                    const newList = [...data.organisasi];
                                                                    const val = e.target.value;
                                                                    newList[index].tanggal_berakhir = val ? `${val}-01` : '';
                                                                    setData('organisasi', newList);
                                                                }}
                                                                disabled={item.is_active}
                                                                className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8]"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Checkbox: Saya Masih Menjadi Anggota */}
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`is_active_${index}`}
                                                            checked={item.is_active}
                                                            onChange={(e) => {
                                                                const newList = [...data.organisasi];
                                                                newList[index].is_active = e.target.checked;
                                                                if (e.target.checked) {
                                                                    newList[index].tanggal_berakhir = '';
                                                                }
                                                                setData('organisasi', newList);
                                                            }}
                                                            className="w-4 h-4 text-[#AC0021] bg-[#2a2a2a] border-white/10 rounded focus:ring-[#AC0021] focus:ring-2"
                                                        />
                                                        <label htmlFor={`is_active_${index}`} className="text-[#FEFCF8] cursor-pointer">
                                                            Saya Masih Menjadi Anggota
                                                        </label>
                                                    </div>

                                                    {/* Informasi Tambahan */}
                                                    <div className="space-y-2">
                                                        <Label className="text-[#FEFCF8]">Informasi Tambahan</Label>
                                                        <Textarea
                                                            value={item.informasi_tambahan}
                                                            onChange={(e) => {
                                                                const newList = [...data.organisasi];
                                                                newList[index].informasi_tambahan = e.target.value;
                                                                setData('organisasi', newList);
                                                            }}
                                                            className="bg-[#2a2a2a] border-white/10 text-[#FEFCF8] min-h-[100px]"
                                                            placeholder="Tambahkan informasi tambahan (opsional)"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Button */}
                                            <div className="flex justify-end pt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setData('organisasi', [...data.organisasi, {
                                                        nama_organisasi: '',
                                                        posisi: '',
                                                        tanggal_mulai: '',
                                                        tanggal_berakhir: '',
                                                        informasi_tambahan: '',
                                                        is_active: false
                                                    }])}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#AC0021] hover:bg-[#8B0019] text-[#FEFCF8] rounded-lg transition-colors font-medium"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    <span>Tambah Organisasi</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 6: DOKUMEN PENDUKUNG */}
                        {step === 6 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 ease-out">
                                {/* New Document Inputs */}
                                <div className="flex justify-center pb-4 pt-1">
                                    <a href={route('complete-profile.download-templates')} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 bg-[#2a2a2a] border-white/10 text-[#FEFCF8] hover:bg-white/10 gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Semua Template
                                    </a>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-0">
                                    {[
                                        { key: 'doc_surat_lamaran', label: '1. Surat Lamaran' },
                                        { key: 'doc_ktp', label: '2. KTP (Asli)' },
                                        { key: 'doc_kk', label: '3. Kartu Keluarga (Fotocopy)' },
                                        { key: 'doc_sk_lurah', label: '4. Surat Keterangan Dari Lurah/Kepala Desa' },
                                        { key: 'doc_skck', label: '5. Surat Keterangan Catatan Kepolisian (SKCK) (Asli)' },
                                        { key: 'doc_ijazah', label: '6. Ijazah Pendidikan Terakhir (Fotocopy & Asli)' },
                                        { key: 'doc_sk_sehat', label: '7. Surat Keterangan Sehat' },
                                        { key: 'doc_drh', label: '8. Daftar Riwayat Hidup' },
                                        { key: 'doc_latsarmil', label: '9. Surat Pernyataan Bersedia Mengikuti LATSARMIL' },
                                        { key: 'doc_izin_instansi', label: '10. Surat Izin dari Instansi/ Perusahaan/ Universitas' },
                                        { key: 'doc_izin_ortu', label: '11. Surat Izin Dari Orang Tua/Istri' },
                                    ].map((doc) => (
                                        <div key={doc.key} className="space-y-2">
                                            <Label className="text-[#FEFCF8] font-medium min-h-[48px] flex items-center block">
                                                {doc.label}
                                                {doc.key !== 'doc_izin_instansi' && <span className="text-red-500 ml-1">*</span>}
                                            </Label>
                                            <div
                                                onClick={() => document.getElementById(doc.key)?.click()}
                                                className={`relative w-full h-40 bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed ${(errors as any)[doc.key] ? 'border-[#AC0021]' : 'border-gray-600 hover:border-gray-400'} cursor-pointer flex items-center justify-center transition-colors group`}
                                            >
                                                {(previews as any)[doc.key] ? (
                                                    // Helper to determine type
                                                    (() => {
                                                        const previewUrl = (previews as any)[doc.key];
                                                        const file = (data as any)[doc.key];
                                                        const isPdf = previewUrl.toLowerCase().includes('.pdf') || file?.type === 'application/pdf' || previewUrl.startsWith('blob:') && file?.type === 'application/pdf';

                                                        return (
                                                            <>
                                                                {isPdf ? (
                                                                    <div className="w-full h-full relative group">
                                                                        <iframe
                                                                            src={`${previewUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                                                                            className="w-full h-full bg-white pointer-events-none"
                                                                            title={`Preview ${doc.label}`}
                                                                        ></iframe>
                                                                    </div>
                                                                ) : (
                                                                    // Image or Generic
                                                                    (previewUrl !== 'DOC_FILE' && !previewUrl.includes('DOC_FILE')) ? (
                                                                        <img src={previewUrl} alt={`Preview ${doc.label}`} className="w-full h-full object-contain" />
                                                                    ) : (
                                                                        <div className="flex flex-col items-center justify-center w-full h-full text-[#FEFCF8] p-2">
                                                                            <FileText className="w-8 h-8 mb-2" />
                                                                            <span className="text-xs px-2 text-center w-full break-words line-clamp-2">{file?.name || 'File Uploaded'}</span>
                                                                        </div>
                                                                    )
                                                                )}

                                                                {/* Overlay for all types */}
                                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <div className="text-[#FEFCF8] text-xs bg-black/50 px-2 py-1 rounded flex items-center gap-1">
                                                                        <FileText className="w-3 h-3" /> {isPdf ? 'Lihat Full / Ganti' : 'Ganti File'}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        );
                                                    })()
                                                ) : (
                                                    <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-300 p-2">
                                                        <FileText className="w-8 h-8 mb-2 opacity-50" />
                                                        <span className="text-sm text-center px-4">Klik untuk upload</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                id={doc.key}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={e => handleFileInput(e, doc.key)}
                                                className="hidden"
                                            />
                                            {(errors as any)[doc.key] && <p className="text-[#AC0021] text-sm">{(errors as any)[doc.key]}</p>}
                                        </div>
                                    ))}
                                    {/* Signature Field - Moved into Grid */}
                                    <div className="space-y-2">
                                        <Label className="text-[#FEFCF8] font-medium min-h-[48px] flex items-center block">12. Tanda Tangan Digital</Label>
                                        <div
                                            onClick={() => setIsSignatureModalOpen(true)}
                                            className={`relative w-full h-40 bg-[#2a2a2a] rounded-lg overflow-hidden border-2 border-dashed ${(errors as any).tanda_tangan ? 'border-[#AC0021]' : 'border-gray-600 hover:border-gray-400'} cursor-pointer flex flex-col items-center justify-center transition-colors group`}
                                        >
                                            <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-300 p-2 gap-2 w-full h-full justify-center">
                                                {signatureDataUrl ? (
                                                    <img
                                                        src={signatureDataUrl}
                                                        alt="Tanda Tangan"
                                                        className="h-24 object-contain max-w-full"
                                                    />
                                                ) : (
                                                    <PenTool className="w-8 h-8 opacity-50" />
                                                )}
                                                <span className="text-sm text-center px-4 max-w-full truncate">
                                                    {signatureDataUrl ? 'Ganti Tanda Tangan' : 'Klik untuk tanda tangan'}
                                                </span>
                                            </div>
                                        </div>
                                        {(errors as any).tanda_tangan && <p className="text-[#AC0021] text-sm text-center">{(errors as any).tanda_tangan}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between p-3 md:p-8 border-t border-white/5">
                    <Button
                        onClick={prevStep}
                        disabled={step === 1}
                        variant="outline"
                        className="bg-white/5 text-[#FEFCF8] hover:bg-white/20 hover:text-gray-100 border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/20 text-xs md:text-sm h-9 md:h-10"
                    >
                        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> Sebelumnya
                    </Button>

                    {step < 6 ? (
                        <Button
                            onClick={nextStep}
                            className="bg-[#AC0021] hover:bg-[#AC0021]/80 text-[#FEFCF8] text-xs md:text-sm h-9 md:h-10"
                        >
                            Selanjutnya <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-[#AC0021] hover:bg-[#AC0021]/80 text-[#FEFCF8] disabled:opacity-50 text-xs md:text-sm h-9 md:h-10"
                        >
                            {processing ? 'Menyimpan...' : 'Kirim'} <Send className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card >

            {/* <div className="absolute top-8 right-8">
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="text-[#FEFCF8]/60 hover:text-[#FEFCF8] transition-colors text-sm font-medium flex items-center gap-2"
                >
                    Logout <ArrowRight className="w-4 h-4" />
                </Link>
            </div> */}

            {/* Signature Modal */}
            <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                <DialogContent className="bg-[#1a1a1a] border-white/20 text-[#FEFCF8] w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#AC0021] flex items-center gap-2">
                            <PenTool className="w-5 h-5" />
                            Buat Tanda Tangan Digital
                        </DialogTitle>
                        <DialogDescription className="text-[#B0B0B0]">
                            Buat tanda tangan Anda di area putih di bawah ini
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Canvas Area */}
                        <div className="bg-[#FEFCF8] rounded-lg overflow-hidden border-2 border-gray-300">
                            <SignatureCanvas
                                ref={signatureRef}
                                canvasProps={{
                                    className: 'w-full h-48 md:h-64 cursor-crosshair',
                                }}
                                backgroundColor="#FEFCF8"
                                penColor="black"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                onClick={handleClearSignature}
                                variant="outline"
                                className="bg-white/5 text-[#FEFCF8] hover:bg-white/20 border-white/20 h-12"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveSignature}
                                className="bg-[#AC0021] hover:bg-[#AC0021]/80 text-[#FEFCF8] h-12"
                            >
                                <BadgeCheck className="w-4 h-4 mr-2" />
                                Simpan
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ImageCropper
                open={showCropper}
                image={cropperImage}
                onClose={() => setShowCropper(false)}
                onCropComplete={onCropComplete}
                aspect={1}
            />

        </div >
    );
}
