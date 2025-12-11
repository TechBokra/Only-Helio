
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

                    // 1. Attempt Standard Login
                    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email: cleanEmail,
                        password: pass,
                    });

                    // ---------------------------------------------------------
                    // AUTO-ADMIN HEALING STRATEGY
                    // Logic: If login fails for admin, try to sign up + login + seed DB profile.
                    // This handles cases where:
                    // 1. User doesn't exist in Auth.
                    // 2. User exists in Auth but not in DB (deleted manually or sync issue).
                    // ---------------------------------------------------------
                    if (authError && cleanEmail === 'admin@onlyhelio.com') {
                         console.warn("Admin login failed. Initiating bootstrap sequence...");

                         // Step A: Ensure Auth Account Exists
                         // We attempt signUp. If it fails because "User already registered", that's expected and fine.
                         await supabase.auth.signUp({
                             email: cleanEmail,
                             password: pass,
                             options: { data: { full_name: 'Super Admin' } }
                         });

                         // Step B: Force Sign In to get a valid Session
                         // We must sign in to get the Access Token required for the DB Insert (RLS).
                         const retryLogin = await supabase.auth.signInWithPassword({
                             email: cleanEmail,
                             password: pass,
                         });

                         if (retryLogin.data.session && retryLogin.data.user) {
                             console.log("Bootstrap: Auth session established. Checking DB profile...");
                             
                             // Step C: Ensure DB Profile Exists
                             // Now that we are authenticated, we try to UPSERT the profile.
                             const { error: upsertError } = await supabase
                                .from('partners')
                                .upsert({ 
                                    id: retryLogin.data.user.id, // Matches auth.uid()
                                    email: cleanEmail,
                                    name: 'Super Admin',
                                    name_ar: 'المشرف العام',
                                    role: 'SUPER_ADMIN',
                                    type: 'admin',
                                    status: 'active',
                                    subscription_plan: 'elite',
                                    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=75&w=200&auto=format&fit=crop'
                                }, { onConflict: 'id' })
                                .select()
                                .single();
                             
                             if (upsertError) {
                                 // Convert object to string for visibility
                                 console.error("Bootstrap: DB Profile creation failed.", JSON.stringify(upsertError));
                             } else {
                                 console.log("Bootstrap: DB Profile verified/created.");
                                 // Success! Override the initial error state
                                 authData = retryLogin.data;
                                 authError = null;
                             }
                         } else {
                             console.error("Bootstrap: Could not establish session. Email confirmation might be required in Supabase settings.");
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
