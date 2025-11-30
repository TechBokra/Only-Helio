
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * DEPRECATED: This file is a duplicate and has been replaced by 
 * components/admin/inquiryManagement/AdminInquiryManagementPage.tsx
 * 
 * It is retained as a placeholder to prevent build errors if referenced elsewhere, 
 * but it simply redirects to the parent route.
 */
const AdminInquiryManagementPage: React.FC = () => {
    return <Navigate to="/admin/partners/inquiry-routing" replace />;
};

export default AdminInquiryManagementPage;
