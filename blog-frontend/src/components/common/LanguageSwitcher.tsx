// src/components/common/LanguageSwitcher.tsx
"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, switchLanguage } = useLanguage();

  return (
    <div 
      className="flex items-center rounded-full p-1 cursor-pointer w-24 relative shadow-inner h-10 transition-colors duration-300"
      // YENİ: Arka plan rengini veritabanından gelen 'secondary' renk yapıyoruz (Navbar ile aynı)
      // Ayrıca hafif bir border ekleyerek belirginleştiriyoruz.
      style={{ 
        backgroundColor: 'var(--color-secondary)', 
        border: '1px solid var(--color-primary)' 
      }}
    >
      
      {/* Arka Plan Kaydırıcısı (Aktif olan dilin arkasındaki kutu) */}
      <div 
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow transition-all duration-300 ease-in-out z-0
          ${lang === 'tr' ? 'left-1' : 'left-[calc(50%+0px)]'}
        `}
        // YENİ: Kaydırıcının rengini 'primary' (vurgu rengi) yapıyoruz
        style={{ backgroundColor: 'var(--color-primary)' }}
      />

      {/* TR Butonu */}
      <div 
        onClick={() => switchLanguage('tr')}
        className="flex-1 flex items-center justify-center z-10 relative transition-colors duration-300"
        // YENİ: Eğer aktifse yazı rengini buton metin rengi yap, değilse normal metin rengi yap
        style={{ 
          color: lang === 'tr' ? 'var(--color-btn-addtocart-text)' : 'var(--color-text)',
          opacity: lang === 'tr' ? 1 : 0.6 // Pasifken biraz soluk olsun
        }}
      >
        <img src="https://flagcdn.com/tr.svg" alt="TR" className="w-5 h-5 rounded-full object-cover mr-1 border border-white/20" />
        <span className="text-xs font-bold">TR</span>
      </div>

      {/* EN Butonu */}
      <div 
        onClick={() => switchLanguage('en')}
        className="flex-1 flex items-center justify-center z-10 relative transition-colors duration-300"
        style={{ 
          color: lang === 'en' ? 'var(--color-btn-addtocart-text)' : 'var(--color-text)',
          opacity: lang === 'en' ? 1 : 0.6
        }}
      >
        <img src="https://flagcdn.com/gb.svg" alt="EN" className="w-5 h-5 rounded-full object-cover mr-1 border border-white/20" />
        <span className="text-xs font-bold">EN</span>
      </div>

    </div>
  );
}