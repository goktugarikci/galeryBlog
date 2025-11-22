// src/components/admin/SiteSettingsForm.tsx
"use client"; 

import { useState } from "react";
import api from "@/lib/api"; 

// Tip Tanımı (Tüm alanları kapsayan)
type SiteSettings = {
  id: string;
  // Genel
  siteName: string;
  footerText: string;
  
  // Modlar
  enableEnglish: boolean;
  showHomeSlider: boolean;
  eCommerceEnabled: boolean;
  
  // İletişim / Düzen
  whatsAppNumber: string;
  navLayout: string;
  
  // Renkler
  colorBackground: string;
  colorText: string;
  colorPrimary: string;
  colorSecondary: string;
  colorButtonAddToCart: string;
  colorButtonAddToCartText: string;
  colorButtonBuyNow: string;
  colorButtonBuyNowText: string;
  
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoAuthor: string;
  
  [key: string]: any; 
};

export default function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  // State Başlangıç Değerleri (Undefined kontrolü ile güvenli başlatma)
  const [settings, setSettings] = useState<SiteSettings>({
    ...initialSettings,
    siteName: initialSettings.siteName || "",
    footerText: initialSettings.footerText || "",
    
    // Boolean değerler için ?? kullanarak null/undefined durumunda varsayılan ata
    enableEnglish: initialSettings.enableEnglish ?? false,
    showHomeSlider: initialSettings.showHomeSlider ?? true,
    eCommerceEnabled: initialSettings.eCommerceEnabled ?? true,
    
    navLayout: initialSettings.navLayout || "top",
    whatsAppNumber: initialSettings.whatsAppNumber || "",
    
    // Renkler (Varsayılanlar)
    colorBackground: initialSettings.colorBackground || "#ffffff",
    colorText: initialSettings.colorText || "#000000",
    colorPrimary: initialSettings.colorPrimary || "#FFD700",
    colorSecondary: initialSettings.colorSecondary || "#333333",
    colorButtonAddToCart: initialSettings.colorButtonAddToCart || "#FFD700",
    colorButtonAddToCartText: initialSettings.colorButtonAddToCartText || "#000000",
    colorButtonBuyNow: initialSettings.colorButtonBuyNow || "#000000",
    colorButtonBuyNowText: initialSettings.colorButtonBuyNowText || "#ffffff",
    
    // SEO
    seoTitle: initialSettings.seoTitle || "",
    seoDescription: initialSettings.seoDescription || "",
    seoKeywords: initialSettings.seoKeywords || "",
    seoAuthor: initialSettings.seoAuthor || "",
  });
  
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    if (isCheckbox && e.target instanceof HTMLInputElement) {
        setSettings({ ...settings, [name]: e.target.checked });
    } else {
        setSettings({ ...settings, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Kaydediliyor...");
    try {
      const response = await api.put("/settings", settings);
      setMessage("Ayarlar başarıyla güncellendi!");
      setSettings(response.data); 
      // Navbar'daki site adı gibi global değişikliklerin yansıması için sayfayı yenile
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      setMessage("Hata: Ayarlar güncellenemedi.");
    }
  };

  // Stiller (Tailwind)
  const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
  const labelClass = "block text-sm font-medium text-gray-700 mt-4";
  const sectionTitleClass = "text-xl font-bold text-gray-800 border-b pb-2 mt-8 mb-4";

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md mb-10">
      
      {/* --- 1. GENEL AYARLAR --- */}
      <h3 className={sectionTitleClass}>Genel Ayarlar</h3>
      <div>
        <label className={labelClass}>Site Adı (Navbar)</label>
        <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} className={inputClass} placeholder="Örn: Benim Blogum" />
      </div>
      <div>
        <label className={labelClass}>Footer Metni</label>
        <input type="text" name="footerText" value={settings.footerText} onChange={handleChange} className={inputClass} placeholder="Örn: © 2025 Tüm hakları saklıdır." />
      </div>

      {/* --- 2. DİL VE MOD AYARLARI --- */}
      <h3 className={sectionTitleClass}>Dil ve Mod Ayarları</h3>
      <div className="flex flex-col gap-2">
        
        <label className="flex items-center mt-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="enableEnglish"
            checked={settings.enableEnglish}
            onChange={handleChange}
            className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
          />
          <span className="ml-2 text-gray-700">İngilizce (EN) Dil Desteğini Aktif Et</span>
        </label>

        <label className="flex items-center mt-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="showHomeSlider"
            checked={settings.showHomeSlider}
            onChange={handleChange}
            className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
          />
          <span className="ml-2 text-gray-700">Anasayfa Slider'ını Göster</span>
        </label>
        
        <label className="flex items-center mt-2 cursor-pointer">
          <input 
            type="checkbox" 
            name="eCommerceEnabled"
            checked={settings.eCommerceEnabled}
            onChange={handleChange}
            className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
          />
          <span className="ml-2 text-gray-700">E-Ticaret Modu (Sepet ve Sipariş) Aktif</span>
        </label>
        <small className="text-gray-500 ml-7">(İşaretlenmezse, WhatsApp Katalog Modu aktif olur)</small>
      </div>

      {/* --- 3. DÜZEN AYARLARI --- */}
      <h3 className={sectionTitleClass}>Düzen Ayarları</h3>
      <label className={labelClass}>
        Navigasyon Menü Konumu
        <select name="navLayout" value={settings.navLayout} onChange={handleChange} className={inputClass}>
          <option value="top">Üst Menü (Top)</option>
          <option value="left">Sol Menü (Left)</option>
        </select>
      </label>

      {/* --- 4. TEMA RENKLERİ --- */}
      <h3 className={sectionTitleClass}>Tema Renkleri</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Ana Arka Plan Rengi</label><input type="color" name="colorBackground" value={settings.colorBackground} onChange={handleChange} className="h-10 w-full cursor-pointer border rounded" /></div>
        <div><label className={labelClass}>Ana Yazı Rengi</label><input type="color" name="colorText" value={settings.colorText} onChange={handleChange} className="h-10 w-full cursor-pointer border rounded" /></div>
        <div><label className={labelClass}>Ana Vurgu Rengi (Sarı)</label><input type="color" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} className="h-10 w-full cursor-pointer border rounded" /></div>
        <div><label className={labelClass}>İkincil Renk (Navbar vb.)</label><input type="color" name="colorSecondary" value={settings.colorSecondary} onChange={handleChange} className="h-10 w-full cursor-pointer border rounded" /></div>
        <div><label className={labelClass}>'Sepete Ekle' Buton Rengi</label><input type="color" name="colorButtonAddToCart" value={settings.colorButtonAddToCart} onChange={handleChange} className="h-10 w-full cursor-pointer border rounded" /></div>
        <div><label className={labelClass}>'Sepete Ekle' Yazı Rengi</label><input type="color" name="colorButtonAddToCartText" value={settings.colorButtonAddToCartText} onChange={handleChange} className="h-10 w-full cursor-pointer border rounded" /></div>
        <div><label className={labelClass}>'Hemen Al' Buton Rengi</label><input type="color" name="colorButtonBuyNow" value={settings.colorButtonBuyNow} onChange={handleChange} className="h-10 w-full cursor-pointer border rounded" /></div>
        <div><label className={labelClass}>'Hemen Al' Yazı Rengi</label><input type="color" name="colorButtonBuyNowText" value={settings.colorButtonBuyNowText} onChange={handleChange} className="h-10 w-full cursor-pointer border rounded" /></div>
      </div>

      {/* --- 5. GLOBAL SEO AYARLARI --- */}
      <h3 className={sectionTitleClass}>Global SEO Ayarları</h3>
      <div>
        <label className={labelClass}>Site Başlığı (SEO Title)</label>
        <input type="text" name="seoTitle" value={settings.seoTitle} onChange={handleChange} className={inputClass} placeholder="Örn: GaleryBlog - En İyi Ürünler" />
      </div>
      <div>
        <label className={labelClass}>Site Açıklaması (SEO Description)</label>
        <textarea name="seoDescription" value={settings.seoDescription} onChange={handleChange} className={inputClass} rows={3} placeholder="Siteniz hakkında kısa bilgi..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className={labelClass}>Anahtar Kelimeler</label>
            <input type="text" name="seoKeywords" value={settings.seoKeywords} onChange={handleChange} className={inputClass} placeholder="örn: galeri, blog, sanat" />
        </div>
        <div>
            <label className={labelClass}>Site Sahibi (Author)</label>
            <input type="text" name="seoAuthor" value={settings.seoAuthor} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <button type="submit" className="px-6 py-3 bg-teal-700 text-white font-bold rounded-md hover:bg-teal-800 transition-colors w-full md:w-auto shadow-sm">
          Ayarları Kaydet
        </button>
        {message && <p className={`mt-4 text-sm font-medium ${message.includes("Hata") ? "text-red-600" : "text-green-600"}`}>{message}</p>}
      </div>
    </form>
  );
}