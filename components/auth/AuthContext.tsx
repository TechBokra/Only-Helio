import React, { ReactNode } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Partner, Permission } from '../../types';

// -----------------------------------------------------------------------------
// MIGRATION NOTE:
// We have migrated state management to Zustand (store/useAuthStore.ts).
// This file now serves as a compatibility layer (Adapter/Facade) so we don't
// have to update imports in every single file that used `useAuth()`.
// The `AuthProvider` is now a dummy pass-through component.
// -----------------------------------------------------------------------------

interface AuthContextType {
    currentUser: Partner | null;
    permissions: Permission[];
    hasPermission: (permission: Permission) => boolean;
    login: (email: string, pass: string) => Promise<Partner | null>;
    logout: () => void;
    loading: boolean;
}

// Dummy Provider - No longer needed for state, but kept to prevent app crash if index.tsx wraps it
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return <>{children}</>;
};

// The Hook now delegates to Zustand
export const useAuth = (): AuthContextType => {
    const store = useAuthStore();
    
    return {
        currentUser: store.currentUser,
        permissions: store.permissions,
        hasPermission: store.hasPermission,
        login: store.login,
        logout: store.logout,
        loading: store.isLoading
    };
};
