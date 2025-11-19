// src/components/auth/AuthModal.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext'; // 1. Adımda oluşturduğumuz Context
import api from '@/lib/api';

export default function AuthModal() {
  const { view, closeModal, openModal } = useModal();
  const { login } = useAuth(); // AuthContext'ten login fonksiyonu
  const router = useRouter();

  // --- Form State'leri ---
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [regFirstName, setRegFirstName] = useState("");
  const [regLastName, setRegLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  
  const [error, setError] = useState<string | null>(null);

  // Modal görünür değilse hiçbir şey render etme
  if (!view) return null;

  // --- Fonksiyonlar ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const loggedInUser = await login(loginEmail, loginPassword);
      closeModal(); // Modalı kapat
      
      // Admin ise /admin'e, değilse ana sayfaya yönlendir
      if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
      router.refresh(); // Navbar'ı güncelle
    } catch (err: any) {
      setError(err.response?.data?.error || "Giriş başarısız.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/auth/register', {
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail,
        password: regPassword,
      });
      alert("Kayıt başarılı! Lütfen giriş yapın.");
      openModal('login'); // Kayıttan sonra login formunu aç
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Kayıt başarısız.");
    }
  };

  const isLoginView = view === 'login';

  return (
    // Arka Plan Overlay (İsteğinizdeki "şeffaf" kısım)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-75 backdrop-blur-sm"
      onClick={closeModal} // Dışarı tıklayınca kapat
    >
      {/* Modal İçeriği (Tıklamayı durdur) */}
      <div
        className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg text-white"
        onClick={(e) => e.stopPropagation()} // İçeriğe tıklayınca kapanmasın
      >
        {/* === GİRİŞ FORMU === */}
        <div style={{ display: isLoginView ? 'block' : 'none' }}>
          <h1 className="text-3xl font-bold text-center text-primary">Giriş Yap</h1>
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-6">
            <div>
              <label htmlFor="email_login" className="block text-sm font-medium text-gray-300">E-posta</label>
              <input
                id="email_login" type="email" required
                value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="password_login" className="block text-sm font-medium text-gray-300">Şifre</label>
              <input
                id="password_login" type="password" required
                value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md"
              />
            </div>
            {error && isLoginView && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="w-full px-4 py-2 font-semibold text-black bg-yellow-400 rounded-md hover:bg-yellow-200">
              Giriş Yap
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-400">
            Hesabınız yok mu?{' '}
            <button onClick={() => { openModal('register'); setError(null); }} className="font-medium text-primary hover:underline">
              Kayıt Olun
            </button>
          </p>
        </div>

        {/* === KAYIT FORMU === */}
        <div style={{ display: !isLoginView ? 'block' : 'none' }}>
          <h1 className="text-3xl font-bold text-center text-primary">Hesap Oluştur</h1>
          <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label htmlFor="firstName_reg" className="block text-sm font-medium text-gray-300">Ad</label>
                <input id="firstName_reg" type="text" required value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" />
              </div>
              <div className="w-1/2">
                <label htmlFor="lastName_reg" className="block text-sm font-medium text-gray-300">Soyad</label>
                <input id="lastName_reg" type="text" required value={regLastName} onChange={(e) => setRegLastName(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" />
              </div>
            </div>
            <div>
              <label htmlFor="email_reg" className="block text-sm font-medium text-gray-300">E-posta</label>
              <input id="email_reg" type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" />
            </div>
            <div>
              <label htmlFor="password_reg" className="block text-sm font-medium text-gray-300">Şifre</label>
              <input id="password_reg" type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md" />
            </div>
            {error && !isLoginView && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" className="w-full px-4 py-2 font-semibold text-black bg-yellow-400 rounded-md hover:bg-yellow-200">
              Kayıt Ol
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-400">
            Zaten bir hesabınız var mı?{' '}
            <button onClick={() => { openModal('login'); setError(null); }} className="font-medium text-primary hover:underline">
              Giriş Yapın
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}