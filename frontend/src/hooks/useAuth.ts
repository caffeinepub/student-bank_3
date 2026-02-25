import { createContext, useContext, useState, useCallback, ReactNode, createElement } from 'react';
import { useInternetIdentity } from './useInternetIdentity';

export type UserRole = 'admin' | 'user' | 'guest';

export interface AuthSession {
  role: UserRole;
  username: string;
  accountNumber?: string;
  useInternetIdentity?: boolean;
}

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isUser: boolean;
  login: (username: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'adminSession';

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const { login: iiLogin, clear: iiClear } = useInternetIdentity();
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const login = useCallback(
    async (username: string, password: string, role: UserRole): Promise<{ success: boolean; error?: string }> => {
      setIsLoggingIn(true);
      try {
        if (role === 'admin') {
          if (username !== 'admin' || password !== 'admin') {
            return { success: false, error: 'Invalid admin credentials' };
          }
          // Trigger Internet Identity login for authenticated actor
          try {
            await iiLogin();
          } catch {
            // II login may open a popup; proceed with session regardless
          }
          const newSession: AuthSession = {
            role: 'admin',
            username: 'admin',
            useInternetIdentity: true,
          };
          setSession(newSession);
          localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
          return { success: true };
        } else {
          // User login: account number = password
          const accountNumber = username.trim();
          const pwd = password.trim();
          if (!accountNumber || accountNumber !== pwd) {
            return { success: false, error: 'Account number and password must match' };
          }
          const newSession: AuthSession = {
            role: 'user',
            username: accountNumber,
            accountNumber,
            useInternetIdentity: false,
          };
          setSession(newSession);
          localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
          return { success: true };
        }
      } catch (e: any) {
        return { success: false, error: e?.message ?? 'Login failed' };
      } finally {
        setIsLoggingIn(false);
      }
    },
    [iiLogin]
  );

  const logout = useCallback(async () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    try {
      await iiClear();
    } catch {
      // ignore
    }
  }, [iiClear]);

  const value: AuthContextType = {
    session,
    isAuthenticated: !!session,
    isAdmin: session?.role === 'admin',
    isUser: session?.role === 'user',
    login,
    logout,
    isLoggingIn,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
