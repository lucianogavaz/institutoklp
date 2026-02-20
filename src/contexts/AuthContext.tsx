
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, pass: string) => Promise<{ error: any; data: any }>;
    signUp: (email: string, pass: string) => Promise<{ error: any; data: any }>;
    signOut: () => Promise<{ error: any }>;
    resetPassword: (email: string) => Promise<{ error: any; data: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Provider
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sessão atual
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Ouvir mudanças de auth (login, logout, refresh)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = (email: string, pass: string) => {
        return supabase.auth.signInWithPassword({ email, password: pass });
    };

    const signUp = (email: string, pass: string) => {
        return supabase.auth.signUp({ email, password: pass });
    };

    const signOut = () => {
        return supabase.auth.signOut();
    };

    const resetPassword = (email: string) => {
        return supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://institutoklp.netlify.app/reset-password',
        });
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
