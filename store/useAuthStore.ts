
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Partner, Role, Permission } from '../types';
import { supabase } from '../lib/supabase'; // Import real supabase client
import { rolePermissions } from '../data/permissions';
import { mapPartnerFromDB } from '../utils/supabaseMapper';

interface AuthState {
    currentUser: Partner | null;
    permissions: Permission[];
    isLoading: boolean;
    
    // Actions
    login: (email: string, pass: string) => Promise<Partner | null>;
    logout: () => Promise<void>;
    hasPermission: (permission: Permission) => boolean;
    
    // Internal setter to sync session state
    setCurrentUser: (user: Partner | null) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            permissions: [],
            isLoading: false,

            login: async (email: string, pass: string) => {
                set({ isLoading: true });
                const cleanEmail = email.trim();

                try {
                    if (!supabase) throw new Error("Supabase client not initialized");

                    // 1. Attempt to Authenticate
                    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email: cleanEmail,
                        password: pass,
                    });

                    // ---------------------------------------------------------
                    // AUTO-FIX: Self-healing for Admin Seed Account
                    // If login fails for the specific seed admin email, try to register it on the fly.
                    // This handles cases where the DB row exists (via SQL seed) but the Auth user does not.
                    // ---------------------------------------------------------
                    if (authError && cleanEmail === 'admin@onlyhelio.com' && authError.message.includes('Invalid login credentials')) {
                         console.warn("Admin login failed. Attempting auto-registration sync for seed account...");
                         
                         const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                             email: cleanEmail,
                             password: pass,
                         });
                         
                         if (!signUpError && signUpData.user) {
                             console.log("Admin Auth account created. Syncing 'partners' table ID...");
                             
                             // CRITICAL: Update the seed row in 'partners' to match the new Auth User ID (UUID)
                             // This ensures Row Level Security (RLS) policies work correctly.
                             const { error: updateError } = await supabase
                                .from('partners')
                                .update({ id: signUpData.user.id })
                                .eq('email', cleanEmail);
                                
                             if (!updateError) {
                                 console.log("Database ID synced successfully. Proceeding with new session.");
                                 // Use the new session data from signup
                                 authData = { user: signUpData.user, session: signUpData.session };
                                 authError = null; // Clear the error to proceed
                             } else {
                                 console.error("Failed to sync admin ID:", updateError);
                             }
                         }
                    }
                    // ---------------------------------------------------------

                    if (authError) {
                        console.error("Supabase Auth Error:", authError.message);
                        set({ isLoading: false });
                        return null;
                    }

                    if (!authData.user) {
                         set({ isLoading: false });
                         return null;
                    }

                    // 2. Fetch User Profile from 'partners' table
                    // Using 'ilike' to ensure case-insensitive matching
                    const { data: partnerData, error: dbError } = await supabase
                        .from('partners')
                        .select('*')
                        .ilike('email', cleanEmail) 
                        .maybeSingle();

                    if (dbError) {
                        console.error("Database error fetching profile:", dbError);
                        set({ isLoading: false });
                        return null;
                    }

                    if (!partnerData) {
                        console.error("Profile not found in 'partners' table for email:", cleanEmail);
                        set({ isLoading: false });
                        return null;
                    }

                    // 3. Map DB data to Partner type
                    const user = mapPartnerFromDB(partnerData);
                    const permissions = rolePermissions.get(user.role) || [];

                    set({ 
                        currentUser: user, 
                        permissions, 
                        isLoading: false 
                    });
                    
                    return user;

                } catch (error) {
                    console.error("Login process failed", error);
                    set({ isLoading: false });
                    return null;
                }
            },

            logout: async () => {
                if (supabase) {
                    await supabase.auth.signOut();
                }
                set({ currentUser: null, permissions: [] });
                localStorage.removeItem('onlyhelio-auth-storage');
            },

            hasPermission: (permission: Permission) => {
                const state = get();
                if (!state.currentUser) return false;
                if (state.currentUser.role === Role.SUPER_ADMIN) return true;
                return state.permissions.includes(permission);
            },

            setCurrentUser: (user: Partner | null) => {
                if (user) {
                    const permissions = rolePermissions.get(user.role) || [];
                    set({ currentUser: user, permissions });
                } else {
                    set({ currentUser: null, permissions: [] });
                }
            }
        }),
        {
            name: 'onlyhelio-auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ currentUser: state.currentUser, permissions: state.permissions }),
        }
    )
);
