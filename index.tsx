import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
// AuthProvider and FavoritesProvider are removed (Zustand handles this now)
import { ToastProvider } from './components/shared/ToastContext';
import { LanguageProvider } from './components/shared/LanguageContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import ErrorBoundary from './components/shared/ErrorBoundary';
import { ThemeProvider } from './components/shared/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Could not find root element to mount to');
}

// Robust Query Client Configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1, // Retry failed requests once
            refetchOnWindowFocus: false, // Prevent refetching when tab is switched (better UX for forms)
            staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
            throwOnError: false, // Don't crash the app on query errors, let components handle isError state
        },
        mutations: {
            retry: 0, // Don't retry mutations (like form submissions) automatically to prevent duplication
        }
    }
});

// Smart Router Selection
const hostname = window.location.hostname;
const href = window.location.href;

const isPreviewEnv = 
    hostname.includes('googleusercontent.com') || 
    hostname.includes('usercontent.goog') || 
    href.includes('usercontent.goog') || 
    hostname.includes('webcontainer.io') ||
    hostname.includes('stackblitz.io') ||
    hostname.includes('codesandbox.io') ||
    (hostname.includes('.goog') && !hostname.includes('www.google.com'));

const Router = isPreviewEnv ? HashRouter : BrowserRouter;

const root = createRoot(rootElement);
root.render(
    <React.StrictMode>
        <ErrorBoundary>
            <Router>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <ToastProvider>
                            <LanguageProvider>
                                <App />
                            </LanguageProvider>
                        </ToastProvider>
                    </ThemeProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </Router>
        </ErrorBoundary>
    </React.StrictMode>,
);
