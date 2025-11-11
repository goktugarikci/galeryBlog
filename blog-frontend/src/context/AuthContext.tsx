"use client"; // Bu dosya tarayıcıda çalışmak zorundadır (useState, localStorage)

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api'; // Adım 1'de oluşturduğumuz axios servisi
import socket from '@/lib/socket'; // Adım 2'de oluşturduğumuz socket servisi

// Context'in veri yapısı
interface AuthContextType {
  user: { id: string; email: string; firstName: string; role: string } | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Context'i oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context'i sağlayan ana bileşen (Provider)
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Sayfa ilk yüklendiğinde token'ı kontrol et

  // Sayfa ilk yüklendiğinde localStorage'ı kontrol et
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Token varsa, socket.io bağlantısını da başlat
      socket.connect();
    }
    setIsLoading(false);
  }, []);

  // Giriş Yap Fonksiyonu
  const login = async (email: string, password: string) => {
    // 1. Backend'deki /api/auth/login endpoint'ine istek at
    const response = await api.post('/auth/login', { email, password });
    
    const { token, user } = response.data;

    // 2. Gelen token ve kullanıcıyı state'e ve localStorage'a kaydet
    setToken(token);
    setUser(user);
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));

    // 3. Canlı destek ve bildirimler için socket bağlantısını AÇ
    socket.connect();
  };

  // Çıkış Yap Fonksiyonu
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    
    // 4. Socket bağlantısını KAPAT
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