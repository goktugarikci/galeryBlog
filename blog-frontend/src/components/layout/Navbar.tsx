"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/common/LanguageSwitcher';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

// Veri Tipleri
type SubCategory = { id: string; name_tr: string; name_en?: string; };
type Category = { id: string; name_tr: string; name_en?: string; subCategories: SubCategory[] };
type Settings = { 
  logoUrl?: string; 
  navLayout: string; 
  enableEnglish: boolean; 
  navLinksJson?: string; 
  siteName?: string;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { openModal } = useModal();
  const { lang } = useLanguage();
  
  const [settings, setSettings] = useState<Settings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Mobilde (Top Menu) Dropdown kontrolü için state
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
  const isLeftLayout = settings?.navLayout === 'left';

  // --- ORTAK STİLLER (Veritabanından) ---
  const themeColors = {
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-primary)',
  };

  return (
    <>
      {/* 1. ÜST BAR (HER ZAMAN VAR - Logo, Auth, Dil) */}
      <header 
        style={{ 
          backgroundColor: themeColors.backgroundColor, 
          color: themeColors.color, 
          borderBottom: `3px solid ${themeColors.borderColor}`,
          zIndex: 50 
        }} 
        className="sticky top-0 shadow-md px-4 py-3 md:px-8 flex justify-between items-center w-full relative"
      >
        {/* Sol: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain" />
            ) : (
              <span className="text-2xl font-bold tracking-tight">{settings?.siteName || "LOGO"}</span>
            )}
          </Link>
        </div>

        {/* Orta: Özel Linkler (Sadece Üst Menü modunda buradadır) */}
        {!isLeftLayout && (
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link: any, index: number) => (
              <Link key={index} href={link.url} className="text-sm font-medium hover:text-[var(--color-primary)] transition-colors">
                {lang === 'en' && settings?.enableEnglish ? (link.text_en || link.text_tr) : link.text_tr}
              </Link>
            ))}
          </div>
        )}

        {/* Sağ: Dil ve Giriş İşlemleri */}
        <div className="flex items-center gap-4">
          {settings?.enableEnglish && <LanguageSwitcher />}
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <span className="block text-sm font-bold">{user.firstName}</span>
                <span className="block text-xs opacity-75">{user.role === 'admin' ? 'Yönetici' : 'Üye'}</span>
              </div>
              {user.role === 'admin' && (
                <Link href="/admin" className="px-3 py-1.5 text-sm font-bold bg-[var(--color-primary)] text-black rounded hover:opacity-90">Panel</Link>
              )}
              <button onClick={logout} className="text-sm underline opacity-80 hover:opacity-100">{lang === 'en' ? 'Logout' : 'Çıkış'}</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => openModal('login')} className="px-4 py-2 text-sm font-medium border border-current rounded hover:bg-white/10">{lang === 'en' ? 'Login' : 'Giriş Yap'}</button>
              <button onClick={() => openModal('register')} className="px-4 py-2 text-sm font-medium bg-[var(--color-primary)] text-black rounded hover:opacity-90">{lang === 'en' ? 'Register' : 'Kayıt Ol'}</button>
            </div>
          )}
        </div>
      </header>

      {/* 2. KATEGORİ MENÜSÜ (AYARA GÖRE DEĞİŞİR) */}
      
      {/* A) SOL MENÜ MODU (Sidebar - Sadece Kategoriler) */}
      {isLeftLayout && (
        <aside 
          style={{ 
            backgroundColor: themeColors.backgroundColor, 
            color: themeColors.color, 
            borderRight: `1px solid ${themeColors.borderColor}`,
            top: '64px' // Header yüksekliği kadar aşağıdan başla (yaklaşık)
          }} 
          className="fixed left-0 h-[calc(100vh-64px)] w-[250px] overflow-y-auto z-40 hidden md:block shadow-xl scrollbar-thin scrollbar-thumb-gray-600"
        >
          <div className="p-4">
            <h4 className="text-xs font-bold uppercase opacity-50 mb-4 px-2 border-b border-white/10 pb-2">
              {lang === 'en' ? 'Categories' : 'Kategoriler'}
            </h4>
            <div className="space-y-1">
              {categories.map((cat) => (
                <div key={cat.id} className="mb-2">
                  <Link 
                    href={`/category/${cat.id}`}
                    className="block py-2 px-3 font-semibold rounded hover:bg-white/10 hover:text-[var(--color-primary)] transition-colors"
                  >
                    {lang === 'en' && settings?.enableEnglish ? (cat.name_en || cat.name_tr) : cat.name_tr}
                  </Link>
                  {cat.subCategories && cat.subCategories.length > 0 && (
                    <div className="ml-4 border-l border-white/20 pl-2 mt-1 space-y-1">
                      {cat.subCategories.map(sub => (
                        <Link 
                          key={sub.id} 
                          href={`/category/sub/${sub.id}`} 
                          className="block py-1 px-2 text-sm opacity-70 hover:opacity-100 hover:text-[var(--color-primary)] transition-colors"
                        >
                          {lang === 'en' && settings?.enableEnglish ? (sub.name_en || sub.name_tr) : sub.name_tr}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Özel Sayfa Linklerini de Buraya Ekleyelim (Sol Menü Modunda) */}
            <div className="mt-8 pt-4 border-t border-white/10">
               {navLinks.map((link: any, index: number) => (
                <Link key={index} href={link.url} className="block py-2 px-3 text-sm font-medium hover:text-[var(--color-primary)]">
                  {lang === 'en' && settings?.enableEnglish ? (link.text_en || link.text_tr) : link.text_tr}
                </Link>
              ))}
            </div>

          </div>
        </aside>
      )}

      {/* B) ÜST MENÜ MODU (DÜZELTİLEN KISIM) */}
      {!isLeftLayout && categories.length > 0 && (
        <div 
          style={{ 
            backgroundColor: themeColors.backgroundColor, 
            color: themeColors.color, 
            borderBottom: `2px solid ${themeColors.borderColor}` 
          }} 
          // DÜZELTME: 'overflow-visible' yaptık ki dropdown dışarı taşabilsin.
          // 'flex-wrap' ekledik ki sığmayanlar aşağı insin, scroll olmasın.
          className="px-4 md:px-8 py-0 flex flex-wrap gap-x-6 gap-y-0 text-sm relative border-t border-white/10 z-30 overflow-visible"
        >
          {categories.map((cat) => (
            <div 
              key={cat.id} 
              className="relative group py-3" // py-3 buraya taşındı
              onMouseEnter={() => setActiveDropdown(cat.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link 
                href={`/category/${cat.id}`}
                className="whitespace-nowrap font-medium hover:text-[var(--color-primary)] transition-colors block"
              >
                {lang === 'en' && settings?.enableEnglish ? (cat.name_en || cat.name_tr) : cat.name_tr}
              </Link>

              {/* Hover Dropdown (Alt Kategoriler) */}
              {/* DÜZELTME: z-index artırıldı ve konumlandırma iyileştirildi */}
              {cat.subCategories && cat.subCategories.length > 0 && (
                <div 
                  className="absolute left-0 top-full w-56 bg-[var(--color-secondary)] shadow-2xl rounded-b-md border border-[var(--color-primary)] border-t-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100]"
                  style={{ marginTop: '-1px' }} // Sınır çizgisini örtmesi için
                >
                  {cat.subCategories.map(sub => (
                    <Link 
                      key={sub.id}
                      href={`/category/sub/${sub.id}`}
                      className="block px-4 py-3 hover:bg-white/10 hover:text-[var(--color-primary)] text-sm border-b border-white/5 last:border-0"
                    >
                      {lang === 'en' && settings?.enableEnglish ? (sub.name_en || sub.name_tr) : sub.name_tr}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}