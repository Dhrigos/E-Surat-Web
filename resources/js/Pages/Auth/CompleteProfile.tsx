import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useForm, Head, Link, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { DateSelect } from '@/components/ui/date-select';
import { ImageCropper } from '@/components/ui/image-cropper';
// import { FastInput } from '@/components/ui/fast-input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogOverlay } from '@/components/ui/dialog';
import { JabatanSelectionModal } from '@/components/JabatanSelectionModal';
import { Edit2, Calendar, FileText, Briefcase, User, Building2, CreditCard, BadgeCheck, MapPin, Upload, ArrowRight, ArrowLeft, AlertCircle, Trash2, PenTool, Loader2, RefreshCw } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { CascadingJabatanSelector } from '@/components/CascadingJabatanSelector';

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
}

function FastInput({ value: initialValue, onChange, onBlur, onValueChange, className, ...props }: React.ComponentProps<typeof Input> & { onValueChange?: (value: string) => void }) {
    const [value, setValue] = useState(initialValue || "");

    useEffect(() => {
        setValue(initialValue || "");
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange?.(e);
        onValueChange?.(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(e);
    };

    return (
        <Input
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
            {...props}
        />
    );
}

export default function CompleteProfile({ auth, jabatans, jabatanRoles = [], golongans = [], pangkats = [], rejectionReason }: Props) {
    // Main Form Step (starts after E-KYC)
    const [step, setStep] = useState(1);
    console.log('Golongans Prop:', golongans);

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
        nik: auth.user?.detail?.nik || '',
        tempat_lahir: auth.user?.detail?.tempat_lahir || '',
        birthplace_province_id: auth.user?.detail?.birthplace_province_id || '',
        tanggal_lahir: auth.user?.detail?.tanggal_lahir ? new Date(auth.user.detail.tanggal_lahir) : undefined,
        jenis_kelamin: auth.user?.detail?.jenis_kelamin || '',
        alamat_domisili_lengkap: auth.user?.detail?.alamat_domisili_lengkap || '',
        jabatan_id: auth.user?.detail?.jabatan_id || '',
        jabatan_role_id: auth.user?.detail?.jabatan_role_id || '',

        golongan_id: initialGolonganId,
        pangkat_id: initialPangkatId,

        tanggal_pengangkatan: auth.user?.detail?.tanggal_pengangkatan ? new Date(auth.user.detail.tanggal_pengangkatan) : undefined,
        nomor_sk: auth.user?.detail?.nomor_sk || '',
        nomor_kta: auth.user?.detail?.nomor_kta || '',
        province_id: auth.user?.detail?.province_id || '',
        city_id: auth.user?.detail?.city_id || '',
        district_id: auth.user?.detail?.district_id || '',
        village_id: auth.user?.detail?.village_id || '',
        jalan: auth.user?.detail?.jalan || '',
        foto_profil: null as File | null,
        scan_ktp: null as File | null,
        scan_kta: null as File | null,
        scan_sk: null as File | null,
        tanda_tangan: null as File | null,

        // Office Address
        office_province_id: auth.user?.detail?.office_province_id || '',
        office_city_id: auth.user?.detail?.office_city_id || '',
        mako_id: auth.user?.detail?.mako_id || '',
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

    // Office address region states
    const [officeCities, setOfficeCities] = useState<any[]>([]);
    const [makos, setMakos] = useState<any[]>([]);

    // Preview states
    const [previews, setPreviews] = useState<Record<string, string>>({});

    // Get authenticated user data
    const { props } = usePage<{ auth: { user: { name: string; username: string } } }>();
    const user = props.auth.user;

    // Signature canvas ref and modal state
    const signatureRef = useRef<SignatureCanvas>(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [signatureFilename, setSignatureFilename] = useState<string>('');
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

    // Derived Display Logic for the Input Trigger
    const selectedJabatanObj = useMemo(() =>
        jabatans.find((j: any) => j.id.toString() === data.jabatan_id),
        [jabatans, data.jabatan_id]);

    const jabatanDisplayText = useMemo(() => {
        const roleObj = jabatanRoles.find(r => r.id.toString() === data.jabatan_role_id);
        const roleName = roleObj ? roleObj.nama : '';
        return selectedJabatanObj
            ? `${selectedJabatanObj.nama}${roleName ? ' - ' + roleName : ''}`
            : 'Pilih Jabatan...';
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

        const objectUrl = URL.createObjectURL(finalFile);
        // Check if PDF for preview logic
        if (finalFile.type === 'application/pdf') {
            setPreviews(prev => ({ ...prev, [field]: 'PDF_FILE' })); // Marker for PDF
        } else {
            setPreviews(prev => ({ ...prev, [field]: objectUrl }));
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
        axios.get(route('regions.provinces')).then(res => setProvinces(Object.entries(res.data).map(([code, name]) => ({ code, name }))));

        if ((user as any).detail?.scan_ktp) {
            const path = (user as any).detail.scan_ktp;
            const isPdf = path.toLowerCase().endsWith('.pdf');
            setPreviews(prev => ({ ...prev, scan_ktp: isPdf ? 'PDF_EXISTING' : `/storage/${path}` }));
        }
    }, []);

    const fetchCities = (provinceCode: string) => {
        setData('province_id', provinceCode);
        clearErrors('province_id');
        setCities([]); setDistricts([]); setVillages([]);
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => setCities(Object.entries(res.data).map(([code, name]) => ({ code, name }))));
    };

    const fetchBirthplaceCities = (provinceCode: string) => {
        setData('birthplace_province_id', provinceCode);
        clearErrors('birthplace_province_id');
        setBirthplaceCities([]);
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => setBirthplaceCities(Object.entries(res.data).map(([code, name]) => ({ code, name }))));
    };

    const fetchDistricts = (cityCode: string) => {
        setData('city_id', cityCode);
        clearErrors('city_id');
        setDistricts([]); setVillages([]);
        axios.get(route('regions.districts', { city_code: cityCode })).then(res => setDistricts(Object.entries(res.data).map(([code, name]) => ({ code, name }))));
    };

    const fetchVillages = (districtCode: string) => {
        setData('district_id', districtCode);
        clearErrors('district_id');
        setVillages([]);
        axios.get(route('regions.villages', { district_code: districtCode })).then(res => setVillages(Object.entries(res.data).map(([code, name]) => ({ code, name }))));
    };

    // Office address fetch functions
    const fetchOfficeCities = async (provinceCode: string) => {
        setData('office_province_id', provinceCode);
        setData('office_city_id', '');
        setData('mako_id', '');
        setMakos([]); // Reset makos

        if (provinceCode) {
            try {
                const response = await axios.get(route('regions.cities'), { params: { province_code: provinceCode } });
                // console.log('Office Cities:', response.data);
                setOfficeCities(Object.entries(response.data).map(([code, name]) => ({ code, name })));
            } catch (error) {
                console.error('Error fetching office cities:', error);
                toast.error('Gagal memuat data kota kantor');
            }
        } else {
            setOfficeCities([]);
        }
    };

    const fetchMakos = async (cityCode: string) => {
        setData('office_city_id', cityCode);
        setData('mako_id', '');

        if (cityCode) {
            try {
                const response = await axios.get(route('regions.makos'), { params: { city_code: cityCode } });
                setMakos(response.data);
            } catch (error) {
                console.error('Error fetching makos:', error);
                toast.error('Gagal memuat data mako');
            }
        } else {
            setMakos([]);
        }
    };
    // E-KYC logic removed (moved to VerificationEkyc page)




    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        // Client-side validation for Step 4 (Address & Documents)
        // Only validate if we are actually submitting (which happens at the end)
        if (step === 4) {
            const requiredFields = ['jalan', 'province_id', 'city_id', 'district_id', 'village_id'];
            let hasError = false;

            requiredFields.forEach(field => {
                if (!data[field as keyof typeof data]) {
                    setError(field as any, 'Wajib diisi');
                    hasError = true;
                }
            });

            // Validate files only if they are absolutely required (fresh profile) using heuristic
            // Or rely on server validation for files to handle "optional if update" logic safely.
            // But we must validate address fields.

            if (hasError) {
                toast.error('Harap lengkapi Alamat dan Wilayah');
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
                        // Optionally setStep(1); but that might be jarring
                        return;
                    }

                    // Step 2
                    if (errorFields.includes('foto_profil')) {
                        toast.warning('Terdapat error pada Foto Profil (Step 2)');
                        return;
                    }

                    // Step 3
                    // Step 3
                    const step3Fields = ['jabatan_id', 'jabatan_role_id', 'tanggal_pengangkatan', 'nomor_kta', 'tanda_tangan'];
                    const hasStep3Error = step3Fields.some(f => errorFields.includes(f));
                    if (hasStep3Error) {
                        toast.warning('Terdapat error pada Data Kepegawaian (Step 3)');
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
            const requiredFields = ['nia_nrp', 'nik', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin'];
            requiredFields.forEach(field => {
                if (!data[field as keyof typeof data]) {
                    setError(field as any, 'Wajib diisi');
                    hasError = true;
                }
            });

            if (hasError) {
                toast.error('Harap lengkapi semua data diri yang wajib diisi');
                return;
            }

            // Validate uniqueness before proceeding
            const nikValid = await validateNik(data.nik);
            const niaNrpValid = await validateNiaNrp(data.nia_nrp);

            if (!nikValid || !niaNrpValid) {
                // Toast already shown by individual validation
                return;
            }
        } else if (step === 2) {
            if (!data.foto_profil) {
                setError('foto_profil', 'Wajib diupload');
                toast.error('Harap upload foto profil');
                return;
            }
        } else if (step === 3) {
            const requiredFields = ['jabatan_id', 'jabatan_role_id', 'tanggal_pengangkatan', 'nomor_kta', 'mako_id'];
            requiredFields.forEach(field => {
                if (!data[field as keyof typeof data]) {
                    setError(field as any, 'Wajib diisi');
                    hasError = true;
                }
            });

            // Validate signature
            if (!data.tanda_tangan) {
                setError('tanda_tangan', 'Wajib dibuat');
                toast.error('Harap buat dan simpan tanda tangan digital Anda');
                hasError = true;
            }

            if (hasError) {
                toast.error('Harap lengkapi semua data kepegawaian yang wajib diisi');
                return;
            }


        }
        setStep(s => Math.min(s + 1, 4));
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/95 p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[100px] animate-pulse delay-700" />

            <Head title={rejectionReason?.includes('Terdeteksi login') ? 'Aktifasi Ulang' : 'Lengkapi Profil'} />

            <Card className="w-full max-w-5xl bg-[#1a1a1a]/95 border-white/10 backdrop-blur-xl shadow-2xl relative z-10">
                <CardHeader className="text-center space-y-2 pb-8 border-b border-white/5">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <img
                            src="/images/KEMENTERIAN-PERTAHANAN.png"
                            alt="Logo Kementerian Pertahanan"
                            className="h-36 w-36 object-contain drop-shadow-2xl"
                        />
                        <img
                            src="/images/BADAN-CADANGAN-NASIONAL.png"
                            alt="Logo Badan Cadangan Nasional"
                            className="h-28 w-28 object-contain drop-shadow-2xl"
                        />
                    </div>
                    <CardTitle className="text-2xl md:text-3xl font-black text-red-600 mb-2 tracking-tight animate-in fade-in duration-700 delay-200 whitespace-nowrap">Sistem Informasi BACADNAS</CardTitle>

                    {step > 0 && (
                        <div className="flex justify-center items-center gap-2 md:gap-4 mb-4">
                            {[1, 2, 3, 4].map((s) => (
                                <div key={s} className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm md:text-lg transition-all ${step === s ? 'bg-red-600 text-white ring-4 ring-red-600/30' : step > s ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                    {step > s ? '✓' : s}
                                </div>
                            ))}
                        </div>
                    )}

                    <CardDescription className="text-gray-400 text-lg">
                        {step === 1 && "Informasi Data Diri"}
                        {step === 2 && "Foto Profil"}
                        {step === 3 && "Informasi Kepegawaian"}
                        {step === 4 && "Alamat & Dokumen Pendukung"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-4 md:p-8">
                    {rejectionReason && (
                        <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10 text-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Verifikasi Ditolak</AlertTitle>
                            <AlertDescription>
                                {rejectionReason}
                            </AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">


                        {/* STEP 1: DATA DIRI */}
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">NRP</Label>
                                    <FastInput
                                        value={data.nia_nrp}
                                        onBlur={(e) => { setData('nia_nrp', e.target.value); clearErrors('nia_nrp'); }}
                                        onPaste={(e) => e.preventDefault()}
                                        onCopy={(e) => e.preventDefault()}
                                        onCut={(e) => e.preventDefault()}
                                        minLength={14}
                                        className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 ${errors.nia_nrp || niaNrpExists ? 'border-red-500' : ''}`}
                                        placeholder="Nomor Registrasi Pokok"
                                    />
                                    {errors.nia_nrp && <p className="text-red-500 text-sm">{errors.nia_nrp}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">NIK</Label>
                                    <FastInput
                                        value={data.nik}
                                        onBlur={(e) => { setData('nik', e.target.value); clearErrors('nik'); }}
                                        onPaste={(e) => e.preventDefault()}
                                        onCopy={(e) => e.preventDefault()}
                                        onCut={(e) => e.preventDefault()}
                                        maxLength={16}
                                        className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 ${errors.nik || nikExists ? 'border-red-500' : ''}`}
                                        placeholder="Nomor Induk Kependudukan"
                                    />
                                    {errors.nik && <p className="text-red-500 text-sm">{errors.nik}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Tempat Lahir</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Select value={data.birthplace_province_id} onValueChange={fetchBirthplaceCities}>
                                            <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.tempat_lahir ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                                            <SelectContent className="max-w-[280px]">
                                                {provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>

                                        <Select value={data.tempat_lahir} onValueChange={val => { setData('tempat_lahir', val); clearErrors('tempat_lahir'); }} disabled={birthplaceCities.length === 0}>
                                            <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.tempat_lahir ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Kota" /></SelectTrigger>
                                            <SelectContent>
                                                {birthplaceCities.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {errors.tempat_lahir && <p className="text-red-500 text-sm">{errors.tempat_lahir}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Tanggal Lahir</Label>
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
                                    {errors.tanggal_lahir && <p className="text-red-500 text-sm">{errors.tanggal_lahir}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Jenis Kelamin</Label>
                                    <Select value={data.jenis_kelamin} onValueChange={val => { setData('jenis_kelamin', val); clearErrors('jenis_kelamin'); }}>
                                        <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.jenis_kelamin ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                            <SelectItem value="Perempuan">Perempuan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.jenis_kelamin && <p className="text-red-500 text-sm">{errors.jenis_kelamin}</p>}
                                </div>
                            </div>
                        )}


                        {/* STEP 2: FOTO PROFIL */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="relative group cursor-pointer w-40 h-40">
                                        <div className={`w-full h-full rounded-full border-4 ${errors.foto_profil ? 'border-red-500' : 'border-dashed border-gray-600'} flex items-center justify-center bg-[#2a2a2a] overflow-hidden group-hover:border-red-500 transition-all`}>
                                            {previews.foto_profil ? (
                                                <img src={previews.foto_profil} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-16 h-16 text-gray-500" />
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                        <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={onFileChange} />
                                    </div>
                                    <p className="text-gray-400 text-sm">Klik untuk upload foto profil</p>
                                    {errors.foto_profil && <p className="text-red-500 text-sm">{errors.foto_profil}</p>}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DATA KEPEGAWAIAN */}
                        {step === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-6 col-span-1 md:col-span-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-white font-medium">Jabatan *</Label>
                                        {/* Removed redundant status text since the button shows it */}
                                    </div>

                                    <div
                                        onClick={() => setIsJabatanModalOpen(true)}
                                        className={`flex items-center justify-between w-full rounded-md border text-sm px-3 py-2 cursor-pointer transition-colors bg-[#2a2a2a] border-white/10 hover:border-red-500/50 hover:bg-[#333] ${errors.jabatan_id ? "border-red-500" : ""}`}
                                    >
                                        <div className={`flex flex-col ${!data.jabatan_id ? "text-muted-foreground" : "text-white"}`}>
                                            <span className="font-medium">{jabatanDisplayText}</span>
                                            {selectedJabatanObj && (
                                                <span className="text-xs text-muted-foreground mt-0.5">
                                                    {(selectedJabatanObj as any).kategori}
                                                </span>
                                            )}
                                        </div>
                                        <Edit2 className="w-4 h-4 text-gray-500" />
                                    </div>


                                    <JabatanSelectionModal
                                        open={isJabatanModalOpen}
                                        onOpenChange={setIsJabatanModalOpen}
                                        jabatans={jabatans}
                                        jabatanRoles={jabatanRoles}
                                        initialUnitId={data.jabatan_id}
                                        initialRole={data.jabatan_role_id}
                                        onConfirm={handleConfirmJabatan}
                                    />
                                    {errors.jabatan_id && <p className="text-red-500 text-sm mt-1">{errors.jabatan_id}</p>}
                                </div>

                                {/* Golongan & Pangkat Selection */}
                                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Golongan *</Label>
                                        <Select
                                            value={data.golongan_id?.toString()}
                                            onValueChange={(val) => {
                                                const gid = parseInt(val);
                                                setData(prev => ({ ...prev, golongan_id: gid, pangkat_id: undefined }));
                                            }}
                                        >
                                            <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white">
                                                <SelectValue placeholder="Pilih Golongan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {golongans.map(g => (
                                                    <SelectItem key={g.id} value={g.id.toString()}>
                                                        {g.nama} {g.keterangan ? `(${g.keterangan})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Pangkat *</Label>
                                        <Select
                                            value={data.pangkat_id?.toString()}
                                            onValueChange={(val) => setData('pangkat_id', parseInt(val))}
                                            disabled={!data.golongan_id}
                                        >
                                            <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.pangkat_id ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder={data.golongan_id ? "Pilih Pangkat" : "Pilih Golongan Dahulu"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {filteredPangkats.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()}>
                                                        {p.nama}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.pangkat_id && <p className="text-red-500 text-sm">{errors.pangkat_id}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label className="text-white font-medium">Tanggal Pengangkatan</Label>
                                    <DateSelect
                                        value={data.tanggal_pengangkatan ? format(data.tanggal_pengangkatan, 'yyyy-MM-dd') : ''}
                                        onChange={(val) => {
                                            setData('tanggal_pengangkatan', val ? new Date(val) : undefined);
                                            clearErrors('tanggal_pengangkatan');
                                        }}
                                        error={!!errors.tanggal_pengangkatan}
                                        startYear={1980}
                                        endYear={new Date().getFullYear()}
                                    />
                                    {errors.tanggal_pengangkatan && <p className="text-red-500 text-sm">{errors.tanggal_pengangkatan}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Nomor KTA</Label>
                                    <FastInput
                                        value={data.nomor_kta}
                                        onBlur={e => {
                                            setData('nomor_kta', e.target.value);
                                            validateKta(e.target.value);
                                        }}
                                        className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 ${errors.nomor_kta || ktaExists ? 'border-red-500' : ''}`}
                                        placeholder="Nomor Kartu Tanda Anggota"
                                    />
                                    {errors.nomor_kta && <p className="text-red-500 text-sm">{errors.nomor_kta}</p>}
                                </div>


                                {/* Signature Field - Click to Open Modal */}
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Tanda Tangan Digital *</Label>
                                    <div
                                        onClick={() => setIsSignatureModalOpen(true)}
                                        className={`cursor-pointer bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 flex h-10 w-full rounded-md border px-3 py-2 text-sm items-center gap-2 hover:border-red-600 transition-colors ${errors.tanda_tangan ? 'border-red-500' : ''}`}
                                    >
                                        <PenTool className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        {signatureDataUrl ? (
                                            <span className="text-white truncate flex-1">{signatureFilename}</span>
                                        ) : (
                                            <span className="text-gray-400">Tekan untuk membuat tanda tangan</span>
                                        )}
                                        {signatureDataUrl && (
                                            <BadgeCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    {errors.tanda_tangan && <p className="text-red-500 text-sm">{errors.tanda_tangan}</p>}
                                </div>

                                {/* Office Address Section */}
                                <div className="col-span-1 md:col-span-2 space-y-2 pt-4 border-t border-white/10">
                                    <Label className="text-white font-medium text-base">Alamat Kantor</Label>
                                    <p className="text-xs text-gray-400">Provinsi, Kota, Kecamatan, dan Desa/Kelurahan tempat kantor Anda berada</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Provinsi Kantor</Label>
                                    <Select value={data.office_province_id} onValueChange={fetchOfficeCities}>
                                        <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.office_province_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                                        <SelectContent className="max-w-[280px]">
                                            {provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.office_province_id && <p className="text-red-500 text-sm">{errors.office_province_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Kota/Kabupaten Kantor</Label>
                                    <Select value={data.office_city_id} onValueChange={fetchMakos} disabled={!data.office_province_id}>
                                        <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.office_city_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Kota/Kabupaten" /></SelectTrigger>
                                        <SelectContent>
                                            {officeCities.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.office_city_id && <p className="text-red-500 text-sm">{errors.office_city_id}</p>}
                                </div>

                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label className="text-white font-medium">Mako</Label>
                                    <Select value={String(data.mako_id)} onValueChange={val => { setData('mako_id', val); clearErrors('mako_id'); }} disabled={!data.office_city_id}>
                                        <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.mako_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Mako" /></SelectTrigger>
                                        <SelectContent>
                                            {makos.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.mako_id && <p className="text-red-500 text-sm">{errors.mako_id}</p>}
                                </div>
                            </div>
                        )}



                        {/* STEP 4: ALAMAT & DOKUMEN */}
                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-white font-medium">Jalan / Alamat Saat Ini</Label>
                                        <Textarea
                                            value={data.jalan}
                                            onChange={e => { setData('jalan', e.target.value); clearErrors('jalan'); }}
                                            className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 min-h-[100px] ${errors.jalan ? 'border-red-500' : ''}`}
                                            placeholder="Nama Jalan, No. Rumah, RT/RW"
                                        />
                                        {errors.jalan && <p className="text-red-500 text-sm">{errors.jalan}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Provinsi</Label>
                                        <Select value={data.province_id} onValueChange={fetchCities}>
                                            <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.province_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                                            <SelectContent className="max-w-[280px]">
                                                {provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.province_id && <p className="text-red-500 text-sm">{errors.province_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Kota/Kabupaten</Label>
                                        <Select value={data.city_id} onValueChange={fetchDistricts} disabled={!data.province_id}>
                                            <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.city_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Kota/Kabupaten" /></SelectTrigger>
                                            <SelectContent>
                                                {cities.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.city_id && <p className="text-red-500 text-sm">{errors.city_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Kecamatan</Label>
                                        <Select value={data.district_id} onValueChange={fetchVillages} disabled={!data.city_id}>
                                            <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.district_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Kecamatan" /></SelectTrigger>
                                            <SelectContent>
                                                {districts.map(d => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.district_id && <p className="text-red-500 text-sm">{errors.district_id}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Desa/Kelurahan</Label>
                                        <Select value={data.village_id} onValueChange={val => { setData('village_id', val); clearErrors('village_id'); }} disabled={!data.district_id}>
                                            <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.village_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Desa/Kelurahan" /></SelectTrigger>
                                            <SelectContent>
                                                {villages.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        {errors.village_id && <p className="text-red-500 text-sm">{errors.village_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Upload KTP</Label>
                                        {previews.scan_ktp && (
                                            <div className="relative w-full h-40 bg-gray-800 rounded-lg overflow-hidden border border-gray-600 mb-2 group flex items-center justify-center">
                                                {previews.scan_ktp === 'PDF_FILE' || previews.scan_ktp === 'PDF_EXISTING' ? (
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <FileText className="w-12 h-12 mb-2" />
                                                        <span className="text-xs">Dokumen PDF Terlampir</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <img src={previews.scan_ktp} alt="Preview KTP" className="w-full h-full object-contain" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <a href={previews.scan_ktp} target="_blank" rel="noreferrer" className="text-white text-xs bg-black/50 px-2 py-1 rounded">Lihat Full</a>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {/* Input file removed as per request to rely on E-KYC data */}
                                        {/* <Input type="file" accept="image/*,application/pdf" onChange={e => handleFileInput(e, 'scan_ktp')} className={`bg-[#2a2a2a] border-white/10 text-white ${errors.scan_ktp ? 'border-red-500' : ''}`} /> */}
                                        {errors.scan_ktp && <p className="text-red-500 text-sm">{errors.scan_ktp}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Upload KTA</Label>
                                        {previews.scan_kta && (
                                            <div className="relative w-full h-40 bg-gray-800 rounded-lg overflow-hidden border border-gray-600 mb-2 group flex items-center justify-center">
                                                {previews.scan_kta === 'PDF_FILE' ? (
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <FileText className="w-12 h-12 mb-2" />
                                                        <span className="text-xs">Dokumen PDF Dipilih</span>
                                                    </div>
                                                ) : (
                                                    <img src={previews.scan_kta} alt="Preview KTA" className="w-full h-full object-contain" />
                                                )}
                                            </div>
                                        )}
                                        <Input type="file" accept="image/*,application/pdf" onChange={e => handleFileInput(e, 'scan_kta')} className={`bg-[#2a2a2a] border-white/10 text-white ${errors.scan_kta ? 'border-red-500' : ''}`} />
                                        {errors.scan_kta && <p className="text-red-500 text-sm">{errors.scan_kta}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Upload SK</Label>
                                        {previews.scan_sk && (
                                            <div className="relative w-full h-40 bg-gray-800 rounded-lg overflow-hidden border border-gray-600 mb-2 group flex items-center justify-center">
                                                {previews.scan_sk === 'PDF_FILE' ? (
                                                    <div className="flex flex-col items-center text-gray-400">
                                                        <FileText className="w-12 h-12 mb-2" />
                                                        <span className="text-xs">Dokumen PDF Dipilih</span>
                                                    </div>
                                                ) : (
                                                    <img src={previews.scan_sk} alt="Preview SK" className="w-full h-full object-contain" />
                                                )}
                                            </div>
                                        )}
                                        <Input type="file" accept="image/*,application/pdf" onChange={e => handleFileInput(e, 'scan_sk')} className={`bg-[#2a2a2a] border-white/10 text-white ${errors.scan_sk ? 'border-red-500' : ''}`} />
                                        {errors.scan_sk && <p className="text-red-500 text-sm">{errors.scan_sk}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between p-4 md:p-8 border-t border-white/5">
                    <Button
                        onClick={prevStep}
                        disabled={step === 1}
                        variant="outline"
                        className="bg-white/5 text-white hover:bg-white/20 hover:text-gray-100 border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-white/20"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
                    </Button>

                    {step < 4 ? (
                        <Button
                            onClick={nextStep}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="bg-green-600 hover:bg-green-700 text-white shadow-[0_0_20px_rgba(22,163,74,0.5)]"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
                        </Button>
                    )}
                </CardFooter>
            </Card >

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

            {/* Signature Modal */}
            <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                <DialogContent className="bg-[#1a1a1a] border-white/20 text-white w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                            <PenTool className="w-5 h-5" />
                            Buat Tanda Tangan Digital
                        </DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Buat tanda tangan Anda di area putih di bawah ini
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4">
                        {/* Canvas Area */}
                        <div className="bg-white rounded-lg overflow-hidden border-2 border-gray-300">
                            <SignatureCanvas
                                ref={signatureRef}
                                canvasProps={{
                                    className: 'w-full h-48 md:h-64 cursor-crosshair',
                                }}
                                backgroundColor="white"
                                penColor="black"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                onClick={handleClearSignature}
                                variant="outline"
                                className="bg-white/5 text-white hover:bg-white/20 border-white/20 h-12"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            <Button
                                type="button"
                                onClick={handleSaveSignature}
                                className="bg-red-600 hover:bg-red-700 text-white h-12"
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
