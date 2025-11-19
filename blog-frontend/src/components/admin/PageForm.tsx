// src/components/admin/PageForm.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// Stil sabitleri
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
const labelClass = "block text-sm font-medium text-gray-700";
const buttonClass = "px-6 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function PageForm() {
  const [formData, setFormData] = useState({
    title_tr: "",
    title_en: "",
    slug: "",
    layoutJson_tr: "",
    layoutJson_en: "",
    sliderEnabled: true,
    sliderPosition: "top",
  });
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const val = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;

    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Kaydediliyor...");
    try {
      // Not: Bu form henüz slider "resimlerini" yüklemiyor,
      // sadece ayarları kaydediyor. Resim yükleme daha sonra eklenebilir.
      await api.post("/pages", formData);
      setMessage("Sayfa başarıyla oluşturuldu.");
      router.push("/admin/content/pages");
    } catch (err) {
      setMessage("Hata: Sayfa oluşturulamadı.");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-6">
      
      {/* Temel Bilgiler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title_tr" className={labelClass}>Sayfa Başlığı (TR) *</label>
          <input id="title_tr" name="title_tr" type="text" value={formData.title_tr} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="title_en" className={labelClass}>Sayfa Başlığı (EN)</label>
          <input id="title_en" name="title_en" type="text" value={formData.title_en} onChange={handleChange} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="slug" className={labelClass}>URL (Slug) *</label>
        <input id="slug" name="slug" type="text" value={formData.slug} onChange={handleChange} className={inputClass} placeholder="örn: hakkimizda" required />
      </div>

      {/* Slider Ayarları */}
      <fieldset className="border p-4 rounded-md">
        <legend className="text-lg font-medium text-gray-900">Düzen ve Slider Ayarları</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <input 
                type="checkbox" 
                name="sliderEnabled" 
                checked={formData.sliderEnabled} 
                onChange={handleChange} 
                className="mr-2"
              />
              Sayfa Slider'ı Aktif
            </label>
          </div>
          <div>
            <label htmlFor="sliderPosition" className={labelClass}>Slider Konumu</label>
            <select id="sliderPosition" name="sliderPosition" value={formData.sliderPosition} onChange={handleChange} className={inputClass}>
              <option value="top">İçeriğin Üstünde</option>
              <option value="bottom">İçeriğin Altında</option>
            </select>
          </div>
        </div>
      </fieldset>
      
      {/* İçerik Metni (LayoutJson) */}
      <fieldset className="border p-4 rounded-md">
        <legend className="text-lg font-medium text-gray-900">İçerik Metni (Konumu)</legend>
        <p className="text-sm text-gray-500 mb-4">Bu alan "layout"u temsil eder. Şimdilik basit metin, ileride JSON editörü olabilir.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="layoutJson_tr" className={labelClass}>İçerik (TR)</label>
            <textarea id="layoutJson_tr" name="layoutJson_tr" value={formData.layoutJson_tr} onChange={handleChange} rows={10} className={inputClass}></textarea>
          </div>
          <div>
            <label htmlFor="layoutJson_en" className={labelClass}>İçerik (EN)</label>
            <textarea id="layoutJson_en" name="layoutJson_en" value={formData.layoutJson_en} onChange={handleChange} rows={10} className={inputClass}></textarea>
          </div>
        </div>
      </fieldset>
      
      {/* Kaydet Butonu */}
      <div className="border-t pt-4">
        <button type="submit" className={buttonClass}>Sayfayı Kaydet</button>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
      </div>
    </form>
  );
}