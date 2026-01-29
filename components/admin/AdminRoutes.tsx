
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingFallback from '../shared/LoadingFallback';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

// --- Admin Dashboard Pages (Lazy Loaded with Retry) ---
const AdminHomePage = lazyWithRetry(() => import('./AdminHomePage'));
const AdminAnalyticsPage = lazyWithRetry(() => import('./AdminAnalyticsPage'));
const AdminReportsPage = lazyWithRetry(() => import('./AdminReportsPage'));
const AdminUsersPage = lazyWithRetry(() => import('./users/AdminUsersPage'));
const AdminUserFormPage = lazyWithRetry(() => import('./users/AdminUserFormPage'));
const AdminRolesPage = lazyWithRetry(() => import('./users/AdminRolesPage'));
const AdminPlansPage = lazyWithRetry(() => import('./AdminPlansPage'));
const AdminPlanEditPage = lazyWithRetry(() => import('./AdminPlanEditPage'));
const AdminFilterManagementPage = lazyWithRetry(() => import('./AdminFilterManagementPage'));
const AdminBannersPage = lazyWithRetry(() => import('./banners/AdminBannersPage'));
const AdminBannerFormPage = lazyWithRetry(() => import('./content/AdminBannerFormPage'));
const AdminSettingsPage = lazyWithRetry(() => import('./AdminSettingsPage'));
const AdminProfilePage = lazyWithRetry(() => import('./AdminProfilePage'));
const PropertyFormPage = lazyWithRetry(() => import('../forms/PropertyFormPage'));
const ProjectFormPage = lazyWithRetry(() => import('../forms/ProjectFormPage'));
const AdminPlatformPropertiesPage = lazyWithRetry(() => import('./platform-ops/AdminPlatformPropertiesPage'));
const AdminPlatformFinishingPage = lazyWithRetry(() => import('./platform-ops/AdminPlatformFinishingPage'));
const AdminPlatformDecorationsPage = lazyWithRetry(() => import('./platform-ops/AdminPlatformDecorationsPage'));

// --- Specific Request Pages (Separated) ---
const AdminPartnerRequestsPage = lazyWithRetry(() => import('./requests/AdminPartnerRequestsPage'));
const AdminPropertyRequestsPage = lazyWithRetry(() => import('./requests/AdminPropertyRequestsPage'));
const AdminPropertyInquiriesPage = lazyWithRetry(() => import('./requests/AdminPropertyInquiriesPage'));
const AdminContactRequestsPage = lazyWithRetry(() => import('./requests/AdminContactRequestsPage'));
const AdminFinishingRequestsPage = lazyWithRetry(() => import('./requests/AdminFinishingRequestsPage'));
const AdminDecorationRequestsPage = lazyWithRetry(() => import('./requests/AdminDecorationRequestsPage'));

const AdminPartnerRequestDetailsPage = lazyWithRetry(() => import('./requests/AdminPartnerRequestDetailsPage'));
const AdminPropertyRequestDetailsPage = lazyWithRetry(() => import('./requests/AdminPropertyRequestDetailsPage'));
const AdminRequestDetailsPage = lazyWithRetry(() => import('./requests/AdminRequestDetailsPage')); // Generic fallback
const AdminDecorationRequestDetailsPage = lazyWithRetry(() => import('./requests/AdminDecorationRequestDetailsPage')); 
const AdminCreateRequestPage = lazyWithRetry(() => import('./requests/AdminCreateRequestPage'));

