import React from 'react';
import { SiteLogo } from './SiteLogo';

const LoadingFallback: React.FC = () => (
    <div className="flex flex-col justify-center items-center gap-4 bg-gray-50 dark:bg-gray-900" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
            <div className="relative bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg border border-amber-100 dark:border-gray-700">
                <SiteLogo className="h-12 w-12 text-amber-500 animate-pulse" />
            </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium animate-pulse">Loading...</p>
    </div>
);

export default LoadingFallback;