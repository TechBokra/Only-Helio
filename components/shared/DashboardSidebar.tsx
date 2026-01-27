
import React, { useMemo, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { 
    ChevronDoubleLeftIcon, ChevronDoubleRightIcon, LogoutIcon, CloseIcon, GlobeAltIcon
} from '../ui/Icons';
import { SiteLogo } from './SiteLogo';
import { type Partner, Permission, Role } from '../../types';
import ErrorBoundary from './ErrorBoundary';
import type { NavLinkItem } from '../../data/navigation';

interface DashboardSidebarProps {
  user: Partner;
  navLinks: NavLinkItem[];
  onLogout: () => void;
  hasPermission: (permission: Permission) => boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const SidebarContent: React.FC<Omit<DashboardSidebarProps, 'isOpen' | 'setIsOpen' | 'setIsCollapsed'> & {onLinkClick: () => void}> = ({
    user,
    navLinks,
    onLogout,
    hasPermission,
    isCollapsed,
    onLinkClick
}) => {
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';

    const visibleNavLinks = useMemo(() => {
        if (!user) return [];
        return navLinks.filter(link => 
            hasPermission(link.permission) && 
            (!link.roles || link.roles.includes(user.role))
        );
    }, [navLinks, hasPermission, user]);
    
    const linkGroups = useMemo(() => {
        const groupOrder = [
            'Overview', 
            'Real Estate',
            'Operations',
            'Partners',
            'Communications',
            'System',
            'Partner'
        ];
        const groups: { [key: string]: typeof visibleNavLinks } = {};
        
        visibleNavLinks.forEach(link => {
            if (!groups[link.group]) groups[link.group] = [];
            groups[link.group].push(link);
        });

        return groupOrder
            .map(groupName => ({ name: groupName, links: groups[groupName] }))
            .filter(group => group.links && group.links.length > 0);
            
    }, [visibleNavLinks]);

    // @ts-ignore
    const partnerName = t.partnerInfo?.[user.id]?.name || user.name;

    return (
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-4 py-4 dashboard-sidebar border-r border-gray-200 dark:border-gray-700">
             <div className={`flex h-16 shrink-0 items-center gap-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <SiteLogo className="h-8 w-auto text-amber-500" />
                <span className={`font-bold text-lg text-gray-800 dark:text-white transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>ONLY HELIO</span>
            </div>
            
            <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                         <div className={`text-center space-y-2 ${isCollapsed ? 'px-1' : ''}`}>
                             <img src={user.imageUrl} alt={partnerName} className={`mx-auto border-2 border-amber-500 object-cover rounded-full transition-all duration-300 bg-gray-100 ${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'}`} />
                            <div className={`transition-all duration-200 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
                                 <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate" title={partnerName}>{partnerName}</h2>
                                 <p className="text-xs text-amber-500 capitalize truncate">{user.role === Role.SUPER_ADMIN ? 'Super Admin' : t.adminDashboard.partnerTypes[user.type as keyof typeof t.adminDashboard.partnerTypes] || user.type}</p>
                            </div>
                        </div>
                    </li>
                    
                    {linkGroups.map((group) => (
                         <li key={group.name}>
                            <div className={`text-xs font-bold leading-6 text-gray-400 dark:text-gray-500 px-2 uppercase tracking-wider mb-1 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0 pointer-events-none' : 'opacity-100'}`}>
                                {group.name === 'Overview' && language === 'ar' ? 'نظرة عامة' : 
                                 group.name === 'Real Estate' && language === 'ar' ? 'سوق العقارات' :
                                 group.name === 'Operations' && language === 'ar' ? 'العمليات والخدمات' :
                                 group.name === 'Partners' && language === 'ar' ? 'الشركاء' :
                                 group.name === 'Communications' && language === 'ar' ? 'التواصل' :
                                 group.name === 'System' && language === 'ar' ? 'النظام' :
                                 group.name}
                            </div>
                            <ul role="list" className="-mx-2 space-y-1">
                                {group.links.map(link => {
                                    const Icon = link.icon;
                                    let linkName = link.name(t);
                                    if (link.href === '/admin/requests' && user.role !== Role.SUPER_ADMIN) {
                                        linkName = t.adminDashboard.nav.myRequests;
                                    }

                                    return (
                                        <li key={link.href} className="relative group">
                                            <NavLink 
                                                to={link.href} 
                                                end={link.exact} 
                                                onClick={onLinkClick}
                                                className={({isActive}) => `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500' : 'text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                            >
                                                <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                                                <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute' : 'opacity-100 w-auto'}`}>{linkName}</span>
                                            </NavLink>
                                            {isCollapsed && (
                                                <div className={`absolute ${isRTL ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg`}>
                                                    {linkName}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>
                    ))}

                    <li className="mt-auto">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-1">
                            <Link 
                                to="/" 
                                className={`group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-amber-600 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                                title={language === 'ar' ? 'العودة للموقع' : 'Return to Website'}
                            >
                                <GlobeAltIcon className="h-6 w-6 shrink-0 group-hover:text-amber-600" />
                                <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute' : 'opacity-100 w-auto'}`}>
                                    {language === 'ar' ? 'العودة للموقع' : 'Return to Website'}
                                </span>
                            </Link>

                            <button 
                                onClick={onLogout} 
                                title={t.auth.logout} 
                                className={`w-full group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                            >
                                <LogoutIcon className="h-6 w-6 shrink-0 group-hover:text-red-700" />
                                <span className={`transition-all duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0 overflow-hidden absolute' : 'opacity-100 w-auto'}`}>{t.auth.logout}</span>
                            </button>
                        </div>
                    </li>
                </ul>
            </nav>
        </div>
    )
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = (props) => {
    const { isOpen, setIsOpen, isCollapsed, setIsCollapsed } = props;
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    }, [isCollapsed]);

    return (
        <ErrorBoundary fallback={<div className="w-20 bg-gray-100 h-full flex items-center justify-center text-red-500">Error</div>}>
            {/* Mobile sidebar */}
            <div className={`relative z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`} role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-gray-900/80 transition-opacity" onClick={() => setIsOpen(false)} />
                <div className="fixed inset-0 flex">
                    <div className={`relative flex h-full w-full max-w-xs flex-1 transition-transform duration-300 ease-in-out 
                        ${isRTL ? 'ml-auto' : 'mr-auto'} 
                        ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}`
                    }>
                        <div className={`absolute top-0 flex w-16 justify-center pt-5 ${isRTL ? 'right-full' : 'left-full'}`}>
                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setIsOpen(false)}>
                                <span className="sr-only">Close sidebar</span>
                                <CloseIcon className="h-6 w-6 text-white" />
                            </button>
                        </div>
                        <SidebarContent {...props} isCollapsed={false} onLinkClick={() => setIsOpen(false)} />
                    </div>
                </div>
            </div>

            {/* Desktop sidebar */}
            <div className={`hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-[width] duration-300 ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
                <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
                    <SidebarContent {...props} onLinkClick={() => {}} />
                    <div className="flex flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="w-full flex items-center justify-center p-1 text-gray-500 dark:text-gray-400 hover:text-amber-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            <span className="sr-only">Collapse sidebar</span>
                             {isRTL ? (
                                isCollapsed ? <ChevronDoubleLeftIcon className="h-5 w-5" /> : <ChevronDoubleRightIcon className="h-5 w-5" />
                            ) : (
                                isCollapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default DashboardSidebar;
