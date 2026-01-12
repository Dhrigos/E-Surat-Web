import React, { useState, useEffect, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import InputError from '@/components/input-error';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin, FileText, Briefcase, Camera, Loader2, UploadCloud, FileType, Check, PenTool, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import SignatureCanvas from 'react-signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CascadingJabatanSelector } from '@/components/CascadingJabatanSelector';
import { JabatanSelectionModal } from '@/components/JabatanSelectionModal';
import { Edit2 } from 'lucide-react';

interface Props {
    userDetail: any;
    jabatans: any[];
}

export default function UpdateProfileDetailsForm({ userDetail, jabatans }: Props) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nia_nrp: userDetail?.nia_nrp || '',
        nik: userDetail?.nik || '',
        tempat_lahir: userDetail?.tempat_lahir || '',
        tanggal_lahir: userDetail?.tanggal_lahir || '',
        jenis_kelamin: userDetail?.jenis_kelamin || '',

        jabatan_id: userDetail?.jabatan_id?.toString() || '',
        jabatan_role: userDetail?.jabatan_role || '',
        tanggal_pengangkatan: userDetail?.tanggal_pengangkatan || '',
        nomor_sk: userDetail?.nomor_sk || '',
        nomor_kta: userDetail?.nomor_kta || '',

        alamat_domisili_lengkap: userDetail?.alamat_domisili_lengkap || '',
        jalan: userDetail?.alamat_domisili_lengkap || '', // Mapping back
        province_id: userDetail?.province_id || '',
        city_id: userDetail?.city_id || '',
        district_id: userDetail?.district_id || '',
        village_id: userDetail?.village_id || '',

        foto_profil: null as File | null,
        scan_ktp: null as File | null,
        scan_kta: null as File | null,
        scan_sk: null as File | null,
        tanda_tangan: null as File | null,
    });



    // Signature states
    const signatureRef = useRef<SignatureCanvas>(null);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [signatureFilename, setSignatureFilename] = useState<string>('');
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    // Jabatan Modal State
    const [isJabatanModalOpen, setIsJabatanModalOpen] = useState(false);

    // Derived Display Logic for the Input Trigger
    const selectedJabatanObj = jabatans.find((j: any) => j.id.toString() === data.jabatan_id);
    const jabatanDisplayText = selectedJabatanObj
        ? `${selectedJabatanObj.nama}${data.jabatan_role ? ' - ' + data.jabatan_role : ''}`
        : 'Pilih Jabatan...';

    // Region Data States
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [villages, setVillages] = useState<any[]>([]);

    const MAX_FILE_SIZE_MB = 2;
    const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

    function handleFileInput(e: React.ChangeEvent<HTMLInputElement>, field: string) {
        const file = e.target.files?.[0] || null;
        if (!file) {
            setData(field as any, null);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error(`File terlalu besar. Maks ${MAX_FILE_SIZE_MB} MB.`);
            setData(field as any, null);
            try { e.target.value = ''; } catch (err) { }
            return;
        }
        setData(field as any, file);
    }



    // Load Region Data
    useEffect(() => {
        axios.get(route('regions.provinces')).then(res => setProvinces(Object.entries(res.data).map(([code, name]) => ({ code, name }))));
        if (data.province_id) fetchCities(data.province_id, true);
    }, []);

    const fetchCities = (provinceCode: string, initial = false) => {
        if (!initial) {
            setData('province_id', provinceCode);
            setCities([]); setDistricts([]); setVillages([]);
        }
        axios.get(route('regions.cities', { province_code: provinceCode })).then(res => {
            const cityList = Object.entries(res.data).map(([code, name]) => ({ code, name }));
            setCities(cityList);
            if (initial && data.city_id) fetchDistricts(data.city_id, true);
        });
    };

    const fetchDistricts = (cityCode: string, initial = false) => {
        if (!initial) {
            setData('city_id', cityCode);
            setDistricts([]); setVillages([]);
        }
        axios.get(route('regions.districts', { city_code: cityCode })).then(res => {
            setDistricts(Object.entries(res.data).map(([code, name]) => ({ code, name })));
            if (initial && data.district_id) fetchVillages(data.district_id, true);
        });
    };

    const fetchVillages = (districtCode: string, initial = false) => {
        if (!initial) {
            setData('district_id', districtCode);
            setVillages([]);
        }
        axios.get(route('regions.villages', { district_code: districtCode })).then(res => {
            setVillages(Object.entries(res.data).map(([code, name]) => ({ code, name })));
        });
    };

    // Signature handlers
    const handleSaveSignature = () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            const dataUrl = signatureRef.current.toDataURL('image/png');
            setSignatureDataUrl(dataUrl);

            const filename = `signature_${Date.now()}.png`;
            setSignatureFilename(filename);

            fetch(dataUrl)
                .then(res => res.blob())
                .then(blob => {
                    const file = new File([blob], filename, { type: 'image/png' });
                    setData('tanda_tangan', file);
                    toast.success('Tanda tangan berhasil disimpan');
                    setIsSignatureModalOpen(false);
                })
                .catch(() => {
                    toast.error('Gagal menyimpan tanda tangan');
                });
        } else {
            toast.error('Silakan buat tanda tangan terlebih dahulu');
        }
    };

    const handleClearSignature = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
            setSignatureDataUrl(null);
            setSignatureFilename('');
            setData('tanda_tangan', null);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update-details'), {
            onSuccess: () => toast.success('Profil berhasil diperbarui dengan sukses!'),
            onError: () => toast.error('Gagal menyimpan data. Mohon periksa kembali input Anda.'),
        });
    };

    const SubmitButton = () => (
        <div className="flex justify-end border-t bg-muted/10 p-4">
            <Button size="sm" disabled={processing} className="w-full md:w-auto shadow-sm hover:shadow-red-500/20 rounded-lg px-6 bg-red-600 hover:bg-red-700 text-sm font-medium transition-all duration-200">
                {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
        </div>
    );

    const CardContainer = ({ children, className, hideSubmit = false }: { children: React.ReactNode; className?: string; hideSubmit?: boolean }) => (
        <Card className={cn("border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ring-1 ring-border/40", className)}>
            {children}
            {!hideSubmit && <SubmitButton />}
        </Card>
    );

    const GradientIcon = ({ icon: Icon, colorClass }: { icon: any, colorClass: string }) => (
        <div className={cn("p-2.5 rounded-xl shadow-sm", colorClass)}>
            <Icon className="w-5 h-5 text-white" />
        </div>
    );

    const FileUploadCard = ({ label, field, icon: Icon, description, accept = "image/*" }: { label: string, field: string, icon: any, description: string, accept?: string }) => {
        const existingFile = userDetail?.[field];
        const hasFile = data[field as keyof typeof data] || existingFile;
        const previewUrl = existingFile ? `/storage/${existingFile}` : null;

        return (
            <div className="space-y-3 group">
                <Label className="text-base font-medium group-hover:text-primary transition-colors">{label}</Label>

                {/* Image Preview */}
                {previewUrl && (
                    <div className="relative w-full h-40 bg-muted rounded-lg overflow-hidden border border-border mb-2 group/preview">
                        <img src={previewUrl} alt={`Preview ${label}`} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                            <a
                                href={previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-white text-xs bg-black/50 px-3 py-1.5 rounded hover:bg-black/70 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Lihat Full
                            </a>
                        </div>
                    </div>
                )}

                {/* Upload Area */}
                <div className={cn(
                    "relative border border-dashed border-input hover:border-primary/50 hover:bg-primary/5 rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center",
                    previewUrl ? "h-24" : "h-40"
                )}>
                    <Input type="file" onChange={e => handleFileInput(e, field)} accept={accept} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                    <div className="p-3 bg-background rounded-full shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-300 mb-3">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                        {hasFile ? (
                            <>
                                <p className="text-sm font-medium text-green-600 flex items-center gap-1 justify-center">
                                    <Check className="w-4 h-4" />
                                    File tersedia
                                </p>
                                <p className="text-xs text-muted-foreground">Klik untuk ganti</p>
                            </>
                        ) : (
                            <>
                                <p className="text-sm font-medium text-foreground">Upload file</p>
                                <p className="text-xs text-muted-foreground px-4">{description}</p>
                            </>
                        )}
                    </div>
                </div>
                <InputError message={errors[field as keyof typeof errors]} />
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-24">

            <div className="grid grid-cols-1 gap-6">
                {/* 1. Personal Information */}
                <CardContainer hideSubmit={true}>
                    <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                        <div className="flex items-center gap-4">
                            <GradientIcon icon={User} colorClass="bg-gradient-to-br from-indigo-500 to-violet-600" />
                            <div>
                                <CardTitle className="text-base">Identitas Pribadi</CardTitle>
                                <CardDescription>Data diri sesuai KTP</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>NRP</Label>
                                <Input value={data.nia_nrp} readOnly className="cursor-not-allowed bg-muted" />
                                <InputError message={errors.nia_nrp} />
                            </div>
                            <div className="space-y-2">
                                <Label>NIK</Label>
                                <Input value={data.nik} readOnly className="cursor-not-allowed bg-muted" />
                                <InputError message={errors.nik} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tempat Lahir</Label>
                                <Input value={data.tempat_lahir} readOnly className="cursor-not-allowed bg-muted" />
                                <InputError message={errors.tempat_lahir} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tanggal Lahir</Label>
                                <Input type="date" value={data.tanggal_lahir} readOnly className="cursor-not-allowed bg-muted" />
                                <InputError message={errors.tanggal_lahir} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Jenis Kelamin</Label>
                            <Select value={data.jenis_kelamin} disabled>
                                <SelectTrigger className="cursor-not-allowed bg-muted"><SelectValue placeholder="Pilih Jenis Kelamin" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.jenis_kelamin} />
                        </div>
                    </CardContent>
                </CardContainer>

                {/* 2. Employment Information */}
                {false && (
                    <CardContainer hideSubmit={true}>
                        <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                            <div className="flex items-center gap-4">
                                <GradientIcon icon={Briefcase} colorClass="bg-gradient-to-br from-blue-500 to-cyan-600" />
                                <div>
                                    <CardTitle className="text-base">Data Kepegawaian</CardTitle>
                                    <CardDescription>Unit kerja dan jabatan saat ini</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {/* Unit / Structure Selection */}
                            <div className="space-y-2">
                                <Label>Jabatan & Struktur Organisasi</Label>

                                <div
                                    className={cn(
                                        "flex items-center justify-between w-full rounded-md border text-sm px-3 py-2 cursor-not-allowed transition-colors",
                                        "bg-[#2a2a2a] border-white/10 opacity-70",
                                    )}
                                >
                                    <div className={cn(
                                        "flex flex-col",
                                        !data.jabatan_id ? "text-muted-foreground" : "text-white"
                                    )}>
                                        <span className="font-medium">{jabatanDisplayText}</span>
                                        {selectedJabatanObj && (
                                            <span className="text-xs text-muted-foreground mt-0.5">
                                                {selectedJabatanObj.kategori}
                                            </span>
                                        )}
                                    </div>
                                    <Edit2 className="w-4 h-4 text-gray-500" />
                                </div>

                                <div className="space-y-1">
                                    <InputError message={errors.jabatan_id} />
                                    <InputError message={errors.jabatan_role} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tanggal Pengangkatan</Label>
                                    <Input type="date" value={data.tanggal_pengangkatan} readOnly className="cursor-not-allowed bg-muted" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nomor SK</Label>
                                    <Input value={data.nomor_sk} readOnly className="cursor-not-allowed bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nomor KTA</Label>
                                    <Input value={data.nomor_kta} readOnly className="cursor-not-allowed bg-muted" />
                                </div>
                            </div>
                        </CardContent>
                    </CardContainer>
                )}
            </div>

            {/* 3. Address Information */}
            <CardContainer hideSubmit={true}>
                <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <GradientIcon icon={MapPin} colorClass="bg-gradient-to-br from-orange-500 to-red-600" />
                        <div>
                            <CardTitle className="text-base">Alamat Domisili</CardTitle>
                            <CardDescription>Alamat lengkap untuk korespondensi surat</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Provinsi</Label>
                            <Select value={data.province_id} disabled>
                                <SelectTrigger className="cursor-not-allowed bg-muted"><SelectValue placeholder="Provinsi" /></SelectTrigger>
                                <SelectContent>
                                    {provinces.map(p => <SelectItem key={p.code} value={p.code}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kota/Kab</Label>
                            <Select value={data.city_id} disabled>
                                <SelectTrigger className="cursor-not-allowed bg-muted"><SelectValue placeholder="Kota/Kab" /></SelectTrigger>
                                <SelectContent>
                                    {cities.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kecamatan</Label>
                            <Select value={data.district_id} disabled>
                                <SelectTrigger className="cursor-not-allowed bg-muted"><SelectValue placeholder="Kecamatan" /></SelectTrigger>
                                <SelectContent>
                                    {districts.map(d => <SelectItem key={d.code} value={d.code}>{d.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Kelurahan</Label>
                            <Select value={data.village_id} disabled>
                                <SelectTrigger className="cursor-not-allowed bg-muted"><SelectValue placeholder="Kelurahan" /></SelectTrigger>
                                <SelectContent>
                                    {villages.map(v => <SelectItem key={v.code} value={v.code}>{v.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="space-y-2">
                            <Label>Alamat Lengkap (Jalan, RT/RW)</Label>
                            <Input value={data.alamat_domisili_lengkap} readOnly className="cursor-not-allowed bg-muted" />
                        </div>
                    </div>
                </CardContent>
            </CardContainer>

            {/* 4. Documents */}
            {false && (
                <CardContainer>
                    <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
                        <div className="flex items-center gap-4">
                            <GradientIcon icon={FileText} colorClass="bg-gradient-to-br from-emerald-500 to-teal-600" />
                            <div>
                                <CardTitle className="text-base">Dokumen Digital</CardTitle>
                                <CardDescription>Kelola berkas digital dan tanda tangan</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FileUploadCard
                                label="Foto Profil"
                                field="foto_profil"
                                icon={Camera}
                                description="Foto resmi (JPG/PNG)"
                            />

                            {/* Signature Field - Click to Open Modal */}
                            <div className="space-y-3 group">
                                <Label className="text-base font-medium group-hover:text-primary transition-colors">Tanda Tangan Digital</Label>
                                <div
                                    onClick={() => setIsSignatureModalOpen(true)}
                                    className={cn(
                                        "cursor-pointer relative border border-dashed border-input hover:border-primary/50 hover:bg-primary/5 rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center text-center h-40"
                                    )}
                                >
                                    <div className="p-3 bg-background rounded-full shadow-sm ring-1 ring-border group-hover:scale-110 transition-transform duration-300 mb-3">
                                        <PenTool className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        {signatureDataUrl ? (
                                            <>
                                                <p className="text-sm font-medium text-green-600 flex items-center gap-1 justify-center">
                                                    <BadgeCheck className="w-4 h-4" />
                                                    Tanda tangan tersedia
                                                </p>
                                                <p className="text-xs text-muted-foreground">Klik untuk ubah</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-medium text-foreground">Buat tanda tangan</p>
                                                <p className="text-xs text-muted-foreground px-4">Klik untuk menggambar</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <InputError message={errors.tanda_tangan} />
                            </div>

                            <FileUploadCard
                                label="Scan KTP"
                                field="scan_ktp"
                                icon={FileType}
                                description="Dokumen Identitas"
                                accept=".pdf,image/*"
                            />
                            <FileUploadCard
                                label="Scan KTA"
                                field="scan_kta"
                                icon={FileType}
                                description="Kartu Tanda Anggota"
                                accept=".pdf,image/*"
                            />
                            <FileUploadCard
                                label="Scan SK Terakhir"
                                field="scan_sk"
                                icon={FileType}
                                description="SK Pangkat/Jabatan"
                                accept=".pdf,image/*"
                            />
                        </div>
                    </CardContent>
                </CardContainer>
            )}

            {/* Sticky Action Bar */}

            {/* Signature Modal */}
            <Dialog open={isSignatureModalOpen} onOpenChange={setIsSignatureModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Buat Tanda Tangan Digital</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="border-2 border-dashed border-border rounded-lg overflow-hidden bg-white">
                            <SignatureCanvas
                                ref={signatureRef}
                                canvasProps={{
                                    className: 'w-full h-64',
                                }}
                                backgroundColor="white"
                            />
                        </div>
                        <div className="flex justify-between gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearSignature}
                            >
                                Hapus
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsSignatureModalOpen(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSaveSignature}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Simpan Tanda Tangan
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </form>
    );
}
