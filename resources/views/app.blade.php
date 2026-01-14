<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            // Mobile "Desktop Mode" Detection
            (function() {
                // Check if current page is already the download app page to avoid infinite loop
                if (window.location.pathname === '/download-app') return;

                function isMobileDesktopMode() {
                    var userAgent = navigator.userAgent;
                    var maxTouchPoints = navigator.maxTouchPoints || 0;
                    
                    // iPadOS 13+ requests desktop site by default (Macintosh UA but has touch points)
                    var isIPad = userAgent.includes('Macintosh') && maxTouchPoints > 0;
                    
                    // Specific check for Android/Other mobile devices requesting desktop site
                    // They often hide "Mobile" from UA but still have touch points and mobile-like screen dimensions
                    var isAndroidDesktop = !userAgent.includes('Mobile') && maxTouchPoints > 0 && (window.screen.width < 1024 || window.screen.height < 1024);

                    return isIPad || isAndroidDesktop;
                }

                if (isMobileDesktopMode()) {
                    window.location.href = '/download-app';
                }
            })();

            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
