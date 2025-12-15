
import { supabase } from '../supabaseClient';
import type { Notification } from '../types';

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    if (!supabase) return [];

    const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }

    return (data || []).map((n: any) => ({
        id: n.id,
        userId: n.userId,
        message: typeof n.message === 'string' ? JSON.parse(n.message) : n.message,
        link: n.link,
        isRead: n.isRead,
        createdAt: n.createdAt
    }));
};

export const markNotificationsAsRead = async (userId: string, notificationIds: string[]): Promise<boolean> => {
    if (!supabase) return false;

    const { error } = await supabase
        .from('Notification')
        .update({ isRead: true })
        .in('id', notificationIds)
        .eq('userId', userId); // Security check

    if (error) {
        console.error("Error marking notifications read:", error);
        return false;
    }
    return true;
};

export const addNotification = async (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification | null> => {
    if (!supabase) return null;

    const newNotification = {
        userId: notificationData.userId,
        message: JSON.stringify(notificationData.message),
        link: notificationData.link,
        isRead: false,
        createdAt: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('Notification').insert(newNotification).select().single();
    
    if (error) {
        console.error("Error adding notification:", error);
        return null;
    }

    return {
        ...data,
        message: notificationData.message // Return parsed message
    };
};
