
import type { FormDefinition } from '../types';

export let formsData: FormDefinition[] = [
    {
        id: 'form-1',
        slug: 'contact-us',
        title: { ar: 'اتصل بنا', en: 'Contact Us' },
        description: { ar: 'نموذج التواصل العام', en: 'General Contact Form' },
        category: 'public',
        destination: 'crm_messages',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'إرسال', en: 'Send Message' },
        fields: [
            { id: 'f1', key: 'name', type: 'text', label: { ar: 'الاسم بالكامل', en: 'Full Name' }, required: true, width: 'half', placeholder: { ar: 'أدخل اسمك', en: 'Enter your name' } },
            { id: 'f2', key: 'phone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, width: 'half', placeholder: { ar: '01xxxxxxxxx', en: '01xxxxxxxxx' } },
            { id: 'f3', key: 'email', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Email Address' }, required: false, width: 'full' },
            { id: 'f4', key: 'message', type: 'textarea', label: { ar: 'الرسالة', en: 'Message' }, required: true, width: 'full', placeholder: { ar: 'اكتب رسالتك هنا...', en: 'Type your message here...' } }
        ]
    },
    {
        id: 'form-2',
        slug: 'service-request',
        title: { ar: 'طلب خدمة سريع', en: 'Quick Service Request' },
        description: { ar: 'نموذج مختصر لطلبات الخدمة', en: 'Short form for service requests' },
        category: 'lead_gen',
        destination: 'crm_leads',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'تأكيد الطلب', en: 'Confirm Request' },
        fields: [
            { id: 'sf0', key: 'customerName', type: 'text', label: { ar: 'الاسم بالكامل', en: 'Full Name' }, required: true, width: 'half' },
            { id: 'sf00', key: 'customerPhone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, width: 'half' },
            { id: 'sf1', key: 'contactTime', type: 'select', label: { ar: 'وقت التواصل المفضل', en: 'Preferred Contact Time' }, required: true, width: 'full', options: ['morning', 'afternoon', 'evening'] },
            { id: 'sf4', key: 'customerNotes', type: 'textarea', label: { ar: 'ملاحظات إضافية', en: 'Additional Notes' }, required: false, width: 'full', placeholder: { ar: 'اذكر أي تفاصيل إضافية...', en: 'Mention any extra details...' } }
        ]
    },
    {
        id: 'form-3',
        slug: 'property-inquiry',
        title: { ar: 'طلب بحث عقاري', en: 'Property Search Request' },
        description: { ar: 'نموذج لتحديد مواصفات العقار المطلوب', en: 'Form to specify desired property details' },
        category: 'lead_gen',
        destination: 'crm_leads', 
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'إرسال الطلب', en: 'Submit Request' },
        fields: [
            { id: 'pi1', key: 'customerName', type: 'text', label: { ar: 'الاسم بالكامل', en: 'Full Name' }, required: true, width: 'half' },
            { id: 'pi2', key: 'customerPhone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, width: 'half' },
            { id: 'pi3', key: 'contactTime', type: 'select', label: { ar: 'وقت التواصل', en: 'Preferred Time' }, required: true, width: 'full', options: ['morning', 'afternoon', 'evening'] },
            { id: 'pi4', key: 'details', type: 'textarea', label: { ar: 'مواصفات العقار المطلوب', en: 'Property Details' }, required: true, width: 'full', placeholder: { ar: 'مثال: شقة ٣ غرف في الحي الثاني...', en: 'e.g., 3 Bedroom apartment in 2nd district...' } }
        ]
    },
    {
        id: 'form-finishing',
        slug: 'finishing-request',
        title: { ar: 'طلب تشطيب', en: 'Finishing Request' },
        description: { ar: 'نموذج تفصيلي لخدمات التشطيب', en: 'Detailed form for finishing services' },
        category: 'lead_gen',
        destination: 'crm_leads',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'إرسال طلب المعاينة', en: 'Request Site Visit' },
        fields: [
            { id: 'fr1', key: 'customerName', type: 'text', label: { ar: 'الاسم بالكامل', en: 'Full Name' }, required: true, width: 'half' },
            { id: 'fr2', key: 'customerPhone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, width: 'half', placeholder: { ar: '+20...', en: '+20...' } },
            { id: 'fr3', key: 'unitType', type: 'select', label: { ar: 'نوع الوحدة', en: 'Unit Type' }, required: true, width: 'half', options: ['apartment', 'villa', 'duplex', 'commercial', 'office'] },
            { id: 'fr4', key: 'unitArea', type: 'number', label: { ar: 'المساحة التقريبية (م٢)', en: 'Approx Area (m2)' }, required: true, width: 'half' },
            { id: 'fr5', key: 'currentStatus', type: 'select', label: { ar: 'حالة الوحدة الحالية', en: 'Current Status' }, required: true, width: 'half', options: ['core_shell', 'semi_finished', 'old_renovation'] },
            { id: 'fr6', key: 'finishingLevel', type: 'select', label: { ar: 'مستوى التشطيب المطلوب', en: 'Desired Finishing' }, required: true, width: 'half', options: ['economic', 'super_lux', 'ultra_lux', 'hotel_standard'] },
            { id: 'fr7', key: 'contactTime', type: 'select', label: { ar: 'وقت التواصل المفضل', en: 'Preferred Contact Time' }, required: true, width: 'full', options: ['morning', 'afternoon', 'evening'] },
            { id: 'fr8', key: 'customerNotes', type: 'textarea', label: { ar: 'ملاحظات إضافية', en: 'Additional Notes' }, required: false, width: 'full', placeholder: { ar: 'أي تفاصيل أخرى تود إضافتها...', en: 'Any other details...' } },
        ]
    },
    {
        id: 'form-decor',
        slug: 'decoration-request',
        title: { ar: 'طلب ديكور / عمل فني', en: 'Decoration Request' },
        description: { ar: 'نموذج طلب أعمال فنية خاصة', en: 'Form for custom art and decoration requests' },
        category: 'lead_gen',
        destination: 'crm_leads',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'إرسال الطلب', en: 'Submit Request' },
        fields: [
            { id: 'dr1', key: 'customerName', type: 'text', label: { ar: 'الاسم بالكامل', en: 'Full Name' }, required: true, width: 'half' },
            { id: 'dr2', key: 'customerPhone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, width: 'half', placeholder: { ar: '+20...', en: '+20...' } },
            { id: 'dr3', key: 'itemCategory', type: 'select', label: { ar: 'نوع العمل المطلوب', en: 'Item Category' }, required: true, width: 'half', options: ['wall_sculpture', 'canvas_painting', 'custom_furniture', 'antique_decor'] },
            { id: 'dr4', key: 'dimensions', type: 'text', label: { ar: 'الأبعاد المطلوبة (سم)', en: 'Dimensions (cm)' }, required: false, width: 'half', placeholder: { ar: 'مثال: 100x80', en: 'e.g. 100x80' } },
            { id: 'dr5', key: 'contactTime', type: 'select', label: { ar: 'وقت التواصل', en: 'Preferred Time' }, required: true, width: 'full', options: ['any_time', 'morning', 'evening'] },
            { id: 'dr6', key: 'customerNotes', type: 'textarea', label: { ar: 'وصف الفكرة / ملاحظات', en: 'Description / Notes' }, required: true, width: 'full', placeholder: { ar: 'صف التصميم الذي تتخيله، الألوان المفضلة، أو المكان الذي سيوضع فيه العمل...', en: 'Describe your vision, preferred colors, or placement...' } },
            { id: 'dr7', key: 'referenceImage', type: 'file', label: { ar: 'صورة مرجعية (اختياري)', en: 'Reference Image (Optional)' }, required: false, width: 'full' },
        ]
    },
    {
        id: 'form-partner',
        slug: 'partner-application',
        title: { ar: 'طلب انضمام شريك', en: 'Partner Application' },
        description: { ar: 'البيانات الأساسية للشركة', en: 'Company Basic Information' },
        category: 'partner_app',
        destination: 'crm_partners',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'التالي', en: 'Next' },
        fields: [
            { id: 'pa1', key: 'companyName', type: 'text', label: { ar: 'اسم الشركة', en: 'Company Name' }, required: true, width: 'half' },
            { id: 'pa2', key: 'companyAddress', type: 'text', label: { ar: 'عنوان الشركة', en: 'Company Address' }, required: true, width: 'half' },
            { id: 'pa3', key: 'website', type: 'text', label: { ar: 'الموقع الإلكتروني', en: 'Website' }, required: false, width: 'full' },
            { id: 'pa4', key: 'description', type: 'textarea', label: { ar: 'وصف الشركة', en: 'Company Description' }, required: true, width: 'full' },
            { id: 'pa5', key: 'contactName', type: 'text', label: { ar: 'اسم مسؤول التواصل', en: 'Contact Person Name' }, required: true, width: 'third' },
            { id: 'pa6', key: 'contactEmail', type: 'email', label: { ar: 'البريد الإلكتروني', en: 'Contact Email' }, required: true, width: 'third' },
            { id: 'pa7', key: 'contactPhone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Contact Phone' }, required: true, width: 'third' },
        ]
    },
    {
        id: 'form-add-property',
        slug: 'add-property',
        title: { ar: 'إضافة عقار', en: 'Add Property' },
        description: { ar: 'بيانات العقار التفصيلية', en: 'Detailed Property Information' },
        category: 'public',
        destination: 'crm_leads',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submitButtonLabel: { ar: 'التالي', en: 'Next' },
        fields: [
             // Contact Info
             { id: 'ap1', key: 'customerName', type: 'text', label: { ar: 'الاسم بالكامل', en: 'Full Name' }, required: true, width: 'half' },
             { id: 'ap2', key: 'customerPhone', type: 'tel', label: { ar: 'رقم الهاتف', en: 'Phone Number' }, required: true, width: 'half' },
             { id: 'ap3', key: 'contactTime', type: 'select', label: { ar: 'الوقت المناسب للتواصل', en: 'Best time to contact' }, required: true, width: 'full', options: ['morning', 'afternoon', 'evening'] },
             
             // Basic Property Info
             { id: 'ap6', key: 'address', type: 'text', label: { ar: 'العنوان التفصيلي', en: 'Detailed Address' }, required: true, width: 'full' },
             { id: 'ap7', key: 'propertyType', type: 'select', label: { ar: 'نوع العقار', en: 'Property Type' }, required: true, width: 'third', options: ['Apartment', 'Villa', 'Commercial', 'Land'] }, // Matches DB Enum
             { id: 'ap8', key: 'area', type: 'number', label: { ar: 'المساحة (م٢)', en: 'Area (m2)' }, required: true, width: 'third' },
             { id: 'ap9', key: 'price', type: 'number', label: { ar: 'السعر المطلوب (ج.م)', en: 'Price (EGP)' }, required: true, width: 'third' },
             
             // Detailed Specs (Crucial for DB Mapping)
             { id: 'ap_beds', key: 'bedrooms', type: 'number', label: { ar: 'غرف النوم', en: 'Bedrooms' }, required: true, width: 'third' },
             { id: 'ap_baths', key: 'bathrooms', type: 'number', label: { ar: 'الحمامات', en: 'Bathrooms' }, required: true, width: 'third' },
             { id: 'ap_floor', key: 'floor', type: 'number', label: { ar: 'الدور', en: 'Floor' }, required: false, width: 'third' },

             { id: 'ap_compound', key: 'isInCompound', type: 'select', label: { ar: 'داخل كومبوند؟', en: 'In Compound?' }, required: true, width: 'half', options: ['yes', 'no'] },
             { id: 'ap_installments', key: 'hasInstallments', type: 'select', label: { ar: 'يوجد تقسيط؟', en: 'Installments?' }, required: true, width: 'half', options: ['yes', 'no'] },
             { id: 'ap_finance', key: 'realEstateFinanceAvailable', type: 'select', label: { ar: 'تمويل عقاري؟', en: 'Mortgage?' }, required: true, width: 'full', options: ['yes', 'no'] },

             { id: 'ap10', key: 'finishingStatus', type: 'select', label: { ar: 'حالة التشطيب', en: 'Finishing Status' }, required: true, width: 'full', options: ['Core & Shell', 'Semi-finished', 'Fully Finished', 'Luxury Finishing'] },
             
             { id: 'ap11', key: 'description.ar', type: 'textarea', label: { ar: 'وصف العقار (عربي)', en: 'Description (AR)' }, required: true, width: 'full' },
             { id: 'ap12', key: 'description.en', type: 'textarea', label: { ar: 'وصف العقار (إنجليزي)', en: 'Description (EN)' }, required: false, width: 'full' },
        ]
    }
];
