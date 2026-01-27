import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { DateSelect } from '@/components/ui/date-select';
import { ImageCropper } from '@/components/ui/image-cropper';
import { FastInput } from '@/components/ui/fast-input';
import { FastTextarea } from '@/components/ui/fast-textarea';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit2, Calendar, FileText, Briefcase, User, Building2, CreditCard, BadgeCheck, MapPin, Upload, ArrowRight, ArrowLeft, AlertCircle, Trash2, PenTool, Loader2, RefreshCw, Download, Trophy, Plus, GraduationCap, Send, Eye, EyeOff, Check, X } from 'lucide-react';
import { compressImage } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { SearchableSelect } from '@/components/SearchableSelect';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jabatans: Array<{ id: number; nama: string; nama_lengkap?: string }>;
    jabatanRoles: Array<{ id: number; nama: string }>;
    golongans: any[];
    pangkats: any[];
    sukus: Array<{ id: number; nama: string }>;
    bangsas: Array<{ id: number; nama: string }>;
    agamas: Array<{ id: number; nama: string }>;
    status_pernikahans: Array<{ id: number; nama: string }>;
    goldars: Array<{ id: number; nama: string; rhesus?: string }>;
    pendidikans: Array<{ id: number; singkatan: string }>;
    pekerjaans: Array<{ id: number; name: string }>;
}

