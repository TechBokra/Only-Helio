
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import type { Partner } from '../../types';
import { LightBulbIcon, HeartIcon, MenuIcon, PlusIcon, UserPlusIcon } from '../ui/Icons';
import { SiteLogo } from './SiteLogo';
import { useLanguage } from './LanguageContext';
import NotificationBell from './NotificationBell';

interface HeaderProps {
    onToggleQuietZone: () => void;
    onOpenMobileNav: () => void;
    currentUser: Partner | null;
    dashboardPath: string;
    dashboardText: string;
    logout: () => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({ 
    onToggleQuietZone,
    onOpenMobileNav,
    currentUser,
    dashboardPath,
    dashboardText,
    logout
}) => {
    const { language, setLanguage, t } = useLanguage();

    const navLinks = [
        { name: t.nav.home, href: '/' },
        { name: t.nav.properties, href: '/properties' },
        { name: t.nav.projects, href: '/projects' },
        { name: t.nav.finishing, href: '/finishing' },
        { name: t.nav.decorations, href: '/decorations' },
        // Contact removed to save space
    ];

    const activeLinkClass = 'text-amber-500 font-semibold';
    const inactiveLinkClass = 'text-gray-600 hover:text-amber-500';

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm border-b border-gray-200">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-16 lg:h-20">
                    <Link to="/" className="flex items-center gap-3 text-3xl font-bold text-amber-500">
                        <SiteLogo className="h-10 w-10" />
                        <span className="text-2xl hidden sm:block">ONLY HELIO</span>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-6 text-base xl:text-lg">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.href}
                                end={link.href === '/'}
                                className={({ isActive }) =>
                                    `${isActive ? activeLinkClass : inactiveLinkClass} transition-colors duration-200`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Call to Actions (Visible on Desktop) */}
                        <div className="hidden lg:flex items-center gap-2">
                            {/* Join as Partner (Business) */}
                            {!currentUser && (
                                <Link 
                                    to="/register" 
                                    className="flex items-center gap-2 text-amber-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-amber-50 transition-colors border border-amber-200"
                                >
                                    <UserPlusIcon className="w-4 h-4" />
                                    {t.joinAsPartner}
                                </Link>
                            )}

                            {/* List Property (Individual) */}
                            <Link 
                                to="/add-property" 
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                            >
                                <PlusIcon className="w-4 h-4" />
                                {t.addProperty}
                            </Link>
                        </div>

                        {currentUser && (
                            <div className="flex items-center justify-center">
                                <NotificationBell />
                            </div>
                        )}
                        <Link
                            to="/favorites"
                            className="hidden lg:block text-gray-500 hover:text-amber-500 transition-colors"
                            aria-label="Favorites"
                        >
                            <HeartIcon className="h-6 w-6" />
                        </Link>
                        <button
                            onClick={onToggleQuietZone}
                            className="hidden lg:block text-gray-500 hover:text-amber-500 transition-colors"
                            aria-label="Quiet Zone"
                        >
                            <LightBulbIcon className="h-6 w-6" />
                        </button>
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                            className="hidden lg:flex items-center justify-center h-10 w-10 rounded-full border border-gray-300 text-gray-600 font-semibold text-lg hover:border-amber-500 hover:text-amber-500 transition-colors"
                            aria-label="Toggle language"
                        >
                            {language === 'en' ? 'ع' : 'En'}
                        </button>
                        
                        {/* Auth Buttons / Profile */}
                        <div className="hidden lg:flex items-center gap-2 border-s border-gray-200 ps-4">
                            {currentUser ? (
                                <>
                                    <Link
                                        to={dashboardPath}
                                        className="text-gray-700 font-semibold hover:text-amber-500 transition-colors text-sm"
                                    >
                                        {dashboardText}
                                    </Link>
                                    <button
                                        onClick={logout}
                                        className="text-gray-500 hover:text-red-500 transition-colors text-sm"
                                    >
                                        {t.auth.logout}
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="text-gray-700 font-semibold hover:text-amber-500 transition-colors text-sm"
                                >
                                    {t.auth.login}
                                </Link>
                            )}
                        </div>
                        
                        <div className="lg:hidden">
                            <button
                                onClick={onOpenMobileNav}
                                className="text-gray-600"
                                aria-label="Open menu"
                                aria-controls="mobile-nav-menu"
                            >
                                <MenuIcon className="h-7 w-7" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
});

export default Header;
