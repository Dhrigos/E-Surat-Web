
import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface SearchableSelectProps {
    options: { value: string; label: string }[];
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    error?: boolean;
    disabled?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyMessage = "No results found.",
    className,
    error,
    disabled = false
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)

    // Find label for current value
    const selectedLabel = React.useMemo(() => {
        return options.find((option) => option.value === value)?.label
    }, [options, value]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between bg-[#2a2a2a] border-white/10 text-white hover:bg-[#333] hover:text-white",
                        error && "border-red-500",
                        className
                    )}
                    disabled={disabled}
                >
                    {value
                        ? selectedLabel || value
                        : <span className="text-gray-400 font-normal">{placeholder}</span>}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-[#2a2a2a] border-white/10 text-white" align="start">
                <Command className="bg-[#2a2a2a] text-white">
                    <CommandInput placeholder={searchPlaceholder} className="text-white placeholder:text-gray-500" />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-y-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label} // Use label for search filtering
                                    onSelect={() => {
                                        onValueChange(option.value)
                                        setOpen(false)
                                    }}
                                    className="text-white hover:bg-white/10 aria-selected:bg-white/10"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
