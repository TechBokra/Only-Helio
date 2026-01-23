
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    UserPlusIcon, 
    ClipboardDocumentListIcon, 
    InboxIcon, 
    WrenchScrewdriverIcon, 
    SparklesIcon, 
    SearchIcon,
    ArrowRightIcon,
    ArrowLeftIcon
} from '../../ui/Icons';
import { useLanguage } from '../../shared/LanguageContext';
import { Card, CardContent } from '../../ui/Card';
import { getAllPartnerRequests } from '../../../services/partnerRequests';
import { getAllPropertyRequests } from '../../../services/propertyRequests';
import { getAllContactRequests } from '../../../services/contactRequests';
import { getAllPropertyInquiries } from '../../../services/propertyInquiries';
import { getAllLeads } from '../../../services/leads';
import type { Lead, PartnerRequest, AddPropertyRequest, ContactRequest, PropertyInquiryRequest } from '../../../types';

interface RequestCategoryCardProps {
    title: string;
    description: string;
    count: number;
    icon: React.FC<{ className?: string }>;
    linkTo: string;
    colorClass: string;
    bgClass: string;
}

const RequestCategoryCard: React.FC<RequestCategoryCardProps> = ({ 
    title, description, count, icon: Icon, linkTo, colorClass, bgClass 
}) => {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <Link to={linkTo} className="block group">
            <Card className="h-full border-2 border-transparent hover:border-amber-500/20 transition-all duration-300 hover:shadow-lg overflow-hidden relative">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${bgClass} ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="w-8 h-8" />
                        </div>
                        {count > 0 && (
                            <span className="flex h-8 min-w-[2rem] px-2 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold text-sm">
                                {count}
                            </span>
                        )}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 min-h-[40px]">
                        {description}
                    </p>
                    
                    <div className={`flex items-center text-sm font-semibold ${colorClass} group-hover:underline`}>
                        {language === 'ar' ? 'إدارة الطلبات' : 'Manage Requests'}
                        {isRTL ? <ArrowLeftIcon className="w-4 h-4 mr-2" /> : <ArrowRightIcon className="w-4 h-4 ml-2" />}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

const AdminAllRequestsPage: React.FC = () => {
    const { t, language } = useLanguage();
    const t_nav = t.adminDashboard.nav;
    
    // Explicitly fetching to preserve types in Promise.all
    const results = useQuery({
        queryKey: ['adminDashboardCounts'],
        queryFn: async () => {
            const [partners, props, inquiries, contacts, leads] = await Promise.all([
                getAllPartnerRequests(),
                getAllPropertyRequests(),
                getAllPropertyInquiries(),
                getAllContactRequests(),
                getAllLeads()
            ]);
            return { 
                partners: partners as PartnerRequest[], 
                props: props as AddPropertyRequest[], 
                inquiries: inquiries as PropertyInquiryRequest[], 
                contacts: contacts as ContactRequest[], 
                leads: leads as Lead[] 
            };
        }
    });

    const { data, isLoading } = results;

    const counts = useMemo(() => {
        if (!data) return { partners: 0, props: 0, inquiries: 0, contacts: 0, finishing: 0, decor: 0 };
        
        return {
            partners: data.partners.filter(r => r.status === 'pending').length,
            props: data.props.filter(r => r.status === 'pending').length,
            inquiries: data.inquiries.filter(r => r.status === 'pending').length,
            contacts: data.contacts.filter(r => r.status === 'pending').length,
            finishing: data.leads.filter(l => l.serviceType === 'finishing' && l.status === 'new').length,
            decor: data.leads.filter(l => l.serviceType === 'decorations' && l.status === 'new').length,
        };
    }, [data]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
            </div>
        );
    }

    const categories = [
        {
            id: 'partners',
            title: t_nav.partnerRequests,
            desc: language === 'ar' ? 'مراجعة طلبات الانضمام.' : 'Review partner applications.',
            count: counts.partners,
            icon: UserPlusIcon,
            link: "/admin/partner-requests",
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30"
        },
        {
            id: 'listings',
            title: t_nav.propertyRequests,
            desc: language === 'ar' ? 'طلبات عرض العقارات.' : 'Property listing requests.',
            count: counts.props,
            icon: ClipboardDocumentListIcon,
            link: "/admin/property-requests",
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30"
        },
        {
            id: 'inquiries',
            title: t_nav.propertyInquiries,
            desc: language === 'ar' ? 'طلبات البحث عن عقار.' : 'Property search inquiries.',
            count: counts.inquiries,
            icon: SearchIcon,
            link: "/admin/property-inquiries",
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-100 dark:bg-purple-900/30"
        },
        {
            id: 'finishing',
            title: t_nav.finishingRequests,
            desc: language === 'ar' ? 'طلبات التشطيب.' : 'Finishing service requests.',
            count: counts.finishing,
            icon: WrenchScrewdriverIcon,
            link: "/admin/finishing-requests",
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/30"
        },
        {
            id: 'decor',
            title: t_nav.decorationsRequests,
            desc: language === 'ar' ? 'طلبات الديكور.' : 'Decoration requests.',
            count: counts.decor,
            icon: SparklesIcon,
            link: "/admin/decoration-requests",
            color: "text-pink-600 dark:text-pink-400",
            bg: "bg-pink-100 dark:bg-pink-900/30"
        },
        {
            id: 'contacts',
            title: t_nav.contactRequests,
            desc: language === 'ar' ? 'رسائل اتصل بنا.' : 'Contact us messages.',
            count: counts.contacts,
            icon: InboxIcon,
            link: "/admin/contact-requests",
            color: "text-gray-600 dark:text-gray-400",
            bg: "bg-gray-200 dark:bg-gray-800"
        }
    ];

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {t.adminDashboard.requestsTriage.title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 max-w-3xl">
                    {language === 'ar' 
                        ? 'مركز التوجيه المركزي. اختر القسم المناسب لإدارة الطلبات والاستفسارات الواردة بشكل منفصل.' 
                        : 'Central Triage Hub. Select a category to manage incoming requests and inquiries separately.'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(cat => (
                    <RequestCategoryCard
                        key={cat.id}
                        title={cat.title}
                        description={cat.desc}
                        count={cat.count}
                        icon={cat.icon}
                        linkTo={cat.link}
                        colorClass={cat.color}
                        bgClass={cat.bg}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdminAllRequestsPage;
