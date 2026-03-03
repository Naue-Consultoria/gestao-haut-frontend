import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../config/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; team: string; role: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('haut_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem('haut_token');
          localStorage.removeItem('haut_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { data } = res.data;
    localStorage.setItem('haut_token', data.session.access_token);
    // Fetch full profile
    const profileRes = await api.get('/auth/me');
    const profile = profileRes.data.data;
    localStorage.setItem('haut_user', JSON.stringify(profile));
    setUser(profile);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; team: string; role: string }) => {
    const res = await api.post('/auth/register', data);
    const { data: resData } = res.data;
    localStorage.setItem('haut_token', resData.session.access_token);
    const profileRes = await api.get('/auth/me');
    const profile = profileRes.data.data;
    localStorage.setItem('haut_user', JSON.stringify(profile));
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('haut_token');
    localStorage.removeItem('haut_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profileRes = await api.get('/auth/me');
    const profile = profileRes.data.data;
    localStorage.setItem('haut_user', JSON.stringify(profile));
    setUser(profile);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
