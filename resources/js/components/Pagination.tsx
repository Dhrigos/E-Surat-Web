import { Link } from '@inertiajs/react';
import {
    Pagination as PaginationRoot,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export default function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null;

    return (
        <PaginationRoot>
            <PaginationContent>
                {links.map((link, index) => {
                    const isPrevious = link.label.includes('Previous') || link.label.includes('&laquo;');
                    const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                    const isEllipsis = link.label === '...';

                    if (isPrevious) {
                        return (
                            <PaginationItem key={index}>
                                {link.url ? (
                                    <PaginationPrevious href={link.url} />
                                ) : (
                                    <span className="flex items-center justify-center gap-1 px-2.5 py-2 text-sm text-muted-foreground opacity-50">
                                        <span>Previous</span>
                                    </span>
                                )}
                            </PaginationItem>
                        );
                    }

                    if (isNext) {
                        return (
                            <PaginationItem key={index}>
                                {link.url ? (
                                    <PaginationNext href={link.url} />
                                ) : (
                                    <span className="flex items-center justify-center gap-1 px-2.5 py-2 text-sm text-muted-foreground opacity-50">
                                        <span>Next</span>
                                    </span>
                                )}
                            </PaginationItem>
                        );
                    }

                    if (isEllipsis) {
                        return (
                            <PaginationItem key={index}>
                                <PaginationEllipsis />
                            </PaginationItem>
                        );
                    }

                    return (
                        <PaginationItem key={index}>
                            <PaginationLink
                                href={link.url || '#'}
                                isActive={link.active}
                            >
                                {link.label}
                            </PaginationLink>
                        </PaginationItem>
                    );
                })}
            </PaginationContent>
        </PaginationRoot>
    );
}
