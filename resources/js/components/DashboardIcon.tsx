import { cn } from "./ui/utils";

interface DashboardIconProps {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    bgColor: string; // Background color for the icon container
    iconColor?: string; // Optional icon color, default white or dark based on desire
    className?: string;
}

export default function DashboardIcon({
    icon: Icon,
    label,
    onClick,
    bgColor,
    iconColor = "#ffffff", // Default to white for better contrast on colored backgrounds
    className
}: DashboardIconProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-start gap-2 group p-2 w-full h-full",
                className
            )}
        >
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-active:scale-95 text-white"
                style={{ backgroundColor: '#262626', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)' }}
            >
                <Icon
                    className="w-7 h-7"
                    style={{ color: bgColor }}
                />
            </div>
            <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 leading-tight">
                {label}
            </span>
        </button>
    );
}
