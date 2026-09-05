import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Role } from '@/types';
import { mockUsers } from '@/data/seed';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  isAuthed: boolean;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
  register: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchRole: (role: Role) => void;
  users: User[];
}

const STORAGE_KEY = 'eventhub:auth-user';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(mockUsers);

  // Sync users on startup and check active session
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as User);
      }
    } catch {
      // ignore
    }

    const initUsers = async () => {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          setUsersList(data as User[]);
        } else {
          // Seed users if empty
          await supabase.from('users').insert(mockUsers);
          setUsersList(mockUsers);
        }
      } catch (err) {
        console.error('Error fetching users from Supabase:', err);
      }
    };

    initUsers();
  }, []);

  const persistUser = useCallback((u: User) => {
    setUser(u);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback((u: User) => persistUser(u), [persistUser]);

  const loginWithCredentials = useCallback(
    async (email: string, _password: string): Promise<{ success: boolean; error?: string }> => {
      const normalized = email.trim().toLowerCase();

      // 1. Try Supabase lookup
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalized)
        .maybeSingle();

      if (data && !error) {
        persistUser(data as User);
        return { success: true };
      }

      // 2. Fallback check local mock list
      const match = usersList.find((u) => u.email.toLowerCase() === normalized);
      if (!match) {
        return { success: false, error: 'No account found with that email address.' };
      }
      persistUser(match);
      return { success: true };
    },
    [persistUser, usersList]
  );

  const register = useCallback(
    async (name: string, email: string, _password: string, role: Role): Promise<{ success: boolean; error?: string }> => {
      const normalized = email.trim().toLowerCase();

      // Check existing in Supabase
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', normalized)
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const newUser: User = {
        id: `u-${role}-${Date.now()}`,
        name: name.trim(),
        email: normalized,
        role,
        avatar: name.trim().slice(0, 2).toUpperCase(),
      };

      // 1. Persist directly to Supabase table
      const { error: insertError } = await supabase.from('users').insert(newUser);
      if (insertError) {
        console.error('Error inserting user to Supabase:', insertError);
        return { success: false, error: insertError.message };
      }

      // 2. Update local state
      setUsersList((prev) => [...prev, newUser]);
      persistUser(newUser);
      return { success: true };
    },
    [persistUser]
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const switchRole = useCallback(
    (role: Role) => {
      const target = usersList.find((u) => u.role === role) ?? null;
      if (target) persistUser(target);
    },
    [persistUser, usersList]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthed: user !== null,
        login,
        loginWithCredentials,
        register,
        logout,
        switchRole,
        users: usersList,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}