const AdminPartnersLayout = lazyWithRetry(() => import('./partners/AdminPartnersLayout'));
const AdminPartnersDashboard = lazyWithRetry(() => import('./partners/AdminPartnersDashboard'));
const AdminPartnersPage = lazyWithRetry(() => import('./partners/AdminPartnersPage'));
const AdminPartnerFormPage = lazyWithRetry(() => import('./partners/AdminPartnerFormPage'));
const AdminProjectsPage = lazyWithRetry(() => import('./partners/AdminProjectsPage'));
const AdminInquiryManagementPage = lazyWithRetry(() => import('./inquiryManagement/AdminInquiryManagementPage'));
const AdminPropertiesLayout = lazyWithRetry(() => import('./properties/AdminPropertiesLayout'));
const AdminPropertiesDashboard = lazyWithRetry(() => import('./properties/AdminPropertiesDashboard'));
const AdminPropertiesListPage = lazyWithRetry(() => import('./properties/AdminPropertiesListPage'));
const AdminContentLayout = lazyWithRetry(() => import('./content/AdminContentLayout'));
const ContentHeroPage = lazyWithRetry(() => import('./content/ContentHeroPage'));
const ContentWhyUsPage = lazyWithRetry(() => import('./content/ContentWhyUsPage'));
const ContentServicesPage = lazyWithRetry(() => import('./content/ContentServicesPage'));
const ContentPartnersPage = lazyWithRetry(() => import('./content/ContentPartnersPage'));
const ContentTestimonialsPage = lazyWithRetry(() => import('./content/ContentTestimonialsPage'));
const ContentSocialProofPage = lazyWithRetry(() => import('./content/ContentSocialProofPage'));
const ContentWhyNewHeliopolisPage = lazyWithRetry(() => import('./content/ContentWhyNewHeliopolisPage'));
const ContentQuotesPage = lazyWithRetry(() => import('./content/ContentQuotesPage'));
const ContentFooterPage = lazyWithRetry(() => import('./content/ContentFooterPage'));
const ContentProjectsPage = lazyWithRetry(() => import('./content/ContentProjectsPage'));
const ContentFinishingPage = lazyWithRetry(() => import('./content/ContentFinishingPage'));
const ContentDecorationsPage = lazyWithRetry(() => import('./content/ContentDecorationsPage'));
const ContentCTAPage = lazyWithRetry(() => import('./content/ContentCTAPage'));
const ContentHomeListingsPage = lazyWithRetry(() => import('./content/ContentHomeListingsPage'));
const ContentPrivacyPolicyPage = lazyWithRetry(() => import('./content/ContentPrivacyPolicyPage'));
const ContentTermsOfUsePage = lazyWithRetry(() => import('./content/ContentTermsOfUsePage'));
const RoutingRulesPage = lazyWithRetry(() => import('./automation/RoutingRulesPage'));
const AllNotificationsPage = lazyWithRetry(() => import('../shared/AllNotificationsPage'));
const AdminFinancePage = lazyWithRetry(() => import('./finance/AdminFinancePage'));
const AdminFormsPage = lazyWithRetry(() => import('./forms/AdminFormsPage'));
const AdminPortfolioFormPage = lazyWithRetry(() => import('./decorations/AdminPortfolioFormPage'));
const AdminAIEstimatorPage = lazyWithRetry(() => import('./AdminAIEstimatorPage'));

