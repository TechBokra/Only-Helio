
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingFallback from '../shared/LoadingFallback';

// --- Admin Dashboard Pages (Lazy Loaded) ---
const AdminHomePage = React.lazy(() => import('./AdminHomePage'));
const AdminAnalyticsPage = React.lazy(() => import('./AdminAnalyticsPage'));
const AdminReportsPage = React.lazy(() => import('./AdminReportsPage'));
const AdminUsersPage = React.lazy(() => import('./users/AdminUsersPage'));
const AdminUserFormPage = React.lazy(() => import('./users/AdminUserFormPage')); // New
const AdminRolesPage = React.lazy(() => import('./users/AdminRolesPage'));
const AdminPlansPage = React.lazy(() => import('./AdminPlansPage'));
const AdminPlanEditPage = React.lazy(() => import('./AdminPlanEditPage')); // New
const AdminFilterManagementPage = React.lazy(() => import('./AdminFilterManagementPage'));
const AdminBannersPage = React.lazy(() => import('./banners/AdminBannersPage'));
const AdminBannerFormPage = React.lazy(() => import('./content/AdminBannerFormPage')); // New
const AdminSettingsPage = React.lazy(() => import('./AdminSettingsPage'));
const AdminProfilePage = React.lazy(() => import('./AdminProfilePage'));
const PropertyFormPage = React.lazy(() => import('../forms/PropertyFormPage'));
const ProjectFormPage = React.lazy(() => import('../forms/ProjectFormPage'));
const AdminPlatformPropertiesPage = React.lazy(() => import('./platform-ops/AdminPlatformPropertiesPage'));
const AdminPlatformFinishingPage = React.lazy(() => import('./platform-ops/AdminPlatformFinishingPage'));
const AdminPlatformDecorationsPage = React.lazy(() => import('./platform-ops/AdminPlatformDecorationsPage'));
const AdminAllRequestsPage = React.lazy(() => import('./requests/AdminAllRequestsPage'));
const AdminRequestDetailsPage = React.lazy(() => import('./requests/AdminRequestDetailsPage'));
const AdminCreateRequestPage = React.lazy(() => import('./requests/AdminCreateRequestPage'));
const AdminPartnersLayout = React.lazy(() => import('./partners/AdminPartnersLayout'));
const AdminPartnersDashboard = React.lazy(() => import('./partners/AdminPartnersDashboard'));
const AdminPartnersPage = React.lazy(() => import('./partners/AdminPartnersPage'));
const AdminPartnerFormPage = React.lazy(() => import('./partners/AdminPartnerFormPage')); // New
const AdminProjectsPage = React.lazy(() => import('./partners/AdminProjectsPage'));
const AdminInquiryManagementPage = React.lazy(() => import('./inquiryManagement/AdminInquiryManagementPage'));
const AdminPropertiesLayout = React.lazy(() => import('./properties/AdminPropertiesLayout'));
const AdminPropertiesDashboard = React.lazy(() => import('./properties/AdminPropertiesDashboard'));
const AdminPropertiesListPage = React.lazy(() => import('./properties/AdminPropertiesListPage'));
const AdminContentLayout = React.lazy(() => import('./content/AdminContentLayout'));
const ContentHeroPage = React.lazy(() => import('./content/ContentHeroPage'));
const ContentWhyUsPage = React.lazy(() => import('./content/ContentWhyUsPage'));
const ContentServicesPage = React.lazy(() => import('./content/ContentServicesPage'));
const ContentPartnersPage = React.lazy(() => import('./content/ContentPartnersPage'));
const ContentTestimonialsPage = React.lazy(() => import('./content/ContentTestimonialsPage'));
const ContentSocialProofPage = React.lazy(() => import('./content/ContentSocialProofPage'));
const ContentWhyNewHeliopolisPage = React.lazy(() => import('./content/ContentWhyNewHeliopolisPage'));
const ContentQuotesPage = React.lazy(() => import('./content/ContentQuotesPage'));
const ContentFooterPage = React.lazy(() => import('./content/ContentFooterPage'));
const ContentProjectsPage = React.lazy(() => import('./content/ContentProjectsPage'));
const ContentFinishingPage = React.lazy(() => import('./content/ContentFinishingPage'));
const ContentDecorationsPage = React.lazy(() => import('./content/ContentDecorationsPage'));
const ContentCTAPage = React.lazy(() => import('./content/ContentCTAPage'));
const ContentHomeListingsPage = React.lazy(() => import('./content/ContentHomeListingsPage'));
const ContentPrivacyPolicyPage = React.lazy(() => import('./content/ContentPrivacyPolicyPage'));
const ContentTermsOfUsePage = React.lazy(() => import('./content/ContentTermsOfUsePage'));
const RoutingRulesPage = React.lazy(() => import('./automation/RoutingRulesPage'));
const AllNotificationsPage = React.lazy(() => import('../shared/AllNotificationsPage'));
const AdminFinancePage = React.lazy(() => import('./finance/AdminFinancePage'));
const AdminFormsPage = React.lazy(() => import('./forms/AdminFormsPage'));
const AdminPortfolioFormPage = React.lazy(() => import('./decorations/AdminPortfolioFormPage')); // New

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

                <Route path="requests/new" element={<AdminCreateRequestPage />} /> 
                <Route path="requests" element={<AdminAllRequestsPage />} />
                <Route path="requests/:requestId" element={<AdminRequestDetailsPage />} />

                <Route path="platform-properties" element={<AdminPlatformPropertiesPage />} />
                <Route path="platform-finishing/*" element={<AdminPlatformFinishingPage />} />
                
                {/* Decorations Routes */}
                <Route path="platform-decorations/*" element={<AdminPlatformDecorationsPage />} />
                <Route path="platform-decorations/portfolio/new" element={<AdminPortfolioFormPage />} />
                <Route path="platform-decorations/portfolio/edit/:itemId" element={<AdminPortfolioFormPage />} />

                <Route path="decorations-management/*" element={<Navigate to="platform-decorations" replace />} />
                <Route path="finishing-management/*" element={<Navigate to="platform-finishing" replace />} />

                <Route path="partner-requests" element={<Navigate to="/admin/requests?type=PARTNER_APPLICATION" replace />} />
                <Route path="partner-requests/:requestId" element={<Navigate to="/admin/requests/:requestId" replace />} />
                <Route path="contact-requests" element={<Navigate to="/admin/requests?type=CONTACT_MESSAGE" replace />} />
                <Route path="leads" element={<Navigate to="/admin/requests?type=LEAD" replace />} />
                <Route path="finishing-requests" element={<Navigate to="/admin/platform-finishing" replace />} />
                
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
                <Route path="projects/edit/:projectId" element={<ProjectFormPage />} />

                <Route path="users" element={<AdminUsersPage />} />
                <Route path="users/new" element={<AdminUserFormPage />} />
                <Route path="users/edit/:userId" element={<AdminUserFormPage />} />
                
                <Route path="properties" element={<AdminPropertiesLayout />}>
                    <Route index element={<AdminPropertiesDashboard />} />
                    <Route path="list" element={<AdminPropertiesListPage />} />
                    <Route path="listing-requests" element={<Navigate to="/admin/requests?type=PROPERTY_LISTING_REQUEST" replace />} />
                    <Route path="listing-requests/:requestId" element={<Navigate to="/admin/requests/:requestId" replace />} />
                    <Route path="search-requests" element={<Navigate to="/admin/requests?type=PROPERTY_INQUIRY" replace />} />
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
