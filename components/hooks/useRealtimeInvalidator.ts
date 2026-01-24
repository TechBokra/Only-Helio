
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';
import { useToast } from '../shared/ToastContext';
import { useAuth } from '../auth/AuthContext';
import { Role } from '../../types';

export const useRealtimeInvalidator = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return;

        // Channel for Notifications (Specific to User)
        const notificationChannel = supabase
            .channel('realtime-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Notification',
                    filter: `userId=eq.${currentUser.id}`,
                },
                (payload) => {
                    // 1. Invalidate notification query to update the bell count
                    queryClient.invalidateQueries({ queryKey: ['notifications'] });
                    
                    // 2. Show visual toast
                    const newNotif = payload.new as any;
                    // Try to parse message if it's JSON string, or use directly if object
                    let msg = newNotif.message;
                    if (typeof msg === 'string') {
                        try { msg = JSON.parse(msg); } catch(e) {}
                    }
                    const text = msg?.en || "You have a new notification";
                    showToast(`🔔 ${text}`, 'success');
                }
            )
            .subscribe();

        // Channel for Global Data (Leads, Requests) - Admin Only or Relevant Partners
        // For simplicity in MVP, we listen to table inserts. 
        // In production, RLS policies dictate what we receive, but listening to 'INSERT' usually requires 
        // the client to have SELECT permission on the new row.
        
        const dataChannel = supabase.channel('realtime-data-updates');

        // Listen for new Leads
        if (currentUser.role === Role.SUPER_ADMIN || ['developer', 'finishing', 'agency'].includes(currentUser.type)) {
            dataChannel.on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'Lead' },
                (payload) => {
                    const newLead = payload.new as any;
                    
                    // Only react if the lead belongs to this partner or it's an admin
                    if (
                        currentUser.role === Role.SUPER_ADMIN || 
                        newLead.partnerId === currentUser.id || 
                        newLead.managerId === currentUser.id
                    ) {
                        queryClient.invalidateQueries({ queryKey: ['allLeads'] });
                        queryClient.invalidateQueries({ queryKey: ['paginatedLeads'] });
                        queryClient.invalidateQueries({ queryKey: ['partner-leads'] }); // For partner dashboard
                        
                        // Optional: Toast for new lead (if not covered by notification system logic)
                        // showToast('New Lead Received!', 'success');
                    }
                }
            );
        }

        // Listen for Partner Requests (Admin Only)
        if (currentUser.role === Role.SUPER_ADMIN || currentUser.role === Role.PARTNER_RELATIONS_MANAGER) {
            dataChannel.on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'PartnerRequest' },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['partnerRequests'] });
                    showToast('New Partner Application Received', 'success');
                }
            );
        }
        
        dataChannel.subscribe();

        return () => {
            supabase.removeChannel(notificationChannel);
            supabase.removeChannel(dataChannel);
        };
    }, [currentUser, queryClient, showToast]);
};