const AdminRoutes: React.FC = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                <Route index element={<AdminHomePage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="finance" element={<AdminFinancePage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="automation" element={<RoutingRulesPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
                <Route path="notifications" element={<AllNotificationsPage />} />
                
                <Route path="forms" element={<AdminFormsPage />} />
                <Route path="ai-estimator" element={<AdminAIEstimatorPage />} />

                <Route path="requests/new" element={<AdminCreateRequestPage />} /> 
                <Route path="requests/:requestId" element={<AdminRequestDetailsPage />} />

                <Route path="platform-properties" element={<AdminPlatformPropertiesPage />} />
                <Route path="platform-finishing/*" element={<AdminPlatformFinishingPage />} />
                
                {/* Decorations Routes */}
                <Route path="platform-decorations/*" element={<AdminPlatformDecorationsPage />} />
                <Route path="platform-decorations/portfolio/new" element={<AdminPortfolioFormPage />} />
                <Route path="platform-decorations/portfolio/edit/:itemId" element={<AdminPortfolioFormPage />} />

                <Route path="decorations-management/*" element={<Navigate to="platform-decorations" replace />} />
                <Route path="finishing-management/*" element={<Navigate to="platform-finishing" replace />} />

                {/* Explicitly Separated Request Routes */}
                <Route path="partner-requests" element={<AdminPartnerRequestsPage />} />
                <Route path="partner-requests/:requestId" element={<AdminPartnerRequestDetailsPage />} />
                
                <Route path="property-requests" element={<AdminPropertyRequestsPage />} />
                <Route path="property-requests/:requestId" element={<AdminPropertyRequestDetailsPage />} />
                
                {/* Contact Requests */}
                <Route path="contact-requests" element={<AdminContactRequestsPage />} />
                <Route path="contact-requests/:requestId" element={<AdminRequestDetailsPage />} />
                
                {/* Property Inquiries */}
                <Route path="property-inquiries" element={<AdminPropertyInquiriesPage />} />
                <Route path="property-inquiries/:requestId" element={<AdminRequestDetailsPage />} />
                
                <Route path="finishing-requests" element={<AdminFinishingRequestsPage />} />
                <Route path="finishing-requests/:requestId" element={<AdminRequestDetailsPage />} /> 

                <Route path="decoration-requests" element={<AdminDecorationRequestsPage />} />
                <Route path="decoration-requests/:requestId" element={<AdminDecorationRequestDetailsPage />} />
                
                <Route path="partners" element={<AdminPartnersLayout />}>
                    <Route index element={<AdminPartnersDashboard />} />
                    <Route path="list" element={<AdminPartnersPage />} />
                    <Route path="new" element={<AdminPartnerFormPage />} />
                    <Route path="edit/:partnerId" element={<AdminPartnerFormPage />} />
                    <Route path="inquiry-routing" element={<AdminInquiryManagementPage />} />
                    <Route path="plans" element={<AdminPlansPage availableCategories={['developer', 'agency', 'individual']} />} />
                    <Route path="plans/edit/:planCategory/:planKey" element={<AdminPlanEditPage />} />
                </Route>
                
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="projects/new" element={<ProjectFormPage />} />
                <Route path="projects/edit/:projectId" element={<ProjectFormPage />} />

                <Route path="users" element={<AdminUsersPage />} />
                <Route path="users/new" element={<AdminUserFormPage />} />
                <Route path="users/edit/:userId" element={<AdminUserFormPage />} />
                
                <Route path="properties" element={<AdminPropertiesLayout />}>
                    <Route index element={<AdminPropertiesDashboard />} />
                    <Route path="list" element={<AdminPropertiesListPage />} />
                    <Route path="listing-requests" element={<Navigate to="/admin/property-requests" replace />} />
                    <Route path="search-requests" element={<Navigate to="/admin/property-inquiries" replace />} />
                    <Route path="filters" element={<AdminFilterManagementPage />} />
                </Route>
                <Route path="properties/new" element={<PropertyFormPage />} />
                <Route path="properties/edit/:propertyId" element={<PropertyFormPage />} />

                <Route path="roles" element={<AdminRolesPage />} />
                
                <Route path="banners" element={<AdminBannersPage />} />
                <Route path="banners/new" element={<AdminBannerFormPage />} />
                <Route path="banners/edit/:bannerId" element={<AdminBannerFormPage />} />
                
                <Route path="content" element={<AdminContentLayout />}>
                    <Route index element={<Navigate to="hero" replace />} />
                    <Route path="hero" element={<ContentHeroPage />} />
                    <Route path="home-listings" element={<ContentHomeListingsPage />} />
                    <Route path="home-cta" element={<ContentCTAPage />} />
                    <Route path="why-us" element={<ContentWhyUsPage />} />
                    <Route path="services" element={<ContentServicesPage />} />
                    <Route path="partners" element={<ContentPartnersPage />} />
                    <Route path="projects-page" element={<ContentProjectsPage />} />
                    <Route path="finishing-page" element={<ContentFinishingPage />} />
                    <Route path="decorations-page" element={<ContentDecorationsPage />} />
                    <Route path="testimonials" element={<ContentTestimonialsPage />} />
                    <Route path="social-proof" element={<ContentSocialProofPage />} />
                    <Route path="why-new-heliopolis" element={<ContentWhyNewHeliopolisPage />} />
                    <Route path="quotes" element={<ContentQuotesPage />} />
                    <Route path="footer" element={<ContentFooterPage />} />
                    <Route path="privacy-policy" element={<ContentPrivacyPolicyPage />} />
                    <Route path="terms-of-use" element={<ContentTermsOfUsePage />} />
                </Route>
                
                <Route path="settings" element={<AdminSettingsPage />} />
                
            </Routes>
        </Suspense>
    );
};

export default AdminRoutes;
