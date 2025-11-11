"use client"; // Hook'ları (useAuth, useState) kullanmak için

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
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
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // === HATA DÜZELTMESİ: 'lang' artık bir state ===
  // Dil seçimini 'tr' olarak başlatıyoruz
  const [lang, setLang] = useState('tr'); 
  // TODO: Bu 'setLang' fonksiyonunu bir dil değiştirme butonu ile tetikleyebilirsiniz
  // TODO: Veya localStorage.getItem('currentLang') || 'tr' ile başlatabilirsiniz

  useEffect(() => {
    // Navbar için gerekli verileri (Ayarlar ve Kategoriler) çek
    async function fetchData() {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          api.get('/settings'), // Site Ayarları
          api.get('/products/categories') // Ürün Kategorileri
        ]);
        setSettings(settingsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Navbar verisi yüklenemedi", error);
      }
    }
    fetchData();
  }, []);

  // Ayarlardan gelen dinamik menü linkleri (örn: Hakkımızda, KVKK)
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

  if (navLayout === 'left') {
    // TODO: "left" (sol) navbar tasarımı buraya uygulanabilir
  }

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
              {/* Hata burada düzeldi (lang artık bir state) */}
              {lang === 'en' ? link.text_en : link.text_tr}
            </Link>
          ))}
        </div>

        {/* Giriş/Kayıt/Profil Butonları */}
        <div className="auth-links" style={{ display: 'flex', gap: '1rem' }}>
          {user ? (
            <>
              <Link href="/profile">{user.firstName}</Link>
              {user.role === 'admin' && (
                <Link href="/admin" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Admin Paneli
                </Link>
              )}
              <button onClick={logout}>Çıkış Yap</button>
            </>
          ) : (
            <>
              <Link href="/login">Giriş Yap</Link>
              <Link href="/register">Kayıt Ol</Link>
            </>
          )}
        </div>
      </nav>

      {/* 2. Kategori Barı */}
      {navLayout === 'top' && categories.length > 0 && (
        <div className="category-bar" style={categoryBarStyle}>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.id}`}>
              {/* Hata burada düzeldi (lang artık bir state) */}
              {lang === 'en' && settings?.enableEnglish ? cat.name_en : cat.name_tr}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}