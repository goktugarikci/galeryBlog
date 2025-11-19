// src/components/layout/Navbar.tsx (GÜNCELLENMİŞ HALİ)
"use client"; 

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
// 1. YENİ: Modal context'ini import edin
import { useModal } from '@/context/ModalContext'; 
import { useEffect, useState } from 'react';
import api from '@/lib/api';

// Backend'den gelecek veri tipleri
type Category = { id: string; name_tr: string; name_en?: string; };
type Settings = { 
  logoUrl?: string; 
  navLayout: string; 
  enableEnglish: boolean; 
  navLinksJson?: string; 
};

export default function Navbar() {
  const { user, logout } = useAuth();
  // 2. YENİ: openModal fonksiyonunu context'ten alın
  const { openModal } = useModal(); 
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [lang, setLang] = useState('tr'); 

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          api.get('/settings'), 
          api.get('/products/categories') 
        ]);
        setSettings(settingsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Navbar verisi yüklenemedi", error);
      }
    }
    fetchData();
  }, []);

  const navLinks = settings?.navLinksJson ? JSON.parse(settings.navLinksJson) : [];

  const navBarStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-primary)',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '2px solid var(--color-primary)'
  };

  const categoryBarStyle: React.CSSProperties = {
    backgroundColor: '#333',
    color: 'white',
    padding: '0.5rem 1rem',
    display: 'flex',
    gap: '1.5rem',
  };

  const navLayout = settings?.navLayout || 'top';

  return (
    <header>
      {/* 1. Ana Navbar (Logo, Linkler, Auth) */}
      <nav style={navBarStyle}>
        <div className="logo">
          <Link href="/">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" style={{ height: '40px' }} />
            ) : (
              <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>LOGO</span>
            )}
          </Link>
        </div>
        
        {/* Dinamik Tekil Sayfa Linkleri (navLinksJson'dan) */}
        <div className="nav-links" style={{ display: 'flex', gap: '1rem' }}>
          {navLinks.map((link: any) => (
            <Link key={link.url} href={link.url}>
              {lang === 'en' ? link.text_en : link.text_tr}
            </Link>
          ))}
        </div>

        {/* 3. DEĞİŞİKLİK: Giriş/Kayıt/Profil Butonları */}
        <div className="auth-links" style={{ display: 'flex', gap: '1rem' }}>
          {user ? (
            <>
              <Link href="/profile">{user.firstName}</Link>
              {user.role === 'admin' && (
                <Link href="/admin" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Admin Paneli
                </Link>
              )}
              <button onClick={logout} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              {/* <Link href="/login">Giriş Yap</Link> DEĞİŞTİ */}
              <button 
                onClick={() => openModal('login')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                Giriş Yap
              </button>
              
              {/* <Link href="/register">Kayıt Ol</Link> DEĞİŞTİ */}
              <button 
                onClick={() => openModal('register')}
                style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                Kayıt Ol
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 2. Kategori Barı */}
      {navLayout === 'top' && categories.length > 0 && (
        <div className="category-bar" style={categoryBarStyle}>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.id}`}>
              {lang === 'en' && settings?.enableEnglish ? cat.name_en : cat.name_tr}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}