
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useLanguage } from '../../shared/LanguageContext';

const AdminFinishingLayout: React.FC = () => {
    const { language, t } = useLanguage();
    const t_tabs = t.adminDashboard.finishingManagement.tabs;
    const t_page = t.adminDashboard.finishingManagement;

    const tabs = [
        { 
            name: t_tabs.dashboard, 
            href: '/admin/platform-finishing', 
            exact: true 
        },
        // "Plans" redirected to the main plans management view filtered by category
        { 
            name: t_tabs.plans, 
            href: '/admin/partners/plans', 
            exact: false,
            // Custom click behavior could be handled, but simple link is safer
            // Note: Since this is outside the router context of the parent slightly, we use NavLink for visual consistency 
            // but we might want it to point to a different route structure.
            // If we want to keep it in the layout visual, we can make it external.
        },
    ];

    const baseClasses = "px-4 py-3 font-semibold text-sm md:text-md border-b-4 transition-colors duration-200 whitespace-nowrap";
    const activeClasses = "border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-900/10";
    const inactiveClasses = "border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-300 hover:bg-gray-50 dark:hover:bg-gray-800";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t_page.title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    {t_page.subtitle}
                </p>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                 <div className="flex -mb-px" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <NavLink
                        to="/admin/platform-finishing"
                        end
                        className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                    >
                        {t_tabs.dashboard}
                    </NavLink>
                    {/* Direct link to unified plans management */}
                    <NavLink
                        to="/admin/partners/plans"
                        className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                    >
                        {t_tabs.plans}
                    </NavLink>
                </div>
            </div>
            
            <div className="min-h-[500px]">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminFinishingLayout;
