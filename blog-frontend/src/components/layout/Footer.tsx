"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

type FooterSettings = {
  footerText: string;
  footerLinksJson?: string;
  siteName?: string;
  enableEnglish: boolean;
};

export default function Footer() {
  const { lang } = useLanguage();
  const [data, setData] = useState<FooterSettings | null>(null);

  useEffect(() => {
    async function getFooterData() {
      try {
        const res = await api.get('/settings');
        setData(res.data);
      } catch (error) {
        console.error("Footer verisi yüklenemedi");
      }
    }
    getFooterData();
  }, []);

  if (!data) return null;

  const footerLinks = data.footerLinksJson ? JSON.parse(data.footerLinksJson) : [];

  // Dinamik Stil
  const footerStyle = {
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-text)',
    borderTop: '4px solid var(--color-primary)'
  };

  return (
    <footer style={footerStyle} className="mt-auto py-10 px-4 md:px-8 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* 1. Kolon: Site Bilgisi */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-[var(--color-primary)]">
            {data.siteName || "Hakkımızda"}
          </h3>
          <p className="opacity-80 leading-relaxed">
            {data.footerText}
          </p>
        </div>

        {/* 2. Kolon: Hızlı Linkler (Dinamik) */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-[var(--color-primary)]">
            {lang === 'en' ? 'Quick Links' : 'Hızlı Bağlantılar'}
          </h3>
          <ul className="space-y-2">
            {footerLinks.map((link: any, index: number) => (
              <li key={index}>
                <Link href={link.url} className="hover:text-[var(--color-primary)] transition-colors">
                  {lang === 'en' && data.enableEnglish ? (link.text_en || link.text_tr) : link.text_tr}
                </Link>
              </li>
            ))}
            {/* Sabit İletişim Linki */}
            <li>
              <Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">
                {lang === 'en' ? 'Contact Us' : 'İletişim'}
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Kolon: İletişim / Sosyal Medya (Örnek) */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-[var(--color-primary)]">
            {lang === 'en' ? 'Follow Us' : 'Bizi Takip Edin'}
          </h3>
          <div className="flex gap-4">
            {/* Örnek Sosyal Medya İkonları (Metin olarak) */}
            <a href="#" className="opacity-70 hover:opacity-100 hover:text-[var(--color-primary)]">Instagram</a>
            <a href="#" className="opacity-70 hover:opacity-100 hover:text-[var(--color-primary)]">Twitter</a>
            <a href="#" className="opacity-70 hover:opacity-100 hover:text-[var(--color-primary)]">Facebook</a>
          </div>
        </div>

      </div>

      {/* Alt Telif Hakkı */}
      <div className="border-t border-white/10 mt-8 pt-4 text-center opacity-60 text-xs">
        &copy; {new Date().getFullYear()} {data.siteName}. {lang === 'en' ? 'All rights reserved.' : 'Tüm hakları saklıdır.'}
      </div>
    </footer>
  );
}