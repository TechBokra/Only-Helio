
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Permission } from '../../types';
import { Input } from '../ui/Input';
import { SiteLogo } from '../shared/SiteLogo';
import { rolePermissions } from '../../data/permissions';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';

const LoginPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_auth = t.auth;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState<boolean>(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLoginAndRedirect = async (emailToLogin: string) => {
        const user = await login(emailToLogin, password || 'password'); // Default password if empty for manual entry fallback

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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await handleLoginAndRedirect(email);
        setLoading(false);
    };

    return (
        <div className="py-20 bg-white flex items-center justify-center">
            <div className="w-full max-w-lg p-8 space-y-8 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center justify-center gap-3 text-3xl font-bold text-amber-500 mb-4">
                        <SiteLogo className="h-10 w-10" />
                        <span className="text-2xl">ONLY HELIO</span>
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">{t_auth.loginTitle}</h1>
                    <p className="mt-2 text-gray-600">{t_auth.loginSubtitle}</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">{t_auth.email}</label>
                            <Input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                placeholder={t_auth.email}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div className="pt-4">
                            <label htmlFor="password" className="sr-only">{t_auth.password}</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                placeholder={t_auth.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <Button type="submit" isLoading={loading} className="w-full" size="lg">
                           {t_auth.loginButton}
                        </Button>
                    </div>
                </form>
                 <div className="text-center">
                    <Button variant="link" onClick={() => navigate('/register')}>
                        {t.joinAsPartner}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
