import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

export const usePropertyFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Simplified: Only Essential Filters
    const filters = useMemo(() => ({
        view: searchParams.get('view') || 'grid',
        status: searchParams.get('status') || 'all',
        type: searchParams.get('type') || 'all',
        query: searchParams.get('q') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        project: searchParams.get('project') || 'all',
        finishing: searchParams.get('finishing') || 'all',
        beds: searchParams.get('beds') || '',
        baths: searchParams.get('baths') || '',
    }), [searchParams]);
    
    const page = useMemo(() => parseInt(searchParams.get('page') || '1', 10), [searchParams]);

    const setFilter = useCallback((filterName: string, value: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            
            if (value === 'all' || value === '') {
                newParams.delete(filterName);
            } else {
                newParams.set(filterName, value);
            }
            
            if (filterName !== 'view') {
                newParams.delete('page');
            }
            return newParams;
        }, { replace: true });
    }, [setSearchParams]);
    
    const setPage = useCallback((newPage: number) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev);
            newParams.set('page', String(newPage));
            return newParams;
        }, { replace: true });
    }, [setSearchParams]);

    const resetFilters = useCallback(() => {
        setSearchParams(prev => {
            const currentView = prev.get('view');
            const newParams = new URLSearchParams();
            if (currentView) {
                newParams.set('view', currentView);
            }
            return newParams;
        }, { replace: true });
    }, [setSearchParams]);

    return useMemo(() => ({
        ...filters,
        page,
        setFilter,
        setPage,
        resetFilters,
    }), [filters, page, setFilter, setPage, resetFilters]);
};