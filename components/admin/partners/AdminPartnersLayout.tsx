import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useLanguage } from '../../shared/LanguageContext';

const AdminPartnersLayout: React.FC = () => {
    const { language, t } = useLanguage();
    const t_nav = t.adminDashboard.nav;

    const tabs = [
        { name: t_nav.dashboard, href: '/admin/partners', exact: true },
        { name: t_nav.partnersList, href: '/admin/partners/list', exact: false },
        { name: t_nav.inquiryRouting, href: '/admin/partners/inquiry-routing', exact: false },
        { name: t_nav.subscriptionPlans, href: '/admin/partners/plans', exact: false },
    ];

    const baseClasses = "px-4 py-3 font-semibold text-md border-b-4 transition-colors duration-200";
    const activeClasses = "border-amber-500 text-amber-500";
    const inactiveClasses = "border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50";

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_nav.partners}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage partners and inquiry routing from one place.</p>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                 <div className="flex flex-wrap -mb-px" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    {tabs.map(tab => (
                        <NavLink
                            key={tab.href}
                            to={tab.href}
                            end={tab.exact}
                            className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
                        >
                            {tab.name}
                        </NavLink>
                    ))}
                </div>
            </div>
            
            <Outlet />
        </div>
    );
};

export default AdminPartnersLayout;