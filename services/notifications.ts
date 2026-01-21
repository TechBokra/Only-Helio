
import { supabase } from '../supabaseClient';
import type { Notification } from '../types';

export const getNotificationsByUserId = async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
        .from('Notification')
        .select('*')
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
    return data || [];
};

export const markNotificationsAsRead = async (userId: string, notificationIds: string[]): Promise<boolean> => {
    const { error } = await supabase
        .from('Notification')
        .update({ isRead: true })
        .eq('userId', userId)
        .in('id', notificationIds);

    return !error;
};

export const addNotification = async (notificationData: Omit<Notification, 'id' | 'isRead' | 'createdAt'>): Promise<Notification> => {
    const { data, error } = await supabase
        .from('Notification')
        .insert({
            ...notificationData,
            isRead: false,
            createdAt: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
    return data;
};
