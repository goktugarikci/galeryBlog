"use client"; 

import { useState } from "react";
import api from "@/lib/api"; 

// --- TİP TANIMLARI ---
type SiteSettings = {
  id: string;
  // Genel
  siteName: string;
  footerText: string;
  logoUrl?: string;
  
  // Modlar
  enableEnglish: boolean;
  showHomeSlider: boolean;
  eCommerceEnabled: boolean; // true: Sepet, false: Katalog (WhatsApp)
  
  // İletişim / Katalog
  whatsAppNumber: string;
  whatsAppMessageTemplate: string;
  
  // Düzen
  navLayout: string;
  navLinksJson?: string;
  
  // Renkler (Tema)
  colorBackground: string;
  colorText: string;
  colorPrimary: string;
  colorSecondary: string;
  colorButtonAddToCart: string;
  colorButtonAddToCartText: string;
  colorButtonBuyNow: string;
  colorButtonBuyNowText: string;
  // Yeni Kart Renkleri
  colorCardBackground: string;
  colorCardText: string;
  
  // SEO
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoAuthor: string;
  
  // Ödeme Yöntemleri
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
  
  // --- STATE BAŞLANGIÇ DEĞERLERİ (Hata Önleyici Varsayılanlar) ---
  const [settings, setSettings] = useState<SiteSettings>({
    ...initialSettings,
    siteName: initialSettings.siteName || "",
    footerText: initialSettings.footerText || "",
    
    // Boolean
    enableEnglish: initialSettings.enableEnglish ?? false,
    showHomeSlider: initialSettings.showHomeSlider ?? true,
    eCommerceEnabled: initialSettings.eCommerceEnabled ?? true,
    
    // İletişim / Düzen
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
    colorCardBackground: initialSettings.colorCardBackground || "#343a40",
    colorCardText: initialSettings.colorCardText || "#ffffff",
    
    // SEO
    seoTitle: initialSettings.seoTitle || "",
    seoDescription: initialSettings.seoDescription || "",
    seoKeywords: initialSettings.seoKeywords || "",
    seoAuthor: initialSettings.seoAuthor || "",

    // Ödeme
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

  // --- HANDLERS ---

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
      
      // Değişikliklerin (özellikle renkler ve layout) yansıması için sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error(error);
      setMessage(`Hata: ${error.response?.data?.error || "Ayarlar güncellenemedi."}`);
      setIsSaving(false);
    }
  };

  // --- STİLLER ---
  const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mt-2";
  const sectionTitleClass = "text-lg font-bold text-gray-800 border-b pb-2 mt-10 mb-4 uppercase tracking-wide";
  const checkboxWrapperClass = "flex items-center p-3 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer";

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white rounded-xl shadow-lg mb-20 border border-gray-200 mx-auto">
      
      {/* --- 1. GENEL AYARLAR --- */}
      <h3 className={sectionTitleClass}>🏢 Genel Ayarlar</h3>
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
      <h3 className={sectionTitleClass}>⚙️ Çalışma Modu ve Dil</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* E-Ticaret / Katalog Modu */}
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
           <p className="text-xs text-gray-600 ml-7 mb-3">
             {settings.eCommerceEnabled 
               ? "Şu an: Sepet ve Sipariş işlemleri AÇIK." 
               : "Şu an: KATALOG Modu (WhatsApp Sipariş) AÇIK."}
           </p>

           {/* Katalog Modu Ayarları */}
           {!settings.eCommerceEnabled && (
             <div className="mt-4 ml-7 space-y-3 p-3 bg-white/50 rounded border border-orange-100">
                <div>
                  <label className="block text-xs font-bold text-gray-700">WhatsApp Numarası</label>
                  <input type="text" name="whatsAppNumber" value={settings.whatsAppNumber} onChange={handleChange} className={inputClass} placeholder="+90 555 123 45 67" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700">Mesaj Şablonu</label>
                  <textarea name="whatsAppMessageTemplate" value={settings.whatsAppMessageTemplate} onChange={handleChange} className={inputClass} rows={2} placeholder="Merhaba, [ÜRÜN_ADI] hakkında bilgi almak istiyorum." />
                  <p className="text-[10px] text-gray-500 mt-1">[ÜRÜN_ADI] yerine ürün ismi gelecektir.</p>
                </div>
             </div>
           )}
        </div>

        {/* Diğer Checkboxlar */}
        <div className="space-y-3">
            <label className={checkboxWrapperClass}>
              <input type="checkbox" name="enableEnglish" checked={settings.enableEnglish} onChange={handleChange} className="w-5 h-5 text-teal-600 rounded" />
              <div className="ml-3">
                <span className="block font-medium text-gray-800">İngilizce (EN) Dil Desteği</span>
                <span className="block text-xs text-gray-500">Sitede bayrak ikonu görünür.</span>
              </div>
            </label>

            <label className={checkboxWrapperClass}>
              <input type="checkbox" name="showHomeSlider" checked={settings.showHomeSlider} onChange={handleChange} className="w-5 h-5 text-teal-600 rounded" />
              <div className="ml-3">
                <span className="block font-medium text-gray-800">Anasayfa Slider'ını Göster</span>
                <span className="block text-xs text-gray-500">Anasayfanın en üstünde büyük slider alanı.</span>
              </div>
            </label>
        </div>
      </div>

      {/* --- 3. ÖDEME AYARLARI (Sadece E-Ticaret Modunda) --- */}
      {settings.eCommerceEnabled && (
        <>
          <h3 className={sectionTitleClass}>💳 Ödeme Yöntemleri</h3>
          <div className="space-y-4">
             {/* Kapıda Ödeme */}
             <label className={checkboxWrapperClass}>
                <input type="checkbox" name="paymentCashEnabled" checked={settings.paymentCashEnabled} onChange={handleChange} className="w-5 h-5 text-teal-600 rounded" />
                <span className="ml-3 font-medium text-gray-800">Kapıda Ödeme</span>
             </label>

             {/* Havale / EFT */}
             <div className={`border rounded-md p-3 ${settings.paymentIbanEnabled ? 'bg-white border-teal-200' : 'bg-gray-50'}`}>
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
             <div className={`border rounded-md p-3 ${settings.paymentPosEnabled ? 'bg-white border-teal-200' : 'bg-gray-50'}`}>
                <label className="flex items-center cursor-pointer">
                    <input type="checkbox" name="paymentPosEnabled" checked={settings.paymentPosEnabled} onChange={handleChange} className="w-5 h-5 text-teal-600 rounded" />
                    <span className="ml-3 font-medium text-gray-800">Kredi Kartı (Sanal POS)</span>
                </label>
                {settings.paymentPosEnabled && (
                    <div className="mt-3 ml-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input name="paymentPosApiKey" value={settings.paymentPosApiKey} onChange={handleChange} className={inputClass} placeholder="API Key" type="password" />
                        <input name="paymentPosSecretKey" value={settings.paymentPosSecretKey} onChange={handleChange} className={inputClass} placeholder="Secret Key" type="password" />
                        <input name="paymentPosBaseUrl" value={settings.paymentPosBaseUrl} onChange={handleChange} className={`${inputClass} md:col-span-2`} placeholder="Base URL" />
                    </div>
                )}
             </div>
          </div>
        </>
      )}

      {/* --- 4. TEMA RENKLERİ --- */}
      <h3 className={sectionTitleClass}>🎨 Tema Renkleri</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        
        {/* Grup 1: Genel */}
        <div className="bg-gray-50 p-4 rounded border">
            <h4 className="font-bold text-xs text-gray-500 uppercase mb-3">Genel Görünüm</h4>
            <div className="space-y-3">
                <div><label className={labelClass}>Ana Arka Plan</label><div className="flex gap-2"><input type="color" name="colorBackground" value={settings.colorBackground} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorBackground" value={settings.colorBackground} onChange={handleChange} className={inputClass} /></div></div>
                <div><label className={labelClass}>Ana Yazı Rengi</label><div className="flex gap-2"><input type="color" name="colorText" value={settings.colorText} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorText" value={settings.colorText} onChange={handleChange} className={inputClass} /></div></div>
                <div><label className={labelClass}>Vurgu Rengi (Primary)</label><div className="flex gap-2"><input type="color" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} className={inputClass} /></div></div>
                <div><label className={labelClass}>İkincil Renk (Navbar)</label><div className="flex gap-2"><input type="color" name="colorSecondary" value={settings.colorSecondary} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorSecondary" value={settings.colorSecondary} onChange={handleChange} className={inputClass} /></div></div>
            </div>
        </div>

        {/* Grup 2: Kartlar ve Butonlar */}
        <div className="bg-gray-50 p-4 rounded border">
            <h4 className="font-bold text-xs text-gray-500 uppercase mb-3">Kartlar ve Butonlar</h4>
            <div className="space-y-3">
                <div><label className={labelClass}>Kart Arka Planı</label><div className="flex gap-2"><input type="color" name="colorCardBackground" value={settings.colorCardBackground} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorCardBackground" value={settings.colorCardBackground} onChange={handleChange} className={inputClass} /></div></div>
                <div><label className={labelClass}>Kart Yazı Rengi</label><div className="flex gap-2"><input type="color" name="colorCardText" value={settings.colorCardText} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorCardText" value={settings.colorCardText} onChange={handleChange} className={inputClass} /></div></div>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t mt-2">
                  
                <div><label className={labelClass}>Sepet Btn Bg</label><div className="flex gap-2"><input type="color" name="colorButtonAddToCart" value={settings.colorButtonAddToCart} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorButtonAddToCart" value={settings.colorButtonAddToCart} onChange={handleChange} className={inputClass} /></div></div>
                <div><label className={labelClass}>Sepet Btn Text</label><div className="flex gap-2"><input type="color" name="colorButtonAddToCartText" value={settings.colorButtonAddToCartText} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorButtonAddToCart" value={settings.colorButtonAddToCartText} onChange={handleChange} className={inputClass} /></div></div>
                </div>
                 <div className="grid grid-cols-2 gap-2">

                <div><label className={labelClass}>Hemen Al Btn Bg</label><div className="flex gap-2"><input type="color" name="colorButtonBuyNow" value={settings.colorButtonBuyNow} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorButtonAddToCart" value={settings.colorButtonBuyNow} onChange={handleChange} className={inputClass} /></div></div>
                <div><label className={labelClass}>Hemen Al Btn Text</label><div className="flex gap-2"><input type="color" name="colorButtonBuyNowText" value={settings.colorButtonBuyNowText} onChange={handleChange} className="h-9 w-12 cursor-pointer border rounded" /><input type="text" name="colorButtonAddToCart" value={settings.colorButtonBuyNowText} onChange={handleChange} className={inputClass} /></div></div>
                </div>
            </div>
        </div>

      </div>

      {/* --- 5. SEO AYARLARI --- */}
      <h3 className={sectionTitleClass}>🔍 Global SEO Ayarları</h3>
      <div className="space-y-4">
        <div>
            <label className={labelClass}>Site Başlığı (Title)</label>
            <input type="text" name="seoTitle" value={settings.seoTitle} onChange={handleChange} className={inputClass} />
        </div>
        <div>
            <label className={labelClass}>Site Açıklaması (Description)</label>
            <textarea name="seoDescription" value={settings.seoDescription} onChange={handleChange} className={inputClass} rows={2} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={labelClass}>Anahtar Kelimeler</label>
                <input type="text" name="seoKeywords" value={settings.seoKeywords} onChange={handleChange} className={inputClass} />
            </div>
            <div>
                <label className={labelClass}>Site Sahibi (Author)</label>
                <input type="text" name="seoAuthor" value={settings.seoAuthor} onChange={handleChange} className={inputClass} />
            </div>
        </div>
      </div>

      {/* --- DÜZEN AYARLARI --- */}
      <h3 className={sectionTitleClass}>📐 Düzen Ayarları</h3>
      <div className="max-w-xs">
        <label className={labelClass}>Navigasyon Menü Konumu</label>
        <select name="navLayout" value={settings.navLayout} onChange={handleChange} className={inputClass}>
            <option value="top">Üst Menü (Top)</option>
            <option value="left">Sol Menü (Left)</option>
        </select>
      </div>

      {/* KAYDET BUTONU */}
      <div className="mt-12 border-t pt-6 sticky bottom-0 bg-white/90 backdrop-blur pb-4 z-10 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-4 -mx-4 rounded-b-xl">
        {message && (
            <p className={`text-sm font-bold ${message.includes("Hata") ? "text-red-600" : "text-green-600"}`}>
                {message}
            </p>
        )}
        <button 
          type="submit" 
          className="px-8 py-3 bg-teal-700 text-white font-bold rounded-lg hover:bg-teal-800 transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2 ml-auto"
          disabled={isSaving}
        >
          {isSaving ? (
            <><span>⏳</span> Kaydediliyor...</>
          ) : (
            <><span>💾</span> Ayarları Kaydet</>
          )}
        </button>
      </div>
    </form>
  );
}