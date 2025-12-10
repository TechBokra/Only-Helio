
import { supabase } from '../lib/supabase';
import type { Transaction, TransactionStatus, FinanceStats } from '../types';
import { addNotification } from './notifications';

const TABLE = 'transactions';

const mapTransactionFromDB = (row: any): Transaction => ({
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    amount: row.amount,
    currency: row.currency,
    type: row.type,
    description: row.description,
    method: row.method,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    referenceNumber: row.reference_number,
    receiptUrl: row.receipt_url,
    relatedEntityId: row.related_entity_id
});

export const getAllTransactions = async (): Promise<Transaction[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
    return data.map(mapTransactionFromDB);
};

export const getTransactionsByUserId = async (userId: string): Promise<Transaction[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching user transactions:", error);
        return [];
    }
    return data.map(mapTransactionFromDB);
};

export const getFinanceStats = async (): Promise<FinanceStats> => {
    // In a real scenario, use Supabase .rpc() or count queries for performance.
    // For now, calculating from fetched data to match existing logic structure
    const transactions = await getAllTransactions();
    
    return transactions.reduce((acc, curr) => {
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
    if (!supabase) throw new Error("DB connection required");

    const status: TransactionStatus = data.method === 'card' ? 'paid' : 'reviewing';
    
    const dbPayload = {
        user_id: data.userId,
        user_name: data.userName,
        amount: data.amount,
        currency: data.currency,
        type: data.type,
        description: data.description,
        method: data.method,
        status: status,
        reference_number: data.referenceNumber,
        receipt_url: data.receiptUrl,
        related_entity_id: data.relatedEntityId
    };

    const { data: inserted, error } = await supabase
        .from(TABLE)
        .insert([dbPayload])
        .select()
        .single();

    if (error) throw error;

    const newTransaction = mapTransactionFromDB(inserted);

    // Notify Admin if review needed
    if (newTransaction.status === 'reviewing') {
        await addNotification({
            userId: 'admin-user',
            message: {
                ar: `إيصال دفع جديد للمراجعة من ${data.userName}`,
                en: `New payment receipt for review from ${data.userName}`,
            },
            link: '/admin/finance',
        });
    }

    return newTransaction;
};

export const updateTransactionStatus = async (id: string, status: TransactionStatus): Promise<Transaction | undefined> => {
    if (!supabase) return undefined;

    const { data, error } = await supabase
        .from(TABLE)
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    const updatedTxn = mapTransactionFromDB(data);

    // Notify User
    await addNotification({
        userId: updatedTxn.userId,
        message: {
            ar: `تم تحديث حالة الدفع الخاصة بك إلى: ${status}`,
            en: `Your payment status has been updated to: ${status}`,
        },
        link: '/dashboard/finance',
    });

    return updatedTxn;
};
