
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * DEPRECATED: This file has been moved to ../inquiryManagement/AdminInquiryManagementPage.tsx
 * This component now serves as a redirect to ensure no broken links.
 */
const AdminInquiryManagementPage: React.FC = () => {
    return <Navigate to="/admin/partners/inquiry-routing" replace />;
};

export default AdminInquiryManagementPage;
