
import { supabase } from '../supabaseClient';
import type { SiteContent } from '../types';

const CONTENT_KEY = 'site_content_v1';

// Full rich content fallback
const fallbackContent: SiteContent = {
  logoUrl: '',
  enableMaps: true, // Default enabled
  hero: { 
      ar: { title: 'بوابتك الحصرية لأرقى العقارات في هليوبوليس الجديدة', subtitle: 'اكتشف روائع معمارية وخدمات متكاملة مصممة خصيصًا لتلبية طموحات سكان مدينة هليوبوليس الجديدة.' }, 
      en: { title: 'Your Exclusive Gateway to the Finest Properties in New Heliopolis', subtitle: 'Discover architectural masterpieces and integrated services tailored to meet the ambitions of New Heliopolis residents.' }, 
      images: [] 
  },
  contactConfiguration: { routing: 'internal' },
  footer: { 
      ar: { description: 'وجهتكم الأولى لاستكشاف أرقى العقارات والخدمات المتكاملة في قلب هليوبوليس الجديدة.', address: 'هليوبوليس الجديدة, القاهرة, مصر', hours: 'الأحد - الخميس: 9 صباحًا - 6 مساءً' }, 
      en: { description: 'Your premier destination for exploring the finest properties and integrated services in the heart of New Heliopolis.', address: 'New Heliopolis, Cairo, Egypt', hours: 'Sunday - Thursday: 9 AM - 6 PM' }, 
      phone: '+20 123 456 7890', email: 'info@onlyhelio.com', social: { facebook: '#', twitter: '#', instagram: '#', linkedin: '#' },
      copyright: { ar: '© 2025 ONLY HELIO. جميع الحقوق محفوظة.', en: '© 2025 ONLY HELIO. All rights reserved.' }, 
      feedbackText: { ar: 'إرسال ملاحظات', en: 'Send Feedback' }
  },
  services: { enabled: true, ar: { title: 'خدماتنا', description: '', features: [] }, en: { title: 'Our Services', description: '', features: [] } },
  partners: { 
      enabled: true, 
      ar: { 
          title: 'شركاء النجاح', description: '',
          mega_projects_title: 'كبار المطورين',
          developers_title: 'المطورون',
          finishing_companies_title: 'شركات التشطيب',
          agencies_title: 'المكاتب العقارية',
          investor_partners_title: 'المستثمرون'
      }, 
      en: { 
          title: 'Success Partners', description: '',
          mega_projects_title: 'Major Developers',
          developers_title: 'Developers',
          finishing_companies_title: 'Finishing Companies',
          agencies_title: 'Real Estate Agencies',
          investor_partners_title: 'Investors'
      } 
  },
  whyNewHeliopolis: { enabled: true, ar: { title: 'لماذا هليوبوليس؟', location: { title: '', description: '', stats: [] } }, en: { title: 'Why New Heliopolis?', location: { title: '', description: '', stats: [] } }, images: [] },
  whyUs: { enabled: true, ar: { title: 'لماذا نحن؟', description: '', features: [] }, en: { title: 'Why Us?', description: '', features: [] } },
  testimonials: { enabled: true, ar: { title: 'آراء العملاء', subtitle: '' }, en: { title: 'Testimonials', subtitle: '' }, items: [] },
  socialProof: { enabled: true, stats: [] },
  homeCTA: { enabled: true, ar: { title: 'ابدأ رحلتك', subtitle: '', button: 'تواصل معنا', link: '/contact' }, en: { title: 'Start Your Journey', subtitle: '', button: 'Contact Us', link: '/contact' } },
  homeListings: { enabled: true, count: 4, ar: { title: 'أحدث العقارات' }, en: { title: 'Latest Properties' } },
  
  // Privacy Policy Content
  privacyPolicy: {
      ar: {
          title: "سياسة الخصوصية",
          lastUpdated: "آخر تحديث: نوفمبر 2025",
          sections: [
              { title: "1. مقدمة", content: "نحن في منصة ONLY HELIO (المشار إليها بـ \"نحن\"، \"المنصة\"، أو \"الموقع\")، نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمعنا واستخدامنا ومشاركتنا لمعلوماتك عند استخدامك لمنصتنا المتخصصة في عقارات وخدمات مدينة هليوبوليس الجديدة." },
              { title: "2. البيانات التي نجمعها", content: "قد نقوم بجمع الأنواع التالية من البيانات:\n• **معلومات الهوية:** الاسم الكامل، رقم الهاتف، عنوان البريد الإلكتروني.\n• **تفاصيل الطلبات:** تفاصيل العقار، تفضيلات التشطيب، ونوع الخدمة المطلوبة.\n• **المحتوى الذي تنشئه:** صور العقارات، والاستفسارات المرسلة عبر النماذج.\n• **البيانات التقنية:** عنوان IP، ونوع المتصفح." },
              { title: "3. كيف نستخدم بياناتك", content: "نستخدم بياناتك للأغراض التالية:\n• ربطك بمقدمي الخدمات المناسبين (مطورين، سماسرة، شركات تشطيب).\n• تحسين تجربة البحث عن العقارات.\n• التواصل معك بخصوص تحديثات الطلبات." },
              { title: "4. مشاركة البيانات", content: "بصفتنا منصة وسيطة، فإننا نشارك بيانات الاتصال وتفاصيل طلبك مع الشركاء المسجلين فقط عندما تقوم بإرسال طلب استفسار لجهة معينة." },
              { title: "5. أمن البيانات", content: "نطبق تدابير أمنية تقنية وتنظيمية مناسبة لحماية بياناتك من الوصول غير المصرح به أو الفقدان." },
              { title: "6. تواصل معنا", content: "إذا كان لديك أي أسئلة، يرجى التواصل معنا عبر البريد الإلكتروني: info@onlyhelio.com." }
          ]
      },
      en: {
          title: "Privacy Policy",
          lastUpdated: "Last Updated: November 2025",
          sections: [
              { title: "1. Introduction", content: "At ONLY HELIO (\"we\", \"our\", or \"the Platform\"), we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and share your information when you use our platform specialized in New Heliopolis real estate and services." },
              { title: "2. Data We Collect", content: "We may collect the following types of data:\n• **Identity Information:** Full name, phone number, email address.\n• **Request Details:** Property details, finishing preferences, and service types.\n• **User Content:** Property photos and inquiries.\n• **Technical Data:** IP address and browser type." },
              { title: "3. How We Use Your Data", content: "We use your data to:\n• Connect you with appropriate service providers.\n• Improve the property search experience.\n• Contact you regarding request updates." },
              { title: "4. Data Sharing", content: "As an intermediary platform, we share your contact data with registered partners only when you submit a specific inquiry." },
              { title: "5. Data Security", content: "We implement appropriate technical and organizational security measures to protect your data." },
              { title: "6. Contact Us", content: "If you have any questions, please contact us at: info@onlyhelio.com." }
          ]
      }
  },

  // Terms of Use Content
  termsOfUse: {
      ar: {
          title: "شروط الاستخدام",
          lastUpdated: "آخر تحديث: نوفمبر 2025",
          sections: [
              { title: "1. الموافقة على الشروط", content: "مرحبًا بك في ONLY HELIO. بوصولك إلى هذا الموقع واستخدامه، فإنك توافق على الالتزام بشروط الاستخدام هذه وجميع القوانين واللوائح المعمول بها." },
              { title: "2. وصف الخدمة", content: "ONLY HELIO هي منصة رقمية تعمل كدليل وسوق للعقارات وخدمات التشطيب في مدينة هليوبوليس الجديدة. نحن نعمل كمنصة للربط بين المستخدمين ومقدمي الخدمات ولسنا طرفاً في المعاملات المالية المباشرة للعقارات." },
              { title: "3. الاستخدام المحظور", content: "يُمنع استخدام الموقع لأي غرض غير قانوني، أو محاولة جمع البيانات بشكل آلي، أو نشر معلومات كاذبة." },
              { title: "4. الملكية الفكرية", content: "جميع المحتويات الموجودة على الموقع هي ملك لـ ONLY HELIO أو مرخصة لها، ومحمية بموجب قوانين حقوق النشر." },
              { title: "5. إخلاء المسؤولية", content: "يتم تقديم المواد على الموقع \"كما هي\". لا تقدم المنصة أي ضمانات صريحة أو ضمنية بخصوص دقة المعلومات العقارية المقدمة من أطراف ثالثة." },
              { title: "6. القانون الواجب التطبيق", content: "تخضع هذه الشروط لقوانين جمهورية مصر العربية." }
          ]
      },
      en: {
          title: "Terms of Use",
          lastUpdated: "Last Updated: November 2025",
          sections: [
              { title: "1. Agreement to Terms", content: "Welcome to ONLY HELIO. By accessing and using this website, you agree to be bound by these Terms of Use and all applicable laws." },
              { title: "2. Service Description", content: "ONLY HELIO is a digital platform acting as a directory and marketplace for real estate and finishing services in New Heliopolis. We act as a connecting platform and are not a party to direct real estate transactions." },
              { title: "3. Prohibited Use", content: "You may not use the site for illegal purposes, attempt to scrape data, or post false information." },
              { title: "4. Intellectual Property", content: "All content on the site is the property of ONLY HELIO or its licensors and is protected by copyright laws." },
              { title: "5. Disclaimer", content: "The materials on the site are provided \"as is\". We make no warranties regarding the accuracy of property information provided by third parties." },
              { title: "6. Governing Law", content: "These terms are governed by the laws of the Arab Republic of Egypt." }
          ]
      }
  },
  finishingServices: [],
  quotes: []
};

export const getContent = async (): Promise<SiteContent> => {
    try {
        // Use .maybeSingle() to avoid error if row missing, defaulting to fallback
        const { data, error } = await supabase
            .from('SystemSetting')
            .select('value')
            .eq('key', CONTENT_KEY)
            .maybeSingle();

        if (data && data.value) {
            const dbContent = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            // Merge DB content with fallback to ensure new keys (like privacyPolicy) exist if DB is old
            return { ...fallbackContent, ...dbContent };
        }
    } catch (e) {
        console.error("Failed to load content from DB:", e);
    }
    
    return fallbackContent;
};

export const updateContent = async (updates: Partial<SiteContent>): Promise<SiteContent> => {
    const currentContent = await getContent();
    const newContent = { ...currentContent, ...updates };

    const { error } = await supabase
        .from('SystemSetting')
        .upsert({ 
            key: CONTENT_KEY, 
            value: JSON.stringify(newContent),
            group: 'cms' 
        }, { onConflict: 'key' });

    if (error) throw error;
    return newContent;
};
