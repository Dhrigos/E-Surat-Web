import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Edit, Save, X, ArrowRight, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

interface Step {
    id?: number;
    order: number;
    approver_id: string;
    approver_type?: string;
    step_type?: 'sequential' | 'parallel' | 'conditional';
    condition_field?: string;
    condition_operator?: string;
    condition_value?: string;
}

interface LetterType {
    id: number;
    name: string;
    code: string;
    description: string;
    approval_workflows: {
        id: number;
        steps: Step[];
    }[];
}

interface Jabatan {
    id: number;
    nama: string;
}


interface Props {
    letterTypes: LetterType[];
}

export default function MasterDataIndex({ letterTypes }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingType, setEditingType] = useState<LetterType | null>(null);
    const [jabatans, setJabatans] = useState<Jabatan[]>([]);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, transform } = useForm({
        name: '',
        code: '',
        description: '',
        workflow_steps: [] as Step[],
    });

    useEffect(() => {
        axios.get(route('api.jabatan'))
            .then(response => setJabatans(response.data))
            .catch(error => console.error("Failed to fetch jabatans", error));
    }, []);

    const handleCreate = () => {
        setEditingType(null);
        reset();
        setData(data => ({ ...data, workflow_steps: [] }));
        setIsCreateOpen(true);
    };

    const handleEdit = (type: LetterType, workflowIndex: number = 0) => {
        setEditingType(type);
        const workflow = type.approval_workflows[workflowIndex];
        const steps = workflow ? workflow.steps.map(s => ({
            order: s.order,
            approver_id: s.approver_id,
            step_type: s.step_type || 'sequential',
            condition_field: s.condition_field,
            condition_operator: s.condition_operator,
            condition_value: s.condition_value
        })) : [];

        setData({
            name: type.name,
            code: type.code,
            description: type.description || '',
            workflow_steps: steps,
        });
        setIsCreateOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingType) {
            put(route('master-data.update', editingType.id), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    toast.success('Workflow berhasil diperbarui');
                    reset();
                },
            });
        }
    };

    const addStep = () => {
        setData('workflow_steps', [
            ...data.workflow_steps,
            {
                order: data.workflow_steps.length + 1,
                approver_id: '',
                step_type: 'sequential'
            }
        ]);
    };

    const removeStep = (index: number) => {
        const newSteps = data.workflow_steps.filter((_, i) => i !== index);
        // Reorder
        const reorderedSteps = newSteps.map((step, i) => ({ ...step, order: i + 1 }));
        setData('workflow_steps', reorderedSteps);
    };

    const updateStepApprover = (index: number, value: string) => {
        const newSteps = [...data.workflow_steps];
        newSteps[index].approver_id = value;
        setData('workflow_steps', newSteps);
    };

    const updateStepField = (index: number, field: keyof Step, value: any) => {
        const newSteps = [...data.workflow_steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setData('workflow_steps', newSteps);
    };

    return (
        <AppLayout>
            <Head title="Master Data Management" />

            <div className="flex h-full flex-1 flex-col gap-8 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Workflow Global</h2>
                        <p className="text-muted-foreground mt-1">Konfigurasi alur persetujuan untuk Jenis Surat.</p>
                    </div>
                </div>

                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[100px]">Kode Surat</TableHead>
                                <TableHead className="w-[200px]">Nama</TableHead>
                                <TableHead className="w-[250px]">Deskripsi</TableHead>
                                <TableHead>Langkah Workflow</TableHead>
                                <TableHead className="text-right w-[100px]">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {letterTypes.map((type) => (
                                <TableRow key={type.id} className="hover:bg-muted/5">
                                    <TableCell className="font-mono text-xs font-medium text-muted-foreground">
                                        <Badge variant="outline" className="font-mono">{type.code}</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold text-foreground">{type.name}</TableCell>

                                    <TableCell className="text-muted-foreground text-sm truncate max-w-[200px]" title={type.description}>
                                        {type.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-3 py-1">
                                            {type.approval_workflows.map((workflow, idx) => (
                                                <div key={workflow.id} className="flex flex-col gap-2 p-3 bg-muted/20 rounded-lg border border-border/50">

                                                    {workflow.steps.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2 items-center mt-1">
                                                            {workflow.steps.sort((a, b) => a.order - b.order).map((step, i) => (
                                                                <React.Fragment key={step.id || i}>
                                                                    <div className="flex items-center gap-2 bg-background border px-2 py-1 rounded-md shadow-sm">
                                                                        <span className="flex items-center justify-center bg-primary/10 text-primary text-[10px] font-bold h-5 w-5 rounded-full">
                                                                            {step.order}
                                                                        </span>
                                                                        <span className="text-xs font-medium">
                                                                            {(() => {
                                                                                const jabatan = jabatans.find(j => j.id.toString() === step.approver_id);
                                                                                return jabatan ? jabatan.nama : step.approver_id;
                                                                            })()}
                                                                        </span>
                                                                    </div>
                                                                    {i < workflow.steps.length - 1 && (
                                                                        <ArrowRight className="h-3 w-3 text-muted-foreground/50" />
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">Tidak ada persetujuan diperlukan</span>
                                                    )}
                                                </div>
                                            ))}
                                            {type.approval_workflows.length === 0 && (
                                                <div className="text-xs text-muted-foreground italic p-2">Belum ada workflow</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => handleEdit(type)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {letterTypes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Belum ada jenis surat. Silahkan tambahkan di menu Jenis Surat.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Konfigurasi Workflow</DialogTitle>
                            <DialogDescription>
                                Atur langkah-langkah alur persetujuan untuk jenis surat ini.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        readOnly
                                        className="font-medium bg-muted/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Kode Surat</Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        readOnly
                                        className="font-mono bg-muted/50"
                                    />
                                </div>
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    readOnly
                                    className="resize-none h-20 bg-muted/50"
                                />
                            </div>

                            <div className="space-y-4 border rounded-xl p-5 bg-muted/20">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <Label className="text-base font-semibold">Alur Persetujuan</Label>
                                        <p className="text-xs text-muted-foreground">Tentukan urutan persetujuan yang diperlukan.</p>
                                    </div>
                                    <Button type="button" variant="secondary" size="sm" onClick={addStep} className="shrink-0">
                                        <Plus className="h-3.5 w-3.5 mr-1.5" /> Tambah Langkah
                                    </Button>
                                </div>

                                <div className="space-y-3 mt-2">
                                    {data.workflow_steps.map((step, index) => (
                                        <div key={index} className="group bg-background p-4 rounded-lg border shadow-sm space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                                    {index + 1}
                                                </div>

                                                {/* Step Type Selector */}
                                                <div className="flex-1">
                                                    <Select
                                                        value={step.step_type || 'sequential'}
                                                        onValueChange={(val) => updateStepField(index, 'step_type', val)}
                                                    >
                                                        <SelectTrigger className="h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="sequential">Berurutan</SelectItem>
                                                            <SelectItem value="parallel">Paralel</SelectItem>
                                                            <SelectItem value="conditional">Bersyarat</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => removeStep(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Approver Selector */}
                                            <div>
                                                <Label className="text-xs text-muted-foreground">Pihak Penyetuju</Label>
                                                <Select
                                                    value={step.approver_id}
                                                    onValueChange={(val) => updateStepApprover(index, val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih Jabatan Penyetuju" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {jabatans.map(jabatan => (
                                                            <SelectItem key={jabatan.id} value={jabatan.id.toString()}>
                                                                {jabatan.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Conditional Routing Fields */}
                                            {step.step_type === 'conditional' && (
                                                <div className="space-y-2 p-3 bg-muted/30 rounded border border-dashed">
                                                    <Label className="text-xs font-semibold">Kondisi</Label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <Select
                                                            value={step.condition_field || ''}
                                                            onValueChange={(val) => updateStepField(index, 'condition_field', val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Field" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="priority">Prioritas</SelectItem>
                                                                <SelectItem value="category">Kategori</SelectItem>
                                                            </SelectContent>
                                                        </Select>

                                                        <Select
                                                            value={step.condition_operator || ''}
                                                            onValueChange={(val) => updateStepField(index, 'condition_operator', val)}
                                                        >
                                                            <SelectTrigger className="h-8 text-xs">
                                                                <SelectValue placeholder="Operator" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="=">=</SelectItem>
                                                                <SelectItem value="!=">!=</SelectItem>
                                                                <SelectItem value="in">In</SelectItem>
                                                            </SelectContent>
                                                        </Select>

                                                        <Input
                                                            placeholder="Nilai"
                                                            value={step.condition_value || ''}
                                                            onChange={(e) => updateStepField(index, 'condition_value', e.target.value)}
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Contoh: priority = urgent
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {data.workflow_steps.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
                                            <div className="p-3 rounded-full bg-muted/50 mb-3">
                                                <GripVertical className="h-6 w-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-sm font-medium text-foreground">Belum ada langkah workflow</p>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                                Tambahkan langkah untuk menentukan hierarki persetujuan untuk jenis surat ini.
                                            </p>
                                            <Button type="button" variant="link" size="sm" onClick={addStep} className="mt-2">
                                                Tambah Langkah Pertama
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <DialogFooter className="gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
