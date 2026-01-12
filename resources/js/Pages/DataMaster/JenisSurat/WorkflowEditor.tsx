import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Trash2,
    GitMerge,
    User,
    CheckCircle2,
    Workflow,
    AlertCircle,
    ArrowDown,
    Layout,
    Pencil
} from 'lucide-react';
import { CascadingJabatanSelector } from '@/components/CascadingJabatanSelector';
import axios from 'axios';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Jabatan {
    id: number;
    nama: string;
    parent_id?: number | null;
    level?: number;
    nama_lengkap?: string;
}

interface WorkflowStep {
    id?: number;
    type: 'sequential' | 'parallel';
    approval_type?: 'all' | 'any' | 'majority';
    description?: string;
    jabatan_id?: number;
    approvers?: { jabatan_id: number }[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    letterType: { id: number; name: string } | null;
}

export default function WorkflowEditor({ isOpen, onClose, letterType }: Props) {
    const [steps, setSteps] = useState<WorkflowStep[]>([]);
    const [jabatans, setJabatans] = useState<Jabatan[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [editModeMap, setEditModeMap] = useState<Record<string, boolean>>({});
    const [newMemberMap, setNewMemberMap] = useState<Record<number, number | undefined>>({});

    // Initial load
    useEffect(() => {
        if (isOpen && letterType) {
            setFetching(true);

            // Parallel requests
            Promise.all([
                axios.get(`/jenis-surat/${letterType.id}/workflow`).catch(() => ({ data: { steps: [] } })), // Graceful fallback
                axios.get('/api/jabatan')
            ]).then(([workflowRes, jabatanRes]) => {
                setSteps(workflowRes.data.steps || []);
                setJabatans(jabatanRes.data);
            }).catch(err => {
                console.error(err);
                toast.error('Gagal memuat data workflow');
            }).finally(() => {
                setFetching(false);
            });
        }
    }, [isOpen, letterType]);

    const handleAddStep = (type: 'sequential' | 'parallel') => {
        setEditModeMap(prev => ({ ...prev, [steps.length.toString()]: true }));
        setSteps([...steps, {
            type,
            approval_type: type === 'parallel' ? 'any' : undefined,
            approvers: type === 'parallel' ? [] : undefined,
            jabatan_id: undefined
        }]);
    };

    const handleRemoveStep = (index: number) => {
        const newSteps = [...steps];
        newSteps.splice(index, 1);
        setSteps(newSteps);

        // Rebuild editModeMap to account for index shift
        const newEditMap: Record<string, boolean> = {};
        Object.keys(editModeMap).forEach(key => {
            const parts = key.split('-');
            const stepIndex = Number(parts[0]);

            if (stepIndex < index) {
                newEditMap[key] = editModeMap[key];
            } else if (stepIndex > index) {
                const newKey = [stepIndex - 1, ...parts.slice(1)].join('-');
                newEditMap[newKey] = editModeMap[key];
            }
        });
        setEditModeMap(newEditMap);
    };

    const updateStep = (index: number, field: keyof WorkflowStep, value: any) => {
        const newSteps = [...steps];
        newSteps[index] = { ...newSteps[index], [field]: value };
        setSteps(newSteps);
    };

    const handleSave = () => {
        if (!letterType) return;
        setLoading(true);

        const isValid = steps.every(step => {
            if (step.type === 'sequential') return !!step.jabatan_id;
            if (step.type === 'parallel') return step.approvers && step.approvers.length > 0;
            return false;
        });

        if (!isValid) {
            toast.error('Mohon lengkapi semua step sebelum menyimpan');
            setLoading(false);
            return;
        }

        router.post(`/jenis-surat/${letterType.id}/workflow`, {
            steps: steps as any
        }, {
            onSuccess: () => {
                toast.success('Workflow berhasil disimpan');
                onClose();
            },
            onError: () => {
                toast.error('Gagal menyimpan workflow');
            },
            onFinish: () => setLoading(false)
        });
    };

    const getJabatanName = (id?: number) => {
        // Use loose equality (==) to handle potential string/number mismatches
        const j = jabatans.find(j => j.id == id);
        return j?.nama_lengkap || j?.nama || 'Pilih Jabatan';
    };

    const getJabatanHierarchy = (id?: number) => {
        if (!id) return [];
        const path = [];
        let current = jabatans.find(j => j.id == id);
        while (current) {
            path.unshift(current.nama);
            if (!current.parent_id) break;
            const parentId = current.parent_id;
            current = jabatans.find(j => j.id == parentId);
        }
        return path;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="!max-w-[95vw] !w-[95vw] h-[95vh] flex flex-col p-0 gap-0 overflow-hidden bg-zinc-50 dark:bg-zinc-950">

                {/* Header */}
                <DialogHeader className="p-6 border-b bg-white dark:bg-zinc-900 sticky top-0 z-10 shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
                            <Workflow className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold tracking-tight">Workflow Editor</DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Konfigurasi alur approval untuk: <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded">{letterType?.name}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Canvas / List */}
                    <div className="flex-1 flex flex-col bg-muted/5 relative min-w-0">
                        {/* Dot Pattern Background */}
                        <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                            style={{ backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                        </div>

                        <div className="flex-1 p-10 overflow-y-auto relative z-0">
                            <div className="w-full max-w-none mx-auto space-y-16 pb-24 px-4">

                                {/* Start Node */}
                                <div className="flex flex-col items-center gap-2 mb-10">
                                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 border-4 border-green-200 dark:border-green-800 flex items-center justify-center shadow-sm z-10">
                                        <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <Badge variant="outline" className="px-4 py-1 text-sm font-medium bg-background">
                                        Mulai (Pemohon Surat)
                                    </Badge>
                                </div>

                                {/* Connecting Line Background */}
                                {steps.length > 0 && (
                                    // bottom-24 extends further down to meet the lowered End Node, border-l is thinner
                                    <div className="absolute left-1/2 top-24 bottom-24 border-l border-dashed border-slate-300 dark:border-slate-700 z-0 -translate-x-1/2" />
                                )}

                                {fetching ? (
                                    <div className="text-center py-20 text-muted-foreground animate-pulse text-lg">
                                        Memuat struktur workflow...
                                    </div>
                                ) : steps.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm mx-auto w-full max-w-3xl">
                                        <div className="p-6 bg-muted/30 rounded-full mb-4">
                                            <Layout className="w-12 h-12 text-muted-foreground/60" />
                                        </div>
                                        <h3 className="font-bold text-xl text-foreground">Belum ada workflow</h3>
                                        <p className="text-muted-foreground text-center max-w-xs mt-2 text-base">
                                            Workflow ini masih kosong. Silakan tambahkan tahapan approval dari panel kanan.
                                        </p>
                                    </div>
                                ) : (
                                    steps.map((step, index) => (
                                        <div key={index} className="relative group z-10">
                                            {/* Connector Arrow */}
                                            {index > 0 && (
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-muted-foreground/40 bg-background rounded-full p-1 z-10 border shadow-sm">
                                                    <ArrowDown className="w-5 h-5" />
                                                </div>
                                            )}

                                            <Card className={cn(
                                                "border-l-[6px] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
                                                step.type === 'parallel'
                                                    ? "border-l-orange-500 bg-gradient-to-br from-white to-orange-50/20 dark:from-zinc-900 dark:to-orange-950/10"
                                                    : "border-l-blue-500 bg-gradient-to-br from-white to-blue-50/20 dark:from-zinc-900 dark:to-blue-950/10"
                                            )}>
                                                <CardHeader className="py-4 px-6 flex flex-row items-center justify-between space-y-0 border-b bg-muted/10">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border",
                                                            step.type === 'parallel'
                                                                ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-200 dark:border-orange-800"
                                                                : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800"
                                                        )}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-base flex items-center gap-3">
                                                                {step.type === 'parallel' ? 'Parallel Approval Group' : 'Sequential Approval'}
                                                                <Badge variant="secondary" className="px-2">
                                                                    {step.type === 'parallel' ? 'Grup' : 'Single'}
                                                                </Badge>
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-10 h-10"
                                                        onClick={() => handleRemoveStep(index)}
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-8">
                                                    {step.type === 'sequential' ? (
                                                        <div className="space-y-4">
                                                            <div className="space-y-3">
                                                                <Label className="text-sm uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                                                                    <User className="w-4 h-4" /> Pejabat Penandatangan
                                                                </Label>
                                                                <div className="bg-background/50 p-2 rounded-xl border border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors">
                                                                    {!editModeMap[index] && step.jabatan_id ? (
                                                                        <div className="flex items-center justify-between p-4 bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200 dark:border-green-800 rounded-lg shadow-sm group/selected animate-in fade-in zoom-in-95 duration-200">
                                                                            <div className="flex items-center gap-4">
                                                                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 shadow-inner">
                                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wider mb-0.5">Jabatan Terpilih</p>
                                                                                    <div className="flex flex-col">
                                                                                        {getJabatanHierarchy(step.jabatan_id).length > 1 && (
                                                                                            <span className="text-xs text-muted-foreground mb-1 flex items-center gap-1 flex-wrap">
                                                                                                {getJabatanHierarchy(step.jabatan_id).slice(0, -1).map((name, i) => (
                                                                                                    <span key={i} className="flex items-center">
                                                                                                        {name} <span className="mx-1 opacity-50">›</span>
                                                                                                    </span>
                                                                                                ))}
                                                                                            </span>
                                                                                        )}
                                                                                        <p className="font-bold text-base text-foreground">
                                                                                            {getJabatanName(step.jabatan_id)}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => setEditModeMap(prev => ({ ...prev, [index]: true }))}
                                                                                className="hidden group-hover/selected:flex border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300"
                                                                            >
                                                                                <Pencil className="w-3 h-3 mr-2" />
                                                                                Ganti
                                                                            </Button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-3 p-2">
                                                                            <Label className="text-sm text-muted-foreground font-medium flex items-center gap-2 mb-2">
                                                                                Silakan pilih jabatan pejabat penandatangan:
                                                                            </Label>
                                                                            <CascadingJabatanSelector
                                                                                jabatans={jabatans}
                                                                                value={step.jabatan_id}
                                                                                onChange={(val) => updateStep(index, 'jabatan_id', Number(val))}
                                                                                className="max-w-xl"
                                                                            />

                                                                            {step.jabatan_id && (
                                                                                <div className="flex justify-end pt-2">
                                                                                    <Button
                                                                                        size="sm"
                                                                                        onClick={() => setEditModeMap(prev => ({ ...prev, [index]: false }))}
                                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                                    >
                                                                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                                        Selesai & Gunakan
                                                                                    </Button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-6">
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div className="space-y-3">
                                                                    <Label className="text-sm uppercase text-muted-foreground font-bold tracking-wider">Tipe Aturan Approval</Label>
                                                                    <Select
                                                                        value={step.approval_type}
                                                                        onValueChange={(val) => updateStep(index, 'approval_type', val)}
                                                                    >
                                                                        <SelectTrigger className="bg-background h-11"> <SelectValue /> </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="all">Semua Wajib (ALL)</SelectItem>
                                                                            <SelectItem value="any">Salah Satu (ANY)</SelectItem>
                                                                            <SelectItem value="majority">Mayoritas (&gt;50%)</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <Label className="text-sm uppercase text-muted-foreground font-bold tracking-wider flex items-center gap-2">
                                                                    <GitMerge className="w-4 h-4" /> Daftar Approver ({step.approvers?.length || 0})
                                                                </Label>
                                                                <div className="space-y-4 bg-muted/20 p-5 rounded-xl border border-dashed hover:border-solid transition-colors max-h-[28rem] overflow-y-auto pr-2">
                                                                    {step.approvers?.map((approver, aprIndex) => {
                                                                        const memberKey = `${index}-${aprIndex}`;
                                                                        return (
                                                                            <div key={aprIndex} className="bg-background rounded-xl border shadow-sm group/item transition-all hover:shadow-md">
                                                                                {editModeMap[memberKey] ? (
                                                                                    <div className="p-4 space-y-3">
                                                                                        <div className="flex items-center justify-between mb-2">
                                                                                            <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">
                                                                                                Edit Anggota #{aprIndex + 1}
                                                                                            </Label>
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                                                                                                onClick={() => {
                                                                                                    const newApprovers = [...(step.approvers || [])];
                                                                                                    newApprovers.splice(aprIndex, 1);
                                                                                                    updateStep(index, 'approvers', newApprovers);
                                                                                                }}
                                                                                            >
                                                                                                <Trash2 className="w-4 h-4" />
                                                                                            </Button>
                                                                                        </div>
                                                                                        <CascadingJabatanSelector
                                                                                            jabatans={jabatans}
                                                                                            value={approver.jabatan_id}
                                                                                            onChange={(val) => {
                                                                                                const newApprovers = [...(step.approvers || [])];
                                                                                                newApprovers[aprIndex] = { ...newApprovers[aprIndex], jabatan_id: Number(val) };
                                                                                                updateStep(index, 'approvers', newApprovers);
                                                                                            }}
                                                                                        />
                                                                                        <div className="flex justify-end pt-2">
                                                                                            <Button
                                                                                                size="sm"
                                                                                                onClick={() => setEditModeMap(prev => ({ ...prev, [memberKey]: false }))}
                                                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                                                disabled={!approver.jabatan_id}
                                                                                            >
                                                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                                                Selesai
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex items-center justify-between p-4">
                                                                                        <div className="flex items-center gap-4">
                                                                                            <div className="flex flex-col items-center gap-1">
                                                                                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0 border">
                                                                                                    {aprIndex + 1}
                                                                                                </div>
                                                                                            </div>

                                                                                            <div>
                                                                                                {getJabatanHierarchy(approver.jabatan_id).length > 1 && (
                                                                                                    <span className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1 flex-wrap">
                                                                                                        {getJabatanHierarchy(approver.jabatan_id).slice(0, -1).map((name, i) => (
                                                                                                            <span key={i} className="flex items-center">
                                                                                                                {name} <span className="mx-1 opacity-50">›</span>
                                                                                                            </span>
                                                                                                        ))}
                                                                                                    </span>
                                                                                                )}
                                                                                                <p className="font-bold text-sm text-foreground">
                                                                                                    {getJabatanName(approver.jabatan_id)}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div className="flex items-center gap-2">
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                onClick={() => setEditModeMap(prev => ({ ...prev, [memberKey]: true }))}
                                                                                                className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                                                            >
                                                                                                <Pencil className="w-4 h-4" />
                                                                                            </Button>
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                                                onClick={() => {
                                                                                                    const newApprovers = [...(step.approvers || [])];
                                                                                                    newApprovers.splice(aprIndex, 1);
                                                                                                    updateStep(index, 'approvers', newApprovers);
                                                                                                }}
                                                                                            >
                                                                                                <Trash2 className="w-4 h-4" />
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}

                                                                    <div className="pt-4 border-t border-dashed">
                                                                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-3 block">
                                                                            Tambah Anggota Baru
                                                                        </Label>
                                                                        <div className="space-y-3">
                                                                            <CascadingJabatanSelector
                                                                                jabatans={jabatans}
                                                                                value={newMemberMap[index]}
                                                                                onChange={(val) => setNewMemberMap(prev => ({ ...prev, [index]: Number(val) }))}
                                                                            />
                                                                            <div className="flex justify-end">
                                                                                <Button
                                                                                    size="sm"
                                                                                    disabled={!newMemberMap[index]}
                                                                                    onClick={() => {
                                                                                        if (newMemberMap[index]) {
                                                                                            const newApprovers = [...(step.approvers || [])];
                                                                                            newApprovers.push({ jabatan_id: newMemberMap[index]! });
                                                                                            updateStep(index, 'approvers', newApprovers);
                                                                                            setNewMemberMap(prev => ({ ...prev, [index]: undefined }));

                                                                                            // Automatically open edit mode for the new item? No, user just selected it.
                                                                                        }
                                                                                    }}
                                                                                    className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                                                                                >
                                                                                    <Plus className="w-4 h-4 mr-2" />
                                                                                    Tambahkan ke Grup
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))
                                )}

                                {/* End Node */}
                                {steps.length > 0 && (
                                    <div className="flex flex-col items-center gap-2 mt-16 relative z-10">
                                        {/* Connector Arrow for End Node */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-muted-foreground/40 bg-background rounded-full p-1 border shadow-sm">
                                            <ArrowDown className="w-5 h-5" />
                                        </div>

                                        <Badge variant="outline" className="px-6 py-2 bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 rounded-full text-base font-medium shadow-sm">
                                            Selesai / Terbit
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Toolbar (Desktop) */}
                    <div className="hidden lg:flex w-96 shrink-0 border-l bg-card flex-col p-8 gap-8 shadow-xl z-20">
                        <div className="space-y-6">
                            <h3 className="font-bold text-xl flex items-center gap-2 text-foreground">
                                <Plus className="w-6 h-6 text-red-600" />
                                Tambah Tahapan
                            </h3>
                            <p className="text-base text-muted-foreground leading-relaxed">
                                Pilih jenis tahapan approval yang ingin ditambahkan ke dalam urutan workflow.
                            </p>

                            <div className="space-y-4">
                                <Button
                                    variant="outline"
                                    className="w-full h-auto py-5 px-6 flex flex-col items-start gap-3 border-2 border-transparent hover:border-blue-500 bg-muted/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all shadow-sm group"
                                    onClick={() => handleAddStep('sequential')}
                                >
                                    <div className="flex items-center gap-3 font-bold text-lg text-blue-700 dark:text-blue-400 group-hover:pl-1 transition-all">
                                        <User className="w-5 h-5" />
                                        Single Approval
                                    </div>
                                    <span className="text-sm text-muted-foreground text-left font-normal leading-tight whitespace-normal break-words">
                                        Satu orang pejabat spesifik harus menyetujui tahapan ini.
                                    </span>
                                </Button>

                                <Button
                                    variant="outline"
                                    className="w-full h-auto py-5 px-6 flex flex-col items-start gap-3 border-2 border-transparent hover:border-orange-500 bg-muted/30 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all shadow-sm group"
                                    onClick={() => handleAddStep('parallel')}
                                >
                                    <div className="flex items-center gap-3 font-bold text-lg text-orange-700 dark:text-orange-400 group-hover:pl-1 transition-all">
                                        <GitMerge className="w-5 h-5" />
                                        Parallel Group
                                    </div>
                                    <span className="text-sm text-muted-foreground text-left font-normal leading-tight whitespace-normal break-words">
                                        Sekelompok pejabat menyetujui secara bersamaan (Paralel).
                                    </span>
                                </Button>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-xl border border-yellow-200 dark:border-yellow-800">
                                <h5 className="font-bold text-yellow-800 dark:text-yellow-400 text-base mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" /> Tips Workflow
                                </h5>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                                    Urutan approval akan dieksekusi dari atas ke bawah. Pastikan hierarki jabatan sudah sesuai dengan aturan organisasi.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="p-6 border-t bg-white dark:bg-zinc-900 shrink-0 gap-4">
                    {/* Mobile Only Add Buttons */}
                    <div className="lg:hidden flex gap-2 mr-auto">
                        <Button size="sm" variant="outline" onClick={() => handleAddStep('sequential')}>
                            <User className="w-4 h-4 mr-2" /> +Single
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleAddStep('parallel')}>
                            <GitMerge className="w-4 h-4 mr-2" /> +Group
                        </Button>
                    </div>

                    <Button variant="ghost" onClick={onClose} className="text-muted-foreground hover:bg-muted text-base px-6">Batal</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white min-w-[180px] text-base font-semibold shadow-md hover:shadow-lg transition-all">
                        {loading ? 'Menyimpan...' : 'Simpan Workflow'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
