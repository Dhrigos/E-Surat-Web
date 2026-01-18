import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark =
        appearance === 'dark' || (appearance === 'system' && prefersDark());

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

export function initializeTheme() {
    // Force dark theme application
    applyTheme('dark');
    
    // Optional: still listen to system changes if we wanted to support it, 
    // but here we force dark, so no need to listen.
}

export function useAppearance() {
    // Force 'dark' state
    const [appearance, setAppearance] = useState<Appearance>('dark');

    const updateAppearance = useCallback((mode: Appearance) => {
        // Force 'dark' regardless of input
        const forcedMode = 'dark';
        setAppearance(forcedMode);
        localStorage.setItem('appearance', forcedMode);
        setCookie('appearance', forcedMode);
        applyTheme(forcedMode);
    }, []);

    useEffect(() => {
        // Enforce dark on mount
        updateAppearance('dark');
        
        // No need to listen to media query changes since we force dark
    }, [updateAppearance]);

    return { appearance, updateAppearance } as const;
}
