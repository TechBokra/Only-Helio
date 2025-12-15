
import { useMemo, useCallback } from 'react';
import type { Property, Project, PortfolioItem } from '../types';
import { useAuthStore } from '../store/useAuthStore'; // Corrected import to use store
import { getPlanLimit } from '../utils/subscriptionUtils';
import { useQuery } from '@tanstack/react-query';
import { getPropertiesByPartnerId } from '../services/properties';
import { getProjectsByPartnerId } from '../services/projects';
import { getPortfolioByPartnerId } from '../services/portfolio';

type UsageType = 'properties' | 'projects' | 'units' | 'portfolio';

export const useSubscriptionUsage = (usageType: UsageType) => {
    const currentUser = useAuthStore((state) => state.currentUser);
    const userId = currentUser?.id || '';

    // Fetch Partner Specific Data (DB Optimized)
    const { 
        data: partnerProperties, 
        isLoading: isLoadingProperties, 
        isError: isErrorProperties,
        refetch: refetchProperties 
    } = useQuery({ 
        queryKey: [`partner-properties`, userId], 
        queryFn: () => getPropertiesByPartnerId(userId), 
        enabled: !!userId && (usageType === 'properties' || usageType === 'units')
    });

    const { 
        data: partnerProjects, 
        isLoading: isLoadingProjects, 
        isError: isErrorProjects,
        refetch: refetchProjects 
    } = useQuery({ 
        queryKey: [`partner-projects`, userId], 
        queryFn: () => getProjectsByPartnerId(userId), 
        enabled: !!userId && usageType === 'projects'
    });

    const { 
        data: partnerPortfolio, 
        isLoading: isLoadingPortfolio, 
        isError: isErrorPortfolio,
        refetch: refetchPortfolio 
    } = useQuery({ 
        queryKey: [`partner-portfolio`, userId], 
        queryFn: () => getPortfolioByPartnerId(userId), 
        enabled: !!userId && usageType === 'portfolio'
    });

    const isLoading = isLoadingProperties || isLoadingProjects || isLoadingPortfolio;
    const isError = isErrorProperties || isErrorProjects || isErrorPortfolio;

    const refetchAll = useCallback(() => {
        if (usageType === 'properties' || usageType === 'units') refetchProperties();
        if (usageType === 'projects') refetchProjects();
        if (usageType === 'portfolio') refetchPortfolio();
    }, [refetchProperties, refetchProjects, refetchPortfolio, usageType]);

    const data = useMemo(() => {
        if (!currentUser) return [];
        switch (usageType) {
            case 'properties':
            case 'units':
                return partnerProperties || [];
            case 'projects':
                return partnerProjects || [];
            case 'portfolio':
                return partnerPortfolio || [];
            default:
                return [];
        }
    }, [partnerProperties, partnerProjects, partnerPortfolio, currentUser, usageType]);

    const usageCount = useMemo(() => data.length, [data]);

    const limit = useMemo(() => {
        if (!currentUser || !('type' in currentUser)) return Infinity;
        return getPlanLimit(currentUser.type, currentUser.subscriptionPlan, usageType);
    }, [currentUser, usageType]);

    const isLimitReached = useMemo(() => {
        if (limit === Infinity) return false;
        return usageCount >= limit;
    }, [usageCount, limit]);

    return {
        data: data as (Property[] | Project[] | PortfolioItem[]),
        isLoading,
        isError,
        usageCount,
        limit,
        isLimitReached,
        refetch: refetchAll,
    };
};
