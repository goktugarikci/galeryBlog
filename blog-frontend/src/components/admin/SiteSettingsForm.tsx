// src/components/admin/SiteSettingsForm.tsx
"use client"; 

import { useState } from "react";
import api from "@/lib/api"; 

// Gelen ayarların tipini (interface) tanımlayalım
type SiteSettings = {
  id: string;
  enableEnglish: boolean;
  navLayout: string;
  eCommerceEnabled: boolean;
  whatsAppNumber: string;
  // --- Renk alanları ---
  colorBackground: string;
  colorText: string;
  colorPrimary: string;
  colorSecondary: string;
  colorButtonAddToCart: string;
  colorButtonAddToCartText: string;
  colorButtonBuyNow: string;
  colorButtonBuyNowText: string;
  // --- YENİ: SEO Alanları ---
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoAuthor: string;
  
  [key: string]: any; 
};

export default function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const isCheckbox = type === 'checkbox';
    if (isCheckbox && e.target instanceof HTMLInputElement) {
        setSettings({
            ...settings,
            [name]: e.target.checked,
        });
    } else {
        setSettings({
            ...settings,
            [name]: value,
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Kaydediliyor...");
    
    try {
      // Backend'e PUT isteği (tüm ayarları gönderir)
      const response = await api.put("/settings", settings);
      
      setMessage("Ayarlar başarıyla güncellendi!");
      setSettings(response.data); 
    } catch (error) {
      console.error(error);
      setMessage("Hata: Ayarlar güncellenemedi.");
    }
  };

  // Basit bir form (Tailwind olmadan inline style ile)
  const inputStyle = { border: '1px solid #999', padding: '0.25rem', width: '300px', marginBottom: '1rem', display: 'block' };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      
      {/* --- Dil ve Mod Ayarları --- */}
      <h3>Dil ve Mod Ayarları</h3>
      <div>
        <label>
          <input 
            type="checkbox" 
            name="enableEnglish"
            checked={settings.enableEnglish}
            onChange={handleChange}
          />
          İngilizce (EN) Dil Desteğini Aktif Et
        </label>
      </div>
      <div>
        <label>
          <input 
            type="checkbox" 
            name="eCommerceEnabled"
            checked={settings.eCommerceEnabled}
            onChange={handleChange}
          />
          E-Ticaret Modu (Sepet ve Sipariş) Aktif
        </label>
        <small style={{display: 'block'}}> (İşaretlenmezse, WhatsApp Katalog Modu aktif olur)</small>
      </div>
      
      <hr style={{ margin: '1rem 0' }} />

      {/* --- Düzen Ayarları --- */}
      <h3>Düzen Ayarları</h3>
      <label>
        Navigasyon Menü Konumu
        <select name="navLayout" value={settings.navLayout} onChange={handleChange} style={inputStyle}>
          <option value="top">Üst Menü (Top)</option>
          <option value="left">Sol Menü (Left)</option>
        </select>
      </label>

      {/* --- Tema Renkleri --- */}
      <h3>Tema Renkleri</h3>
      <label>Ana Arka Plan Rengi <input type="color" name="colorBackground" value={settings.colorBackground} onChange={handleChange} /></label><br />
      <label>Ana Yazı Rengi <input type="color" name="colorText" value={settings.colorText} onChange={handleChange} /></label><br />
      <label>Ana Vurgu Rengi (Sarı) <input type="color" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} /></label><br />
      <label>İkincil Renk (Navbar vb.) <input type="color" name="colorSecondary" value={settings.colorSecondary} onChange={handleChange} /></label><br />
      <label>'Sepete Ekle' Buton Rengi <input type="color" name="colorButtonAddToCart" value={settings.colorButtonAddToCart} onChange={handleChange} /></label><br />
      <label>'Sepete Ekle' Yazı Rengi <input type="color" name="colorButtonAddToCartText" value={settings.colorButtonAddToCartText} onChange={handleChange} /></label><br />
      <label>'Hemen Al' Buton Rengi <input type="color" name="colorButtonBuyNow" value={settings.colorButtonBuyNow} onChange={handleChange} /></label><br />
      <label>'Hemen Al' Yazı Rengi <input type="color" name="colorButtonBuyNowText" value={settings.colorButtonBuyNowText} onChange={handleChange} /></label><br />

      {/* --- YENİ EKLENEN SEO BÖLÜMÜ --- */}
      <hr style={{ margin: '1rem 0' }} />
      
      <h3>Global SEO Ayarları</h3>
      <label>
        Site Başlığı (SEO Title)
        <input type="text" name="seoTitle" value={settings.seoTitle || ''} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Site Açıklaması (SEO Description)
        <input type="text" name="seoDescription" value={settings.seoDescription || ''} onChange={handleChange} style={inputStyle} />
      </label>
      <label>
        Anahtar Kelimeler (SEO Keywords)
        <input type="text" name="seoKeywords" value={settings.seoKeywords || ''} onChange={handleChange} style={inputStyle} placeholder="örn: galeri, blog, sanat" />
      </label>
      <label>
        Site Sahibi (SEO Author)
        <input type="text" name="seoAuthor" value={settings.seoAuthor || ''} onChange={handleChange} style={inputStyle} />
      </label>
      {/* --- SEO BÖLÜMÜ SONU --- */}

      <hr style={{ margin: '1rem 0' }} />

      <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: 'blue', color: 'white', border: 'none' }}>
        Ayarları Kaydet
      </button>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </form>
  );
}