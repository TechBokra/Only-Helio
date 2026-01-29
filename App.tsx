
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import ScrollToTop from './components/shared/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Permission } from './types';
import ToastContainer from './components/shared/ToastContainer';
import BackToTopButton from './components/shared/BackToTopButton';
import { useLanguage } from './components/shared/LanguageContext';
import { adminNavLinks, partnerNavLinks } from './data/navigation';
import LoadingFallback from './components/shared/LoadingFallback';
import { lazyWithRetry } from './utils/lazyWithRetry';

// --- Layouts (Static Imports to avoid waterfall) ---
import DashboardLayout from './components/shared/DashboardLayout';
import PublicLayout from './components/shared/PublicLayout';

// --- Route Groups ---
import PartnerRoutes from './components/partner-dashboard/PartnerRoutes';
import AdminRoutes from './components/admin/AdminRoutes';

// --- Public Pages (Lazy Loaded with Retry) ---
const HomePage = lazyWithRetry(() => import('./components/home/HomePage'));
const PropertiesPage = lazyWithRetry(() => import('./components/properties/PropertiesPage'));
const ProjectsPage = lazyWithRetry(() => import('./components/projects/ProjectsPage'));
const PropertyDetailsPage = lazyWithRetry(() => import('./components/properties/PropertyDetailsPage'));
const ProjectDetailsPage = lazyWithRetry(() => import('./components/projects/ProjectDetailsPage'));
const FinishingPage = lazyWithRetry(() => import('./components/finishing/FinishingPage'));
const DecorationsPage = lazyWithRetry(() => import('./components/decorations/DecorationsPage'));
const ContactPage = lazyWithRetry(() => import('./components/contact/ContactPage'));
const FavoritesPage = lazyWithRetry(() => import('./components/favorites/FavoritesPage'));
const PartnerProfilePage = lazyWithRetry(() => import('./components/partners/PartnerProfilePage'));
const AddPropertyPage = lazyWithRetry(() => import('./components/forms/AddPropertyPage'));
const ServiceRequestPage = lazyWithRetry(() => import('./components/forms/ServiceRequestPage'));
const LoginPage = lazyWithRetry(() => import('./components/auth/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./components/auth/RegisterPage'));
const PaymentPage = lazyWithRetry(() => import('./components/finance/PaymentPage'));
const PrivacyPolicyPage = lazyWithRetry(() => import('./components/legal/PrivacyPolicyPage'));
const TermsOfUsePage = lazyWithRetry(() => import('./components/legal/TermsOfUsePage'));
const NotFoundPage = lazyWithRetry(() => import('./components/shared/NotFoundPage'));
const AIEstimatorPage = lazyWithRetry(() => import('./components/tools/AIEstimatorPage'));


const App: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div>
            <ScrollToTop />
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* ================================================================== */}
                    {/*                        Protected Partner Dashboard                   */}
                    {/* ================================================================== */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <ProtectedRoute permission={Permission.VIEW_PARTNER_DASHBOARD}>
                                <DashboardLayout navLinks={partnerNavLinks} pageTitle={t.dashboard.title} />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="*" element={<PartnerRoutes />} />
                    </Route>

                    {/* ================================================================== */}
                    {/*                   Protected Super Admin Dashboard                  */}
                    {/* ================================================================== */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute permission={Permission.VIEW_ADMIN_DASHBOARD}>
                                <DashboardLayout navLinks={adminNavLinks} pageTitle={t.adminDashboard.title} />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="*" element={<AdminRoutes />} />
                    </Route>

                    {/* ================================================================== */}
                    {/*                       Public Routes & Catch-all                    */}
                    {/* ================================================================== */}
                    <Route path="/" element={<PublicLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="properties" element={<PropertiesPage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="properties/:propertyId" element={<PropertyDetailsPage />} />
                        <Route path="projects/:projectId" element={<ProjectDetailsPage />} />
                        <Route path="finishing" element={<FinishingPage />} />
                        <Route path="estimator" element={<AIEstimatorPage />} />
                        <Route path="decorations" element={<DecorationsPage />} />
                        <Route path="contact" element={<ContactPage />} />
                        <Route path="favorites" element={<FavoritesPage />} />
                        <Route path="partners/:partnerId" element={<PartnerProfilePage />} />
                        <Route path="add-property" element={<AddPropertyPage />} />
                        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="terms-of-use" element={<TermsOfUsePage />} />
                        <Route path="request-service" element={<ServiceRequestPage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="payment" element={<PaymentPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </Suspense>
            <ToastContainer />
            <BackToTopButton />
        </div>
    );
};

export default App;
