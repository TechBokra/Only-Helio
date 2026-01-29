
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingFallback from '../shared/LoadingFallback';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

// --- Partner Dashboard Pages (Lazy Loaded with Retry) ---
const DashboardHomePage = lazyWithRetry(() => import('./DashboardHomePage'));
const DashboardProfilePage = lazyWithRetry(() => import('./DashboardProfilePage'));
const DashboardPortfolioPage = lazyWithRetry(() => import('./DashboardPortfolioPage'));
const DashboardPropertiesPage = lazyWithRetry(() => import('./DashboardPropertiesPage'));
const DashboardProjectsPage = lazyWithRetry(() => import('./DashboardProjectsPage'));
const DashboardProjectDetailsPage = lazyWithRetry(() => import('./DashboardProjectDetailsPage'));
const DashboardLeadsPage = lazyWithRetry(() => import('./DashboardLeadsPage'));
const DashboardSubscriptionPage = lazyWithRetry(() => import('./DashboardSubscriptionPage'));
const DashboardFinancePage = lazyWithRetry(() => import('./DashboardFinancePage'));
const DashboardAnalyticsPage = lazyWithRetry(() => import('./DashboardAnalyticsPage'));
const DashboardServicesPage = lazyWithRetry(() => import('./DashboardServicesPage'));
const PropertyFormPage = lazyWithRetry(() => import('../forms/PropertyFormPage'));
const ProjectFormPage = lazyWithRetry(() => import('../forms/ProjectFormPage'));
const PartnerLeadDetailsPage = lazyWithRetry(() => import('./PartnerLeadDetailsPage'));
const AllNotificationsPage = lazyWithRetry(() => import('../shared/AllNotificationsPage'));

const PartnerRoutes: React.FC = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route index element={<DashboardHomePage />} />
                <Route path="profile" element={<DashboardProfilePage />} />
                <Route path="portfolio" element={<DashboardPortfolioPage />} />
                <Route path="services" element={<DashboardServicesPage />} /> 
                <Route path="properties" element={<DashboardPropertiesPage />} />
                <Route path="properties/new" element={<PropertyFormPage />} />
                <Route path="properties/edit/:propertyId" element={<PropertyFormPage />} />
                <Route path="projects" element={<DashboardProjectsPage />} />
                <Route path="projects/new" element={<ProjectFormPage />} />
                <Route path="projects/edit/:projectId" element={<ProjectFormPage />} />
                <Route path="projects/:projectId" element={<DashboardProjectDetailsPage />} />
                <Route path="leads" element={<DashboardLeadsPage />} />
                <Route path="leads/:leadId" element={<PartnerLeadDetailsPage />} />
                <Route path="subscription" element={<DashboardSubscriptionPage />} />
                <Route path="finance" element={<DashboardFinancePage />} />
                <Route path="analytics" element={<DashboardAnalyticsPage />} />
                <Route path="notifications" element={<AllNotificationsPage />} />
            </Routes>
        </Suspense>
    );
};

export default PartnerRoutes;
