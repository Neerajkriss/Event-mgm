import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, Role } from '@/types';
import { mockUsers } from '@/data/seed';

interface AuthContextValue {
  user: User | null;
  isAuthed: boolean;
  login: (user: User) => void;
  loginWithCredentials: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, role: Role) => { success: boolean; error?: string };
  logout: () => void;
  switchRole: (role: Role) => void;
  users: User[];
}

const STORAGE_KEY = 'eventhub:auth-user';
const DEMO_PASSWORD = 'demo1234';
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as User);
      }
    } catch {
      // ignore
    }
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
    (email: string, _password: string): { success: boolean; error?: string } => {
      const normalized = email.trim().toLowerCase();
      const match = mockUsers.find((u) => u.email.toLowerCase() === normalized);
      if (!match) {
        return { success: false, error: 'No account found with that email address.' };
      }
      persistUser(match);
      return { success: true };
    },
    [persistUser]
  );

  const register = useCallback(
    (name: string, email: string, _password: string, role: Role): { success: boolean; error?: string } => {
      const normalized = email.trim().toLowerCase();
      const existing = mockUsers.find((u) => u.email.toLowerCase() === normalized);
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
      const target = mockUsers.find((u) => u.role === role) ?? null;
      if (target) persistUser(target);
    },
    [persistUser]
  );

  return (
    <AuthContext.Provider
      value={{ user, isAuthed: user !== null, login, loginWithCredentials, register, logout, switchRole, users: mockUsers }}
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
