
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AdminPartner, PartnerService } from '../../types';
import BannerDisplay from '../shared/BannerDisplay';
import SEO from '../shared/SEO';
import { usePartners } from '../../hooks/usePartners';
import { getAllMarketplaceServices } from '../../services/partnerServices';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
    WrenchScrewdriverIcon, 
    SparklesIcon, 
    UserPlusIcon,
    BuildingIcon,
    BriefcaseIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    ArrowLeftIcon,
    SearchIcon,
    FilterIcon,
    ArrowUpIcon,
    ArrowDownIcon
} from '../ui/Icons';
import Pagination from '../shared/Pagination';

// --- Components ---

const ServiceCardSkeleton: React.FC = () => (
    <div className="flex flex-col h-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden animate-pulse bg-white dark:bg-gray-800">
        <div className="h-40 bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-5 flex flex-col flex-grow space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="mt-auto h-10 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
    </div>
);

const PartnerCard: React.FC<{ partner: AdminPartner; type: 'company' | 'professional' }> = ({ partner, type }) => {
    const { language } = useLanguage();
    
    const name = language === 'ar' ? (partner.nameAr || partner.name) : partner.name;
    const description = language === 'ar' ? (partner.descriptionAr || partner.description) : partner.description;

    return (
        <Link to={`/partners/${partner.id}`} className="block h-full">
            <Card className={`h-full border-2 transition-all duration-300 transform hover:-translate-y-2 flex flex-col overflow-hidden ${
                type === 'company' 
                    ? 'border-transparent hover:border-amber-400 shadow-md' 
                    : 'border-gray-100 hover:border-blue-400 shadow-sm'
            }`}>
                <div className="relative">
                     {/* Banner / Cover */}
                     <div className={`h-24 w-full ${type === 'company' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`}></div>
                     
                     {/* Avatar */}
                     <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                         <img 
                            src={partner.imageUrl} 
                            alt={name} 
                            className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-md bg-white" 
                        />
                     </div>
                </div>

                <CardContent className="pt-12 px-6 pb-6 text-center flex flex-col flex-grow">
                    <div className="mb-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full ${
                            type === 'company' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                            {type === 'company' 
                                ? (language === 'ar' ? 'شركة معتمدة' : 'Verified Company') 
                                : (language === 'ar' ? 'مهندس / مكتب' : 'Professional')
                            }
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{name}</h3>
                    <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-grow">{description}</p>
                    
                    <Button variant={type === 'company' ? 'primary' : 'outline'} className="w-full mt-auto">
                        {language === 'ar' ? 'عرض الملف' : 'View Profile'}
                    </Button>
                </CardContent>
            </Card>
        </Link>
    );
};

