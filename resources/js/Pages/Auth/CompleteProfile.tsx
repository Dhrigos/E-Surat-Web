import React, { useState, useEffect } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Briefcase, User, Building2, CreditCard, BadgeCheck, MapPin, Upload, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import axios from 'axios';

interface Props {
    unitKerjas: Array<{ id: number; nama: string; kode: string | null; }>;
    allUnits: Array<{ id: number; nama: string; kode: string | null; parent_id: number | null; }>;
    statusKeanggotaans: Array<{ id: number; nama: string }>;
    rejectionReason?: string;
}

export default function CompleteProfile({ unitKerjas, allUnits, statusKeanggotaans, rejectionReason }: Props) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        // Step 1: Data Diri
        nia_nrp: '',
        nik: '',
        nama_lengkap: '',
        tempat_lahir: '',
        birthplace_province_id: '',
        tanggal_lahir: '',
        jenis_kelamin: '',
        foto_profil: null as File | null,

        // Step 2: Data Kepegawaian (now using IDs)
        unit_kerja_id: '',
        subunit_id: '',
        jabatan_id: '',
        status_keanggotaan_id: '',
        pangkat_id: '',
        tanggal_pengangkatan: '',
        nomor_sk: '',
        nomor_kta: '',

        // Step 3: Alamat & Dokumen
        alamat_domisili_lengkap: '',
        jalan: '',
        province_id: '',
        city_id: '',
        district_id: '',
        village_id: '',
        postal_code: '',

        scan_ktp: null as File | null,
        scan_kta: null as File | null,
        scan_sk: null as File | null,
        tanda_tangan: null as File | null,
    });

    // Cascading dropdown states
    const [availableSubunits, setAvailableSubunits] = useState<any[]>([]);
    const [availableJabatans, setAvailableJabatans] = useState<any[]>([]);
    const [availableStatuses, setAvailableStatuses] = useState<any[]>([]);
    const [availablePangkats, setAvailablePangkats] = useState<any[]>([]);

    // Region Data States
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [villages, setVillages] = useState<any[]>([]);
    const [birthplaceCities, setBirthplaceCities] = useState<any[]>([]);

    // Preview states
    const [previews, setPreviews] = useState<Record<string, string>>({});

    // Client-side file size guard to avoid server 413 errors
    const MAX_FILE_SIZE_MB = 2; // keep aligned with backend validation (2 MB)
    const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, field: string) {
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

        setData(field as any, file);
        clearErrors(field as any);

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [field]: objectUrl }));
    }

    // Load cascading data when selections change
    useEffect(() => {
        if (data.unit_kerja_id) {
            // Load subunits for selected unit
            const subunits = allUnits.filter(u => u.parent_id === parseInt(data.unit_kerja_id));
            setAvailableSubunits(subunits);

            // Load jabatans for selected unit
            axios.get(`/api/jabatan-by-unit?unit_id=${data.unit_kerja_id}`)
                .then(res => setAvailableJabatans(res.data))
                .catch(() => setAvailableJabatans([]));
        } else {
            setAvailableSubunits([]);
            setAvailableJabatans([]);
        }
    }, [data.unit_kerja_id]);

    useEffect(() => {
        if (data.jabatan_id) {
            axios.get(`/api/status-by-jabatan?jabatan_id=${data.jabatan_id}`)
                .then(res => setAvailableStatuses(res.data))
                .catch(() => setAvailableStatuses([]));
        } else {
            setAvailableStatuses([]);
        }
    }, [data.jabatan_id]);

    useEffect(() => {
        if (data.status_keanggotaan_id) {
            axios.get(`/api/pangkat-by-status?status_id=${data.status_keanggotaan_id}`)
                .then(res => setAvailablePangkats(res.data))
                .catch(() => setAvailablePangkats([]));
        } else {
            setAvailablePangkats([]);
        }
    }, [data.status_keanggotaan_id]);

    useEffect(() => {
        axios.get(route('regions.provinces')).then(res => setProvinces(Object.entries(res.data).map(([code, name]) => ({ code, name }))));
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('complete-profile.store'), {
            onSuccess: () => toast.success('Profil berhasil dilengkapi!'),
            onError: () => toast.error('Gagal menyimpan data. Periksa input Anda.'),
        });
    };

    const nextStep = () => {
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
        } else if (step === 2) {
            if (!data.foto_profil) {
                setError('foto_profil', 'Wajib diupload');
                toast.error('Harap upload foto profil');
                return;
            }
        } else if (step === 3) {
            const requiredFields = ['unit_kerja_id', 'jabatan_id', 'status_keanggotaan_id', 'pangkat_id', 'tanggal_pengangkatan', 'nomor_sk', 'nomor_kta'];
            requiredFields.forEach(field => {
                if (!data[field as keyof typeof data]) {
                    setError(field as any, 'Wajib diisi');
                    hasError = true;
                }
            });

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
                    <img
                        src="/images/KEMENTERIAN-PERTAHANAN.png"
                        alt="Logo Kementerian Pertahanan"
                        className="h-28 w-28 object-contain mx-auto mb-4 drop-shadow-2xl transition-all duration-300 hover:scale-110"
                    />
                    <CardTitle className="text-2xl md:text-3xl font-black text-red-600 mb-2 tracking-tight animate-in fade-in duration-700 delay-200 whitespace-nowrap">Badan Cadangan Nasional</CardTitle>

                    <div className="flex justify-center items-center gap-4 mb-4">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step === s ? 'bg-red-600 text-white ring-4 ring-red-600/30' : step > s ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                {step > s ? '✓' : s}
                            </div>
                        ))}
                    </div>

                    <CardDescription className="text-gray-400 text-lg">
                        {step === 1 && "Informasi Data Diri"}
                        {step === 2 && "Foto Profil"}
                        {step === 3 && "Informasi Kepegawaian"}
                        {step === 4 && "Alamat & Dokumen Pendukung"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-8">
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
                                    <Label className="text-white font-medium">NIA / NRP</Label>
                                    <Input value={data.nia_nrp} onChange={e => { setData('nia_nrp', e.target.value); clearErrors('nia_nrp'); }} className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 ${errors.nia_nrp ? 'border-red-500' : ''}`} placeholder="Nomor Induk Anggota" />
                                    {errors.nia_nrp && <p className="text-red-500 text-sm">{errors.nia_nrp}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">NIK</Label>
                                    <Input value={data.nik} onChange={e => { setData('nik', e.target.value); clearErrors('nik'); }} className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 ${errors.nik ? 'border-red-500' : ''}`} placeholder="Nomor Induk Kependudukan" />
                                    {errors.nik && <p className="text-red-500 text-sm">{errors.nik}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Tempat Lahir</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Select value={data.birthplace_province_id} onValueChange={fetchBirthplaceCities}>
                                            <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.tempat_lahir ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                                            <SelectContent>
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
                                    <Input type="date" value={data.tanggal_lahir} onChange={e => { setData('tanggal_lahir', e.target.value); clearErrors('tanggal_lahir'); }} className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 [color-scheme:dark] ${errors.tanggal_lahir ? 'border-red-500' : ''}`} />
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
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Foto Profil (Formal)</Label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="foto_profil"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={e => handleFileInput(e, 'foto_profil')}
                                        />
                                        <label
                                            htmlFor="foto_profil"
                                            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${errors.foto_profil
                                                ? 'border-red-500 bg-red-500/10'
                                                : 'border-white/20 bg-[#2a2a2a] hover:bg-[#333] hover:border-white/40'
                                                } overflow-hidden group`}
                                        >
                                            {previews.foto_profil ? (
                                                <div className="relative w-full h-full group-hover:opacity-90 transition-opacity">
                                                    <img
                                                        src={previews.foto_profil}
                                                        alt="Preview"
                                                        className="w-full h-full object-contain"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <p className="text-white font-medium text-sm">Ganti Foto</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-400 group-hover:text-white transition-colors">
                                                    <Upload className="w-12 h-12 mb-4" />
                                                    <p className="text-lg font-medium mb-2">Klik untuk upload foto</p>
                                                    <p className="text-sm text-gray-500">JPG, PNG (Max 2MB)</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                    {errors.foto_profil && <p className="text-red-500 text-sm">{errors.foto_profil}</p>}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: DATA KEPEGAWAIAN */}
                        {step === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Unit Kerja *</Label>
                                    <Select value={data.unit_kerja_id} onValueChange={val => { setData('unit_kerja_id', val); clearErrors('unit_kerja_id'); }}>
                                        <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.unit_kerja_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Unit Kerja" /></SelectTrigger>
                                        <SelectContent>
                                            {unitKerjas.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.unit_kerja_id && <p className="text-red-500 text-sm">{errors.unit_kerja_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Sub Unit (Opsional)</Label>
                                    <Select value={data.subunit_id} onValueChange={val => { setData('subunit_id', val); clearErrors('subunit_id'); }} disabled={availableSubunits.length === 0}>
                                        <SelectTrigger className="bg-[#2a2a2a] border-white/10 text-white"><SelectValue placeholder="Pilih Sub Unit" /></SelectTrigger>
                                        <SelectContent>
                                            {availableSubunits.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.subunit_id && <p className="text-red-500 text-sm">{errors.subunit_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Jabatan *</Label>
                                    <Select value={data.jabatan_id} onValueChange={val => { setData('jabatan_id', val); clearErrors('jabatan_id'); }} disabled={availableJabatans.length === 0}>
                                        <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.jabatan_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Jabatan" /></SelectTrigger>
                                        <SelectContent>
                                            {availableJabatans.map((j: any) => <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.jabatan_id && <p className="text-red-500 text-sm">{errors.jabatan_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Status Keanggotaan *</Label>
                                    <Select value={data.status_keanggotaan_id} onValueChange={val => { setData('status_keanggotaan_id', val); clearErrors('status_keanggotaan_id'); }} disabled={availableStatuses.length === 0}>
                                        <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.status_keanggotaan_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                                        <SelectContent>
                                            {availableStatuses.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.nama}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.status_keanggotaan_id && <p className="text-red-500 text-sm">{errors.status_keanggotaan_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Pangkat / Golongan *</Label>
                                    <Select value={data.pangkat_id} onValueChange={val => { setData('pangkat_id', val); clearErrors('pangkat_id'); }} disabled={availablePangkats.length === 0}>
                                        <SelectTrigger className={`bg-[#2a2a2a] border-white/10 text-white ${errors.pangkat_id ? 'border-red-500' : ''}`}><SelectValue placeholder="Pilih Pangkat" /></SelectTrigger>
                                        <SelectContent>
                                            {availablePangkats.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.nama} ({p.kode})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {errors.pangkat_id && <p className="text-red-500 text-sm">{errors.pangkat_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Tanggal Pengangkatan</Label>
                                    <Input type="date" value={data.tanggal_pengangkatan} onChange={e => { setData('tanggal_pengangkatan', e.target.value); clearErrors('tanggal_pengangkatan'); }} className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 [color-scheme:dark] ${errors.tanggal_pengangkatan ? 'border-red-500' : ''}`} />
                                    {errors.tanggal_pengangkatan && <p className="text-red-500 text-sm">{errors.tanggal_pengangkatan}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Nomor SK</Label>
                                    <Input value={data.nomor_sk} onChange={e => { setData('nomor_sk', e.target.value); clearErrors('nomor_sk'); }} className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 ${errors.nomor_sk ? 'border-red-500' : ''}`} placeholder="Nomor SK Pengangkatan" />
                                    {errors.nomor_sk && <p className="text-red-500 text-sm">{errors.nomor_sk}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white font-medium">Nomor KTA</Label>
                                    <Input value={data.nomor_kta} onChange={e => { setData('nomor_kta', e.target.value); clearErrors('nomor_kta'); }} className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 ${errors.nomor_kta ? 'border-red-500' : ''}`} placeholder="Nomor Kartu Tanda Anggota" />
                                    {errors.nomor_kta && <p className="text-red-500 text-sm">{errors.nomor_kta}</p>}
                                </div>
                            </div>
                        )}


                        {/* STEP 4: ALAMAT & DOKUMEN */}
                        {step === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label className="text-white font-medium">Jalan / Alamat Lengkap</Label>
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
                                            <SelectContent>
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
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Kode Pos</Label>
                                        <Input value={data.postal_code} onChange={e => { setData('postal_code', e.target.value); clearErrors('postal_code'); }} className={`bg-[#2a2a2a] border-white/10 text-white focus:border-red-600 ${errors.postal_code ? 'border-red-500' : ''}`} placeholder="Kode Pos" />
                                        {errors.postal_code && <p className="text-red-500 text-sm">{errors.postal_code}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/10">
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Scan KTP</Label>
                                        <Input type="file" onChange={e => handleFileInput(e, 'scan_ktp')} className={`bg-[#2a2a2a] border-white/10 text-white ${errors.scan_ktp ? 'border-red-500' : ''}`} />
                                        {errors.scan_ktp && <p className="text-red-500 text-sm">{errors.scan_ktp}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Scan KTA</Label>
                                        <Input type="file" onChange={e => handleFileInput(e, 'scan_kta')} className={`bg-[#2a2a2a] border-white/10 text-white ${errors.scan_kta ? 'border-red-500' : ''}`} />
                                        {errors.scan_kta && <p className="text-red-500 text-sm">{errors.scan_kta}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Scan SK</Label>
                                        <Input type="file" onChange={e => handleFileInput(e, 'scan_sk')} className={`bg-[#2a2a2a] border-white/10 text-white ${errors.scan_sk ? 'border-red-500' : ''}`} />
                                        {errors.scan_sk && <p className="text-red-500 text-sm">{errors.scan_sk}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-white font-medium">Tanda Tangan</Label>
                                        <Input type="file" onChange={e => handleFileInput(e, 'tanda_tangan')} className={`bg-[#2a2a2a] border-white/10 text-white ${errors.tanda_tangan ? 'border-red-500' : ''}`} />
                                        {errors.tanda_tangan && <p className="text-red-500 text-sm">{errors.tanda_tangan}</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </CardContent>

                <CardFooter className="flex justify-between p-8 border-t border-white/5">
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
        </div >
    );
}
