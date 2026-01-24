
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '../ui/Icons';
import { useDebounce } from '../../hooks/useDebounce';

type SortDirection = 'ascending' | 'descending';

export type SortConfig<T> = {
    key: keyof T | string; // Allow string for dot notation
    direction: SortDirection;
} | null;

// Generic helper for safe nested property access
function getNestedValue<T>(obj: T, path: string): unknown {
    if (!path) return obj;
    return path.split('.').reduce<unknown>((o, i) => {
        if (o === null || o === undefined) return undefined;
        // Cast to Record to access by string key
        return (o as Record<string, unknown>)[i];
    }, obj);
}

export function useAdminTable<T>({
    data = [],
    itemsPerPage = 10,
    initialSort,
    initialFilters = {},
    searchFn,
    filterFns,
}: {
    data: T[] | undefined;
    itemsPerPage?: number;
    initialSort: SortConfig<T>;
    initialFilters?: Record<string, string>;
    searchFn: (item: T, searchTerm: string) => boolean;
    filterFns: Record<string, (item: T, value: string) => boolean>;
}) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<SortConfig<T>>(initialSort);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [filters, setFilters] = useState<Record<string, string>>(initialFilters);

    // Sync initial filters if they change externally
    useEffect(() => {
        if (Object.keys(initialFilters).length > 0) {
            setFilters(prev => ({ ...prev, ...initialFilters }));
        }
    }, [initialFilters]);

    const setFilter = useCallback((key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setCurrentPage(1); 
    }, []);

    const processedData = useMemo(() => {
        if (!data) return [];
        let items = [...data];

        // 1. Search
        if (debouncedSearchTerm.trim()) {
            const lowercasedTerm = debouncedSearchTerm.trim().toLowerCase();
            items = items.filter((item) => searchFn(item, lowercasedTerm));
        }

        // 2. Filter
        for (const key in filters) {
            if (Object.prototype.hasOwnProperty.call(filters, key)) {
                const value = filters[key];
                if (value && value !== 'all' && filterFns[key]) {
                    items = items.filter((item) => filterFns[key](item, value));
                }
            }
        }

        // 3. Sort
        if (sortConfig) {
            items.sort((a, b) => {
                const aVal = getNestedValue(a, sortConfig.key as string);
                const bVal = getNestedValue(b, sortConfig.key as string);
                const dir = sortConfig.direction === 'ascending' ? 1 : -1;

                // Handle Null/Undefined
                if (aVal === bVal) return 0;
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                // Numeric Sort
                if (typeof aVal === 'number' && typeof bVal === 'number') {
                    return (aVal - bVal) * dir;
                }
                
                // Boolean Sort
                if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                    return (aVal === bVal ? 0 : aVal ? -1 : 1) * dir;
                }

                // String Sort
                return String(aVal).localeCompare(String(bVal)) * dir;
            });
        }
        return items;
    }, [data, debouncedSearchTerm, filters, sortConfig, searchFn, filterFns]);

    // Reset page if data length changes significantly (e.g. search filter applied)
    useEffect(() => {
        const newTotalPages = Math.ceil(processedData.length / itemsPerPage);
        if (currentPage > newTotalPages) {
            setCurrentPage(Math.max(1, newTotalPages));
        }
    }, [processedData.length, itemsPerPage, currentPage]);

    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return processedData.slice(start, start + itemsPerPage);
    }, [processedData, currentPage, itemsPerPage]);

    const requestSort = useCallback(
        (key: string) => {
            setSortConfig(current => {
                if (current?.key === key && current.direction === 'ascending') {
                    return { key, direction: 'descending' };
                }
                return { key, direction: 'ascending' };
            });
        },
        []
    );

    const getSortIcon = useCallback(
        (key: string) => {
            if (sortConfig?.key !== key) {
                return (
                    <span className="w-4 h-4 ml-1 inline-block opacity-0 group-hover:opacity-50 transition-opacity">
                        <ArrowUpIcon />
                    </span>
                );
            }
            return sortConfig.direction === 'ascending' ? (
                <ArrowUpIcon className="w-4 h-4 ml-1 inline-block text-amber-500" />
            ) : (
                <ArrowDownIcon className="w-4 h-4 ml-1 inline-block text-amber-500" />
            );
        },
        [sortConfig]
    );

    return {
        paginatedItems,
        totalPages,
        currentPage,
        setCurrentPage,
        searchTerm,
        setSearchTerm,
        filters,
        setFilter,
        requestSort,
        getSortIcon,
    };
}
