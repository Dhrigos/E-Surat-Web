import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        VitePWA({
            registerType: 'autoUpdate',
            outDir: 'public',
            buildBase: '/',
            scope: '/',
            workbox: {
                cleanupOutdatedCaches: true,
                directoryIndex: null,
            },
            manifest: {
                name: 'E-Surat Web',
                short_name: 'E-Surat',
                description: 'Aplikasi E-Surat Modern',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: '/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        cors: {
            origin: '*',
            credentials: true,
        },
        allowedHosts: ['api.bacadnas.com', 'wss.bacadnas.com'],
        hmr: {
            host: 'api.bacadnas.com',
            clientPort: 443,
            protocol: 'wss',
        },
        watch: {
            usePolling: true,
            ignored: ['**/vendor/**', '**/node_modules/**'],
        },
    },
    optimizeDeps: {
        include: ['react-easy-crop', 'tslib'],
    },
});
