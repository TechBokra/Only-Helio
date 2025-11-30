import React from 'react';

const LoadingFallback: React.FC = () => (
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
    </div>
);

export default LoadingFallback;
