import React, { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Building2, Users, Settings } from 'lucide-react';
import axios from 'axios';

interface UnitKerja {
    id: number;
    nama: string;
    kode: string;
    children: UnitKerja[];
}

const TreeNode = ({ node, level = 0 }: { node: UnitKerja; level?: number }) => {
    const [isOpen, setIsOpen] = useState(true);
    const hasChildren = node.children && node.children.length > 0;

    return (
        <div className="relative">
            <div
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${level === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
                    }`}
                style={{ marginLeft: `${level * 24}px` }}
            >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border shadow-sm shrink-0 text-muted-foreground">
                    {level === 0 ? <Building2 className="w-4 h-4 text-primary" /> : <Users className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className={`font-semibold truncate ${level === 0 ? 'text-lg text-primary' : 'text-sm'}`}>
                            {node.nama}
                        </h4>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono">
                            {node.kode}
                        </Badge>
                    </div>
                </div>

                {hasChildren && (
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-1 hover:bg-muted rounded-full transition-colors"
                    >
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                )}
            </div>

            {hasChildren && isOpen && (
                <div className="relative mt-2 space-y-2">
                    {/* Connecting Line */}
                    <div
                        className="absolute left-[15px] top-0 bottom-4 w-px bg-border"
                        style={{ left: `${level * 24 + 16}px` }}
                    />
                    {node.children.map((child) => (
                        <TreeNode key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function OrganizationIndex() {
    const [treeData, setTreeData] = useState<UnitKerja[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(route('api.organization-tree'))
            .then(response => {
                setTreeData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Failed to fetch organization tree", error);
                setLoading(false);
            });
    }, []);

    return (
        <AppLayout breadcrumbs={[{ title: 'Struktur Organisasi', href: '/organization' }]}>
            <Head title="Struktur Organisasi" />

            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Struktur Organisasi</h2>
                        <p className="text-muted-foreground mt-1">Visualisasi hierarki unit kerja Badan Cadangan Nasional.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/unit-kerja">
                            <Button variant="outline" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Manage Units
                            </Button>
                        </Link>
                        <Link href="/jabatan">
                            <Button variant="outline" className="gap-2">
                                <Settings className="h-4 w-4" />
                                Manage Positions
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="border-none shadow-none bg-transparent">
                    <CardContent className="p-0 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : treeData.length > 0 ? (
                            treeData.map((node) => (
                                <TreeNode key={node.id} node={node} />
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                No organization structure found.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
