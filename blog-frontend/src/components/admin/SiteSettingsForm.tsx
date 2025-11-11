"use client"; // Form yönetimi için (useState)

import { useState } from "react";
import api from "@/lib/api"; // Merkezi Axios istemcimiz

// Gelen ayarların tipini (interface) tanımlayalım
type SiteSettings = {
  id: string;
  enableEnglish: boolean;
  navLayout: string;
  eCommerceEnabled: boolean;
  whatsAppNumber: string;
  // ... (color, seo vb. diğer tüm alanlar)
  [key: string]: any; // Diğer alanlar için
};

export default function SiteSettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Checkbox'lar (boolean) için özel kontrol
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
      // Axios (api.ts) kullanarak backend'e PUT isteği gönder
      // Token (Auth) otomatik olarak eklenecektir
      const response = await api.put("/settings", settings);
      
      setMessage("Ayarlar başarıyla güncellendi!");
      setSettings(response.data); // Sunucudan dönen en güncel veriyi al
    } catch (error) {
      console.error(error);
      setMessage("Hata: Ayarlar güncellenemedi.");
    }
  };

  // Basit bir form (Tailwind olmadan inline style ile)
  const inputStyle = { border: '1px solid #999', padding: '0.25rem', width: '300px', marginBottom: '1rem', display: 'block' };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
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

      <h3>Düzen Ayarları</h3>
      <label>
        Navigasyon Menü Konumu
        <select name="navLayout" value={settings.navLayout} onChange={handleChange} style={inputStyle}>
          <option value="top">Üst Menü (Top)</option>
          <option value="left">Sol Menü (Left)</option>
        </select>
      </label>

      <hr style={{ margin: '1rem 0' }} />

      <h3>Tema Renkleri (Sarı/Siyah Tema)</h3>
      <label>
        Ana Arka Plan Rengi
        <input type="color" name="colorBackground" value={settings.colorBackground} onChange={handleChange} />
      </label>
      <br />
      <label>
        Ana Yazı Rengi
        <input type="color" name="colorText" value={settings.colorText} onChange={handleChange} />
      </label>
       <br />
      <label>
        Ana Vurgu Rengi (Sarı)
        <input type="color" name="colorPrimary" value={settings.colorPrimary} onChange={handleChange} />
      </label>

      {/* (Buraya 'siteName', 'seoTitle', 'whatsAppNumber' vb. 
        diğer tüm ayar alanları için input'lar eklenebilir) 
      */}

      <hr style={{ margin: '1rem 0' }} />

      <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: 'blue', color: 'white', border: 'none' }}>
        Ayarları Kaydet
      </button>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </form>
  );
}