export function AddMemberDialog({
    open,
    onOpenChange,
    jabatans = [],
    jabatanRoles = [],
    golongans = [],
    pangkats = [],
    sukus = [],
    bangsas = [],
    agamas = [],
    status_pernikahans = [],
    goldars = [],
    pendidikans = [],
    pekerjaans = [],
}: Props) {
    const { auth } = usePage<any>().props;
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, setError, clearErrors, reset } = useForm({
        // Basic User Info
        name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',

        nia_nrp: '',
        nomor_kk: '',
        nik: '',
        matra: '',
        tempat_lahir: '',
        birthplace_province_id: '',
        tanggal_lahir: undefined as Date | undefined,
        jenis_kelamin: '',
        suku_id: '',
        bangsa_id: '',
        agama_id: '',
        status_pernikahan_id: '',
        nama_ibu_kandung: '',

        golongan_darah_id: '',
        tinggi_badan: '',
        berat_badan: '',
        warna_kulit: '',
        warna_mata: '',
        warna_rambut: '',
        bentuk_rambut: '',

        // Sizes
        ukuran_pakaian: '',
        ukuran_sepatu: '',
        ukuran_topi: '',
        ukuran_kaos_olahraga: '',
        ukuran_sepatu_olahraga: '',
        ukuran_kaos_pdl: '',
        ukuran_seragam_tactical: '',
        ukuran_baju_tidur: '',
        ukuran_training_pack: '',
        ukuran_baju_renang: '',
        ukuran_sepatu_tactical: '',

        alamat_domisili_lengkap: '',

        // Education
        pendidikan_id: '',
        nama_sekolah: '',
        nama_prodi: '',
        nilai_akhir: '',
        status_lulus: '',

        // Prestasi
        has_prestasi: 'tidak_ada',
        prestasi: [] as any[],

        // Profesi
        is_bekerja: 'tidak_bekerja',
        pekerjaan_id: '',
        nama_perusahaan: '',
        nama_profesi: '',

        // Organisasi
        has_organisasi: 'tidak_ada',
        organisasi: [] as any[],

        jabatan_id: '',
        jabatan_role_id: '',

        golongan_id: '',
        pangkat_id: '',

        tanggal_pengangkatan: undefined as Date | undefined,
        nomor_sk: '',
        nomor_kta: '',
        province_id: '',
        city_id: '',
        district_id: '',
        village_id: '',
        jalan: '',
        domisili_jalan: '',
        domisili_province_id: '',
        domisili_city_id: '',
        domisili_district_id: '',
        domisili_village_id: '',
        foto_profil: null as File | null,
        scan_ktp: null as File | null,
        scan_kta: null as File | null,
        scan_sk: null as File | null,
        tanda_tangan: null as File | null,

        office_province_id: '',
        mako_id: '',

        // Documents
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

    const [domisiliCities, setDomisiliCities] = useState<any[]>([]);
    const [domisiliDistricts, setDomisiliDistricts] = useState<any[]>([]);
    const [domisiliVillages, setDomisiliVillages] = useState<any[]>([]);

    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [isSameAsKTP, setIsSameAsKTP] = useState(false);

    // Signature
    const signatureRef = useRef<SignatureCanvas>(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    // Cropper
    const [cropperImage, setCropperImage] = useState<string | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Validation states for unique fields
    const [nikExists, setNikExists] = useState(false);
    const [niaNrpExists, setNiaNrpExists] = useState(false);
    const [ktaExists, setKtaExists] = useState(false);
    const [isValidatingNik, setIsValidatingNik] = useState(false);
    const [isValidatingNiaNrp, setIsValidatingNiaNrp] = useState(false);
    const [isValidatingKta, setIsValidatingKta] = useState(false);

    // Client-side file size guard
    const MAX_FILE_SIZE_MB = 10;
    const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

    // Reset on Open
    useEffect(() => {
        if (open) {
            setStep(1);
            reset();
            setPreviews({});
            setSignatureDataUrl(null);
            setIsSameAsKTP(false);
            setNikExists(false);
            setNiaNrpExists(false);
            setKtaExists(false);
            clearErrors();
        }
    }, [open]);

    // Reset scroll on step change
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [step]);

    // Fetch Provinces
    useEffect(() => {
        axios.get(route('regions.provinces')).then(res => setProvinces(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    }, []);

    // Address Sync Logic (Synced with CompleteProfile.tsx)
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

            // Sync the region data arrays
            setDomisiliCities(cities);
            setDomisiliDistricts(districts);
            setDomisiliVillages(villages);
        }
    }, [isSameAsKTP]);


    // Fetchers
    const fetchCities = (provinceCode: string) => {
        setData('province_id', provinceCode);
        if (errors.province_id) clearErrors('province_id');
        setCities([]); setDistricts([]); setVillages([]);
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => setCities(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchBirthplaceCities = (provinceCode: string) => {
        setData('birthplace_province_id', provinceCode);
        if (errors.birthplace_province_id) clearErrors('birthplace_province_id');
        setBirthplaceCities([]);
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => setBirthplaceCities(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchDistricts = (cityCode: string) => {
        setData('city_id', cityCode);
        if (errors.city_id) clearErrors('city_id');
        setDistricts([]); setVillages([]);
        axios.get(route('regions.districts', { city_code: cityCode })).then(res => setDistricts(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchVillages = (districtCode: string) => {
        setData('district_id', districtCode);
        if (errors.district_id) clearErrors('district_id');
        setVillages([]);
        axios.get(route('regions.villages', { district_code: districtCode })).then(res => setVillages(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchDomisiliCities = (provinceCode: string) => {
        setData('domisili_province_id', provinceCode);
        if (errors.domisili_province_id) clearErrors('domisili_province_id');
        setDomisiliCities([]); setDomisiliDistricts([]); setDomisiliVillages([]);
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => setDomisiliCities(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchDomisiliDistricts = (cityCode: string) => {
        setData('domisili_city_id', cityCode);
        if (errors.domisili_city_id) clearErrors('domisili_city_id');
        setDomisiliDistricts([]); setDomisiliVillages([]);
        axios.get(route('regions.districts', { city_code: cityCode })).then(res => setDomisiliDistricts(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
    };

    const fetchDomisiliVillages = (districtCode: string) => {
        setData('domisili_district_id', districtCode);
        if (errors.domisili_district_id) clearErrors('domisili_district_id');
        setDomisiliVillages([]);
        axios.get(route('regions.villages', { district_code: districtCode })).then(res => setDomisiliVillages(Object.entries(res.data).map(([code, name]) => ({ code, name })).sort((a: any, b: any) => a.name.localeCompare(b.name))));
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
            setError('nia_nrp', 'Nomor harus 16 digit');
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
            return true;
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

    // File Handling
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCropperImage(reader.result as string);
                setShowCropper(true);
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        }
    };

    const onCropComplete = async (croppedBlob: Blob) => {
        const file = new File([croppedBlob], "profile_cropped.jpg", { type: "image/jpeg" });
        setData('foto_profil', file);
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => ({ ...prev, foto_profil: reader.result as string }));
        reader.readAsDataURL(file);
    };

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
            try { e.target.value = ''; } catch (err) { }
            return;
        }

        setData(field as any, file);
        clearErrors(field as any);

        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            const objectUrl = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, [field]: objectUrl }));
        } else {
            setPreviews(prev => ({ ...prev, [field]: 'DOC_FILE' }));
        }
    }

    // Signature
    const handleSaveSignature = () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            const dataUrl = signatureRef.current.toDataURL('image/png');
            setSignatureDataUrl(dataUrl);
            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], "signature.png", { type: 'image/png' });
                    setData('tanda_tangan', file);
                    clearErrors('tanda_tangan' as any);
                    toast.success('Tanda tangan berhasil disimpan');
                    setIsSignatureModalOpen(false);
                });
        }
    };

    const handleClearSignature = () => {
        if (signatureRef.current) signatureRef.current.clear();
        setSignatureDataUrl(null);
        setData('tanda_tangan', null);
    };

    const validateStep = (currentStep: number) => {
        let isValid = true;
        const requiredFields: any[] = [];

        if (currentStep === 1) { // Akun
            if (!data.name) requiredFields.push('name');
            if (!data.email) requiredFields.push('email');
            if (!(data as any).phone_number) requiredFields.push('phone_number');
            if (!data.password) requiredFields.push('password');
        }

        if (currentStep === 2) { // Matra & Pangkat
            if (!data.matra) requiredFields.push('matra');
            if (!data.golongan_id) requiredFields.push('golongan_id');
        }

        if (currentStep === 3) { // Data Diri
            if (!data.foto_profil && !previews.foto_profil) requiredFields.push('foto_profil');
            if (!data.nomor_kk || data.nomor_kk.length < 16) requiredFields.push('nomor_kk');
            if (!data.nik || data.nik.length < 16) requiredFields.push('nik');
            if (!data.agama_id) requiredFields.push('agama_id');
            if (!data.status_pernikahan_id) requiredFields.push('status_pernikahan_id');
            if (!data.suku_id) requiredFields.push('suku_id');
            if (!data.bangsa_id) requiredFields.push('bangsa_id');
            if (!data.nama_ibu_kandung) requiredFields.push('nama_ibu_kandung');
            if (!data.jenis_kelamin) requiredFields.push('jenis_kelamin');
            if (!data.birthplace_province_id) requiredFields.push('birthplace_province_id');
            if (!data.tempat_lahir) requiredFields.push('tempat_lahir');
            if (!data.tanggal_lahir) requiredFields.push('tanggal_lahir');
            if (!data.golongan_darah_id) requiredFields.push('golongan_darah_id');
            if (!data.tinggi_badan) requiredFields.push('tinggi_badan');
            if (!data.berat_badan) requiredFields.push('berat_badan');
            if (!data.warna_kulit) requiredFields.push('warna_kulit');
            if (!data.warna_rambut) requiredFields.push('warna_rambut');
            if (!data.bentuk_rambut) requiredFields.push('bentuk_rambut');
            if (!data.warna_mata) requiredFields.push('warna_mata');
        }

        if (currentStep === 4) { // Detail (Sizes & Address)
            const sizeFields = ['ukuran_pakaian', 'ukuran_kaos_pdl', 'ukuran_seragam_tactical',
                'ukuran_kaos_olahraga', 'ukuran_baju_tidur', 'ukuran_baju_renang',
                'ukuran_training_pack', 'ukuran_topi', 'ukuran_sepatu',
                'ukuran_sepatu_olahraga', 'ukuran_sepatu_tactical'];

            sizeFields.forEach(f => {
                if (!(data as any)[f]) requiredFields.push(f);
            });

            if (!data.jalan) requiredFields.push('jalan');
            if (!data.province_id) requiredFields.push('province_id');
            if (!data.city_id) requiredFields.push('city_id');
            if (!data.district_id) requiredFields.push('district_id');
            if (!data.village_id) requiredFields.push('village_id');

            if (!isSameAsKTP) {
                if (!data.domisili_jalan) requiredFields.push('domisili_jalan');
                if (!data.domisili_province_id) requiredFields.push('domisili_province_id');
                if (!data.domisili_city_id) requiredFields.push('domisili_city_id');
                if (!data.domisili_district_id) requiredFields.push('domisili_district_id');
                if (!data.domisili_village_id) requiredFields.push('domisili_village_id');
            }
        }

        // Step 5: Pendidikan (Check if filled)
        if (currentStep === 5) {
            if (!data.pendidikan_id) requiredFields.push('pendidikan_id');
            if (!data.nama_sekolah) requiredFields.push('nama_sekolah');
            if (!data.nama_prodi) requiredFields.push('nama_prodi');
            if (!data.nilai_akhir) requiredFields.push('nilai_akhir');
            if (!data.status_lulus) requiredFields.push('status_lulus');
        }

        // Step 6: Organisasi (Check if "Ada" selected but empty list, or incomplete items)
        if (currentStep === 6) {
            if (data.has_organisasi === 'ada') {
                if (data.organisasi.length === 0) {
                    toast.error('Silakan tambah minimal satu organisasi');
                    return false;
                }
                // Check items
                data.organisasi.forEach((org: any, idx: number) => {
                    if (!org.nama_organisasi || !org.posisi || !org.tanggal_mulai) {
                        toast.error(`Lengkapi data organisasi ke-${idx + 1}`);
                        isValid = false;
                    }
                });
            }
            if (data.has_prestasi === 'ada') {
                if (data.prestasi.length === 0) {
                    toast.error('Silakan tambah minimal satu prestasi');
                    return false;
                }
                data.prestasi.forEach((pres: any, idx: number) => {
                    if (!pres.nama_kegiatan || !pres.tahun) {
                        toast.error(`Lengkapi data prestasi ke-${idx + 1}`);
                        isValid = false;
                    }
                });
            }
        }

        if (requiredFields.length > 0) {
            requiredFields.forEach(f => setError(f as any, 'Wajib diisi'));
            toast.error('Harap lengkapi semua field yang wajib diisi');
            return false;
        }

        return isValid;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            clearErrors();
            setStep(s => Math.min(s + 1, 7));
        }
    };
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate final step (Documents)
        if (step === 7) {
            let hasDocError = false;
            const docFields = [
                'doc_surat_lamaran', 'doc_ktp', 'doc_kk', 'doc_sk_lurah',
                'doc_skck', 'doc_ijazah', 'doc_sk_sehat', 'doc_drh',
                'doc_latsarmil', 'doc_izin_ortu',
            ]; // Excluded doc_izin_instansi

            docFields.forEach(field => {
                const isFileSelected = (data as any)[field] instanceof File;
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

        try {
            // @ts-ignore
            if (typeof route().has === 'function' && !route().has('mitra.members.store')) {
                toast.error("Route mitra.members.store not defined yet.");
                return;
            }

            // @ts-ignore
            post(route('mitra.members.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Anggota berhasil ditambahkan');
                    onOpenChange(false);
                },
                onError: (errors) => {
                    console.error('Submission errors:', errors);
                    toast.error('Gagal menambahkan anggota. Periksa inputan.');

                    const errorFields = Object.keys(errors);
                    if (errorFields.length > 0) {
                        if (errorFields.includes('nik') || errorFields.includes('name')) {
                            toast.warning('Cek Step 1/3 (Akun/Data Diri)');
                        }
                    }
                }
            });
        } catch (error) {
            toast.error("Terjadi kesalahan sistem saat submit.");
        }
    };

    // Styling constants reused from complete-profile to ensure match
    // Styling constants reused from complete-profile to ensure match
    const getInputClass = (fieldName: string, additionalClass: string = "bg-[#2a2a2a] border-white/10 text-[#FEFCF8] focus:border-[#AC0021]") => {
        return `${additionalClass} ${(errors as any)[fieldName] ? '!border-[#AC0021]' : ''}`;
    };
    const BASE_INPUT_CLASS = "bg-[#2a2a2a] border-white/10 text-[#FEFCF8] focus:border-[#AC0021]";
    const LABEL_CLASS = "text-[#FEFCF8] font-medium";
    const PRIMARY_BUTTON_CLASS = "bg-[#AC0021] hover:bg-[#AC0021]/80 text-[#FEFCF8]";
    const SECONDARY_BUTTON_CLASS = "bg-white/5 text-[#FEFCF8] hover:bg-white/20 hover:text-gray-100 border-transparent";
    const SECTION_TITLE_CLASS = "text-lg font-bold text-[#FEFCF8]";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 flex flex-col bg-[#1a1a1a] text-[#FEFCF8] border-white/10">
                <DialogHeader className="p-6 border-b border-white/10 shrink-0 flex flex-row items-center justify-between">
                    <div>
                        <DialogTitle className="text-xl font-bold">Tambah Anggota Baru</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Lengkapi data profil anggota secara lengkap.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <CardContent ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    {/* Stepper matching CompleteProfile visual */}
                    <div className="flex justify-between items-center w-full max-w-4xl relative mx-auto mb-8 px-4">
                        {[
                            { num: 1, label: 'Akun' },
                            { num: 2, label: 'Matra' },
                            { num: 3, label: 'Data Diri' },
                            { num: 4, label: 'Detail' },
                            { num: 5, label: 'Pendidikan' },
                            { num: 6, label: 'Organisasi' },
                            { num: 7, label: 'Dokumen' }
                        ].map((s, index) => (
                            <React.Fragment key={s.num}>
                                <div className="flex flex-col items-center relative z-10 shrink-0">
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-300 border-2 ${step >= s.num ? 'bg-[#AC0021] border-[#AC0021] text-[#FEFCF8] shadow-[0_0_15px_#AC0021]' : 'bg-[#1a1a1a] border-white/20 text-gray-500'}`}>
                                        {s.num}
                                    </div>
                                    <span className={`text-[10px] md:text-xs font-medium mt-2 uppercase ${step >= s.num ? 'text-[#AC0021]' : 'text-gray-600'}`}>{s.label}</span>
                                </div>
                                {index < 6 && (
                                    <div className="flex-1 h-[2px] bg-white/10 mx-2 relative rounded-full overflow-hidden">
                                        <div className={`absolute top-0 left-0 h-full bg-[#AC0021] transition-all duration-500 ${step > s.num ? 'w-full' : 'w-0'}`} />
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-20">
                        {/* STEP 1: AKUN ANGGOTA */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-4">
                                    <h3 className={SECTION_TITLE_CLASS}><User className="inline mr-2 text-[#AC0021]" /> Akun Anggota</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Left Column: Personal Info */}
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className={LABEL_CLASS}>Nama Lengkap <span className="text-[#AC0021]">*</span></Label>
                                                <FastInput value={data.name} onBlur={e => setData('name', e.target.value)} onChange={() => errors.name && clearErrors('name')} className={getInputClass('name')} placeholder="Nama Lengkap" />
                                                {errors.name && <p className="text-[#AC0021] text-sm">{errors.name}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={LABEL_CLASS}>Email <span className="text-[#AC0021]">*</span></Label>
                                                <FastInput type="email" value={data.email} onBlur={e => setData('email', e.target.value)} onChange={() => errors.email && clearErrors('email')} className={getInputClass('email')} placeholder="Email Aktif" />
                                                {errors.email && <p className="text-[#AC0021] text-sm">{errors.email}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={LABEL_CLASS}>No Handphone <span className="text-[#AC0021]">*</span></Label>
                                                <FastInput value={(data as any).phone_number} onBlur={e => setData('phone_number' as any, e.target.value)} onChange={() => (errors as any).phone_number && clearErrors('phone_number' as any)} className={getInputClass('phone_number')} placeholder="08..." />
                                            </div>
                                        </div>

                                        {/* Right Column: Security (Password) */}
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className={LABEL_CLASS}>Password</Label>
                                                <div className="relative">
                                                    <FastInput type={showPassword ? "text" : "password"} value={data.password} onBlur={e => setData('password', e.target.value)} onChange={e => { setData('password', e.target.value); if (errors.password) clearErrors('password'); }} className={getInputClass('password')} placeholder="Minimal 8 karakter" />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors">
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className={LABEL_CLASS}>Konfirmasi Password</Label>
                                                <div className="relative">
                                                    <FastInput type={showConfirmPassword ? "text" : "password"} value={data.password_confirmation} onBlur={e => setData('password_confirmation', e.target.value)} onChange={e => { setData('password_confirmation', e.target.value); if (errors.password_confirmation) clearErrors('password_confirmation'); }} className={getInputClass('password_confirmation')} placeholder="Ulangi Password" />
                                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors">
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                {data.password_confirmation && data.password !== data.password_confirmation && (
                                                    <div className="flex items-center gap-1 text-[#AC0021] text-xs mt-1">
                                                        <X className="h-3.5 w-3.5" />
                                                        <span>Kata sandi tidak cocok</span>
                                                    </div>
                                                )}
                                                {data.password_confirmation && data.password === data.password_confirmation && (
                                                    <div className="flex items-center gap-1 text-[#659800] text-xs mt-1">
                                                        <Check className="h-3.5 w-3.5" />
                                                        <span>Kata sandi cocok</span>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Password Validation Checklist */}
                                            <div className="space-y-1 mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                                {[
                                                    { label: 'Minimal 8 karakter', valid: data.password.length >= 8 },
                                                    { label: 'Huruf besar (A-Z)', valid: /[A-Z]/.test(data.password) },
                                                    { label: 'Angka (0-9)', valid: /[0-9]/.test(data.password) },
                                                    { label: 'Karakter spesial (!@#$...)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(data.password) },
                                                ].map((req, index) => (
                                                    <div key={index} className="flex items-center gap-2 text-xs">
                                                        {req.valid ? (
                                                            <Check className="h-3.5 w-3.5 text-[#659800]" />
                                                        ) : (
                                                            <X className="h-3.5 w-3.5 text-gray-600" />
                                                        )}
                                                        <span className={req.valid ? 'text-[#659800] font-medium' : 'text-gray-500'}>{req.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: MATRA & PANGKAT */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">

                                {/* Matra Selection */}
                                <div className="space-y-4">
                                    <Label className={`${LABEL_CLASS} text-lg flex items-center gap-2`}><BadgeCheck className="w-5 h-5 text-[#AC0021]" /> Matra</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {['AD', 'AL', 'AU'].map((m) => (
                                            <button key={m} type="button" onClick={() => { setData('matra', m); if (errors.matra) clearErrors('matra'); }} className={`relative p-6 rounded-xl border-2 transition-all ${data.matra === m ? 'border-[#AC0021] bg-[#AC0021]/10' : (errors.matra ? 'border-[#AC0021]' : 'border-white/10 bg-[#1a1a1a] hover:border-white/20')}`}>
                                                <div className="flex flex-col items-center gap-4">
                                                    <img src={`/images/Lambang_TNI_${m}.png`} alt={m} className="w-20 h-20 object-contain" />
                                                    <span className="font-bold text-lg text-[#FEFCF8]">{m}</span>
                                                </div>
                                                {data.matra === m && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#AC0021] flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.matra && <p className="text-[#AC0021] text-sm">{errors.matra}</p>}
                                </div>

                                {/* Pangkat */}
                                <div className="space-y-4">
                                    <Label className={`${LABEL_CLASS} text-lg flex items-center gap-2`}><CreditCard className="w-5 h-5 text-[#AC0021]" /> Jenjang Pangkat</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { id: 1, label: 'Perwira', desc: 'Jenjang Pendidikan Sarjana (Selesai)' },
                                            { id: 2, label: 'Bintara', desc: 'Jenjang Pendidikan SMA (Selesai)' },
                                            { id: 3, label: 'Tamtama', desc: 'Jenjang Pendidikan SMA/SMK (Selesai)' }
                                        ].map((g) => (
                                            <button key={g.id} type="button" onClick={() => setData('golongan_id', g.id.toString())} className={`relative p-6 rounded-xl border-2 transition-all ${Number(data.golongan_id) === g.id ? 'border-[#AC0021] bg-[#AC0021]/10' : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'}`}>
                                                <div className="text-center">
                                                    <h4 className="font-bold text-xl text-[#FEFCF8] mb-2">{g.label}</h4>
                                                    <p className="text-gray-400 text-xs">*{g.desc}</p>
                                                </div>
                                                {Number(data.golongan_id) === g.id && (
                                                    <div className="absolute top-3 right-3">
                                                        <div className="w-6 h-6 rounded-full bg-[#AC0021] flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DATA DIRI */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Photo */}
                                    {/* Photo */}
                                    <div className="flex flex-row items-center justify-start gap-6 border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                                        <div className="relative w-32 h-32 group cursor-pointer shrink-0" onClick={() => document.getElementById('foto_input')?.click()}>
                                            <div className={`w-full h-full rounded-full border-4 ${errors.foto_profil ? 'border-[#AC0021]' : 'border-dashed border-gray-600'} flex items-center justify-center bg-[#2a2a2a] overflow-hidden group-hover:border-[#AC0021] transition-all shadow-lg`}>
                                                {previews.foto_profil ? <img src={previews.foto_profil} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-[#B0B0B0]" />}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Upload className="w-6 h-6 text-[#FEFCF8]" />
                                            </div>
                                            <input id="foto_input" type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[#FEFCF8] font-bold text-lg">Foto Diri <span className="text-[#AC0021]">*</span></Label>
                                            <p className="text-gray-400 text-sm">Foto 4x6 Latar Belakang Merah</p>
                                            <p className="text-gray-500 text-xs uppercase">(JPG, PNG, JPEG)</p>
                                        </div>
                                    </div>

                                    {/* Essential IDs */}
                                    <div className="space-y-4 mt-8">
                                        <div className="space-y-2">
                                            <Label className={LABEL_CLASS}>Nomor KK <span className="text-[#B0B0B0] text-xs font-normal ml-1">(Min. 16 digit)</span></Label>
                                            <FastInput value={data.nomor_kk} onBlur={e => setData('nomor_kk', e.target.value)} onChange={() => errors.nomor_kk && clearErrors('nomor_kk')} className={getInputClass('nomor_kk')} placeholder="Nomor KK (16 Digit)" maxLength={16} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className={LABEL_CLASS}>NIK <span className="text-[#B0B0B0] text-xs font-normal ml-1">(Min. 16 digit)</span></Label>
                                            <FastInput value={data.nik} onBlur={e => { setData('nik', e.target.value); validateNik(e.target.value); }} onChange={() => errors.nik && clearErrors('nik')} className={getInputClass('nik')} placeholder="Nomor Induk Kependudukan" maxLength={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Agama</Label>
                                        <Select value={String(data.agama_id)} onValueChange={v => { setData('agama_id', v); if (errors.agama_id) clearErrors('agama_id'); }}>
                                            <SelectTrigger className={getInputClass('agama_id')}><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                                            <SelectContent>
                                                {agamas.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Status Pernikahan</Label>
                                        <Select value={String(data.status_pernikahan_id)} onValueChange={v => { setData('status_pernikahan_id', v); if (errors.status_pernikahan_id) clearErrors('status_pernikahan_id'); }}>
                                            <SelectTrigger className={getInputClass('name')}><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                            <SelectContent>
                                                {status_pernikahans.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Suku</Label>
                                        <Select value={String(data.suku_id)} onValueChange={v => { setData('suku_id', v); if (errors.suku_id) clearErrors('suku_id'); }}>
                                            <SelectTrigger className={getInputClass('name')}><SelectValue placeholder="Pilih Suku" /></SelectTrigger>
                                            <SelectContent>
                                                {sukus.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Bangsa</Label>
                                        <Select value={String(data.bangsa_id)} onValueChange={v => { setData('bangsa_id', v); if (errors.bangsa_id) clearErrors('bangsa_id'); }}>
                                            <SelectTrigger className={getInputClass('name')}><SelectValue placeholder="Pilih Bangsa" /></SelectTrigger>
                                            <SelectContent>
                                                {bangsas.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nama}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Nama Ibu Kandung</Label>
                                        <FastInput value={data.nama_ibu_kandung} onBlur={e => setData('nama_ibu_kandung', e.target.value)} onChange={() => errors.nama_ibu_kandung && clearErrors('nama_ibu_kandung')} className={getInputClass('nama_ibu_kandung')} placeholder="Nama Ibu Kandung" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Jenis Kelamin</Label>
                                        <div className="flex gap-4 h-10 items-center">
                                            {['Laki-laki', 'Perempuan'].map(g => (
                                                <div key={g} className="flex items-center gap-2 cursor-pointer group" onClick={() => { setData('jenis_kelamin', g); if (errors.jenis_kelamin) clearErrors('jenis_kelamin'); }}>
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${data.jenis_kelamin === g ? 'bg-[#AC0021] border-[#AC0021]' : 'border-gray-500 group-hover:border-gray-400'}`}>
                                                        {data.jenis_kelamin === g && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                    </div>
                                                    <span className={data.jenis_kelamin === g ? 'text-[#FEFCF8]' : 'text-gray-400 group-hover:text-gray-300'}>{g}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Tempat Lahir</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <SearchableSelect value={data.birthplace_province_id} onValueChange={fetchBirthplaceCities} options={provinces.map(p => ({ value: p.code, label: p.name }))} placeholder="Pilih Provinsi" />
                                            <SearchableSelect value={data.tempat_lahir} onValueChange={v => setData('tempat_lahir', v)} options={birthplaceCities.map(p => ({ value: p.code, label: p.name }))} placeholder="Pilih Kota" disabled={!data.birthplace_province_id} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Tanggal Lahir</Label>
                                        <DateSelect value={data.tanggal_lahir ? format(data.tanggal_lahir, 'yyyy-MM-dd') : ''} onChange={v => setData('tanggal_lahir', v ? new Date(v) : undefined)} startYear={1950} endYear={new Date().getFullYear()} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Golongan Darah</Label>
                                        <Select value={String(data.golongan_darah_id)} onValueChange={v => { setData('golongan_darah_id', v); if (errors.golongan_darah_id) clearErrors('golongan_darah_id'); }}>
                                            <SelectTrigger className={getInputClass('golongan_darah_id')}><SelectValue placeholder="Pilih Golongan Darah" /></SelectTrigger>
                                            <SelectContent>
                                                {goldars.map(g => <SelectItem key={g.id} value={String(g.id)}>{g.nama} {g.rhesus}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Tinggi Badan (cm)</Label>
                                        <div className="relative">
                                            <FastInput type="number" value={data.tinggi_badan} onBlur={e => setData('tinggi_badan', e.target.value)} onChange={() => errors.tinggi_badan && clearErrors('tinggi_badan')} className={getInputClass('tinggi_badan', `bg-[#2a2a2a] border-white/10 text-[#FEFCF8] focus:border-[#AC0021] pr-8`)} placeholder="0" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Berat Badan (kg)</Label>
                                        <div className="relative">
                                            <FastInput type="number" value={data.berat_badan} onBlur={e => setData('berat_badan', e.target.value)} onChange={() => errors.berat_badan && clearErrors('berat_badan')} className={getInputClass('berat_badan', `bg-[#2a2a2a] border-white/10 text-[#FEFCF8] focus:border-[#AC0021] pr-8`)} placeholder="0" />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">kg</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Warna Kulit</Label>
                                        <Select value={data.warna_kulit} onValueChange={v => setData('warna_kulit', v)}>
                                            <SelectTrigger className={getInputClass('warna_kulit')}><SelectValue placeholder="Pilih" /></SelectTrigger>
                                            <SelectContent>
                                                {['Sawo Matang', 'Kuning Langsat', 'Putih', 'Hitam', 'Coklat'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Warna Rambut</Label>
                                        <Select value={data.warna_rambut} onValueChange={v => setData('warna_rambut', v)}>
                                            <SelectTrigger className={getInputClass('warna_rambut')}><SelectValue placeholder="Pilih" /></SelectTrigger>
                                            <SelectContent>
                                                {['Hitam', 'Coklat', 'Pirang', 'Beruban', 'Botak'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Bentuk Rambut</Label>
                                        <Select value={data.bentuk_rambut} onValueChange={v => setData('bentuk_rambut', v)}>
                                            <SelectTrigger className={getInputClass('bentuk_rambut')}><SelectValue placeholder="Pilih" /></SelectTrigger>
                                            <SelectContent>
                                                {['Lurus', 'Ikal', 'Bergelombang', 'Keriting'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Warna Mata</Label>
                                        <Select value={data.warna_mata} onValueChange={v => setData('warna_mata', v)}>
                                            <SelectTrigger className={getInputClass('warna_mata')}><SelectValue placeholder="Pilih" /></SelectTrigger>
                                            <SelectContent>
                                                {['Hitam', 'Cokelat'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: DETAILS */}
                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                {/* Clothing Sizes - Row 1 (5 Cols) */}
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
                                                    onValueChange={(val) => { setData(field.key as any, val); if ((errors as any)[field.key]) clearErrors(field.key as any); }}
                                                >
                                                    <SelectTrigger className={getInputClass(field.key)}>
                                                        <SelectValue placeholder={`Pilih`} />
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

                                    {/* Clothing Sizes - Row 2 (6 Cols) */}
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
                                                    onValueChange={(val) => { setData(field.key as any, val); if ((errors as any)[field.key]) clearErrors(field.key as any); }}
                                                >
                                                    <SelectTrigger className={getInputClass(field.key)}>
                                                        <SelectValue placeholder={`Pilih`} />
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

                                <div className="pt-6 border-t border-white/10 space-y-4">
                                    <div className="flex justify-between">
                                        <h3 className={SECTION_TITLE_CLASS}>Alamat KTP</h3>
                                        <div className="flex items-center gap-2">
                                            <Checkbox id="same" checked={isSameAsKTP} onCheckedChange={(c) => setIsSameAsKTP(c as boolean)} className="data-[state=checked]:bg-[#AC0021] border-white/20" />
                                            <Label htmlFor="same" className={LABEL_CLASS}>Alamat Domisili sama dengan KTP</Label>
                                        </div>
                                    </div>
                                    <FastTextarea value={data.jalan} onBlur={e => setData('jalan', e.target.value)} onChange={() => errors.jalan && clearErrors('jalan')} className={getInputClass('jalan')} placeholder="Alamat Lengkap" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <SearchableSelect value={data.province_id} onValueChange={fetchCities} options={provinces.map(p => ({ value: p.code, label: p.name }))} placeholder="Provinsi" />
                                        <SearchableSelect value={data.city_id} onValueChange={fetchDistricts} options={cities.map(p => ({ value: p.code, label: p.name }))} placeholder="Kota/Kab" disabled={!data.province_id} />
                                        <SearchableSelect value={data.district_id} onValueChange={fetchVillages} options={districts.map(p => ({ value: p.code, label: p.name }))} placeholder="Kecamatan" disabled={!data.city_id} />
                                        <SearchableSelect value={data.village_id} onValueChange={v => setData('village_id', v)} options={villages.map(p => ({ value: p.code, label: p.name }))} placeholder="Kelurahan" disabled={!data.district_id} />
                                    </div>
                                </div>

                                {/* Domisili Address */}
                                {!isSameAsKTP && (
                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <h3 className={SECTION_TITLE_CLASS}>Alamat Domisili</h3>
                                        <FastTextarea value={data.domisili_jalan} onBlur={e => setData('domisili_jalan', e.target.value)} onChange={() => errors.domisili_jalan && clearErrors('domisili_jalan')} className={getInputClass('domisili_jalan')} placeholder="Alamat Lengkap" />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <SearchableSelect value={data.domisili_province_id} onValueChange={fetchDomisiliCities} options={provinces.map(p => ({ value: p.code, label: p.name }))} placeholder="Provinsi" />
                                            <SearchableSelect value={data.domisili_city_id} onValueChange={fetchDomisiliDistricts} options={domisiliCities.map(p => ({ value: p.code, label: p.name }))} placeholder="Kota/Kab" disabled={!data.domisili_province_id} />
                                            <SearchableSelect value={data.domisili_district_id} onValueChange={fetchDomisiliVillages} options={domisiliDistricts.map(p => ({ value: p.code, label: p.name }))} placeholder="Kecamatan" disabled={!data.domisili_city_id} />
                                            <SearchableSelect value={data.domisili_village_id} onValueChange={v => setData('domisili_village_id', v)} options={domisiliVillages.map(p => ({ value: p.code, label: p.name }))} placeholder="Kelurahan" disabled={!data.domisili_district_id} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 5: PENDIDIKAN */}
                        {step === 5 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                <h3 className={SECTION_TITLE_CLASS}><GraduationCap className="inline mr-2 text-[#AC0021]" /> Pendidikan Terakhir</h3>
                                {/* Row 1: Jenjang & Nama Institusi (2 Columns) */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Jenjang</Label>
                                        <Select value={String(data.pendidikan_id)} onValueChange={v => { setData('pendidikan_id', v); if (errors.pendidikan_id) clearErrors('pendidikan_id'); }}>
                                            <SelectTrigger className={getInputClass('pendidikan_id')}><SelectValue placeholder="Pilih" /></SelectTrigger>
                                            <SelectContent>{pendidikans.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.singkatan}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Nama Institusi</Label>
                                        <FastInput value={data.nama_sekolah} onBlur={e => setData('nama_sekolah', e.target.value)} onChange={() => errors.nama_sekolah && clearErrors('nama_sekolah')} className={getInputClass('nama_sekolah')} placeholder="Nama Institusi" />
                                    </div>
                                </div>

                                {/* Row 2: Jurusan, Nilai, Status (3 Columns) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Jurusan / Prodi</Label>
                                        <FastInput value={data.nama_prodi} onBlur={e => setData('nama_prodi', e.target.value)} onChange={() => errors.nama_prodi && clearErrors('nama_prodi')} className={getInputClass('nama_prodi')} placeholder="Jurusan / Program Studi" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>IPS / IPK / NEM</Label>
                                        <FastInput value={data.nilai_akhir} onBlur={e => setData('nilai_akhir', e.target.value)} onChange={() => errors.nilai_akhir && clearErrors('nilai_akhir')} className={getInputClass('nilai_akhir')} placeholder="Contoh: 3.50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Status Lulus</Label>
                                        <Select value={data.status_lulus} onValueChange={v => { setData('status_lulus', v); if (errors.status_lulus) clearErrors('status_lulus'); }}>
                                            <SelectTrigger className={getInputClass('status_lulus')}><SelectValue placeholder="Pilih" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Lulus">Lulus</SelectItem>
                                                <SelectItem value="Tidak Lulus">Tidak Lulus</SelectItem>
                                                <SelectItem value="Sedang Menempuh">Sedang Menempuh</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {/* PRESTASI SECTION */}
                                <div className="border-t border-white/10 my-6"></div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Trophy className="w-5 h-5 text-[#AC0021]" />
                                        <h3 className="text-lg font-bold text-[#FEFCF8]">Prestasi</h3>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="has_prestasi" value="ada" checked={data.has_prestasi === 'ada'} onChange={() => { setData('has_prestasi', 'ada'); if (data.prestasi.length === 0) setData('prestasi', [{ jenis_prestasi: '', tingkat: '', nama_kegiatan: '', pencapaian: '', tahun: '' }]); }} className="accent-[#AC0021] w-4 h-4 bg-[#2a2a2a] border-white/10" /> <span className="text-[#FEFCF8]">Ada</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="has_prestasi" value="tidak_ada" checked={data.has_prestasi === 'tidak_ada'} onChange={() => setData('has_prestasi', 'tidak_ada')} className="accent-[#AC0021] w-4 h-4 bg-[#2a2a2a] border-white/10" /> <span className="text-[#FEFCF8]">Tidak Ada</span>
                                        </label>
                                    </div>
                                    {data.has_prestasi === 'ada' && (
                                        <div className="space-y-6 pt-2">
                                            {data.prestasi.map((item: any, index: number) => (
                                                <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 relative animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="text-sm font-bold text-[#AC0021] bg-[#AC0021]/10 px-3 py-1 rounded-full border border-[#AC0021]/20">Prestasi {index + 1}</div>
                                                        {index > 0 && <button type="button" onClick={() => { const newList = [...data.prestasi]; newList.splice(index, 1); setData('prestasi', newList); }} className="text-gray-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2"><Label className={LABEL_CLASS}>Jenis</Label><Select value={item.jenis_prestasi} onValueChange={v => { const l = [...data.prestasi]; l[index].jenis_prestasi = v; setData('prestasi', l); if ((errors as any)[`prestasi.${index}.jenis_prestasi`]) clearErrors(`prestasi.${index}.jenis_prestasi` as any); }}><SelectTrigger className={getInputClass(`prestasi.${index}.jenis_prestasi`)}><SelectValue placeholder="Pilih Jenis" /></SelectTrigger><SelectContent><SelectItem value="Akademik">Akademik</SelectItem><SelectItem value="Non-Akademik">Non-Akademik</SelectItem><SelectItem value="Olahraga">Olahraga</SelectItem></SelectContent></Select></div>
                                                        <div className="space-y-2"><Label className={LABEL_CLASS}>Tingkat</Label><Select value={item.tingkat} onValueChange={v => { const l = [...data.prestasi]; l[index].tingkat = v; setData('prestasi', l); if ((errors as any)[`prestasi.${index}.tingkat`]) clearErrors(`prestasi.${index}.tingkat` as any); }}><SelectTrigger className={getInputClass(`prestasi.${index}.tingkat`)}><SelectValue placeholder="Pilih Tingkat" /></SelectTrigger><SelectContent><SelectItem value="Kabupaten/Kota">Kabupaten/Kota</SelectItem><SelectItem value="Provinsi">Provinsi</SelectItem><SelectItem value="Nasional">Nasional</SelectItem><SelectItem value="Internasional">Internasional</SelectItem></SelectContent></Select></div>
                                                        <div className="space-y-2 md:col-span-2"><Label className={LABEL_CLASS}>Nama Kegiatan</Label><FastInput value={item.nama_kegiatan} onBlur={e => { const l = [...data.prestasi]; l[index].nama_kegiatan = e.target.value; setData('prestasi', l); }} onChange={() => (errors as any)[`prestasi.${index}.nama_kegiatan`] && clearErrors(`prestasi.${index}.nama_kegiatan` as any)} className={getInputClass(`prestasi.${index}.nama_kegiatan`)} placeholder="Nama Kegiatan / Kejuaraan" /></div>
                                                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                                            <div className="space-y-2"><Label className={LABEL_CLASS}>Pencapaian</Label><FastInput value={item.pencapaian} onBlur={e => { const l = [...data.prestasi]; l[index].pencapaian = e.target.value; setData('prestasi', l); }} onChange={() => (errors as any)[`prestasi.${index}.pencapaian`] && clearErrors(`prestasi.${index}.pencapaian` as any)} className={getInputClass(`prestasi.${index}.pencapaian`)} placeholder="Juara 1 / Medali Emas" /></div>
                                                            <div className="space-y-2"><Label className={LABEL_CLASS}>Tahun</Label>
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
                                            <div className="flex justify-end pt-2"><button type="button" onClick={() => setData('prestasi', [...data.prestasi, { jenis_prestasi: '', tingkat: '', nama_kegiatan: '', pencapaian: '', tahun: '' }])} className="flex items-center gap-2 px-4 py-2 bg-[#AC0021] text-white rounded-full hover:bg-[#8a001a] transition-colors shadow-lg shadow-red-900/20"><Plus className="w-4 h-4" /><span>Tambah Prestasi</span></button></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 6: ORGANISASI */}
                        {step === 6 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                <h3 className={SECTION_TITLE_CLASS}><Briefcase className="inline mr-2 text-[#AC0021]" /> Profesi</h3>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 text-[#FEFCF8] cursor-pointer">
                                        <input type="radio" checked={data.is_bekerja === 'bekerja'} onChange={() => { setData('is_bekerja', 'bekerja'); if (errors.is_bekerja) clearErrors('is_bekerja'); }} className="accent-[#AC0021] w-4 h-4 bg-[#2a2a2a] border-white/10" /> Bekerja
                                    </label>
                                    <label className="flex items-center gap-2 text-[#FEFCF8] cursor-pointer">
                                        <input type="radio" checked={data.is_bekerja === 'tidak_bekerja'} onChange={() => { setData('is_bekerja', 'tidak_bekerja'); if (errors.is_bekerja) clearErrors('is_bekerja'); }} className="accent-[#AC0021] w-4 h-4 bg-[#2a2a2a] border-white/10" /> Tidak Bekerja
                                    </label>
                                </div>
                                {data.is_bekerja === 'bekerja' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2"><Label className={LABEL_CLASS}>Jenis Profesi</Label>
                                            <Select value={String(data.pekerjaan_id)} onValueChange={v => { setData('pekerjaan_id', v); if (errors.pekerjaan_id) clearErrors('pekerjaan_id'); }}>
                                                <SelectTrigger className={getInputClass('pekerjaan_id')}><SelectValue placeholder="Pilih" /></SelectTrigger>
                                                <SelectContent>{pekerjaans.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2"><Label className={LABEL_CLASS}>Nama Profesi</Label><FastInput value={data.nama_profesi} onBlur={e => setData('nama_profesi', e.target.value)} onChange={() => errors.nama_profesi && clearErrors('nama_profesi')} className={getInputClass('nama_profesi')} placeholder="Contoh: Manager, Staff IT" /></div>
                                        <div className="space-y-2"><Label className={LABEL_CLASS}>Nama Perusahaan</Label><FastInput value={data.nama_perusahaan} onBlur={e => setData('nama_perusahaan', e.target.value)} onChange={() => errors.nama_perusahaan && clearErrors('nama_perusahaan')} className={getInputClass('nama_perusahaan')} placeholder="Nama Perusahaan" /></div>
                                    </div>
                                )}
                                {/* ORGANISASI SECTION */}
                                <div className="border-t border-white/10 my-6"></div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 className="w-5 h-5 text-[#AC0021]" />
                                        <h3 className="text-lg font-bold text-[#FEFCF8]">Organisasi</h3>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="has_organisasi" value="ada" checked={data.has_organisasi === 'ada'} onChange={e => { setData('has_organisasi', 'ada'); if (data.organisasi.length === 0) setData('organisasi', [{ nama_organisasi: '', posisi: '', tanggal_mulai: '', tanggal_berakhir: '', informasi_tambahan: '', is_active: false }]); }} className="accent-[#AC0021] w-4 h-4 bg-[#2a2a2a] border-white/10" /> <span className="text-[#FEFCF8]">Ada</span></label>
                                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="has_organisasi" value="tidak_ada" checked={data.has_organisasi === 'tidak_ada'} onChange={e => setData('has_organisasi', 'tidak_ada')} className="accent-[#AC0021] w-4 h-4 bg-[#2a2a2a] border-white/10" /> <span className="text-[#FEFCF8]">Tidak Ada</span></label>
                                    </div>
                                    {data.has_organisasi === 'ada' && (
                                        <div className="space-y-6 pt-2">
                                            {data.organisasi.map((item: any, index: number) => (
                                                <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 relative space-y-4">
                                                    {index > 0 && <button type="button" onClick={() => { const newList = data.organisasi.filter((_: any, i: number) => i !== index); setData('organisasi', newList); }} className="absolute top-4 right-4 text-red-500"><Trash2 className="w-4 h-4" /></button>}
                                                    <h4 className="text-[#FEFCF8] font-semibold mb-4">Organisasi {index + 1}</h4>
                                                    <div className="space-y-2"><Label className={LABEL_CLASS}>Nama Organisasi/Kegiatan</Label><FastInput value={item.nama_organisasi} onBlur={e => { const l = [...data.organisasi]; l[index].nama_organisasi = e.target.value; setData('organisasi', l); }} onChange={() => (errors as any)[`organisasi.${index}.nama_organisasi`] && clearErrors(`organisasi.${index}.nama_organisasi` as any)} className={getInputClass(`organisasi.${index}.nama_organisasi`)} placeholder="Nama Organisasi" /></div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="space-y-2"><Label className={LABEL_CLASS}>Posisi</Label><FastInput value={item.posisi} onBlur={e => { const l = [...data.organisasi]; l[index].posisi = e.target.value; setData('organisasi', l); }} onChange={() => (errors as any)[`organisasi.${index}.posisi`] && clearErrors(`organisasi.${index}.posisi` as any)} className={getInputClass(`organisasi.${index}.posisi`)} placeholder="Jabatan / Peran" /></div>
                                                        <div className="space-y-2"><Label className={LABEL_CLASS}>Mulai</Label><FastInput type="month" value={item.tanggal_mulai?.substring(0, 7)} onBlur={e => { const l = [...data.organisasi]; l[index].tanggal_mulai = e.target.value ? e.target.value + '-01' : ''; setData('organisasi', l); }} onChange={() => (errors as any)[`organisasi.${index}.tanggal_mulai`] && clearErrors(`organisasi.${index}.tanggal_mulai` as any)} className={getInputClass(`organisasi.${index}.tanggal_mulai`)} /></div>
                                                        <div className="space-y-2"><Label className={LABEL_CLASS}>Berakhir</Label><FastInput type="month" value={item.tanggal_berakhir?.substring(0, 7)} onBlur={e => { const l = [...data.organisasi]; l[index].tanggal_berakhir = e.target.value ? e.target.value + '-01' : ''; setData('organisasi', l); }} disabled={item.is_active} onChange={() => (errors as any)[`organisasi.${index}.tanggal_berakhir`] && clearErrors(`organisasi.${index}.tanggal_berakhir` as any)} className={getInputClass(`organisasi.${index}.tanggal_berakhir`)} /></div>
                                                    </div>
                                                    <div className="flex items-center gap-2"><input type="checkbox" checked={item.is_active} onChange={e => { const l = [...data.organisasi]; l[index].is_active = e.target.checked; if (e.target.checked) l[index].tanggal_berakhir = ''; setData('organisasi', l); }} className="accent-[#AC0021] w-4 h-4 bg-[#2a2a2a] border-white/10" /> <span className="text-[#FEFCF8]">Masih Aktif</span></div>
                                                    <div className="space-y-2"><Label className={LABEL_CLASS}>Info Tambahan</Label><FastTextarea value={item.informasi_tambahan} onBlur={e => { const l = [...data.organisasi]; l[index].informasi_tambahan = e.target.value; setData('organisasi', l); }} onChange={() => (errors as any)[`organisasi.${index}.informasi_tambahan`] && clearErrors(`organisasi.${index}.informasi_tambahan` as any)} className={getInputClass(`organisasi.${index}.informasi_tambahan`)} placeholder="Keterangan tambahan..." /></div>
                                                </div>
                                            ))}
                                            <div className="flex justify-end pt-2"><button type="button" onClick={() => setData('organisasi', [...data.organisasi, { nama_organisasi: '', posisi: '', tanggal_mulai: '', tanggal_berakhir: '', informasi_tambahan: '', is_active: false }])} className="flex items-center gap-2 px-4 py-2 bg-[#AC0021] text-white rounded-full hover:bg-[#8a001a] transition-colors"><Plus className="w-4 h-4" /><span>Tambah Organisasi</span></button></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 7: DOKUMEN */}
                        {step === 7 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
                                {/* Download Template Button */}
                                <div className="flex justify-center pb-4 pt-1">
                                    <a href={route('complete-profile.download-templates')} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 bg-[#2a2a2a] border-white/10 text-[#FEFCF8] hover:bg-white/10 gap-2">
                                        <Download className="w-4 h-4" />
                                        Download Semua Template
                                    </a>
                                </div>

                                <h3 className={SECTION_TITLE_CLASS}>Dokumen Pendukung</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { key: 'doc_surat_lamaran', label: '1. Surat Lamaran' },
                                        { key: 'doc_ktp', label: '2. KTP (Asli)' },
                                        { key: 'doc_kk', label: '3. Kartu Keluarga (Fotocopy)' },
                                        { key: 'doc_sk_lurah', label: '4. Surat Ket. Lurah/Kades' },
                                        { key: 'doc_skck', label: '5. SKCK (Asli)' },
                                        { key: 'doc_ijazah', label: '6. Ijazah Terakhir' },
                                        { key: 'doc_sk_sehat', label: '7. Surat Sehat' },
                                        { key: 'doc_drh', label: '8. Daftar Riwayat Hidup' },
                                        { key: 'doc_latsarmil', label: '9. Surat Pernyataan LATSARMIL' },
                                        { key: 'doc_izin_instansi', label: '10. Surat Izin Instansi' },
                                        { key: 'doc_izin_ortu', label: '11. Surat Izin Ortu' },
                                    ].map((doc) => (
                                        <div key={doc.key} className="space-y-2">
                                            <Label className={LABEL_CLASS}>{doc.label}</Label>
                                            <div onClick={() => document.getElementById(doc.key)?.click()} className={`h-32 bg-[#2a2a2a] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors ${(errors as any)[doc.key] ? 'border-[#AC0021]' : 'border-gray-600'
                                                }`}>
                                                {(previews as any)[doc.key] ? (
                                                    <span className="text-xs text-[#FEFCF8] truncate px-2">Uploaded</span>
                                                ) : (
                                                    <FileText className="w-8 h-8 text-gray-400" />
                                                )}
                                                <span className="text-xs text-gray-400 mt-2">Klik untuk upload</span>
                                            </div>
                                            <input id={doc.key} type="file" className="hidden" onChange={(e) => handleFileInput(e, doc.key)} />
                                        </div>
                                    ))}
                                    {/* Signature */}
                                    <div className="space-y-2">
                                        <Label className={LABEL_CLASS}>Tanda Tangan</Label>
                                        <div onClick={() => setIsSignatureModalOpen(true)} className="h-32 bg-[#2a2a2a] border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                                            {signatureDataUrl ? <img src={signatureDataUrl} className="h-20 object-contain" /> : <PenTool className="w-8 h-8 text-gray-400" />}
                                            <span className="text-xs text-gray-400 mt-2">{signatureDataUrl ? 'Ubah' : 'Buat Tanda Tangan'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>

                <div className="p-6 border-t border-white/10 bg-[#1a1a1a] shrink-0 flex justify-between">
                    <Button variant="ghost" onClick={step === 1 ? () => onOpenChange(false) : prevStep} className={SECONDARY_BUTTON_CLASS}>
                        {step === 1 ? 'Batal' : 'Kembali'}
                    </Button>
                    <Button onClick={step === 7 ? handleSubmit : nextStep} className={PRIMARY_BUTTON_CLASS}>
                        {step === 7 ? 'Simpan Anggota' : 'Lanjut'}
                    </Button>
                </div>

                {/* Signature Modal */}
                <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                    <DialogContent className="bg-[#1a1a1a] border-white/20 text-[#FEFCF8]">
                        <DialogHeader>
                            <DialogTitle className="text-[#FEFCF8]">Tanda Tangan Digital</DialogTitle>
                        </DialogHeader>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <SignatureCanvas ref={signatureRef} canvasProps={{ className: 'w-full h-64' }} />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleClearSignature} className={SECONDARY_BUTTON_CLASS}>Hapus</Button>
                            <Button onClick={handleSaveSignature} className={PRIMARY_BUTTON_CLASS}>Simpan</Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Cropper */}
                <ImageCropper open={showCropper} image={cropperImage} onClose={() => setShowCropper(false)} onCropComplete={onCropComplete} aspect={1} />
            </DialogContent>
        </Dialog >
    );
}
