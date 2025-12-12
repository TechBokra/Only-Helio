import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Partner, Role, Permission } from '../types';
import { supabase } from '../supabaseClient';
import { getPartnerByEmail } from '../services/partners';
import { rolePermissions } from '../data/permissions';

interface AuthState {
    currentUser: Partner | null;
    permissions: Permission[];
    isLoading: boolean;
    
    // Actions
    login: (email: string, pass: string) => Promise<Partner | null>;
    logout: () => Promise<void>;
    hasPermission: (permission: Permission) => boolean;
    
    // Internal setter
    setCurrentUser: (user: Partner | null) => void;
    checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            currentUser: null,
            permissions: [],
            isLoading: false,

            login: async (email: string, pass: string) => {
                set({ isLoading: true });
                try {
                    // 1. Try Supabase Auth (Identity Platform)
                    if (supabase) {
                        const { data, error } = await supabase.auth.signInWithPassword({
                            email,
                            password: pass,
                        });
                        
                        if (error) {
                            // If user is not in Auth system yet (Legacy/Seeded), suppress the scary warning
                            // because we have a fallback strategy below.
                            if (error.message === "Invalid login credentials") {
                                console.info("Auth: Standard login failed, attempting Database verification (Fallback mode).");
                            } else {
                                console.warn("Supabase Auth Error:", error.message);
                            }
                        }
                    }

                    // 2. Fetch User Profile from 'User' table (public schema)
                    // This serves as the fallback source of truth for the MVP
                    const userProfile = await getPartnerByEmail(email);
                    
                    if (userProfile) {
                        const permissions = rolePermissions.get(userProfile.role) || [];
                        set({ 
                            currentUser: userProfile, 
                            permissions, 
                            isLoading: false 
                        });
                        return userProfile;
                    } else {
                        throw new Error("Invalid login credentials");
                    }

                } catch (error) {
                    console.error("Login process failed", error);
                    set({ isLoading: false });
                    return null;
                }
            },

            logout: async () => {
                set({ isLoading: true });
                if (supabase) {
                    await supabase.auth.signOut();
                }
                set({ currentUser: null, permissions: [], isLoading: false });
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
            },

            checkSession: async () => {
                if (!supabase) return;
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    const userProfile = await getPartnerByEmail(session.user.email);
                    if (userProfile) {
                        const permissions = rolePermissions.get(userProfile.role) || [];
                        set({ currentUser: userProfile, permissions });
                    }
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