import * as React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/utils"; // Assuming utils is in components/ui based on previous context

interface DateSelectProps {
    value?: string;
    onChange: (date: string) => void;
    startYear?: number;
    endYear?: number;
    className?: string;
    error?: boolean;
    placeholder?: string;
}

export function DateSelect({
    value,
    onChange,
    startYear = 1950,
    endYear = new Date().getFullYear(),
    className,
    error
}: DateSelectProps) {
    // Lazy initialization to ensure state is present on first render if value exists
    const [selectedDay, setSelectedDay] = React.useState<string>(() => {
        if (!value) return "";
        const parts = value.split('-');
        return parts.length === 3 ? parseInt(parts[2]).toString() : "";
    });

    const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
        if (!value) return "";
        const parts = value.split('-');
        return parts.length === 3 ? parseInt(parts[1]).toString() : "";
    });

    const [selectedYear, setSelectedYear] = React.useState<string>(() => {
        if (!value) return "";
        const parts = value.split('-');
        return parts.length === 3 ? parts[0] : "";
    });

    // Sync from prop changes (if external update happens)
    React.useEffect(() => {
        if (value) {
            const parts = value.split('-');
            if (parts.length === 3) {
                const [y, m, d] = parts;
                // Only update if different to avoid cycles, though React prevents no-op updates
                const newY = y;
                const newM = parseInt(m).toString();
                const newD = parseInt(d).toString();

                if (newY !== selectedYear) setSelectedYear(newY);
                if (newM !== selectedMonth) setSelectedMonth(newM);
                if (newD !== selectedDay) setSelectedDay(newD);
            }
        }
    }, [value, selectedDay, selectedMonth, selectedYear]);

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);

    const daysInMonth = (month: string, year: string) => {
        if (!month || !year) return 31;
        return new Date(parseInt(year), parseInt(month), 0).getDate();
    };

    const days = Array.from({ length: daysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

    const updateDate = (d: string, m: string, y: string) => {
        // Only trigger onChange if all parts are present
        if (d && m && y) {
            // Clamp day if necessary
            const maxDays = daysInMonth(m, y);
            let dayNum = parseInt(d);
            if (dayNum > maxDays) {
                dayNum = maxDays;
                setSelectedDay(dayNum.toString()); // Update visual state immediately
            }

            const monthStr = m.padStart(2, '0');
            const dayStr = dayNum.toString().padStart(2, '0');
            onChange(`${y}-${monthStr}-${dayStr}`);
        }
        // Do NOT emit empty string for partials to avoid clearing parent state and causing loop
    };

    const handleDayChange = (val: string) => {
        setSelectedDay(val);
        updateDate(val, selectedMonth, selectedYear);
    };

    const handleMonthChange = (val: string) => {
        setSelectedMonth(val);
        updateDate(selectedDay, val, selectedYear);
    };

    const handleYearChange = (val: string) => {
        setSelectedYear(val);
        updateDate(selectedDay, selectedMonth, val);
    };

    return (
        <div className={cn("grid grid-cols-3 gap-2 w-full", className)}>
            <Select value={selectedDay} onValueChange={handleDayChange}>
                <SelectTrigger className={cn("w-full bg-[#2a2a2a] border-white/10 text-white", error && "border-red-500")}>
                    <SelectValue placeholder="Tgl" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {days.map((d) => (
                        <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className={cn("w-full bg-[#2a2a2a] border-white/10 text-white", error && "border-red-500")}>
                    <SelectValue placeholder="Bulan" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {months.map((m, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>{m}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className={cn("w-full bg-[#2a2a2a] border-white/10 text-white", error && "border-red-500")}>
                    <SelectValue placeholder="Tahun" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                    {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
