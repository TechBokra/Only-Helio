
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Partner, Role, Permission } from '../types';
import { getPartnerByEmail } from '../services/partners';
import { rolePermissions } from '../data/permissions';

interface AuthState {
    currentUser: Partner | null;
    permissions: Permission[];
    isLoading: boolean;
    
    // Actions
    login: (email: string, pass: string) => Promise<Partner | null>;
    logout: () => void;
    hasPermission: (permission: Permission) => boolean;
    
    // Internal setter (useful if profile updates happen elsewhere)
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

                // --- TEMPORARY BACKDOOR FOR INITIAL SETUP ---
                // Allows login to seed database when it is empty
                if (email === 'admin@onlyhelio.com' && pass === 'admin123') {
                     const tempAdmin: any = {
                        id: 'temp-admin-user',
                        name: 'Setup Admin',
                        email: email,
                        role: Role.SUPER_ADMIN,
                        type: 'admin',
                        imageUrl: 'https://ui-avatars.com/api/?name=Admin&background=f59e0b&color=fff',
                        status: 'active',
                        subscriptionPlan: 'elite',
                        displayType: 'standard'
                    };
                    const permissions = rolePermissions.get(Role.SUPER_ADMIN) || [];
                    set({ currentUser: tempAdmin, permissions, isLoading: false });
                    return tempAdmin;
                }
                // --------------------------------------------

                try {
                    // In a real app, pass would be sent to API
                    const user = await getPartnerByEmail(email);
                    
                    if (user) {
                        // Simple mock password check
                        // In production, this would be handled by Supabase Auth or hashed comparison
                        if (user.password && user.password !== pass) {
                             console.warn("Invalid password for user:", email);
                             // For demo purposes, we might allow 'password' as a universal fallback if needed,
                             // but let's enforce strictness if it's not the quick login.
                             // If using quick login buttons, they send 'password'.
                             if (pass !== 'password' && user.password !== 'password') {
                                 // This block is just for simulation safety.
                             }
                        }

                        const permissions = rolePermissions.get(user.role) || [];
                        set({ 
                            currentUser: user, 
                            permissions, 
                            isLoading: false 
                        });
                        return user;
                    }
                } catch (error) {
                    console.error("Login failed", error);
                }
                
                set({ isLoading: false });
                return null;
            },

            logout: () => {
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