const ServiceMarketplaceCard: React.FC<{ service: any; onRequest: (title: string, partnerId: string) => void }> = ({ service, onRequest }) => {
    const { language } = useLanguage();
    
    // Fallback category colors
    const categoryColors: Record<string, string> = {
        'Design': 'bg-purple-100 text-purple-700',
        'Finishing': 'bg-amber-100 text-amber-700',
        'Landscape': 'bg-green-100 text-green-700',
        'Technology': 'bg-blue-100 text-blue-700',
        'General': 'bg-gray-100 text-gray-700'
    };

    const categoryLabel = service.category || 'General';
    const badgeClass = categoryColors[categoryLabel] || categoryColors['General'];

    return (
        <Card className="flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 group overflow-hidden">
            {/* Service Image */}
            <div className="h-40 w-full overflow-hidden relative">
                <img src={service.imageUrl || 'https://via.placeholder.com/400x300?text=Service'} alt={service.title[language]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm ${badgeClass}`}>
                        {categoryLabel}
                    </span>
                </div>
            </div>

            <CardContent className="p-5 flex flex-col flex-grow">
                {/* Service Details */}
                <div className="mb-4 flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2" title={service.title[language]}>
                        {service.title[language]}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {service.description[language]}
                    </p>
                </div>

                {/* Price & Time info */}
                <div className="flex justify-between items-center text-xs text-gray-500 mb-4 bg-gray-50 dark:bg-gray-800 p-2 rounded-lg">
                     <div className="flex flex-col">
                        <span className="uppercase text-[10px] text-gray-400">{language === 'ar' ? 'السعر' : 'Price'}</span>
                        <span className="font-bold text-amber-600">{service.priceRange ? service.priceRange[language] : (language === 'ar' ? 'عند الطلب' : 'On Request')}</span>
                     </div>
                     <div className="flex flex-col text-end">
                        <span className="uppercase text-[10px] text-gray-400">{language === 'ar' ? 'المدة' : 'Duration'}</span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{service.estimatedTime ? service.estimatedTime[language] : '-'}</span>
                     </div>
                </div>

                {/* Provider Info & Actions */}
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <div className="flex items-center justify-between gap-3 mb-4">
                        {/* Provider Link - Clickable Area */}
                        <Link to={`/partners/${service.partnerId}`} className="flex items-center gap-2 group/provider hover:bg-gray-50 dark:hover:bg-gray-800 p-1 -ml-1 rounded-md transition-colors flex-grow overflow-hidden">
                             <img 
                                src={service.partnerImage || 'https://via.placeholder.com/40'} 
                                alt={service.partnerName} 
                                className="w-8 h-8 rounded-full object-cover border border-gray-200" 
                            />
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover/provider:text-amber-600 transition-colors">
                                    {service.partnerName}
                                </span>
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                    {language === 'ar' ? 'عرض البروفايل' : 'View Profile'}
                                    {language === 'ar' ? <ArrowLeftIcon className="w-2 h-2"/> : <ArrowRightIcon className="w-2 h-2"/>}
                                </span>
                            </div>
                        </Link>
                    </div>

                    <Button 
                        onClick={() => onRequest(service.title[language], service.partnerId)} 
                        className="w-full text-sm"
                        variant="primary"
                    >
                        {language === 'ar' ? 'طلب الخدمة' : 'Request Service'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const ITEMS_PER_PAGE = 9;

const FinishingPage: React.FC = () => {
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState<'partners' | 'services'>('partners');
    
    // --- Filters State ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [priceSort, setPriceSort] = useState<'asc' | 'desc' | 'default'>('default');
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch Data
    const { data: partners, isLoading: isLoadingPartners } = usePartners();
    const { data: services, isLoading: isLoadingServices } = useQuery({ 
        queryKey: ['marketplaceServices'], 
        queryFn: getAllMarketplaceServices 
    });

    const handleRequestService = (serviceTitle: string, partnerId: string) => {
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: partnerId,
                serviceType: 'finishing',
            },
        });
    };

    // Filter Partners into Two Groups
    const { companies, professionals } = useMemo(() => {
        if (!partners) return { companies: [], professionals: [] };
        
        const finishingPartners = partners.filter(p => p.type === 'finishing' && p.status === 'active');
        
        // Companies: Elite/Professional plans (Usually larger entities)
        const companiesList = finishingPartners.filter(p => p.subscriptionPlan === 'elite' || p.subscriptionPlan === 'professional');
        
        // Professionals: Commission/Basic plans (Usually individuals or small offices)
        const professionalsList = finishingPartners.filter(p => p.subscriptionPlan === 'commission' || p.subscriptionPlan === 'basic');

        return { companies: companiesList, professionals: professionalsList };
    }, [partners]);

    // --- Services Filtering Logic ---
    const availableCategories = useMemo(() => {
        if (!services) return [];
        const cats = new Set(services.map(s => s.category || 'General'));
        return Array.from(cats);
    }, [services]);

    const filteredServices = useMemo(() => {
        if (!services) return [];
        
        let result = services.filter(service => {
            const matchesSearch = 
                service.title[language].toLowerCase().includes(searchTerm.toLowerCase()) || 
                (service.partnerName && service.partnerName.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || (service.category || 'General') === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        // Simple sorting based on estimated price range string (Not perfect, but functional for MVP)
        // Ideally, price would be numeric in DB for sorting
        /* 
           This part is tricky with text ranges "5000 EGP". 
           For now, we might rely on the DB returning created_at desc order.
           Or we implement basic parsing if needed. 
           Let's stick to default sort or rely on "created_at" descending from query.
        */
        
        return result;

    }, [services, searchTerm, selectedCategory, language]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE);
    const paginatedServices = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredServices.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredServices, currentPage]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <SEO 
                title={language === 'ar' ? 'مركز تشطيبات هليوبوليس | ONLY HELIO' : 'Heliopolis Finishing Hub | ONLY HELIO'} 
                description={language === 'ar' ? 'الدليل الشامل لشركات التشطيب، مهندسي الديكور، والخدمات الفنية في هليوبوليس الجديدة.' : 'The comprehensive directory for finishing companies, decor engineers, and technical services in New Heliopolis.'}
            />

            {/* Modern Hero Section */}
            <div className="relative bg-gray-900 text-white py-20 lg:py-28 overflow-hidden">
                 <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" alt="Background" className="w-full h-full object-cover opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
                </div>
                
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                        {language === 'ar' ? 'وجهتك الأولى لتشطيب منزلك' : 'Your Premier Destination for Home Finishing'}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
                        {language === 'ar' 
                            ? 'سواء كنت تبحث عن شركة لتنفيذ كامل، أو مهندس لرسم 2D، ستجد هنا نخبة الخبراء.'
                            : 'Whether you need a full turnkey company or an engineer for 2D drafting, find the elite experts here.'}
                    </p>
                    
                    {/* Tabs Navigation */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => setActiveTab('partners')}
                            className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 flex items-center gap-2 ${
                                activeTab === 'partners'
                                    ? 'bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/25 scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                            }`}
                        >
                            <BuildingIcon className="w-5 h-5" />
                            {language === 'ar' ? 'دليل الشركات والمهندسين' : 'Partners Directory'}
                        </button>
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-200 flex items-center gap-2 ${
                                activeTab === 'services'
                                    ? 'bg-amber-500 text-gray-900 shadow-lg shadow-amber-500/25 scale-105'
                                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                            }`}
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                            {language === 'ar' ? 'سوق الخدمات' : 'Services Marketplace'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-6 py-16">
                
                {/* TAB 1: PARTNERS DIRECTORY */}
                {activeTab === 'partners' && (
                    <div className="animate-fadeIn space-y-20">
                        
                        {/* Section A: Companies */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                                    <BriefcaseIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {language === 'ar' ? 'شركات التشطيب الكبرى' : 'Major Finishing Companies'}
                                    </h2>
                                    <p className="text-gray-500 mt-1">
                                        {language === 'ar' ? 'حلول متكاملة، تسليم مفتاح، وضمانات شاملة.' : 'Turnkey solutions, comprehensive warranties, and full management.'}
                                    </p>
                                </div>
                            </div>
                            
                            {isLoadingPartners ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>)}
                                </div>
                            ) : companies.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {companies.map(partner => (
                                        <PartnerCard key={partner.id} partner={partner} type="company" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-500">{language === 'ar' ? 'لا توجد شركات مسجلة حالياً.' : 'No companies listed currently.'}</p>
                                </div>
                            )}
                        </section>

                        {/* Section B: Professionals */}
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                    <SparklesIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {language === 'ar' ? 'مهندسون ومكاتب متخصصة' : 'Engineers & Specialized Offices'}
                                    </h2>
                                    <p className="text-gray-500 mt-1">
                                        {language === 'ar' ? 'خدمات محددة (تصميم، إشراف، استشارات) بمرونة عالية.' : 'Specific services (Design, Supervision, Consulting) with high flexibility.'}
                                    </p>
                                </div>
                            </div>

                            {isLoadingPartners ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {[1, 2, 3].map(i => <div key={i} className="h-80 bg-gray-200 rounded-lg animate-pulse"></div>)}
                                </div>
                            ) : professionals.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {professionals.map(partner => (
                                        <PartnerCard key={partner.id} partner={partner} type="professional" />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                    <p className="text-gray-500">{language === 'ar' ? 'لا يوجد مهندسين مسجلين حالياً.' : 'No professionals listed currently.'}</p>
                                </div>
                            )}
                        </section>
                        
                        {/* Call to Action for Partners */}
                        <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl p-8 text-center">
                            <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-500 mb-4">
                                {language === 'ar' ? 'هل أنت مهندس أو شركة تشطيب؟' : 'Are you an Engineer or Finishing Company?'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                                {language === 'ar' ? 'انضم إلى منصة أونلي هيليو واعرض خدماتك على آلاف العملاء المهتمين في المدينة.' : 'Join Only Helio platform and showcase your services to thousands of interested clients in the city.'}
                            </p>
                            <Link to="/register" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                                <UserPlusIcon className="w-5 h-5" />
                                {language === 'ar' ? 'سجل كشريك الآن' : 'Register as Partner'}
                            </Link>
                        </section>
                    </div>
                )}


                {/* TAB 2: SERVICES MARKETPLACE (UPDATED) */}
                {activeTab === 'services' && (
                    <div className="animate-fadeIn">
                        
                        {/* Filters & Controls */}
                        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-20 z-20">
                             {/* Left: Search & Count */}
                             <div className="w-full lg:w-auto flex flex-col md:flex-row gap-4 items-center flex-grow">
                                <div className="relative w-full md:w-80">
                                    <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input 
                                        type="text" 
                                        placeholder={language === 'ar' ? 'ابحث عن خدمة...' : 'Search services...'} 
                                        className="pl-10 w-full"
                                        value={searchTerm}
                                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    />
                                </div>
                                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
                                    {filteredServices.length} {language === 'ar' ? 'خدمة متاحة' : 'Services found'}
                                </span>
                             </div>

                             {/* Right: Category Filter */}
                             <div className="w-full lg:w-auto flex gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                                 <button
                                     onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                                     className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                                 >
                                     {language === 'ar' ? 'الكل' : 'All'}
                                 </button>
                                 {availableCategories.map(cat => (
                                     <button
                                         key={cat}
                                         onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                                         className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                                     >
                                         {cat}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        {isLoadingServices ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => <ServiceCardSkeleton key={i} />)}
                            </div>
                        ) : (paginatedServices && paginatedServices.length > 0) ? (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                                    {paginatedServices.map(service => (
                                        <ServiceMarketplaceCard 
                                            key={service.id} 
                                            service={service} 
                                            onRequest={handleRequestService} 
                                        />
                                    ))}
                                </div>
                                
                                {/* Pagination Controls */}
                                <div className="mt-8">
                                    <Pagination 
                                        currentPage={currentPage} 
                                        totalPages={totalPages} 
                                        onPageChange={setCurrentPage} 
                                    />
                                </div>
                            </div>
                        ) : (
                             // Empty State with Mock Data Preview if DB is empty
                             <div className="space-y-12">
                                <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                                    <FilterIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium text-lg">
                                        {language === 'ar' ? 'لا توجد خدمات تطابق بحثك.' : 'No services found matching your criteria.'}
                                    </p>
                                    <Button variant="ghost" onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-4">
                                        {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <BannerDisplay location="finishing" />
        </div>
    );
};

export default FinishingPage;
