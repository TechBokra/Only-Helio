
import { supabase } from '../lib/supabase';
import type { Notification } from '../types';

const TABLE = 'notifications';

const mapNotificationFromDB = (row: any): Notification => ({
    id: row.id,
    userId: row.user_id,
    message: typeof row.message === 'string' ? JSON.parse(row.message) : row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
    link: row.link
});

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
    return data.map(mapNotificationFromDB);
};

export const markNotificationsAsRead = async (userId: string, notificationIds: string[]): Promise<boolean> => {
     if (!supabase) return false;

     const { error } = await supabase
        .from(TABLE)
        .update({ is_read: true })
        .eq('user_id', userId)
        .in('id', notificationIds);
        
     return !error;
};

export const addNotification = async (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification | null> => {
    if (!supabase) return null;

    const payload = {
        user_id: notificationData.userId,
        message: notificationData.message, // Supabase handles JSON object conversion automatically if column is JSONB
        link: notificationData.link,
        is_read: false
    };

    const { data, error } = await supabase
        .from(TABLE)
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error("Error creating notification:", error);
        return null;
    }
    return mapNotificationFromDB(data);
};
