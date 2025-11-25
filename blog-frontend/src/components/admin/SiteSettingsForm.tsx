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
  eCommerceEnabled: boolean; // true = Sepet/Sipariş, false = Katalog/WhatsApp
  
  // İletişim / Düzen
  whatsAppNumber: string;
  whatsAppMessageTemplate: string; // Katalog modu için mesaj şablonu
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
  
  // Ödeme
  paymentCashEnabled: boolean;
  paymentIbanEnabled: boolean;
  paymentIbanInfo: string;
  paymentPosEnabled: boolean;
  paymentPosApiKey: string;
  paymentPosSecretKey: string;
  paymentPosBaseUrl: string;

  [key: string]: any; 
};

export default function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  // State Başlangıç Değerleri (Undefined kontrolü ile güvenli başlatma)
  const [settings, setSettings] = useState<SiteSettings>({
    ...initialSettings,
    siteName: initialSettings.siteName || "",
    footerText: initialSettings.footerText || "",
    
    // Boolean değerler
    enableEnglish: initialSettings.enableEnglish ?? false,
    showHomeSlider: initialSettings.showHomeSlider ?? true,
    eCommerceEnabled: initialSettings.eCommerceEnabled ?? true,
    
    navLayout: initialSettings.navLayout || "top",
    whatsAppNumber: initialSettings.whatsAppNumber || "",
    whatsAppMessageTemplate: initialSettings.whatsAppMessageTemplate || "Merhaba, [ÜRÜN_ADI] hakkında bilgi almak istiyorum.",
    
    // Renkler
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

    // Ödeme (Varsayılanlar)
    paymentCashEnabled: initialSettings.paymentCashEnabled ?? true,
    paymentIbanEnabled: initialSettings.paymentIbanEnabled ?? true,
    paymentIbanInfo: initialSettings.paymentIbanInfo || "",
    paymentPosEnabled: initialSettings.paymentPosEnabled ?? false,
    paymentPosApiKey: initialSettings.paymentPosApiKey || "",
    paymentPosSecretKey: initialSettings.paymentPosSecretKey || "",
    paymentPosBaseUrl: initialSettings.paymentPosBaseUrl || "",
  });
  
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    setIsSaving(true);
    setMessage("Kaydediliyor...");
    try {
      const response = await api.put("/settings", settings);
      setMessage("Ayarlar başarıyla güncellendi!");
      setSettings(response.data); 
      // Navbar'daki site adı, renkler vb. global değişikliklerin yansıması için sayfayı yenile
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error(error);
      setMessage("Hata: Ayarlar güncellenemedi.");
      setIsSaving(false);
    }
  };

  // Stiller (Tailwind)
  const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
  const labelClass = "block text-sm font-medium text-gray-700 mt-4";
  const sectionTitleClass = "text-xl font-bold text-gray-800 border-b pb-2 mt-8 mb-4";
  const checkboxWrapperClass = "flex items-center mt-2 cursor-pointer p-3 rounded border border-gray-200 hover:bg-gray-50 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md mb-10">
      
      {/* --- 1. GENEL AYARLAR --- */}
      <h3 className={sectionTitleClass}>Genel Ayarlar</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Site Adı (Navbar)</label>
          <input type="text" name="siteName" value={settings.siteName} onChange={handleChange} className={inputClass} placeholder="Örn: Benim Blogum" />
        </div>
        <div>
          <label className={labelClass}>Footer Metni</label>
          <input type="text" name="footerText" value={settings.footerText} onChange={handleChange} className={inputClass} placeholder="Örn: © 2025 Tüm hakları saklıdır." />
        </div>
      </div>

      {/* --- 2. MOD VE DİL AYARLARI --- */}
      <h3 className={sectionTitleClass}>Çalışma Modu ve Dil</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* E-Ticaret vs Katalog Modu */}
        <div className={`border rounded-lg p-4 ${settings.eCommerceEnabled ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
           <label className="flex items-center cursor-pointer mb-2">
             <input 
               type="checkbox" 
               name="eCommerceEnabled"
               checked={settings.eCommerceEnabled}
               onChange={handleChange}
               className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
             />
             <span className="ml-2 font-bold text-gray-900">E-Ticaret Modunu Aktif Et</span>
           </label>
           <p className="text-xs text-gray-600 ml-7">
             {settings.eCommerceEnabled 
               ? "Aktif: Kullanıcılar sepete ürün ekleyip sipariş verebilir." 
               : "Pasif (Katalog Modu): 'Sepete Ekle' yerine 'WhatsApp İle Sipariş Ver' butonu görünür."}
           </p>

           {/* Katalog Modu Ayarları (Sadece E-Ticaret kapalıysa göster) */}
           {!settings.eCommerceEnabled && (
             <div className="mt-4 ml-7 space-y-3 animate-in fade-in slide-in-from-top-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">WhatsApp Numarası</label>
                  <input 
                    type="text" 
                    name="whatsAppNumber" 
                    value={settings.whatsAppNumber} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="+90 555 123 45 67"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Mesaj Şablonu</label>
                  <textarea 
                    name="whatsAppMessageTemplate" 
                    value={settings.whatsAppMessageTemplate} 
                    onChange={handleChange} 
                    className={inputClass} 
                    rows={2}
                    placeholder="Merhaba, [ÜRÜN_ADI] hakkında bilgi almak istiyorum."
                  />
                  <p className="text-[10px] text-gray-500 mt-1">[ÜRÜN_ADI] yazan yere otomatik olarak ürünün ismi gelecektir.</p>
                </div>
             </div>
           )}
        </div>

        <div className="space-y-2">
            <label className={checkboxWrapperClass}>
              <input 
                type="checkbox" 
                name="enableEnglish"
                checked={settings.enableEnglish}
                onChange={handleChange}
                className="w-5 h-5 text-teal-600 rounded"
              />
              <div className="ml-3">
                <span className="block font-medium text-gray-800">İngilizce (EN) Dil Desteği</span>
                <span className="block text-xs text-gray-500">Sitede bayrak ikonu görünür ve içerikler çevrilebilir.</span>
              </div>
            </label>

            <label className={checkboxWrapperClass}>
              <input 
                type="checkbox" 
                name="showHomeSlider"
                checked={settings.showHomeSlider}
                onChange={handleChange}
                className="w-5 h-5 text-teal-600 rounded"
              />
              <div className="ml-3">
                <span className="block font-medium text-gray-800">Anasayfa Slider'ını Göster</span>
                <span className="block text-xs text-gray-500">Anasayfanın en üstünde büyük slider alanı görünür.</span>
              </div>
            </label>
        </div>
      </div>

      {/* --- 3. ÖDEME AYARLARI (Sadece E-Ticaret Modunda) --- */}
      {settings.eCommerceEnabled && (
        <>
          <h3 className={sectionTitleClass}>Ödeme Yöntemleri</h3>
          <div className="space-y-4">
             {/* Kapıda Ödeme */}
             <label className={checkboxWrapperClass}>
                <input type="checkbox" name="paymentCashEnabled" checked={settings.paymentCashEnabled} onChange={handleChange} className="w-5 h-5 text-teal-600 rounded" />
                <span className="ml-3 font-medium text-gray-800">Kapıda Ödeme (Nakit/Kredi Kartı)</span>
             </label>

             {/* Havale / EFT */}
             <div className={`border rounded-md p-3 ${settings.paymentIbanEnabled ? 'bg-white' : 'bg-gray-50'}`}>
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="paymentIbanEnabled" checked={settings.paymentIbanEnabled} onChange={handleChange} className="w-5 h-5 text-teal-600 rounded" />
                    <span className="ml-3 font-medium text-gray-800">Havale / EFT</span>
                </label>
                {settings.paymentIbanEnabled && (
                    <div className="mt-2 ml-8">
                        <label className="block text-xs text-gray-500 mb-1">Banka ve IBAN Bilgileri</label>
                        <textarea name="paymentIbanInfo" value={settings.paymentIbanInfo} onChange={handleChange} className={inputClass} rows={2} />
                    </div>
                )}
             </div>

             {/* Kredi Kartı (Sanal POS) */}
             <div className={`border rounded-md p-3 ${settings.paymentPosEnabled ? 'bg-white' : 'bg-gray-50'}`}>
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="paymentPosEnabled" checked={settings.paymentPosEnabled} onChange={handleChange} className="w-5 h-5 text-teal-600 rounded" />
                    <span className="ml-3 font-medium text-gray-800">Kredi Kartı (Sanal POS)</span>
                </label>
                {settings.paymentPosEnabled && (
                    <div className="mt-3 ml-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input name="paymentPosApiKey" value={settings.paymentPosApiKey} onChange={handleChange} className={inputClass} placeholder="API Key" type="password" />
                        <input name="paymentPosSecretKey" value={settings.paymentPosSecretKey} onChange={handleChange} className={inputClass} placeholder="Secret Key" type="password" />
                        <input name="paymentPosBaseUrl" value={settings.paymentPosBaseUrl} onChange={handleChange} className={`${inputClass} md:col-span-2`} placeholder="Base URL (https://api...)" />
                    </div>
                )}
             </div>
          </div>
        </>
      )}

      {/* --- 4. TEMA RENKLERİ --- */}
      <h3 className={sectionTitleClass}>Tema Renkleri</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className={labelClass}>Ana Arka Plan Rengi</label><div className="flex gap-2"><input type="color" name="colorBackground" value={settings.colorBackground} onChange={handleChange} className="h-10 w-16 cursor-pointer border rounded" /><input type="text" name="colorBackground" value={settings.colorBackground} onChange={handleChange} className={inputClass} /></div></div>
        <div><label className={labelClass}>Ana Yazı Rengi</label><div className="flex gap-2"><input type="color" name="colorText" value={settings.colorText} onChange={handleChange} className="h-10 w-16 cursor-pointer border rounded" /><input type="text" name="colorText" value={settings.colorText} onChange={handleChange} className={inputClass} /></div></div>
        <div><label className={labelClass}>Ana Vurgu Rengi (Sarı)</label><div className="flex gap-2"><input type="color" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} className="h-10 w-16 cursor-pointer border rounded" /><input type="text" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} className={inputClass} /></div></div>
        <div><label className={labelClass}>İkincil Renk (Navbar vb.)</label><div className="flex gap-2"><input type="color" name="colorSecondary" value={settings.colorSecondary} onChange={handleChange} className="h-10 w-16 cursor-pointer border rounded" /><input type="text" name="colorSecondary" value={settings.colorSecondary} onChange={handleChange} className={inputClass} /></div></div>
        <div><label className={labelClass}>'Sepete/WhatsApp' Buton Rengi</label><div className="flex gap-2"><input type="color" name="colorButtonAddToCart" value={settings.colorButtonAddToCart} onChange={handleChange} className="h-10 w-16 cursor-pointer border rounded" /><input type="text" name="colorButtonAddToCart" value={settings.colorButtonAddToCart} onChange={handleChange} className={inputClass} /></div></div>
        <div><label className={labelClass}>'Sepete/WhatsApp' Yazı Rengi</label><div className="flex gap-2"><input type="color" name="colorButtonAddToCartText" value={settings.colorButtonAddToCartText} onChange={handleChange} className="h-10 w-16 cursor-pointer border rounded" /><input type="text" name="colorButtonAddToCartText" value={settings.colorButtonAddToCartText} onChange={handleChange} className={inputClass} /></div></div>
      </div>

      {/* --- 5. GLOBAL SEO AYARLARI --- */}
      <h3 className={sectionTitleClass}>Global SEO Ayarları</h3>
      <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-gray-700">Site Başlığı (Title)</label>
            <input type="text" name="seoTitle" value={settings.seoTitle} onChange={handleChange} className={inputClass} />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Site Açıklaması (Description)</label>
            <textarea name="seoDescription" value={settings.seoDescription} onChange={handleChange} className={inputClass} rows={2} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Anahtar Kelimeler</label>
                <input type="text" name="seoKeywords" value={settings.seoKeywords} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Site Sahibi (Author)</label>
                <input type="text" name="seoAuthor" value={settings.seoAuthor} onChange={handleChange} className={inputClass} />
            </div>
        </div>
      </div>

      {/* --- DÜZEN AYARLARI --- */}
      <h3 className={sectionTitleClass}>Düzen Ayarları</h3>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Navigasyon Menü Konumu
      </label>
      <select name="navLayout" value={settings.navLayout} onChange={handleChange} className={inputClass}>
          <option value="top">Üst Menü (Top)</option>
          <option value="left">Sol Menü (Left)</option>
      </select>

      <div className="mt-10 border-t pt-6 sticky bottom-0 bg-white pb-4 z-10 flex items-center justify-between">
        {message && (
            <p className={`text-sm font-bold ${message.includes("Hata") ? "text-red-600" : "text-green-600"}`}>
                {message}
            </p>
        )}
        <button type="submit" className="px-8 py-3 bg-teal-700 text-white font-bold rounded-md hover:bg-teal-800 transition-colors shadow-lg disabled:opacity-50" disabled={isSaving}>
          {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </div>
    </form>
  );
}