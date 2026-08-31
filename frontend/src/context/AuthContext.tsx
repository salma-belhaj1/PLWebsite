import React, { createContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/database';

interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, profileData?: Partial<UserProfile>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<UserProfile | null>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function resolveRole(userSession: Session['user'], existingRole?: string): 'admin' | 'customer' {
    if (existingRole === 'admin') return 'admin';
    const metadataRole = userSession?.app_metadata?.role || userSession?.user_metadata?.role;
    if (metadataRole === 'admin') return 'admin';
    if (userSession?.email === 'admin@peace.love') return 'admin';
    return 'customer';
  }

  async function loadOrCreateProfile(sessionUser: Session['user']): Promise<UserProfile> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      if (!profileError && profile) {
        const resolvedRole = resolveRole(sessionUser, profile.role);
        const resolvedProfile: UserProfile = {
          ...(profile as UserProfile),
          role: resolvedRole,
        };
        setUser(resolvedProfile);
        return resolvedProfile;
      }
    } catch (err) {
      console.warn('Profile fetch error, falling back to metadata:', err);
    }

    const meta = sessionUser.user_metadata || {};
    const profileData: UserProfile = {
      id: sessionUser.id,
      email: sessionUser.email,
      full_name: meta.full_name || '',
      phone: meta.phone || null,
      birth_date: meta.birth_date || null,
      country: meta.country || null,
      city: meta.city || null,
      state: meta.state || null,
      address: meta.address || null,
      role: resolveRole(sessionUser),
    };

    try {
      await supabase.from('profiles').insert(profileData);
    } catch (err) {
      console.warn('Profile insert error:', err);
    }

    setUser(profileData);
    return profileData;
  }

  async function refreshProfile() {
    if (session?.user) {
      await loadOrCreateProfile(session.user);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data.session);
          if (data.session?.user) {
            await loadOrCreateProfile(data.session.user);
          }
        }
      } catch (err) {
        console.error('Session retrieval error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    getInitialSession();

    const authRes = supabase.auth.onAuthStateChange(async (_event: string, newSession: Session | null) => {
      if (mounted) {
        setSession(newSession);
        if (newSession?.user) {
          await loadOrCreateProfile(newSession.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    });

    const subscription = authRes?.data?.subscription;

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  async function signUp(email: string, password: string, profileMeta?: Partial<UserProfile>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profileMeta?.full_name || '',
          phone: profileMeta?.phone || '',
          birth_date: profileMeta?.birth_date || '',
          country: profileMeta?.country || '',
          city: profileMeta?.city || '',
          state: profileMeta?.state || '',
          address: profileMeta?.address || '',
        },
      },
    });

    if (error) throw error;

    if (data.user) {
      const newProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        full_name: profileMeta?.full_name || data.user.user_metadata?.full_name || '',
        phone: profileMeta?.phone || null,
        birth_date: profileMeta?.birth_date || null,
        country: profileMeta?.country || null,
        city: profileMeta?.city || null,
        state: profileMeta?.state || null,
        address: profileMeta?.address || null,
        role: 'customer',
      };

      try {
        await supabase.from('profiles').insert([newProfile]);
      } catch (err) {
        console.warn('Profile record insert warning:', err);
      }
      setUser(newProfile);
    }
    return data;
  }

  async function signIn(email: string, password: string): Promise<UserProfile | null> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      if (data.session) setSession(data.session);
      const loadedProfile = await loadOrCreateProfile(data.user);
      return loadedProfile;
    }
    return null;
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) throw error;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
  }

  const value = {
    session,
    user,
    isLoading,
    isAdmin: user?.role === 'admin',
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
