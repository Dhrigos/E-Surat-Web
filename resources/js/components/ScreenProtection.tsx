import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ScreenProtection() {
    const [isBlurred, setIsBlurred] = useState(false);
    const [isModifierHeld, setIsModifierHeld] = useState(false);

    useEffect(() => {
        // 1. Disable Right Click
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };

        // 2. Disable Keyboard Shortcuts (Windows/Linux/Mac)
        const handleKeyDown = (e: KeyboardEvent) => {
            // Aggressive Protection: Blur on ANY modifier key (Win, Cmd, Ctrl, Alt)
            // This prevents the user from seeing the screen while preparing a screenshot shortcut
            if (e.key === 'Meta' || e.key === 'Control' || e.key === 'Alt') {
                setIsModifierHeld(true);
            }

            // Universal Modifier Keys
            const isCtrl = e.ctrlKey || e.metaKey; // Windows/Linux Ctrl or Mac Cmd
            const isShift = e.shiftKey;
            const isAlt = e.altKey;

            // Block PrintScreen (Windows/Linux)
            if (e.key === 'PrintScreen') {
                e.preventDefault();
                blockAction('Screenshot disabled.');
            }

            // Block Mac Screenshot Shortcuts (Cmd + Shift + 3, 4, 5)
            if (e.metaKey && isShift && (e.key === '3' || e.key === '4' || e.key === '5')) {
                e.preventDefault();
                blockAction('Screenshot disabled.');
            }

            // Block Windows Snipping Tool (Win + Shift + S) - Best Effort
            if (e.getModifierState('OS') && isShift && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                blockAction('Snippet tool disabled.');
            }

            // Block Print (Ctrl/Cmd + P)
            if (isCtrl && (e.key === 'p' || e.key === 'P')) {
                e.preventDefault();
                toast.error('Printing is disabled.');
            }

            // Block Save (Ctrl/Cmd + S)
            if (isCtrl && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
            }

            // Block View Source / Inspect
            // Ctrl/Cmd + U (View Source)
            if (isCtrl && (e.key === 'u' || e.key === 'U')) {
                e.preventDefault();
            }

            // Developer Tools
            // F12
            // Ctrl/Cmd + Shift + I
            // Ctrl/Cmd + Shift + J
            // Ctrl/Cmd + Shift + C
            if (
                e.key === 'F12' ||
                (isCtrl && isShift && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key))
            ) {
                e.preventDefault();
            }
        };

        const blockAction = (msg: string) => {
            alert(msg);
            copyToClipboard(' ');
        };

        // 3. Clear Clipboard on Copy (prevent copying text)
        const handleCopy = (e: ClipboardEvent) => {
            e.preventDefault();
        };

        // 4. Blur on Window Blur (when switching to screen recorder or other app)
        const handleVisibilityChange = () => {
            if (document.hidden) {
                setIsBlurred(true);
            }
        };

        const handleWindowBlur = () => {
            setIsBlurred(true);
        };

        const handleWindowFocus = () => {
            // Do NOT auto-unlock on focus. User must click key/overlay to unlock.
            // verifying visibility state just in case
            if (document.hidden) {
                setIsBlurred(true);
            }
        };

        // 5. Detect PrintScreen KeyUp (Fallback if KeyDown is blocked)
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'PrintScreen') {
                copyToClipboard(' ');
                alert('Screenshot disabled.');
            }
            if (e.key === 'Meta' || e.key === 'Control' || e.key === 'Alt') {
                setIsModifierHeld(false);
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        document.addEventListener('copy', handleCopy);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleWindowBlur);
        window.addEventListener('focus', handleWindowFocus);

        // Anti-Print Styles
        const style = document.createElement('style');
        style.innerHTML = `
            @media print {
                html, body { display: none !important; }
            }
            body {
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleWindowBlur);
            window.removeEventListener('focus', handleWindowFocus);
            document.head.removeChild(style);
        };
    }, []);

    // Clear clipboard helper
    const copyToClipboard = (text: string) => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
        }
    };

    const isLocked = isBlurred || isModifierHeld;

    return (
        <>
            {/* Blur Overlay */}
            {isLocked && (
                <div
                    onClick={() => {
                        setIsBlurred(false);
                        setIsModifierHeld(false);
                    }}
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-2xl flex items-center justify-center cursor-pointer"
                >
                    <div className="text-center p-8 bg-black rounded-2xl border border-red-900/50 shadow-2xl animate-pulse">
                        <div className="text-6xl mb-6">🛡️</div>
                        <h2 className="text-2xl font-bold text-red-500 mb-2 uppercase tracking-widest">Sistem Terkunci</h2>
                        <p className="text-gray-400 font-mono text-sm">
                            {isModifierHeld ? 'Shortcut Detected...' : 'Klik di mana saja untuk membuka kembali'}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
