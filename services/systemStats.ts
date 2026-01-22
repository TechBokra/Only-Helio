
import { supabase } from '../supabaseClient';

const KNOWN_TABLES = [
    // Core
    'User',
    'Project',
    'Property',
    'PortfolioItem',
    
    // CRM
    'Lead',
    'LeadMessage',
    
    // Requests Forms
    'PartnerRequest',
    'PropertyListingRequest',
    'ContactRequest',
    'PropertyInquiry',
    
    // Configuration & System
    'SystemSetting',
    'PlanConfiguration',
    'RoutingRule',
    'FormDefinition',
    'Notification',
    'Banner',
    'Transaction',
    
    // Lookups
    'PropertyType',
    'FinishingStatus',
    'Amenity',
    'DecorationCategory',
    
    // Relations & Extras
    'AmenitiesOnProperties',
    'Quote',
    'StaticPage',
    'AuditLog',
    'SavedSearch',
    'NewsletterSubscriber'
];

export interface TableStat {
    name: string;
    count: number;
    status: 'healthy' | 'empty' | 'error';
    lastError?: string;
}

export const getDatabaseStats = async (): Promise<TableStat[]> => {
    const stats: TableStat[] = [];
    
    // We use Promise.all to fetch counts in parallel for performance
    const promises = KNOWN_TABLES.map(async (table) => {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                // Ignore specific error for implicit many-to-many if created by Prisma as _RelationName
                if(error.code === '42P01') { 
                     return { name: table, count: 0, status: 'error', lastError: 'Table not found (might be implicit)' } as TableStat;
                }
                return { name: table, count: 0, status: 'error', lastError: error.message } as TableStat;
            }
            
            return { 
                name: table, 
                count: count || 0, 
                status: (count && count > 0) ? 'healthy' : 'empty' 
            } as TableStat;
        } catch (e: any) {
            return { name: table, count: 0, status: 'error', lastError: e.message } as TableStat;
        }
    });

    return await Promise.all(promises);
};
