import React, { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import axios from 'axios';
import InputError from '@/components/input-error';
import HeadingSmall from '@/components/heading-small';

interface Props {
    unitKerjas: Array<{ id: number; nama: string; kode: string | null; }>;
    allUnits: Array<{ id: number; nama: string; kode: string | null; parent_id: number | null; }>;
    statusKeanggotaans: Array<{ id: number; nama: string }>;
    userDetail: any;
}

export default function UpdateProfileDetailsForm({ unitKerjas, allUnits, statusKeanggotaans, userDetail }: Props) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nia_nrp: userDetail?.nia_nrp || '',
        nik: userDetail?.nik || '',
        tempat_lahir: userDetail?.tempat_lahir || '',
        tanggal_lahir: userDetail?.tanggal_lahir || '',
        jenis_kelamin: userDetail?.jenis_kelamin || '',

        unit_kerja_id: userDetail?.unit_kerja_id?.toString() || '',
        subunit_id: userDetail?.subunit_id?.toString() || '',
        jabatan_id: userDetail?.jabatan_id?.toString() || '',
        status_keanggotaan_id: userDetail?.status_keanggotaan_id?.toString() || '',
        pangkat_id: userDetail?.pangkat_id?.toString() || '',
        tanggal_pengangkatan: userDetail?.tanggal_pengangkatan || '',
        nomor_sk: userDetail?.nomor_sk || '',
        nomor_kta: userDetail?.nomor_kta || '',

        alamat_domisili_lengkap: userDetail?.alamat_domisili_lengkap || '',
        jalan: userDetail?.alamat_domisili_lengkap || '', // Mapping back
        province_id: userDetail?.province_id || '',
        city_id: userDetail?.city_id || '',
        district_id: userDetail?.district_id || '',
        village_id: userDetail?.village_id || '',
        postal_code: userDetail?.postal_code || '',

        foto_profil: null as File | null,
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

    // Load initial cascading data if editing
    useEffect(() => {
        if (data.unit_kerja_id) {
            const subunits = allUnits.filter(u => u.parent_id === parseInt(data.unit_kerja_id));
            setAvailableSubunits(subunits);
            axios.get(`/api/jabatan-by-unit?unit_id=${data.unit_kerja_id}`)
                .then(res => setAvailableJabatans(res.data))
                .catch(() => setAvailableJabatans([]));
        }
    }, [data.unit_kerja_id]);

    useEffect(() => {
        if (data.jabatan_id) {
            axios.get(`/api/status-by-jabatan?jabatan_id=${data.jabatan_id}`)
                .then(res => setAvailableStatuses(res.data))
                .catch(() => setAvailableStatuses([]));
        }
    }, [data.jabatan_id]);

    useEffect(() => {
        if (data.status_keanggotaan_id) {
            axios.get(`/api/pangkat-by-status?status_id=${data.status_keanggotaan_id}`)
                .then(res => setAvailablePangkats(res.data))
                .catch(() => setAvailablePangkats([]));
        }
    }, [data.status_keanggotaan_id]);

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
            setBirthplaceCities(cityList); // Assuming birthplace uses same list
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update-details'), {
            onSuccess: () => toast.success('Profil berhasil diperbarui!'),
            onError: () => toast.error('Gagal menyimpan data. Periksa input Anda.'),
        });
    };

    return (
        <section className="space-y-6">
            <HeadingSmall
                title="Detail Kepegawaian & Pribadi"
                description="Perbarui informasi detail kepegawaian dan data pribadi Anda."
            />

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Data Diri */}
                    <div className="space-y-2">
                        <Label>NIA / NRP</Label>
                        <Input value={data.nia_nrp} onChange={e => setData('nia_nrp', e.target.value)} />
                        <InputError message={errors.nia_nrp} />
                    </div>
                    <div className="space-y-2">
                        <Label>NIK</Label>
                        <Input value={data.nik} onChange={e => setData('nik', e.target.value)} />
                        <InputError message={errors.nik} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tempat Lahir</Label>
                        <Input value={data.tempat_lahir} onChange={e => setData('tempat_lahir', e.target.value)} />
                        <InputError message={errors.tempat_lahir} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tanggal Lahir</Label>
                        <Input type="date" value={data.tanggal_lahir} onChange={e => setData('tanggal_lahir', e.target.value)} />
                        <InputError message={errors.tanggal_lahir} />
                    </div>
                    <div className="space-y-2">
                        <Label>Jenis Kelamin</Label>
                        <Select value={data.jenis_kelamin} onValueChange={val => setData('jenis_kelamin', val)}>
                            <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                <SelectItem value="Perempuan">Perempuan</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.jenis_kelamin} />
                    </div>

                    {/* Kepegawaian */}
                    <div className="space-y-2">
                        <Label>Unit Kerja</Label>
                        <Select value={data.unit_kerja_id} onValueChange={val => setData('unit_kerja_id', val)}>
                            <SelectTrigger><SelectValue placeholder="Pilih Unit" /></SelectTrigger>
                            <SelectContent>
                                {unitKerjas.map(u => <SelectItem key={u.id} value={u.id.toString()}>{u.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.unit_kerja_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Jabatan</Label>
                        <Select value={data.jabatan_id} onValueChange={val => setData('jabatan_id', val)}>
                            <SelectTrigger><SelectValue placeholder="Pilih Jabatan" /></SelectTrigger>
                            <SelectContent>
                                {availableJabatans.map((j: any) => <SelectItem key={j.id} value={j.id.toString()}>{j.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.jabatan_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Status Keanggotaan</Label>
                        <Select value={data.status_keanggotaan_id} onValueChange={val => setData('status_keanggotaan_id', val)}>
                            <SelectTrigger><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                            <SelectContent>
                                {availableStatuses.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status_keanggotaan_id} />
                    </div>
                    <div className="space-y-2">
                        <Label>Pangkat</Label>
                        <Select value={data.pangkat_id} onValueChange={val => setData('pangkat_id', val)}>
                            <SelectTrigger><SelectValue placeholder="Pilih Pangkat" /></SelectTrigger>
                            <SelectContent>
                                {availablePangkats.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.pangkat_id} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button disabled={processing}>Simpan Perubahan</Button>
                    {recentlySuccessful && <p className="text-sm text-green-600">Tersimpan.</p>}
                </div>
            </form>
        </section>
    );
}
