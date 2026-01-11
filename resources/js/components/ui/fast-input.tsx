import * as React from "react";
import { Input } from "./input";

interface FastInputProps extends React.ComponentProps<typeof Input> {
    onValueChange?: (value: string) => void;
}

export function FastInput({ value: initialValue, onChange, onBlur, onValueChange, className, ...props }: FastInputProps) {
    const [value, setValue] = React.useState(initialValue || "");

    React.useEffect(() => {
        setValue(initialValue || "");
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange?.(e);
        onValueChange?.(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(e);
    };

    return (
        <Input
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
            {...props}
        />
    );
}
