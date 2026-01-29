
import { useMemo, useCallback } from 'react';
import type { Property, Project, PortfolioItem, SubscriptionPlanDetails } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { getLimitFromPlan } from '../../utils/subscriptionUtils';
import { useQuery } from '@tanstack/react-query';
import { getPropertiesByPartnerId } from '../../services/properties';
import { getProjectsByPartnerId } from '../../services/projects';
import { getPortfolioByPartnerId } from '../../services/portfolio';
import { getPlans } from '../../services/plans';
import { useLanguage } from './LanguageContext';

type UsageType = 'properties' | 'projects' | 'units' | 'portfolio';

export const useSubscriptionUsage = (usageType: UsageType) => {
    const { language } = useLanguage();
    const currentUser = useAuthStore((state) => state.currentUser);
    const userId = currentUser?.id || '';

    // 1. Fetch Plans Config
    const { data: allPlans, isLoading: isLoadingPlans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });

    // 2. Fetch User Data
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

    const isLoading = isLoadingProperties || isLoadingProjects || isLoadingPortfolio || isLoadingPlans;
    const isError = isErrorProperties || isErrorProjects || isErrorPortfolio;

    const refetchAll = useCallback(() => {
        if (usageType === 'properties' || usageType === 'units') refetchProperties();
        if (usageType === 'projects') refetchProjects();
        if (usageType === 'portfolio') refetchPortfolio();
    }, [refetchProperties, refetchProjects, refetchPortfolio, usageType]);

    // 3. Determine Current Plan Details
    const currentPlanDetails = useMemo(() => {
        if (!currentUser || !allPlans) return undefined;
        // Logic to find the plan object based on user type/role
        const planCategory = currentUser.type; // developer, agency, finishing
        if (allPlans[planCategory]) {
            return allPlans[planCategory][currentUser.subscriptionPlan]?.[language];
        }
        return undefined;
    }, [currentUser, allPlans, language]);

    // 4. Calculate Usage & Limits
    const usageData = useMemo(() => {
        if (!currentUser) return { count: 0, saleCount: 0, rentCount: 0 };
        
        let rawData: any[] = [];
        if (usageType === 'properties' || usageType === 'units') rawData = partnerProperties || [];
        else if (usageType === 'projects') rawData = partnerProjects || [];
        else if (usageType === 'portfolio') rawData = partnerPortfolio || [];

        // Count split for properties
        const saleCount = rawData.filter(i => (i as Property).status?.en === 'For Sale').length;
        const rentCount = rawData.filter(i => (i as Property).status?.en === 'For Rent').length;
        
        return { count: rawData.length, saleCount, rentCount, rawData };

    }, [partnerProperties, partnerProjects, partnerPortfolio, usageType, currentUser]);


    const limits = useMemo(() => {
        if (!currentPlanDetails) return { total: Infinity, sale: Infinity, rent: Infinity };
        
        return {
            total: getLimitFromPlan(currentPlanDetails, usageType),
            sale: usageType === 'properties' ? getLimitFromPlan(currentPlanDetails, 'propertiesSale') : Infinity,
            rent: usageType === 'properties' ? getLimitFromPlan(currentPlanDetails, 'propertiesRent') : Infinity,
        };
    }, [currentPlanDetails, usageType]);

    // 5. Determine Checks
    const isLimitReached = useMemo(() => {
        if (limits.total === -1) return false; // Unlimited
        return usageData.count >= limits.total;
    }, [usageData.count, limits.total]);

    const isSaleLimitReached = useMemo(() => {
        if (limits.sale === -1) return false;
        return usageData.saleCount >= limits.sale;
    }, [usageData.saleCount, limits.sale]);

    const isRentLimitReached = useMemo(() => {
        if (limits.rent === -1) return false;
        return usageData.rentCount >= limits.rent;
    }, [usageData.rentCount, limits.rent]);

    return {
        data: usageData.rawData as (Property[] | Project[] | PortfolioItem[]),
        isLoading,
        isError,
        usageCount: usageData.count,
        limit: limits.total,
        isLimitReached,
        // New Granular Checks
        limits,
        counts: { total: usageData.count, sale: usageData.saleCount, rent: usageData.rentCount },
        canAddSale: !isLimitReached && !isSaleLimitReached,
        canAddRent: !isLimitReached && !isRentLimitReached,
        refetch: refetchAll,
        currentPlanDetails
    };
};