
import React, { ReactNode } from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Context Imports (using relative paths)
import { ThemeProvider } from '../shared/ThemeContext';
import { ToastProvider } from '../shared/ToastContext';
import { LanguageProvider } from '../shared/LanguageContext';
import ErrorBoundary from '../shared/ErrorBoundary';

interface AppProvidersProps {
    children: ReactNode;
}

// Robust Query Client Configuration
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1, // Retry failed requests once
            refetchOnWindowFocus: false, // Prevent refetching when tab is switched
            staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
            throwOnError: false, // Don't crash the app on query errors
        },
        mutations: {
            retry: 0, // Don't retry mutations automatically
        }
    }
});

// Smart Router Selection logic
const getRouter = () => {
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

    return isPreviewEnv ? HashRouter : BrowserRouter;
};

const Router = getRouter();

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <ErrorBoundary>
            <Router>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <ToastProvider>
                            <LanguageProvider>
                                {children}
                            </LanguageProvider>
                        </ToastProvider>
                    </ThemeProvider>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </Router>
        </ErrorBoundary>
    );
};
