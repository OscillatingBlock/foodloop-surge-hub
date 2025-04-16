
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/api';
import { toast } from '@/hooks/use-toast';

interface User {
  id: number;
  email: string;
  role: string;
  username?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await api.auth.checkAuth();
      setIsAuthenticated(response.authenticated);
      if (response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to check authentication status:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.auth.logout();
      setIsAuthenticated(false);
      setUser(null);
      return Promise.resolve();
    } catch (error) {
      console.error("Logout error:", error);
      // Despite API errors, we should still update the local state
      setIsAuthenticated(false);
      setUser(null);
      // Re-throw the error to let the component handle it
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Listen for auth changes from other tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'authToken') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, checkAuthStatus, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
