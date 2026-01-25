<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <meta name="theme-color" content="#black">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title inertia>{{ config('app.name', 'Laravel') }}</title>
        <script>
            // Block notifications BEFORE anything else loads
            (function() {
                if ('Notification' in window) {
                    Object.defineProperty(window, 'Notification', {
                        value: function() {
                            console.log('Notifications blocked');
                            return null;
                        },
                        writable: false,
                        configurable: false
                    });
                    
                    Object.defineProperty(window.Notification, 'permission', {
                        get: () => 'denied',
                        configurable: false
                    });
                    
                    window.Notification.requestPermission = () => Promise.resolve('denied');
                }
                
                // Unregister service workers
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(regs => {
                        regs.forEach(reg => reg.unregister());
                    });
                }
            })();
        </script>

        {{-- Inline script to detect system dark mode preference --}}


        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
                overscroll-behavior-y: none; /* Prevent pull-to-refresh bounce on body */
                -webkit-tap-highlight-color: transparent; /* Remove outline on tap */
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }

            body {
                user-select: none; /* Disable text selection for app-like feel */
                -webkit-user-select: none;
                -webkit-touch-callout: none; /* Disable long-press context menu */
            }
            
            /* Re-enable select for inputs so users can type */
            input, textarea, [contenteditable="true"] {
                user-select: text;
                -webkit-user-select: text;
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
