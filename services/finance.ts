
import { supabase } from '../supabaseClient';
import type { Transaction, TransactionStatus, FinanceStats } from '../types';
import { addNotification } from './notifications';

// Helper
const mapDbToTransaction = (row: any): Transaction => ({
    id: row.id,
    userId: row.userId,
    userName: row.userName || 'Unknown',
    amount: row.amount,
    currency: row.currency || 'EGP',
    type: row.type,
    status: row.status,
    method: row.method,
    description: row.description,
    relatedEntityId: row.relatedEntityId,
    receiptUrl: row.receiptUrl,
    referenceNumber: row.referenceNumber,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
});

export const getAllTransactions = async (): Promise<Transaction[]> => {
    const { data, error } = await supabase
        .from('Transaction')
        .select('*')
        .order('createdAt', { ascending: false });

    if (error || !data) return [];
    return data.map(mapDbToTransaction);
};

export const getTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
        .from('Transaction')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error || !data) return [];
    return data.map(mapDbToTransaction);
};

export const getFinanceStats = async (): Promise<FinanceStats> => {
    const { data, error } = await supabase
        .from('Transaction')
        .select('amount, status');

    if (error || !data) return { totalRevenue: 0, pendingAmount: 0, successfulTransactions: 0, pendingReviews: 0 };

    return data.reduce((acc, curr) => {
        if (curr.status === 'paid') {
            acc.totalRevenue += curr.amount;
            acc.successfulTransactions += 1;
        } else if (curr.status === 'reviewing' || curr.status === 'pending') {
            acc.pendingAmount += curr.amount;
        }
        
        if (curr.status === 'reviewing') {
            acc.pendingReviews += 1;
        }
        return acc;
    }, { totalRevenue: 0, pendingAmount: 0, successfulTransactions: 0, pendingReviews: 0 });
};

export const createTransaction = async (data: Omit<Transaction, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    const newTransaction = {
        ...data,
        id: `txn-${Date.now()}`,
        status: data.method === 'card' ? 'paid' : 'reviewing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase.from('Transaction').insert(newTransaction).select().single();
    
    if (error) throw error;
    
    const txn = mapDbToTransaction(inserted);

    // Notify Admin if review needed
    if (txn.status === 'reviewing') {
        addNotification({
            userId: 'admin-user',
            message: {
                ar: `إيصال دفع جديد للمراجعة من ${data.userName}`,
                en: `New payment receipt for review from ${data.userName}`,
            },
            link: '/admin/finance',
        });
    }

    return txn;
};

export const updateTransactionStatus = async (id: string, status: TransactionStatus): Promise<Transaction | undefined> => {
    const { data, error } = await supabase
        .from('Transaction')
        .update({ status, updatedAt: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error || !data) return undefined;
    
    const txn = mapDbToTransaction(data);

    // Notify User
    addNotification({
        userId: txn.userId,
        message: {
            ar: `تم تحديث حالة الدفع الخاصة بك إلى: ${status}`,
            en: `Your payment status has been updated to: ${status}`,
        },
        link: '/dashboard/finance',
    });

    return txn;
};
