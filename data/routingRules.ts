export interface RoutingRuleCondition {
    field: string; // e.g., 'type', 'payload.serviceType'
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number;
}

export interface RoutingRuleAction {
    assignTo: string; // userId of the manager/partner
}

export interface RoutingRule {
    id: string;
    name: { [key in 'ar' | 'en']: string };
    active: boolean;
    conditions: RoutingRuleCondition[];
    action: RoutingRuleAction;
}

export let routingRulesData: RoutingRule[] = [
    // --- Specific Rules First ---
    {
        id: 'rule-high-value-property',
        name: {
            en: 'Route High-Value Listings to VIP Manager',
            ar: 'توجيه العقارات مرتفعة القيمة للمدير المختص'
        },
        active: true,
        conditions: [
            { field: 'type', operator: 'equals', value: 'PROPERTY_LISTING_REQUEST' },
            { field: 'payload.propertyDetails.price', operator: 'greater_than', value: 5000000 },
        ],
        action: {
            assignTo: 'listings-manager-1',
        }
    },
    // --- General Rules Later ---
    {
        id: 'rule-1',
        name: {
            en: 'Route Finishing Leads to Service Manager',
            ar: 'توجيه طلبات التشطيب لمدير الخدمات'
        },
        active: true,
        conditions: [
            { field: 'type', operator: 'equals', value: 'LEAD' },
            { field: 'payload.serviceType', operator: 'equals', value: 'finishing' },
        ],
        action: {
            assignTo: 'service-manager-1',
        }
    },
     {
        id: 'rule-decor-leads',
        name: {
            en: 'Route Decoration Leads to Service Manager',
            ar: 'توجيه طلبات الديكور لمدير الخدمات'
        },
        active: true,
        conditions: [
            { field: 'type', operator: 'equals', value: 'LEAD' },
            { field: 'payload.serviceType', operator: 'equals', value: 'decorations' },
        ],
        action: {
            assignTo: 'service-manager-1',
        }
    },
    {
        id: 'rule-2',
        name: {
            en: 'Route Developer Applications to Partner Manager',
            ar: 'توجيه طلبات المطورين لمدير الشركاء'
        },
        active: true,
        conditions: [
            { field: 'type', operator: 'equals', value: 'PARTNER_APPLICATION' },
            { field: 'payload.companyType', operator: 'equals', value: 'developer' },
        ],
        action: {
            assignTo: 'partner-relations-manager-1',
        }
    },
    {
        id: 'rule-other-partnerships',
        name: {
            en: 'Route Other Partner Applications to Partner Manager',
            ar: 'توجيه باقي طلبات الشراكة لمدير الشركاء'
        },
        active: true,
        conditions: [
            { field: 'type', operator: 'equals', value: 'PARTNER_APPLICATION' },
        ],
        action: {
            assignTo: 'partner-relations-manager-1',
        }
    },
    {
        id: 'rule-general-listings',
        name: {
            en: 'Route General Listings to Customer Relations',
            ar: 'توجيه طلبات عرض العقارات لعلاقات العملاء'
        },
        active: true,
        conditions: [
            { field: 'type', operator: 'equals', value: 'PROPERTY_LISTING_REQUEST' },
        ],
        action: {
            assignTo: 'customer-relations-manager-1',
        }
    },
     {
        id: 'rule-contact-messages',
        name: {
            en: 'Route Contact Messages to Customer Relations',
            ar: 'توجيه رسائل التواصل لعلاقات العملاء'
        },
        active: true,
        conditions: [
            { field: 'type', operator: 'equals', value: 'CONTACT_MESSAGE' },
        ],
        action: {
            assignTo: 'customer-relations-manager-1',
        }
    },
     {
        id: 'rule-property-inquiries',
        name: {
            en: 'Route Property Inquiries to Customer Relations',
            ar: 'توجيه طلبات البحث عن عقار لعلاقات العملاء'
        },
        active: true,
        conditions: [
            { field: 'type', operator: 'equals', value: 'PROPERTY_INQUIRY' },
        ],
        action: {
            assignTo: 'customer-relations-manager-1',
        }
    },
];