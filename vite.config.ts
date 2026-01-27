
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './'),
            'api': path.resolve(__dirname, './services'),
        },
    },
    define: {
        'process.env': {}
    },
    build: {
        target: 'es2022',
        outDir: 'dist',
        sourcemap: false, // Disable sourcemaps in production for security/size
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-libs': ['framer-motion', 'chart.js', 'react-chartjs-2'],
                    'data-libs': ['@tanstack/react-query', 'zod', 'react-hook-form', 'zustand'],
                    'utils': ['jspdf', 'jspdf-autotable'],
                    'db-client': ['@supabase/supabase-js'],
                    'ai-sdk': ['@google/genai'] // Keep AI separate as it's heavy and specific
                },
            },
        },
    },
    server: {
        port: 5173,
        strictPort: true,
    }
});
