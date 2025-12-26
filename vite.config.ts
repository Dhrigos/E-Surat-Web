import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

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
    ],
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        strictPort: true,
        cors: {
            origin: [
                'https://project-bacadnas.dhrigo.biz.id',
                'https://api-project-bacadnas.dhrigo.biz.id',
            ],
            credentials: true,
        },
        hmr: {
            host: 'api-project-bacadnas.dhrigo.biz.id',
            clientPort: 443,
            protocol: 'wss',
        },
        watch: {
            usePolling: true,
            ignored: ['**/vendor/**', '**/node_modules/**'],
        },
        allowedHosts: [
            "api-project-bacadnas.dhrigo.biz.id",
        ],
    },
});
