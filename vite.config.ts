
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
        // Prevent "process is not defined" error in browser for libraries expecting Node env
        'process.env': {}
    },
    build: {
        target: 'es2022',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    utils: ['react-hook-form', '@tanstack/react-query', 'zod', 'zustand'],
                    charts: ['chart.js', 'react-chartjs-2'],
                    pdf: ['jspdf', 'jspdf-autotable'],
                    // Keep AI separate so it doesn't block main bundle
                    ai: ['@google/genai']
                },
            },
        },
    },
});
