// src/context/AuthContext.tsx
"use client"; 

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api'; 
import socket from '@/lib/socket'; 

// 1. YENİ: User tipini tanımla
type User = { 
  id: string; 
  email: string; 
  firstName: string; 
  role: string; 
};

// Context'in veri yapısı
interface AuthContextType {
  user: User | null; // User tipini kullan
  token: string | null;
  isLoading: boolean;
  // 2. DEĞİŞİKLİK: Promise<void> yerine Promise<User> döndüreceğini belirt
  login: (email: string, password: string) => Promise<User>; 
  logout: () => void;
}

// Context'i oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context'i sağlayan ana bileşen (Provider)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // State'e User tipini ver
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  // Sayfa ilk yüklendiğinde localStorage'ı kontrol et
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as User); // Tipi belirt
      socket.connect();
    }
    setIsLoading(false);
  }, []);

  // Giriş Yap Fonksiyonu
  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    
    const { token, user }: { token: string; user: User } = response.data; // Gelen verinin tipini belirt

    setToken(token);
    setUser(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));

    socket.connect();

    // 3. DEĞİŞİKLİK: Giriş yapan 'user' objesini LoginPage'e döndür
    return user; 
  };

  // Çıkış Yap Fonksiyonu
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    socket.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Context'i kolayca kullanmak için bir hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır');
  }
  return context;
};