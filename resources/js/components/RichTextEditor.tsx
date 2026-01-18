import React, { useEffect, useRef } from 'react';
import type { Editor as TinyMCEEditor } from 'tinymce';

interface RichTextEditorProps {
    value?: string;
    onChange?: (content: string) => void;
    // Debounce interval for onChange to mengurangi lag saat mengetik
    onChangeDebounceMs?: number;
    placeholder?: string;
    height?: number;
    id?: string;
    name?: string;
    // Show AI button in toolbar (e.g., only for Assessment editor)
    showAiButton?: boolean;
    // Optional click handler for AI button; if not provided, a simple prompt is used
    onAiClick?: (editor: TinyMCEEditor) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value = '', onChange, onChangeDebounceMs = 300, placeholder = 'Masukkan teks...', height = 200, id, name, showAiButton = false, onAiClick }) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const editorRef = useRef<TinyMCEEditor | null>(null);
    const uiSkinLinkRef = useRef<HTMLLinkElement | null>(null);
    const uiCustomStyleRef = useRef<HTMLStyleElement | null>(null);
    const isDarkRef = useRef<boolean | null>(null);
    const initialContentRef = useRef<string | null>(null);
    const changeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize TinyMCE (Community) on mount
    useEffect(() => {
        let active = true;
        if (!textareaRef.current) return;

        const init = async () => {
            // Load TinyMCE via a local bundler-friendly module to avoid scattered dynamic imports
            const tinymceModule = await import('@/lib/tinymceLoader');
            const tinymce = tinymceModule.default;
            // Detect dark mode solely by presence of 'dark' class on <html>
            const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

            // Load UI skin CSS URL and Content CSS URL based on theme
            const uiSkinUrl = (
                await import(
                    /* @vite-ignore */ isDark
                        ? 'tinymce/skins/ui/oxide-dark/skin.min.css?url'
                        : 'tinymce/skins/ui/oxide/skin.min.css?url'
                )
            ).default as string;

            const contentCssUrl = (
                await import(
                    /* @vite-ignore */ isDark
                        ? 'tinymce/skins/content/dark/content.min.css?url'
                        : 'tinymce/skins/content/default/content.min.css?url'
                )
            ).default as string;

            // Inject UI skin link into head (TinyMCE skin disabled; we manage CSS manually)
            try {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = uiSkinUrl;
                document.head.appendChild(link);
                uiSkinLinkRef.current = link;
            } catch {
                // ignore
            }

            // Remember current theme
            isDarkRef.current = isDark;

            if (!active || !textareaRef.current) return;

            tinymce.init({
                target: textareaRef.current,
                height: height,
                inline: false,
                menubar: false,
                plugins: ['lists', 'link', 'code'],
                toolbar:
                    'undo redo | blocks | ' +
                    'bold italic | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat' +
                    (showAiButton ? ' | ai' : '') +
                    ' | mic',
                // Disable TinyMCE fetching skin; we inject UI skin CSS ourselves
                skin: false,
                // Use TinyMCE content CSS inside iframe for better default styling
                content_css: contentCssUrl,
                content_style: (
                    isDark
                        ? [
                            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px;background:#262626; color:#e5e7eb; }',
                            'a { color:#60a5fa; }',
                            'table { color: inherit; }',
                            // Placeholder styles for dark mode
                            'body[data-mce-placeholder]:not(.mce-content-body):before { color: #71717a; opacity: 1; }',
                        ].join(' ')
                        : [
                            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background:#ffffff; color:#0f172a; }',
                            // Placeholder styles for light mode
                            'body[data-mce-placeholder]:not(.mce-content-body):before { color: #a1a1aa; opacity: 1; }',
                        ].join(' ')
                ),
                placeholder: placeholder,
                license_key: 'gpl',
                promotion: false,
                branding: false,
                elementpath: false,
                statusbar: false,
                toolbar_mode: 'sliding',
                resize: false,
                min_height: height,
                max_height: height,
                paste_data_images: true,
                automatic_uploads: false,
                file_picker_types: 'image',
                setup: (editor) => {
                    editorRef.current = editor;

                    // TinyMCE 8+ deprecates editor.fire; prefer editor.dispatch when available
                    const safeDispatch = (name: string) => {
                        const anyEditor = editor as unknown as { dispatch?: (n: string) => void; fire?: (n: string) => void };
                        if (typeof anyEditor.dispatch === 'function') {
                            anyEditor.dispatch(name);
                        } else if (typeof anyEditor.fire === 'function') {
                            // Fallback for older versions
                            // @ts-ignore
                            anyEditor.fire(name as any);
                        }
                    };

                    // Register a custom microphone icon
                    try {
                        editor.ui.registry.addIcon(
                            'mic',
                            // Simple microphone SVG icon
                            '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-3.08A7 7 0 0 0 19 11h-2z"/></svg>'
                        );
                    } catch { }

                    // Register AI icon and button if requested
                    if (showAiButton) {
                        try {
                            editor.ui.registry.addIcon(
                                'ai',
                                '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M12 2l1.76 3.57L17.7 6.2l-2.7 2.63.64 3.86L12 10.96 8.36 12.69l.64-3.86L6.3 6.2l3.94-.63L12 2zm-6 14.5l2-1 .5-2 1.5 1.4 2-.4-1 1.9.9 1.8-2-.3-1.4 1.5-.2-2.1-1.8-.9z"/></svg>'
                            );
                        } catch { }

                        const handleAiAction = async () => {
                            try {
                                if (onAiClick) {
                                    onAiClick(editor as unknown as TinyMCEEditor);
                                } else {
                                    const text = window.prompt('Masukkan teks dari AI untuk disisipkan:');
                                    if (text && text.trim()) {
                                        editor.insertContent(text.trim());
                                        safeDispatch('change');
                                    }
                                }
                            } catch {
                                // ignore
                            }
                        };

                        editor.ui.registry.addButton('ai', {
                            icon: 'ai',
                            tooltip: 'AI Assist',
                            onAction: handleAiAction,
                        });
                    }

                    // Web Speech API integration for speech-to-text
                    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                    let recognition: any = null;
                    let recognizing = false;
                    let lastRange: any = null;

                    const isSupported = typeof SpeechRecognition === 'function';

                    if (isSupported) {
                        recognition = new SpeechRecognition();
                        recognition.lang = 'id-ID';
                        recognition.continuous = true;
                        recognition.interimResults = true;

                        recognition.onstart = () => {
                            recognizing = true;
                            safeDispatch('MicStart');
                        };
                        recognition.onend = () => {
                            recognizing = false;
                            safeDispatch('MicEnd');
                        };
                        recognition.onerror = () => {
                            recognizing = false;
                            safeDispatch('MicEnd');
                        };

                        recognition.onresult = (event: any) => {
                            let finalTranscript = '';
                            for (let i = event.resultIndex; i < event.results.length; ++i) {
                                const result = event.results[i];
                                if (result.isFinal) {
                                    finalTranscript += result[0].transcript;
                                }
                            }
                            if (finalTranscript) {
                                // Restore last selection if available to insert at caret where mic started
                                try {
                                    if (lastRange) {
                                        editor.selection.setRng(lastRange);
                                    }
                                } catch { }
                                editor.insertContent(finalTranscript);
                                safeDispatch('change');
                            }
                        };
                    }

                    // Add toolbar toggle button
                    editor.ui.registry.addToggleButton('mic', {
                        icon: 'mic',
                        tooltip: isSupported ? 'Mulai/Diamkan dikte' : 'Speech-to-text tidak didukung browser',
                        onAction: () => {
                            if (!isSupported) return;
                            try {
                                if (!recognizing) {
                                    // Save current range before starting
                                    try {
                                        lastRange = editor.selection.getRng();
                                    } catch {
                                        lastRange = null;
                                    }
                                    recognition.start();
                                } else {
                                    recognition.stop();
                                }
                            } catch {
                                // ignore start/stop errors
                            }
                        },
                        onSetup: (api) => {
                            const onStart = () => api.setActive(true);
                            const onEnd = () => api.setActive(false);
                            editor.on('MicStart', onStart);
                            editor.on('MicEnd', onEnd);
                            return () => {
                                editor.off('MicStart', onStart);
                                editor.off('MicEnd', onEnd);
                            };
                        },
                    });

                    editor.on('init', () => {
                        const initial = (initialContentRef.current ?? value) || '';
                        if (initial) {
                            editor.setContent(initial);
                        }
                        // clear one-shot initial
                        initialContentRef.current = null;

                        // Apply custom UI styles after init
                        const container = editor.getContainer();
                        if (container) {
                            const toolbars = container.querySelectorAll('.tox-editor-header, .tox-toolbar, .tox-toolbar__primary');
                            toolbars.forEach((toolbar: Element) => {
                                if (isDark) {
                                    toolbar.setAttribute('style', 'background: #262626 !important; border-bottom: 1px solid #262626 !important;');
                                } else {
                                    toolbar.setAttribute('style', 'background: #ffffff !important; border-bottom: 1px solid #e5e7eb !important;');
                                }
                            });

                            // Scoped dark mode adjustments for buttons and dropdowns
                            if (isDark) {
                                try {
                                    // Mark this container to scope our CSS
                                    container.setAttribute('data-custom-dark', '1');

                                    const css = `
                                    .tox[data-custom-dark="1"] .tox-editor-header,
                                    .tox[data-custom-dark="1"] .tox-toolbar,
                                    .tox[data-custom-dark="1"] .tox-toolbar__primary,
                                    .tox[data-custom-dark="1"] .tox-toolbar__overflow,
                                    .tox[data-custom-dark="1"] .tox-toolbar__group {
                                        background: #262626 !important;
                                        border-bottom: 1px solid #262626 !important;
                                        border-color: #262626 !important;
                                        box-shadow: none !important;
                                    }
                                    /* Make all borders blend with background */
                                    .tox[data-custom-dark="1"],
                                    .tox[data-custom-dark="1"] .tox-tinymce,
                                    .tox[data-custom-dark="1"] .tox-editor-container,
                                    .tox[data-custom-dark="1"] .tox-toolbar-overlord,
                                    .tox[data-custom-dark="1"] .tox-toolbar__group:not(:last-child) {
                                        border-color: #262626 !important;
                                        box-shadow: none !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn {
                                        background: #262626 !important;
                                        color: #e5e7eb !important;
                                        border-color: #262626 !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn:hover,
                                    .tox[data-custom-dark="1"] .tox-tbtn:focus {
                                        background: #3f3f46 !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn--select[aria-expanded="true"] {
                                        background: #3f3f46 !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn svg {
                                        color: #e5e7eb !important;
                                        fill: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn--select .tox-tbtn__select-label,
                                    .tox[data-custom-dark="1"] .tox-tbtn--select .tox-tbtn__select-chevron,
                                    .tox[data-custom-dark="1"] .tox-tbtn--select svg {
                                        color: #e5e7eb !important;
                                        fill: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-split-button,
                                    .tox[data-custom-dark="1"] .tox-split-button .tox-tbtn {
                                        background: #262626 !important;
                                        border-color: #262626 !important;
                                    }
                                    /* Dropdown menu panel */
                                    .tox[data-custom-dark="1"] .tox-menu,
                                    .tox[data-custom-dark="1"] .tox-collection,
                                    .tox[data-custom-dark="1"] .tox-collection__group {
                                        background: #262626 !important;
                                        color: #e5e7eb !important;
                                        border-color: #262626 !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-collection__item-checkmark,
                                    .tox[data-custom-dark="1"] .tox-collection__item-icon {
                                        color: #e5e7eb !important;
                                        fill: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-collection__item,
                                    .tox[data-custom-dark="1"] .tox-collection__item * {
                                        color: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-collection__item--active,
                                    .tox[data-custom-dark="1"] .tox-collection__item--enabled,
                                    .tox[data-custom-dark="1"] .tox-collection__item:focus,
                                    .tox[data-custom-dark="1"] .tox-collection__item:hover {
                                        background: #3f3f46 !important;
                                    }
                                    /* Ensure Blocks/Paragraph select (and similar selects) are dark */
                                    .tox[data-custom-dark="1"] .tox-tbtn--select {
                                        background: #262626 !important;
                                        border-color: #262626 !important;
                                        color: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn--select:hover,
                                    .tox[data-custom-dark="1"] .tox-tbtn--select:focus,
                                    .tox[data-custom-dark="1"] .tox-tbtn--select.tox-tbtn--enabled,
                                    .tox[data-custom-dark="1"] .tox-tbtn--select[aria-expanded="true"],
                                    .tox[data-custom-dark="1"] .tox-tbtn--select[aria-pressed="true"] {
                                        background: #3f3f46 !important;
                                        color: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn--select .tox-tbtn__select-label,
                                    .tox[data-custom-dark="1"] .tox-tbtn--select .tox-tbtn__select-chevron {
                                        color: #e5e7eb !important;
                                        fill: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn--select .tox-tbtn__select-label *,
                                    .tox[data-custom-dark="1"] .tox-tbtn--select .tox-tbtn__select-label span {
                                        color: #e5e7eb !important;
                                        fill: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tbtn--select svg {
                                        color: #e5e7eb !important;
                                        fill: #e5e7eb !important;
                                    }
                                    /* Remove blue focus rings */
                                    .tox[data-custom-dark="1"] .tox-tbtn:focus-visible,
                                    .tox[data-custom-dark="1"] .tox-tbtn--select:focus-visible {
                                        outline: none !important;
                                        box-shadow: 0 0 0 2px #3f3f46 !important;
                                    }
                                    /* Menus rendered in global sink (outside editor container) */
                                    html.dark .tox-silver-sink .tox-menu,
                                    html.dark .tox-silver-sink .tox-collection,
                                    html.dark .tox-silver-sink .tox-collection__group {
                                        background: #262626 !important;
                                        color: #e5e7eb !important;
                                        border-color: #262626 !important;
                                    }
                                    html.dark .tox-silver-sink .tox-collection__item,
                                    html.dark .tox-silver-sink .tox-collection__item * {
                                        color: #e5e7eb !important;
                                    }
                                    html.dark .tox-silver-sink .tox-collection__item--active,
                                    html.dark .tox-silver-sink .tox-collection__item--enabled,
                                    html.dark .tox-silver-sink .tox-collection__item:focus,
                                    html.dark .tox-silver-sink .tox-collection__item:hover {
                                        background: #3f3f46 !important;
                                    }
                                    /* Fix text rendering in menus to avoid white shadow/glow artifacts */
                                    html.dark .tox-silver-sink .tox-collection__item-label *, 
                                    html.dark .tox-silver-sink .tox-collection__item-label h1,
                                    html.dark .tox-silver-sink .tox-collection__item-label h2,
                                    html.dark .tox-silver-sink .tox-collection__item-label h3,
                                    html.dark .tox-silver-sink .tox-collection__item-label h4,
                                    html.dark .tox-silver-sink .tox-collection__item-label h5,
                                    html.dark .tox-silver-sink .tox-collection__item-label h6,
                                    html.dark .tox-silver-sink .tox-collection__item-label p,
                                    html.dark .tox-silver-sink .tox-collection__item-label span {
                                        text-shadow: none !important;
                                        box-shadow: none !important;
                                        color: #e5e7eb !important;
                                        background: transparent !important;
                                        -webkit-font-smoothing: antialiased;
                                        font-weight: normal !important; /* Optional: might want to keep headings bold, but this resets the artifacts */
                                    }
                                    /* Restore bold for headings if desired, but cleanly */
                                    html.dark .tox-silver-sink .tox-collection__item-label h1,
                                    html.dark .tox-silver-sink .tox-collection__item-label h2,
                                    html.dark .tox-silver-sink .tox-collection__item-label h3,
                                    html.dark .tox-silver-sink .tox-collection__item-label h4,
                                    html.dark .tox-silver-sink .tox-collection__item-label b,
                                    html.dark .tox-silver-sink .tox-collection__item-label strong {
                                        font-weight: 700 !important;
                                    }
                                    /* Force toolbar bottom border and any other separators to specific color */
                                    .tox[data-custom-dark="1"] .tox-toolbar__primary {
                                        border-bottom: 1px solid #262626 !important;
                                        background: #262626 !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-anchorbar {
                                        background: #262626 !important;
                                        border-bottom: 1px solid #262626 !important;
                                    }
                                    /* Ensure the edit area border is also matching or removed */
                                    .tox[data-custom-dark="1"] .tox-edit-area__iframe,
                                    .tox[data-custom-dark="1"] .tox-edit-area {
                                        background: #262626 !important;
                                        border: none !important;
                                    }
                                    /* Handle StatusBar (even if hidden, sometimes container remains) */
                                    .tox[data-custom-dark="1"] .tox-statusbar {
                                        background-color: #262626 !important;
                                        border-top: 1px solid #262626 !important;
                                        color: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-statusbar__text,
                                    .tox[data-custom-dark="1"] .tox-statusbar__path-item,
                                    .tox[data-custom-dark="1"] .tox-statusbar__wordcount {
                                        color: #e5e7eb !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-statusbar__resize-handle svg {
                                        fill: #e5e7eb !important;
                                    }
                                    /* Aggressively target SVG fills for icons */
                                    .tox[data-custom-dark="1"] .tox-tbtn svg,
                                    .tox[data-custom-dark="1"] .tox-tbtn svg * {
                                        fill: #e5e7eb !important;
                                        color: #e5e7eb !important;
                                    }
                                    
                                    /* Blanket rule for all backgrounds and borders in dark mode to be #262626 */
                                    .tox[data-custom-dark="1"] .tox-sidebar-wrap,
                                    .tox[data-custom-dark="1"] .tox-edit-area__iframe,
                                    .tox[data-custom-dark="1"] .tox-menubar,
                                    .tox[data-custom-dark="1"] .tox-toolbar,
                                    .tox[data-custom-dark="1"] .tox-toolbar-overlord,
                                    .tox[data-custom-dark="1"] .tox-toolbar__primary,
                                    .tox[data-custom-dark="1"] .tox-toolbar__overflow,
                                    .tox[data-custom-dark="1"] .tox-toolbar__group,
                                    .tox[data-custom-dark="1"] .tox-statusbar,
                                    .tox[data-custom-dark="1"] .tox-throbber,
                                    .tox[data-custom-dark="1"] .tox-editor-container,
                                    .tox[data-custom-dark="1"] .tox-sidebar-wrap,
                                    .tox[data-custom-dark="1"] .tox-dialog,
                                    .tox[data-custom-dark="1"] .tox-dialog__header,
                                    .tox[data-custom-dark="1"] .tox-dialog__footer,
                                    .tox[data-custom-dark="1"] .tox-dialog__body {
                                        background: #262626 !important;
                                        background-color: #262626;                                        
                                    }
                                    
                                    /* Specific overrides for borders that need to exist but match color (if any) */
                                    .tox[data-custom-dark="1"] .tox-toolbar__primary {
                                         background: #262626 !important;
                                         background-color: #262626 !important;
                                         background-image: none !important;
                                         border-bottom: 1px solid #262626 !important;
                                    }
                                    
                                    /* Tooltips must also match */
                                    .tox[data-custom-dark="1"] .tox-tooltip,
                                    .tox[data-custom-dark="1"] .tox-tooltip__body {
                                        background: #262626 !important;
                                        background-color: #262626 !important;
                                        color: #e5e7eb !important;
                                        border: 1px solid #3f3f46 !important; /* Subtle border for visibility */
                                        box-shadow: none !important;
                                    }
                                    .tox[data-custom-dark="1"] .tox-tooltip__arrow {
                                        border-top-color: #262626 !important;
                                    }
                                    
                                    /* Re-apply hover states which might be overridden by blanket rule */
                                    .tox[data-custom-dark="1"] .tox-tbtn:hover,
                                    .tox[data-custom-dark="1"] .tox-tbtn:focus,
                                    .tox[data-custom-dark="1"] .tox-tbtn--enabled,
                                    .tox[data-custom-dark="1"] .tox-tbtn--enabled:hover {
                                        background: #3f3f46 !important;
                                    }
                                    `;

                                    const styleEl = document.createElement('style');
                                    styleEl.setAttribute('data-rte-dark-style', '');
                                    styleEl.textContent = css;
                                    document.head.appendChild(styleEl);
                                    uiCustomStyleRef.current = styleEl;
                                } catch { }
                            } else {
                                try { container.removeAttribute('data-custom-dark'); } catch { }
                            }
                        }
                    });

                    const handler = () => {
                        if (!onChange) return;
                        if (changeTimeoutRef.current) {
                            clearTimeout(changeTimeoutRef.current);
                        }
                        changeTimeoutRef.current = setTimeout(() => {
                            try {
                                const content = editor.getContent();
                                onChange(content);
                            } catch { }
                        }, Math.max(0, onChangeDebounceMs || 0));
                    };
                    // Kurangi event: hindari keyup agar tidak trigger tiap ketikan
                    editor.on('input undo redo change', handler);
                },
            });
        };

        void init();

        // Listen for theme (dark class) and system pref changes, re-init editor on change
        const handleThemeChange = () => {
            try {
                const nowDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
                if (isDarkRef.current === null || nowDark === isDarkRef.current) {
                    return; // no change
                }
                // Preserve current content
                let currentContent = '';
                try {
                    if (editorRef.current) currentContent = editorRef.current.getContent();
                } catch { }
                initialContentRef.current = currentContent;
                // Teardown existing editor and UI skin
                if (editorRef.current) {
                    try { editorRef.current.remove(); } catch { }
                    editorRef.current = null;
                }
                if (uiSkinLinkRef.current && uiSkinLinkRef.current.parentNode) {
                    try { uiSkinLinkRef.current.parentNode.removeChild(uiSkinLinkRef.current); } catch { }
                    uiSkinLinkRef.current = null;
                }
                if (uiCustomStyleRef.current && uiCustomStyleRef.current.parentNode) {
                    try { uiCustomStyleRef.current.parentNode.removeChild(uiCustomStyleRef.current); } catch { }
                    uiCustomStyleRef.current = null;
                }
                // Re-init with new theme
                void init();
            } catch { }
        };

        let mo: MutationObserver | null = null;
        try {
            mo = new MutationObserver(() => handleThemeChange());
            mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        } catch { }

        let mq: MediaQueryList | null = null;
        const mqListener = () => handleThemeChange();
        try {
            if (window.matchMedia) {
                mq = window.matchMedia('(prefers-color-scheme: dark)');
                // Support modern and older APIs
                // @ts-ignore
                (mq.addEventListener ? mq.addEventListener('change', mqListener) : mq.addListener(mqListener));
            }
        } catch { }

        return () => {
            active = false;
            try {
                if (editorRef.current) {
                    editorRef.current.remove();
                    editorRef.current = null;
                }
                if (uiSkinLinkRef.current && uiSkinLinkRef.current.parentNode) {
                    try { uiSkinLinkRef.current.parentNode.removeChild(uiSkinLinkRef.current); } catch { }
                    uiSkinLinkRef.current = null;
                }
                if (uiCustomStyleRef.current && uiCustomStyleRef.current.parentNode) {
                    try { uiCustomStyleRef.current.parentNode.removeChild(uiCustomStyleRef.current); } catch { }
                    uiCustomStyleRef.current = null;
                }
                if (mo) {
                    try { mo.disconnect(); } catch { }
                    mo = null;
                }
                if (mq) {
                    try {
                        // @ts-ignore
                        (mq.removeEventListener ? mq.removeEventListener('change', mqListener) : mq.removeListener(mqListener));
                    } catch { }
                    mq = null;
                }
                if (changeTimeoutRef.current) {
                    clearTimeout(changeTimeoutRef.current);
                    changeTimeoutRef.current = null;
                }
            } catch {
                // ignore
            }
        };

    }, []);

    // Sync external value changes into the editor
    useEffect(() => {
        const ed = editorRef.current;
        // Hindari setContent saat editor fokus agar tidak mengganggu mengetik
        if (ed && typeof value === 'string') {
            let current = '';
            try {
                current = ed.getContent();
            } catch { }
            if (value !== current && !ed.hasFocus()) {
                ed.setContent(value);
            }
        }
    }, [value]);

    return <textarea ref={textareaRef} id={id} name={name} defaultValue={value} />;
};

// Export default component
export default RichTextEditor;
export { RichTextEditor };
