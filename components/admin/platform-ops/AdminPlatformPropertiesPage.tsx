
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllProperties } from '../../../services/properties';
import { useLanguage } from '../../shared/LanguageContext';
import { Property } from '../../../types';
import AdminPropertiesListPage from '../properties/AdminPropertiesListPage';

const AdminPlatformPropertiesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;

    const { data: allProperties, isLoading } = useQuery({ 
        queryKey: ['allPropertiesAdmin'], 
        queryFn: getAllProperties 
    });

    const platformProperties = useMemo(() => {
        return (allProperties || []).filter(p => 
            p.partnerId === 'individual-listings' || 
            p.partnerId === 'admin-user' ||
            p.partnerId.includes('platform') // Future proofing if specific platform IDs used
        );
    }, [allProperties]);
    
    const subtitle = language === 'ar' 
        ? 'إدارة العقارات المعروضة مباشرة من خلال المنصة أو نيابة عن الملاك الأفراد.' 
        : 'Manage properties listed directly through the platform or on behalf of individual owners.';

    return (
        <AdminPropertiesListPage
            title={t_admin.nav.platformProperties}
            subtitle={subtitle}
            properties={platformProperties}
            isLoading={isLoading}
            hideFilters={['partner', 'source']} // Hide partner filter since these are platform props
        />
    );
};

export default AdminPlatformPropertiesPage;
