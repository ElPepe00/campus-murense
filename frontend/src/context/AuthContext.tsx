// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuari } from '../types/auth';
import { loginStaff, getPerfilStaff } from '../api/authApi';

interface AuthContextType {
  usuari: Usuari | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuari, setUsuari] = useState<Usuari | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('murense_token');
    if (token) {
      getPerfilStaff()
        .then((perfil) => setUsuari(perfil))
        .catch(() => {
          localStorage.removeItem('murense_token');
          setUsuari(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await loginStaff(email, pass);
    localStorage.setItem('murense_token', res.access_token);
    const perfil = await getPerfilStaff();
    setUsuari(perfil);
  };

  const logout = () => {
    localStorage.removeItem('murense_token');
    setUsuari(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuari,
        isLoading,
        isLoggedIn: !!usuari,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
