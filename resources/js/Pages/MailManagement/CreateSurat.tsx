import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Send, X, FileText, Check, ArrowRight, ChevronDown, ArrowLeft, ZoomIn, ZoomOut, GitMerge, Plus, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from "@/lib/utils"
import axios from 'axios';

interface User {
    id: number;
    name: string;
    username: string;
    rank?: string;
    unit?: string;
    position_name?: string;
    signature_url?: string | null;
}

interface LetterType {
    id: number;
    name: string;
    code?: string;
}

interface WorkflowStep {
    id: number; // Added ID
    order: number;
    type?: 'sequential' | 'parallel';
    is_required?: boolean;
    approver_type: string;
    approver_id: string;
    step_type?: string;
    condition_field?: string;
    condition_operator?: string;
    condition_value?: string;
    approver_user?: {
        name: string;
        rank?: string;
        unit?: string;
        staff?: {
            jabatan?: {
                nama: string;
            }
        }
    };
    approver_jabatan?: { nama: string };
    current_holder?: { name: string };
    jabatan_id?: string;
    jabatan_nama?: string;
    approvers?: { // For parallel groups
        id: number;
        jabatan_id: string;
        jabatan_nama?: string;
    }[];
}

// ... (existing code)



interface Props {
    users: User[];
    letterTypes: LetterType[];
    referenceLetter?: {
        id: number;
        subject: string;
        sender: { id: number; name: string; username: string };
        code: string;
    } | null;
}

