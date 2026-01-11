import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { id as idID } from "date-fns/locale"

import { cn } from "@/components/ui/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    value?: Date
    onChange?: (date?: Date) => void
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function DatePicker({
    value,
    onChange,
    placeholder = "Pilih tanggal",
    className,
    disabled
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    disabled={disabled}
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal bg-[#2a2a2a] border-white/10 text-white hover:bg-[#333] hover:text-white",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, "PPP", { locale: idID }) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    initialFocus
                    locale={idID}
                />
            </PopoverContent>
        </Popover>
    )
}
