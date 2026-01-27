import * as React from "react";
import { Textarea } from "./textarea";

interface FastTextareaProps extends React.ComponentProps<typeof Textarea> {
    onValueChange?: (value: string) => void;
}

export function FastTextarea({ value: initialValue, onChange, onBlur, onValueChange, className, ...props }: FastTextareaProps) {
    const [value, setValue] = React.useState(initialValue || "");

    React.useEffect(() => {
        setValue(initialValue || "");
    }, [initialValue]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setValue(e.target.value);
        onChange?.(e);
        onValueChange?.(e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        onBlur?.(e);
    };

    return (
        <Textarea
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            className={className}
            {...props}
        />
    );
}