export default function CreateSurat({ users = [], letterTypes = [], referenceLetter = null }: Props) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        subject: referenceLetter ? `Re: ${referenceLetter.subject}` : '',
        recipient: referenceLetter ? referenceLetter.sender.id.toString() : '', // Pre-fill recipient
        priority: 'normal',
        category: 'internal',
        mailType: 'official',
        letter_type_id: '',
        content: '',
        attachments: [] as File[],
        recipients: [] as any[],
        reference_letter_id: referenceLetter?.id || null, // Track reference ID
        workflow_steps: [] as WorkflowStep[],
        custom_approvers: {} as Record<string, string>,
    });

    const [query, setQuery] = useState(referenceLetter ? `${referenceLetter.sender.name} - ${referenceLetter.sender.username}` : '');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
    const [loadingWorkflow, setLoadingWorkflow] = useState(false);

    const [customApprovers, setCustomApprovers] = useState<Record<string, string>>({}); // step_id -> user_id
    const [customApproverNames, setCustomApproverNames] = useState<Record<string, string>>({}); // step_id -> user_name
    const [customApproverDetails, setCustomApproverDetails] = useState<Record<string, { rank?: string, unit?: string, position_name?: string, signature_url?: string | null }>>({}); // step_id -> { rank, unit, position_name, signature_url }
    const [openStepId, setOpenStepId] = useState<number | null>(null);
    const [stepUsers, setStepUsers] = useState<User[]>([]);
    const [loadingStepUsers, setLoadingStepUsers] = useState(false);
    const [step, setStep] = useState(1); // 1: Form, 2: Preview & Signature

    // Drag and Drop State
    const [signaturePositions, setSignaturePositions] = useState<Record<number, { x: number, y: number }>>({});
    const [draggedItem, setDraggedItem] = useState<{ id: number, type: 'sidebar' | 'preview', offsetX?: number, offsetY?: number } | null>(null);
    const [ghostPosition, setGhostPosition] = useState<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1);

    // Manual Workflow State
    const [structuralJabatanList, setStructuralJabatanList] = useState<any[]>([]);
    const [manualWorkflowJabatan, setManualWorkflowJabatan] = useState<string>('');
    const [usersByJabatanList, setUsersByJabatanList] = useState<User[]>([]);
    const [manualWorkflowUser, setManualWorkflowUser] = useState<string>('');
    const [loadingUsersByJabatan, setLoadingUsersByJabatan] = useState(false);

    // Fetch Structural Jabatan on Mount
    useEffect(() => {
        axios.get(route('api.jabatan'), { params: { kategori: 'struktural' } }) // Use the new filter
            .then(response => {
                setStructuralJabatanList(response.data);
            })
            .catch(error => console.error("Failed to fetch structural jabatan", error));
    }, []);

    // Fetch Users when Manual Jabatan changes
    // Fetch Users when Manual Jabatan changes - REMOVED to prevent conflict with Smart Add
    // The Smart Add modal (handleOpenAddModal) fetches users directly via api.users.superior.
    // This useEffect was causing a race condition by re-fetching from the "dumb" api.users-by-jabatan endpoint.
    /*
    useEffect(() => {
        if (manualWorkflowJabatan) {
            setLoadingUsersByJabatan(true);
            setManualWorkflowUser(''); // Reset selected user
            axios.get(route('api.users-by-jabatan'), { params: { jabatan_id: manualWorkflowJabatan } })
                .then(response => {
                    setUsersByJabatanList(response.data);
                })
                .catch(error => console.error("Failed to fetch users by jabatan", error))
                .finally(() => setLoadingUsersByJabatan(false));
        } else {
            setUsersByJabatanList([]);
            setManualWorkflowUser('');
        }
    }, [manualWorkflowJabatan]);
    */

    // Sync Workflow Steps and Custom Approvers to Form Data
    useEffect(() => {
        setData(data => ({
            ...data,
            workflow_steps: workflowSteps,
            custom_approvers: customApprovers
        }));
    }, [workflowSteps, customApprovers]);

    // --- Manual Workflow & Smart Add Logic ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [manualWorkflowJabatanName, setManualWorkflowJabatanName] = useState('');
    const [insertionIndex, setInsertionIndex] = useState<number | null>(null); // To track where to insert the new step

    // Use existing handleAddManualStep logic but adapt it
    const handleAddManualStepWrapper = () => {
        handleAddManualStep();
        setIsAddModalOpen(false);
    }

    const handleOpenAddModal = (referenceUserId: number, indexToInsert: number = 0) => {
        setIsAddModalOpen(true);
        setManualWorkflowJabatan('');
        setManualWorkflowJabatanName('');
        setUsersByJabatanList([]);
        setManualWorkflowUser('');
        setInsertionIndex(indexToInsert);
        setLoadingUsersByJabatan(true);

        let params: any = {};

        if (workflowSteps.length > 0) {
            const lastStep = workflowSteps[workflowSteps.length - 1];
            const lastJabatanId = lastStep.jabatan_id || (lastStep.approver_type === 'jabatan' ? lastStep.approver_id : null);

            if (lastJabatanId) {
                params.jabatan_id = lastJabatanId;
            } else {
                params.user_id = referenceUserId;
            }
        } else {
            params.user_id = referenceUserId;
        }

        axios.get(route('api.users.superior'), { params })
            .then(response => {
                const { jabatan, users } = response.data;
                setManualWorkflowJabatan(jabatan.id.toString());
                setManualWorkflowJabatanName(jabatan.nama);
                setUsersByJabatanList(users);

                // If only one user, auto-select
                if (users.length === 1) {
                    setManualWorkflowUser(users[0].id.toString());
                }
            })
            .catch(error => {
                console.error("Failed to get superior", error);
                if (axios.isAxiosError(error) && error.response && error.response.data.message) {
                    toast.error(error.response.data.message);
                } else if (axios.isAxiosError(error) && error.response?.status === 404) {
                    toast.error("Tidak ditemukan atasan langsung.");
                } else {
                    toast.error("Gagal memuat data atasan.");
                }
            })
            .finally(() => setLoadingUsersByJabatan(false));
    }

    // Reuse allow manual adding but slightly different execution context
    const handleAddManualStep = () => {
        if (!manualWorkflowJabatan || !manualWorkflowUser) {
            toast.error("Pilih Jabatan dan User terlebih dahulu.");
            return;
        }

        const selectedUser = usersByJabatanList.find(u => u.id.toString() === manualWorkflowUser);
        // We might not have structuralJabatanList populated if we only called getSuperior, 
        // so we use the name we fetched or finding it in the list if available, 
        // OR rely on what we set in state.
        // Let's assume we rely on what we set or fetch.
        // Actually, structuralJabatanList is fetched on mount, so we can try to find it there too,
        // but getSuperior returns the object. 

        // Simpler: Just construct the object from state we have
        const selectedJabatanId = manualWorkflowJabatan;
        const selectedJabatanName = manualWorkflowJabatanName || structuralJabatanList.find(j => j.id.toString() == manualWorkflowJabatan)?.nama || 'Unknown Position';

        if (!selectedUser) return;

        // Use user's actual position name if available, otherwise fallback to selected jabatan
        const effectivePositionName = selectedUser.position_name || selectedJabatanName;

        const newStep: WorkflowStep = {
            id: Date.now(),
            order: (insertionIndex !== null ? insertionIndex : workflowSteps.length) + 1, // Logic needs refinement for complex reordering but OK for appending/inserting
            type: 'sequential',
            approver_type: 'jabatan',
            approver_id: selectedJabatanId,
            jabatan_id: selectedJabatanId,
            jabatan_nama: effectivePositionName, // Use effective name
            step_type: 'sequential',
            is_required: true,
            approver_user: {
                name: selectedUser.name,
                rank: selectedUser.rank,
                unit: selectedUser.unit,
                staff: {
                    jabatan: {
                        nama: effectivePositionName // Use effective name
                    }
                }
            }
        };

        setCustomApprovers(prev => ({ ...prev, [newStep.id]: selectedUser.id.toString() }));
        setCustomApproverNames(prev => ({ ...prev, [newStep.id]: selectedUser.name }));
        setCustomApproverDetails(prev => ({
            ...prev,
            [newStep.id]: {
                rank: selectedUser.rank,
                unit: selectedUser.unit,
                position_name: effectivePositionName
            }
        }));

        // Insert at specific index or append
        setWorkflowSteps(prev => {
            const newSteps = [...prev];
            // If insertionIndex (0-based relative to the array), insert there.
            // But wait, the UI calls this with "0" for "after Drafter" which means index 0 in the array?
            // If existing: [Step A, Step B]. 
            // "After Drafter" -> Insert at 0 -> [New, Step A, Step B]. Correct.
            // "After Step A" -> Index was 0. We want to insert at 1. 

            if (insertionIndex !== null && insertionIndex >= 0) {
                newSteps.splice(insertionIndex, 0, newStep);
                return newSteps;
            }
            return [...prev, newStep];
        });

        toast.success("Approver berhasil ditambahkan.");
    };

    const handleRemoveStep = (stepId: number) => {
        setWorkflowSteps(prev => {
            // Check if it's a top-level step
            const isTopLevel = prev.some(s => s.id === stepId);
            if (isTopLevel) {
                return prev.filter(s => s.id !== stepId);
            }

            // Check if it's inside a parallel step
            return prev.map(step => {
                if (step.approvers) {
                    return {
                        ...step,
                        approvers: step.approvers.filter(sub => sub.id !== stepId)
                    };
                }
                return step;
            }).filter(step => {
                // Remove empty parallel steps if needed, or keep them? 
                // If a parallel step becomes empty, maybe remove the parent step too?
                if (step.type === 'parallel' && step.approvers && step.approvers.length === 0) {
                    return false;
                }
                return true;
            });
        });

        // Also clean up custom approvers state
        setCustomApprovers(prev => {
            const next = { ...prev };
            delete next[stepId];
            return next;
        });
        setCustomApproverNames(prev => {
            const next = { ...prev };
            delete next[stepId];
            return next;
        });
        setCustomApproverDetails(prev => {
            const next = { ...prev };
            delete next[stepId];
            return next;
        });

        toast.success("Approver dihapus.");
    };


    // --- Mouse Drag Handlers ---
    const handleDragStart = (e: React.DragEvent, id: number, type: 'sidebar' | 'preview') => {
        if (type === 'preview') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setDraggedItem({
                id,
                type,
                offsetX: e.clientX - rect.left,
                offsetY: e.clientY - rect.top
            });
        } else {
            setDraggedItem({ id, type, offsetX: 75, offsetY: 40 }); // Center offset for sidebar items
        }
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedItem) return;

        const containerRect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX - containerRect.left;
        let y = e.clientY - containerRect.top;

        if (draggedItem.offsetX !== undefined && draggedItem.offsetY !== undefined) {
            x -= draggedItem.offsetX;
            y -= draggedItem.offsetY;
        }

        // Convert to percentage
        // Convert to percentage
        const xPercent = (x / containerRect.width) * 100;
        const yPercent = (y / containerRect.height) * 100;

        // Find step details to store with position
        const step = workflowSteps.find(s => s.id === draggedItem.id);
        let metadata = {};
        if (step) {
            const name = (step.approver_type === 'user' ? step.approver_user?.name : null) || (customApproverNames[step.id] || step.current_holder?.name || step.approver_jabatan?.nama);
            const jabatan = step.approver_jabatan?.nama || step.approver_user?.staff?.jabatan?.nama || 'Pejabat';
            metadata = { name, jabatan };
        }

        setSignaturePositions(prev => ({
            ...prev,
            [draggedItem.id]: { x: xPercent, y: yPercent, ...metadata }
        }));
        setDraggedItem(null);
    };

    // --- Touch Handlers (Mobile) ---
    const handleTouchStart = (e: React.TouchEvent, id: number, type: 'sidebar' | 'preview') => {
        const touch = e.touches[0];

        if (type === 'preview') {
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            setDraggedItem({
                id,
                type,
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            });
        } else {
            setDraggedItem({ id, type, offsetX: 75, offsetY: 40 });
        }
        setGhostPosition({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!draggedItem) return;
        const touch = e.touches[0];
        setGhostPosition({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!draggedItem) return;

        const touch = e.changedTouches[0];
        // We need to find the drop target (preview area) manually since touchend happens on the dragged element
        // But here we can check if the touch point is within the preview container
        // We need a ref to the preview container. Let's assume we can get it or pass it.
        // For now, let's use document.elementFromPoint or similar, OR better:
        // Since we are in the parent component, we can check if the touch is inside the preview area bounds.
        // However, we don't have the preview container ref easily accessible here without adding one.
        // Let's add a ref to the preview container.

        // Actually, let's just use the logic: if we are dragging, we assume we want to drop on the preview if it's there.
        // But we need the rect of the preview container.
        // Let's add an ID to the preview container and get it.
        const previewContainer = document.getElementById('preview-container');

        if (previewContainer) {
            const containerRect = previewContainer.getBoundingClientRect();
            if (
                touch.clientX >= containerRect.left &&
                touch.clientX <= containerRect.right &&
                touch.clientY >= containerRect.top &&
                touch.clientY <= containerRect.bottom
            ) {
                let x = touch.clientX - containerRect.left;
                let y = touch.clientY - containerRect.top;

                if (draggedItem && draggedItem.offsetX !== undefined && draggedItem.offsetY !== undefined) {
                    x -= draggedItem.offsetX;
                    y -= draggedItem.offsetY;
                }

                const xPercent = (x / containerRect.width) * 100;
                const yPercent = (y / containerRect.height) * 100;

                // Find step details to store with position
                const step = workflowSteps.find(s => s.id === draggedItem.id);
                let metadata = {};
                if (step) {
                    const name = (step.approver_type === 'user' ? step.approver_user?.name : null) || (customApproverNames[step.id] || step.current_holder?.name || step.approver_jabatan?.nama);
                    const jabatan = step.approver_jabatan?.nama || step.approver_user?.staff?.jabatan?.nama || 'Pejabat';
                    metadata = { name, jabatan };
                }

                setSignaturePositions(prev => ({
                    ...prev,
                    [draggedItem.id]: { x: xPercent, y: yPercent, ...metadata }
                }));
            }
        }

        setDraggedItem(null);
        setGhostPosition(null);
    };

    useEffect(() => {
        if (draggedItem && ghostPosition) {
            const preventScroll = (e: TouchEvent) => e.preventDefault();
            document.addEventListener('touchmove', preventScroll, { passive: false });
            return () => document.removeEventListener('touchmove', preventScroll);
        }
    }, [draggedItem, ghostPosition]);

    const { auth } = usePage<any>().props;

    const filteredUsers = query === ''
        ? []
        : users.filter((user) => {
            const lowerQuery = query.toLowerCase();
            const lowerName = user.name.toLowerCase();
            const lowerUsername = user.username.toLowerCase();
            const lowerComposite = `${lowerName} - ${lowerUsername}`;

            return (lowerName.includes(lowerQuery) ||
                lowerUsername.includes(lowerQuery) ||
                lowerComposite.includes(lowerQuery)) &&
                user.id !== auth.user.id; // Prevent self-sending
        });

    const handleSelectUser = (user: User) => {
        setData('recipient', user.id.toString());
        setQuery(`${user.name} - ${user.username}`);
        setShowSuggestions(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setShowSuggestions(true);
        if (value === '') {
            setData('recipient', '');
        }
    };

    // Fetch Workflow Preview when Letter Type changes
    useEffect(() => {
        if (data.letter_type_id && data.letter_type_id !== 'none') {
            setLoadingWorkflow(true);
            // Reset custom approvers when letter type changes to avoid stale data
            setCustomApprovers({});
            setCustomApproverNames({});

            axios.get(route('jenis-surat.workflow.get', { id: data.letter_type_id }))
                .then(response => {
                    const fetchedSteps = response.data.steps || [];

                    // Find current user details for the sender step
                    const currentUser = users.find(u => u.id === auth.user.id);

                    const senderStep: WorkflowStep = {
                        id: 0, // Special ID for sender
                        order: 0,
                        type: 'sequential',
                        approver_type: 'user',
                        approver_id: auth.user.id.toString(),
                        step_type: 'sequential',
                        is_required: true,
                        approver_user: {
                            name: auth.user.name,
                            rank: currentUser?.rank,
                            unit: currentUser?.unit,
                            staff: {
                                jabatan: {
                                    nama: currentUser?.position_name || 'Pejabat'
                                }
                            }
                        },
                        current_holder: { name: auth.user.name }
                    };

                    // Allow sender signature to be found
                    if (currentUser?.signature_url) {
                        setCustomApproverDetails(prev => ({
                            ...prev,
                            [senderStep.id]: {
                                rank: currentUser.rank,
                                unit: currentUser.unit,
                                position_name: currentUser.position_name,
                                signature_url: currentUser.signature_url
                            }
                        }));
                    }

                    setWorkflowSteps([senderStep, ...fetchedSteps]);
                })
                .catch(error => {
                    console.error("Failed to fetch workflow", error);
                    setWorkflowSteps([]);
                })
                .finally(() => setLoadingWorkflow(false));
        } else {
            setWorkflowSteps([]);
            setCustomApprovers({});
            setCustomApproverNames({});
        }
    }, [data.letter_type_id]);

    const handleStepClick = (step: WorkflowStep) => {
        if (step.approver_type !== 'jabatan') return;

        setOpenStepId(step.id);
        setLoadingStepUsers(true);
        // Use jabatan_id from the step object, which is what the controller returns now
        const jabatanId = step.jabatan_id || step.approver_id;
        axios.get(route('api.users-by-jabatan'), { params: { jabatan_id: jabatanId } })
            .then(response => {
                setStepUsers(response.data);
            })
            .catch(error => {
                console.error("Failed to fetch users", error);
                setStepUsers([]);
            })
            .finally(() => setLoadingStepUsers(false));
    };

    const handleSelectApprover = (stepId: number, user: User) => {
        setCustomApprovers(prev => ({ ...prev, [stepId]: user.id.toString() }));
        setCustomApproverNames(prev => ({ ...prev, [stepId]: user.name }));
        setCustomApproverDetails(prev => ({
            ...prev,
            [stepId]: {
                rank: user.rank,
                unit: user.unit,
                position_name: user.position_name, // Store specific position name
                signature_url: user.signature_url
            }
        }));
        setOpenStepId(null);
    };

    const { flash } = usePage().props as any || {};

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            reset();
            setQuery('');
            setWorkflowSteps([]);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (step === 1) {
            if (!data.recipient) {
                toast.error('Pilih penerima surat terlebih dahulu.');
                return;
            }
            if (!data.subject) {
                toast.error('Perihal surat wajib diisi.');
                return;
            }

            // Validate all approvers are selected
            // Validate all approvers are selected
            let missingApprovers = false;
            workflowSteps.forEach(step => {
                if (step.type === 'parallel' && step.approvers) {
                    step.approvers.forEach(subStep => {
                        if (!customApprovers[subStep.id]) missingApprovers = true;
                    });
                } else if (step.approver_type === 'jabatan' && !customApprovers[step.id]) {
                    missingApprovers = true;
                }
            });

            if (missingApprovers) {
                toast.error('Harap pilih semua penyetuju (approver) terlebih dahulu.');
                return;
            }

            setStep(2);
            return;
        }

        transform((data) => ({
            ...data,
            mail_type: data.mailType,
            recipients: [{ type: 'user', id: data.recipient }],
            custom_approvers: customApprovers,
            workflow_steps: workflowSteps, // Send dynamic steps
            signature_positions: signaturePositions, // Send signature positions
            letter_type_id: data.letter_type_id, // Mandatory now
            reference_letter_id: data.reference_letter_id // Include reference ID
        }));

        post('/letters', {
            onSuccess: () => {
                // Flash message handled in useEffect
            },
            onError: (errors) => {
                console.error('Validation Errors:', errors);
                toast.error('Gagal mengirim surat. Periksa input anda.');
                if (Object.keys(errors).length > 0) {
                    toast.error(Object.values(errors)[0]);
                }
            }
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'List Surat', href: '/list-surat' },
            { title: 'Buat Surat', href: '/buat-surat' },
        ]}>
            <Head title="Buat Surat" />
            <div className="p-4 md:p-6 space-y-6">
                {/* Stepper UI */}
                <div className="w-full max-w-4xl mx-auto mb-8">
                    <div className="flex items-center justify-between w-full mb-4 px-4">
                        {/* Step 1 */}
                        <div className="flex items-center">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors duration-300",
                                step >= 1 ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"
                            )}>
                                1
                            </div>
                            <span className={cn(
                                "ml-3 font-medium text-sm transition-colors duration-300",
                                step >= 1 ? "text-foreground" : "text-muted-foreground"
                            )}>
                                Informasi Surat
                            </span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-center">
                            <div className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-colors duration-300",
                                step >= 2 ? "bg-red-600 text-white" : "bg-muted text-muted-foreground"
                            )}>
                                2
                            </div>
                            <span className={cn(
                                "ml-3 font-medium text-sm transition-colors duration-300",
                                step >= 2 ? "text-foreground" : "text-muted-foreground"
                            )}>
                                Preview & Tanda Tangan
                            </span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-600 transition-all duration-500 ease-in-out"
                            style={{ width: step === 1 ? '50%' : '100%' }}
                        ></div>
                    </div>
                </div>

                {referenceLetter && (
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 mb-8 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                            <ArrowLeft className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-medium text-zinc-200">Membalas Surat</h4>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                Anda sedang membalas surat <span className="text-zinc-200 font-medium">{referenceLetter.code}</span>
                                <span className="mx-2 text-zinc-700">|</span>
                                <span className="text-zinc-300">"{referenceLetter.subject}"</span>
                                <span className="mx-2 text-zinc-700">|</span>
                                dari <span className="text-zinc-200 font-medium">{referenceLetter.sender.name}</span>
                            </p>
                        </div>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>{step === 1 ? 'Form Buat Surat' : 'Preview & Penempatan Tanda Tangan'}</CardTitle>
                        <CardDescription>
                            {step === 1 ? 'Lengkapi form di bawah untuk membuat surat baru' : 'Preview surat dan tempatkan tanda tangan pada posisi yang sesuai'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {step === 1 && (
                                <>
                                    {/* Perihal */}
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">Perihal Surat <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="subject"
                                            placeholder="Masukkan perihal surat"
                                            value={data.subject}
                                            onChange={(e) => setData('subject', e.target.value)}
                                            required
                                        />
                                        {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Penerima - Autocomplete Input */}
                                        <div className="space-y-2 flex flex-col relative">
                                            <Label htmlFor="recipient">Penerima <span className="text-red-500">*</span></Label>
                                            <div className="relative">
                                                <Input
                                                    id="recipient"
                                                    placeholder="Ketik nama atau username..."
                                                    value={query}
                                                    onChange={handleInputChange}
                                                    onFocus={() => setShowSuggestions(true)}
                                                    autoComplete="off"
                                                    className={cn(errors.recipient && "border-destructive")}
                                                />
                                                {showSuggestions && query && filteredUsers.length > 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                                                        {filteredUsers.map((user) => (
                                                            <div
                                                                key={user.id}
                                                                className="px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                                                                onClick={() => handleSelectUser(user)}
                                                            >
                                                                <span>{user.name} - {user.username}</span>
                                                                {data.recipient === user.id.toString() && (
                                                                    <Check className="h-4 w-4 opacity-50" />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {showSuggestions && query && filteredUsers.length === 0 && (
                                                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md p-4 text-sm text-muted-foreground text-center">
                                                        User tidak ditemukan.
                                                    </div>
                                                )}
                                            </div>
                                            {errors.recipient && <p className="text-sm text-destructive">{errors.recipient}</p>}
                                        </div>

                                        {/* Prioritas */}
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Prioritas</Label>
                                            <Select
                                                value={data.priority}
                                                onValueChange={(value) => setData('priority', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih prioritas" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Rendah</SelectItem>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="high">Tinggi</SelectItem>
                                                    <SelectItem value="urgent">Mendesak</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Kategori */}
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Kategori</Label>
                                            <Select
                                                value={data.category}
                                                onValueChange={(value) => setData('category', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="internal">Internal</SelectItem>
                                                    <SelectItem value="external">Eksternal</SelectItem>
                                                    <SelectItem value="report">Laporan</SelectItem>
                                                    <SelectItem value="finance">Keuangan</SelectItem>
                                                    <SelectItem value="hr">SDM</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Jenis Surat (Letter Type) - Determines Workflow */}
                                        <div className="space-y-2">
                                            <Label htmlFor="letter_type_id">Jenis Surat <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={data.letter_type_id}
                                                onValueChange={(value) => setData('letter_type_id', value)}
                                            >
                                                <SelectTrigger className={cn(errors.letter_type_id && "border-destructive")}>
                                                    <SelectValue placeholder="Pilih jenis surat (Wajib)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {/* Removed 'No Approval' option */}
                                                    {letterTypes.map((type) => (
                                                        <SelectItem key={type.id} value={type.id.toString()}>
                                                            {type.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.letter_type_id && <p className="text-sm text-destructive">{errors.letter_type_id}</p>}
                                        </div>
                                    </div>

                                    {/* Smart Add Approver Modal */}
                                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Tambah Approval Manual</DialogTitle>
                                                <DialogDescription>
                                                    Pilih atasan atau pejabat yang ingin ditambahkan sebagai approver.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Jabatan</Label>
                                                    <Input value={manualWorkflowJabatanName} disabled placeholder="Jabatan akan terisi otomatis" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>User</Label>
                                                    {loadingUsersByJabatan ? (
                                                        <div className="text-sm text-muted-foreground">Memuat user...</div>
                                                    ) : usersByJabatanList.length > 0 ? (
                                                        <Select value={manualWorkflowUser} onValueChange={setManualWorkflowUser}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih User..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {usersByJabatanList.map((user) => (
                                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                                        {user.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <div className="text-sm text-red-500">Tidak ada user aktif menjabat posisi ini</div>
                                                    )}
                                                </div>
                                            </div>

                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                                                <Button onClick={handleAddManualStepWrapper} disabled={!manualWorkflowUser}>Tambah</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Workflow Preview - Only show if workflow exists */}
                                    {data.letter_type_id && (
                                        <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-semibold">Alur Approval</Label>
                                                <span className="text-xs text-muted-foreground">Surat ini memerlukan persetujuan</span>
                                            </div>
                                            {loadingWorkflow ? (
                                                <div className="text-sm text-muted-foreground">Memuat alur...</div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex flex-wrap items-start gap-2">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium h-8 flex items-center">
                                                                Drafter (Anda)
                                                            </div>
                                                        </div>

                                                        {/* Connector after Drafter - Only show Arrow if steps exist, otherwise the End Button handles it */}
                                                        {workflowSteps.length > 0 && (
                                                            <div className="h-8 w-8 flex items-center justify-center">
                                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        )}

                                                        {workflowSteps.map((step, index) => {
                                                            // Hide the "Sender" step (ID 0) from visualization as it is represented by the "Drafter" badge
                                                            if (step.id === 0) return null;

                                                            return (
                                                                <React.Fragment key={index}>
                                                                    {/* Arrow before this step. 
                                                                        If it's the first visible step (index 1, since 0 is receiver), logic handles connection to Drafter.
                                                                        Actually, if index > 0, we render arrow. 
                                                                        Since index 0 is hidden, index 1 will render arrow which connects to Drafter pill. 
                                                                    */}
                                                                    {(index > 0) && (
                                                                        <div className="h-8 w-8 flex items-center justify-center">
                                                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                                        </div>
                                                                    )}
                                                                    <div className="flex flex-col items-center gap-1">
                                                                        {step.type === 'parallel' && step.approvers ? (
                                                                            <div className="flex-1 min-w-[300px] flex flex-col gap-3 p-4 bg-white dark:bg-zinc-900/50 border rounded-xl shadow-sm hover:shadow-md transition-all relative group">
                                                                                {/* Header Label */}
                                                                                <div className="flex items-center gap-2 border-b pb-2">
                                                                                    <div className="p-1 bg-orange-100 dark:bg-orange-900/30 rounded text-orange-600 dark:text-orange-400">
                                                                                        <GitMerge className="w-3.5 h-3.5" />
                                                                                    </div>
                                                                                    <div className="flex flex-col">
                                                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
                                                                                            Approval Paralel
                                                                                        </span>
                                                                                        <span className="text-[10px] text-muted-foreground/70 leading-none mt-0.5">
                                                                                            Dilakukan secara bersamaan
                                                                                        </span>
                                                                                    </div>
                                                                                </div>

                                                                                {/* Approvers Grid */}
                                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                                                                    {step.approvers.map((subStep) => (
                                                                                        <div key={subStep.id} className="relative group/step">
                                                                                            <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-muted/30 dark:bg-muted/10 border border-transparent hover:border-border transition-colors">
                                                                                                {/* Jabatan Label */}
                                                                                                <span className="text-[11px] font-semibold text-foreground truncate px-1" title={subStep.jabatan_nama || subStep.jabatan_id.toString()}>
                                                                                                    {subStep.jabatan_nama || subStep.jabatan_id}
                                                                                                </span>

                                                                                                {/* User Selector */}
                                                                                                <Popover open={openStepId === subStep.id} onOpenChange={(open) => {
                                                                                                    if (open) handleStepClick({ ...step, id: subStep.id, approver_id: subStep.jabatan_id, approver_type: 'jabatan' });
                                                                                                    else setOpenStepId(null);
                                                                                                }}>
                                                                                                    <PopoverTrigger asChild>
                                                                                                        <div
                                                                                                            className="w-full px-3 py-2 bg-background border rounded-md text-sm flex items-center justify-between gap-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all shadow-sm"
                                                                                                        >
                                                                                                            <span className={cn("truncate text-xs", !customApproverNames[subStep.id] && "text-muted-foreground")}>
                                                                                                                {customApproverNames[subStep.id] || "Pilih Pejabat..."}
                                                                                                            </span>
                                                                                                            <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                                                                                                        </div>
                                                                                                    </PopoverTrigger>
                                                                                                    <PopoverContent className="p-0 w-[240px]" align="start">
                                                                                                        <Command>
                                                                                                            <CommandInput placeholder="Cari nama..." className="h-8 text-xs" />
                                                                                                            <CommandList>
                                                                                                                <CommandEmpty className="py-2 text-center text-xs text-muted-foreground">
                                                                                                                    {loadingStepUsers ? 'Memuat...' : 'Tidak ditemukan.'}
                                                                                                                </CommandEmpty>
                                                                                                                <CommandGroup>
                                                                                                                    {stepUsers.map((user) => (
                                                                                                                        <CommandItem
                                                                                                                            key={user.id}
                                                                                                                            value={user.name}
                                                                                                                            onSelect={() => handleSelectApprover(subStep.id, user)}
                                                                                                                            className="text-xs"
                                                                                                                        >
                                                                                                                            <Check
                                                                                                                                className={cn(
                                                                                                                                    "mr-2 h-3.5 w-3.5",
                                                                                                                                    customApprovers[subStep.id] === user.id.toString() ? "opacity-100" : "opacity-0"
                                                                                                                                )}
                                                                                                                            />
                                                                                                                            {user.name}
                                                                                                                        </CommandItem>
                                                                                                                    ))}
                                                                                                                </CommandGroup>
                                                                                                            </CommandList>
                                                                                                        </Command>
                                                                                                    </PopoverContent>
                                                                                                </Popover>
                                                                                            </div>

                                                                                            {/* Remove Button - Only visible on hover or if it's the last step? Let's make it always accessible but subtle, or absolute top-right */}
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => handleRemoveStep(subStep.id)}
                                                                                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/step:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90"
                                                                                                title="Hapus Step"
                                                                                            >
                                                                                                <XCircle className="h-4 w-4" />
                                                                                            </button>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="relative group/step flex flex-col items-center gap-1">
                                                                                {step.approver_type === 'jabatan' ? (
                                                                                    <Popover open={openStepId === step.id} onOpenChange={(open) => {
                                                                                        if (open) handleStepClick(step);
                                                                                        else setOpenStepId(null);
                                                                                    }}>
                                                                                        <PopoverTrigger asChild>
                                                                                            <div
                                                                                                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium border border-border flex items-center gap-2 cursor-pointer hover:bg-secondary/80 transition-colors h-8"
                                                                                            >
                                                                                                <span>
                                                                                                    {step.jabatan_nama || step.jabatan_id}
                                                                                                </span>
                                                                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                                                                            </div>
                                                                                        </PopoverTrigger>
                                                                                        <PopoverContent className="p-0 w-[250px]" align="start">
                                                                                            <Command>
                                                                                                <CommandInput placeholder="Cari user..." />
                                                                                                <CommandList>
                                                                                                    <CommandEmpty>
                                                                                                        {loadingStepUsers ? 'Memuat...' : 'Tidak ada user ditemukan.'}
                                                                                                    </CommandEmpty>
                                                                                                    <CommandGroup>
                                                                                                        {stepUsers.map((user) => (
                                                                                                            <CommandItem
                                                                                                                key={user.id}
                                                                                                                value={user.name}
                                                                                                                onSelect={() => handleSelectApprover(step.id, user)}
                                                                                                            >
                                                                                                                <Check
                                                                                                                    className={cn(
                                                                                                                        "mr-2 h-4 w-4",
                                                                                                                        customApprovers[step.id] === user.id.toString() ? "opacity-100" : "opacity-0"
                                                                                                                    )}
                                                                                                                />
                                                                                                                {user.name}
                                                                                                            </CommandItem>
                                                                                                        ))}
                                                                                                    </CommandGroup>
                                                                                                </CommandList>
                                                                                            </Command>
                                                                                        </PopoverContent>
                                                                                    </Popover>
                                                                                ) : (
                                                                                    <div className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium border border-border flex items-center gap-2 h-8">
                                                                                        <span>
                                                                                            {step.jabatan_nama || step.jabatan_id}
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                <span className="text-xs text-muted-foreground max-w-[150px] text-center truncate">
                                                                                    {step.approver_type === 'user'
                                                                                        ? step.approver_user?.name
                                                                                        : (customApproverNames[step.id] ? (
                                                                                            <span className="text-primary font-medium">{customApproverNames[step.id]}</span>
                                                                                        ) : "Pilih User...")}
                                                                                </span>

                                                                                {/* Remove Button for Sequential Steps */}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handleRemoveStep(step.id)}
                                                                                    className="absolute -top-3 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/step:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90 z-10"
                                                                                    title="Hapus Step"
                                                                                >
                                                                                    <XCircle className="h-4 w-4" />
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        {/* Tags */}
                                                                        <div className="flex gap-1">
                                                                            {step.step_type === 'conditional' && (
                                                                                <span className="text-[10px] bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded">
                                                                                    Conditional
                                                                                </span>
                                                                            )}
                                                                            {step.step_type === 'parallel' && (
                                                                                <span className="text-[10px] bg-blue-500/20 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                                                    Parallel
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {step.step_type === 'conditional' && step.condition_field && (
                                                                            <div className="text-[10px] text-muted-foreground italic px-2">
                                                                                If {step.condition_field} {step.condition_operator} {step.condition_value}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </React.Fragment>
                                                            );
                                                        })}

                                                        {/* Recursive Smart Add Button for Subsequent Steps */}
                                                        <div className="h-8 flex items-center relative group w-8 justify-center">
                                                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-50 group-hover:opacity-0 pointer-events-none">
                                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleOpenAddModal(auth.user.id, workflowSteps.length)}
                                                                    className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 shadow-sm transition-all"
                                                                    title="Tambah Approval (Atasan Berjenjang)"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Recipient Node */}
                                                        <div className="h-8 flex items-center">
                                                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                                        </div>
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-800 flex items-center gap-2 h-8">
                                                                <span>
                                                                    {data.recipient ? (users.find(u => u.id.toString() === data.recipient)?.name || 'Penerima') : 'Penerima'}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">Penerima Akhir</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        💡 Workflow akan dijalankan otomatis setelah surat dikirim
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Isi Surat */}
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Isi Surat</Label>
                                        <Textarea
                                            id="content"
                                            placeholder="Tulis isi surat di sini..."
                                            rows={15}
                                            value={data.content}
                                            onChange={(e) => setData('content', e.target.value)}
                                        />
                                    </div>

                                    {/* Lampiran */}
                                    <div className="space-y-2">
                                        <Label htmlFor="attachment">Lampiran (PDF/Word)</Label>
                                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer relative">
                                            <input
                                                type="file"
                                                multiple
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files) {
                                                        setData('attachments', [...data.attachments, ...Array.from(e.target.files)]);
                                                    }
                                                }}
                                            />
                                            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                                            <p className="text-sm text-muted-foreground mb-1">
                                                Drag & drop files atau klik untuk upload
                                            </p>
                                            <p className="text-xs text-muted-foreground">Support: PDF, DOC, DOCX (Max 10MB)</p>
                                        </div>
                                        {data.attachments.length > 0 && (
                                            <div className="mt-4 space-y-2">
                                                {data.attachments.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                                                        <div className="flex items-center gap-3 overflow-hidden">
                                                            <div className="bg-primary/10 p-2 rounded-md">
                                                                <FileText className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-sm font-medium truncate">{file.name}</span>
                                                                <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => setData('attachments', data.attachments.filter((_, i) => i !== index))}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                        <Button type="button" variant="outline" onClick={() => reset()}>
                                            Reset
                                        </Button>
                                        <Button type="submit">
                                            Lanjut ke Preview
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </>
                            )}

                            {step === 2 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"
                                    onTouchMove={draggedItem ? handleTouchMove : undefined}
                                    onTouchEnd={draggedItem ? handleTouchEnd : undefined}
                                >
                                    {/* Ghost Element for Mobile Drag */}
                                    {draggedItem && ghostPosition && (
                                        <div
                                            className="fixed z-50 pointer-events-none opacity-80"
                                            style={{
                                                left: ghostPosition.x - (draggedItem.offsetX || 0),
                                                top: ghostPosition.y - (draggedItem.offsetY || 0),
                                                width: '150px'
                                            }}
                                        >
                                            <div className="p-2 border-2 border-dashed border-blue-500 bg-blue-50/50 rounded text-center bg-white">
                                                <p className="text-xs font-semibold uppercase text-black">Signature</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Left: Preview Area (2 parts) */}
                                    <div className="md:col-span-2 min-w-0 max-w-full">
                                        <div className="overflow-x-auto pb-4 w-full">
                                            <div className="flex flex-col items-center space-y-4 min-w-fit px-4">
                                                {/* Zoom Controls */}

                                                <div
                                                    id="preview-container"
                                                    className="bg-white text-black p-8 shadow-sm border min-h-[800px] relative w-[210mm] transition-all duration-200"
                                                    style={{ zoom: zoom } as React.CSSProperties}
                                                    onDragOver={handleDragOver}
                                                    onDrop={handleDrop}
                                                >
                                                    {/* Header */}
                                                    <div className="text-center mb-8 relative">
                                                        <div className="border-b-4 border-black pb-4 mb-4">
                                                            <h3 className="text-lg font-bold uppercase tracking-wide">PEMERINTAH KABUPATEN CONTOH</h3>
                                                            <h2 className="text-2xl font-bold uppercase tracking-wider mb-1">DINAS KOMUNIKASI DAN INFORMATIKA</h2>
                                                            <p className="text-sm font-medium">Jalan Jenderal Sudirman No. 123, Kota Contoh, 12345</p>
                                                            <p className="text-sm font-medium">Telepon: (021) 1234567 | Email: info@dinas.contoh.go.id</p>
                                                        </div>

                                                        <h2 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4 mb-6">SURAT DINAS</h2>

                                                        <div className="flex justify-between items-start text-sm mb-4">
                                                            <div className="text-left">
                                                                <table className="border-collapse">
                                                                    <tbody>
                                                                        <tr>
                                                                            <td className="pr-2">Nomor</td>
                                                                            <td className="pr-2">:</td>
                                                                            <td>
                                                                                SK/
                                                                                {letterTypes.find(t => t.id.toString() === data.letter_type_id)?.code || '...'}
                                                                                /
                                                                                {String(new Date().getDate()).padStart(2, '0')}{String(new Date().getMonth() + 1).padStart(2, '0')}{new Date().getFullYear()}
                                                                                /...
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td className="pr-2">Sifat</td>
                                                                            <td className="pr-2">:</td>
                                                                            <td className="uppercase">{data.priority}</td>
                                                                        </tr>
                                                                        {data.attachments.length > 0 && (
                                                                            <tr>
                                                                                <td className="pr-2">Lampiran</td>
                                                                                <td className="pr-2">:</td>
                                                                                <td>{data.attachments.length} Berkas</td>
                                                                            </tr>
                                                                        )}
                                                                        <tr>
                                                                            <td className="pr-2">Perihal</td>
                                                                            <td className="pr-2">:</td>
                                                                            <td className="font-bold">{data.subject}</td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                            <div className="text-right">
                                                                <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="whitespace-pre-wrap text-sm leading-relaxed mb-12 min-h-[200px]">
                                                        {data.content || "Belum ada isi surat..."}
                                                    </div>

                                                    {/* Dropped Signatures */}
                                                    {Object.entries(signaturePositions).map(([stepId, pos]) => {
                                                        const step = workflowSteps.find(s => s.id === parseInt(stepId));
                                                        if (!step) return null;
                                                        const name = (step.approver_type === 'user' ? step.approver_user?.name : null) || (customApproverNames[step.id] || step.current_holder?.name || step.approver_jabatan?.nama);
                                                        const jabatan = step.approver_jabatan?.nama || step.approver_user?.staff?.jabatan?.nama || 'Pejabat';

                                                        return (
                                                            <div
                                                                key={stepId}
                                                                className="absolute cursor-move border-2 border-dashed border-blue-500 bg-blue-50/50 p-2 rounded text-center min-w-[150px] touch-none"
                                                                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                                                                draggable
                                                                onDragStart={(e) => handleDragStart(e, parseInt(stepId), 'preview')}
                                                                onTouchStart={(e) => handleTouchStart(e, parseInt(stepId), 'preview')}
                                                            >
                                                                <p className="text-xs font-semibold uppercase">{customApproverDetails[parseInt(stepId)]?.position_name || jabatan}</p>
                                                                {(step.approver_type === 'user' && step.approver_user?.unit) || (customApproverDetails[step.id]?.unit) ? (
                                                                    <p className="text-[10px] font-semibold uppercase">{step.approver_user?.unit || customApproverDetails[step.id]?.unit}</p>
                                                                ) : null}

                                                                <div className="h-16 flex items-center justify-center my-1">
                                                                    {customApproverDetails[parseInt(stepId)]?.signature_url ? (
                                                                        <img
                                                                            src={customApproverDetails[parseInt(stepId)]?.signature_url!}
                                                                            alt="Signature"
                                                                            className="max-h-full max-w-full object-contain"
                                                                            draggable={false}
                                                                        />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center border border-dashed border-gray-300 rounded bg-gray-50 text-[10px] text-gray-400">
                                                                            No Signature
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <p className="text-xs font-bold underline">{name}</p>
                                                                {(step.approver_type === 'user' && step.approver_user?.rank) || (customApproverDetails[step.id]?.rank) ? (
                                                                    <p className="text-[10px]">{step.approver_user?.rank || customApproverDetails[step.id]?.rank}</p>
                                                                ) : null}
                                                            </div>
                                                        );
                                                    })}

                                                    {/* Signature Placeholder (Only show if not dropped) */}
                                                    <div className="text-center mt-12 opacity-50">
                                                        <p className="text-xs text-gray-400">
                                                            {workflowSteps
                                                                .filter(s => !signaturePositions[s.id])
                                                                .map(s => {
                                                                    const name = (s.approver_type === 'user' ? s.approver_user?.name : null) || (customApproverNames[s.id] || s.current_holder?.name || s.approver_jabatan?.nama);
                                                                    const jabatan = s.approver_jabatan?.nama || s.approver_user?.staff?.jabatan?.nama || 'Pejabat';
                                                                    return `${jabatan} - ${name}`;
                                                                })
                                                                .filter(Boolean)
                                                                .join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Sidebar */}
                                    <div className="space-y-6">
                                        {/* Zoom Controls */}
                                        <Card className="bg-muted/30">
                                            <CardContent className="p-3 flex items-center justify-between">
                                                <span className="text-sm font-medium">Zoom Preview</span>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                                                        disabled={zoom <= 0.5}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <ZoomOut className="h-4 w-4" />
                                                    </Button>
                                                    <span className="text-sm font-medium w-[3rem] text-center">
                                                        {Math.round(zoom * 100)}%
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                                                        disabled={zoom >= 2}
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <ZoomIn className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-muted/30">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base">Tanda Tangan Tersedia</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {workflowSteps.map(step => {
                                                    const isDropped = !!signaturePositions[step.id];
                                                    const name = (step.approver_type === 'user' ? step.approver_user?.name : null) || (customApproverNames[step.id] || step.current_holder?.name || step.approver_jabatan?.nama);
                                                    const jabatan = step.approver_jabatan?.nama || step.approver_user?.staff?.jabatan?.nama || 'Pejabat';

                                                    if (isDropped) return null;

                                                    return (
                                                        <div
                                                            key={step.id}
                                                            className="p-3 bg-white text-black border rounded shadow-sm cursor-move hover:border-primary transition-colors flex items-center justify-between touch-none"
                                                            draggable
                                                            onDragStart={(e) => handleDragStart(e, step.id, 'sidebar')}
                                                            onTouchStart={(e) => handleTouchStart(e, step.id, 'sidebar')}
                                                        >
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold uppercase text-gray-700">{jabatan}</span>
                                                                <span className="text-sm font-medium">{name}</span>
                                                                {(step.approver_type === 'user' && step.approver_user?.rank) || (customApproverDetails[step.id]?.rank) ? (
                                                                    <span className="text-[10px] text-muted-foreground">{step.approver_user?.rank || customApproverDetails[step.id]?.rank}</span>
                                                                ) : null}
                                                            </div>
                                                            <div className="h-6 w-6 bg-gray-100 rounded flex items-center justify-center">
                                                                <FileText className="h-3 w-3 text-gray-500" />
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {workflowSteps.every(s => signaturePositions[s.id]) && (
                                                    <div className="text-center text-sm text-muted-foreground py-4">
                                                        Semua tanda tangan telah ditempatkan.
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base text-blue-700 dark:text-blue-400">Petunjuk Penempatan</CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-sm text-blue-600 dark:text-blue-300 space-y-2">
                                                <ul className="list-disc pl-4 space-y-1">
                                                    <li>Drag & drop nama penanda tangan dari list di atas ke area surat.</li>
                                                    <li>Geser posisi tanda tangan di area surat sesuai keinginan.</li>
                                                    <li>Pastikan posisi tidak menutupi teks penting.</li>
                                                </ul>
                                            </CardContent>
                                        </Card>

                                        <div className="flex flex-col gap-3 pt-4">
                                            <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)}>
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Kembali ke Form
                                            </Button>
                                            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={processing}>
                                                <Send className="h-4 w-4 mr-2" />
                                                {processing ? 'Mengirim...' : 'Kirim Surat'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout >
    );
}
