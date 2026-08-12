import React, { createContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function resolveRole(userSession: Session['user']): 'admin' | 'customer' {
    const metadataRole = userSession?.app_metadata?.role || userSession?.user_metadata?.role;

    return metadataRole === 'admin' ? 'admin' : 'customer';
  }

  async function loadOrCreateProfile(sessionUser: Session['user']) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionUser.id)
      .single();

    if (!profileError && profile) {
      setUser(profile);
      return profile;
    }

    const profileData = {
      id: sessionUser.id,
      email: sessionUser.email,
      full_name: sessionUser.user_metadata?.full_name || '',
      role: resolveRole(sessionUser),
    };

    await supabase.from('profiles').insert(profileData);
    setUser(profileData as any);
    return profileData;
  }

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
      }
    }

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
      if (mounted) {
        setSession(session);
        if (session?.user) {
          try {
            await loadOrCreateProfile(session.user);
          } catch (err) {
            console.warn('Profile fetch failed', err);
            setUser({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              role: resolveRole(session.user),
            } as any);
          }
          
          // Cart sync is disabled for now - needs update for new cart_items schema
          // TODO: Implement cart sync with new cart_items table structure
        } else {
          setUser(null);
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user) {
      (async () => {
        try {
          await loadOrCreateProfile(session.user);
        } catch (err) {
          console.warn('Profile setup failed', err);
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || '',
            role: resolveRole(session.user),
          } as any);
        }
        setIsLoading(false);
      })();
    } else {
      setIsLoading(false);
    }
  }, [session?.user]);

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').insert([
        {
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          role: 'customer',
        },
      ]);
    }
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  const value = {
    session,
    user,
    isLoading,
    isAdmin: user?.role === 'admin',
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
