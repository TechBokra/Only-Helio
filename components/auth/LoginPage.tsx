
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Permission } from '../../types';
import { Input } from '../ui/Input';
import { SiteLogo } from '../shared/SiteLogo';
import { rolePermissions } from '../../data/permissions';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import { useSiteContent } from '../../hooks/useSiteContent';
import { Checkbox } from '../ui/Checkbox';

const LoginPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { data: siteContent } = useSiteContent();
    const siteName = siteContent?.siteName?.[language] || 'ONLY HELIO';
    const t_auth = t.auth;
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    // Load saved email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('onlyhelio_saved_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Handle Remember Me logic
        if (rememberMe) {
            localStorage.setItem('onlyhelio_saved_email', email);
        } else {
            localStorage.removeItem('onlyhelio_saved_email');
        }

        const user = await login(email, password);

        if (user) {
            const permissions = rolePermissions.get(user.role) || [];
            const isAdmin = permissions.includes(Permission.VIEW_ADMIN_DASHBOARD);

            if (isAdmin) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        } else {
            setError(t_auth.loginError);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-amber-500 mb-6">
                        <SiteLogo className="h-12 w-12" />
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                        {siteName}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t_auth.loginSubtitle}
                    </p>
                </div>
                
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t_auth.email}
                            </label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {t_auth.password}
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Checkbox 
                                id="remember-me" 
                                checked={rememberMe} 
                                onCheckedChange={(checked) => setRememberMe(!!checked)} 
                            />
                            <label htmlFor="remember-me" className={`ml-2 block text-sm text-gray-900 dark:text-gray-300 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>
                                {language === 'ar' ? 'تذكرني' : 'Remember me'}
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-amber-600 hover:text-amber-500">
                                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                            </a>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <Button type="submit" isLoading={loading} className="w-full" size="lg">
                           {t_auth.loginButton}
                        </Button>
                    </div>
                </form>
                
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                        <Button variant="link" onClick={() => navigate('/register')} className="p-0 h-auto font-bold text-amber-600">
                            {t.joinAsPartner}
                        </Button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
