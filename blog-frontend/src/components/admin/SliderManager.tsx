"use client";

import { useState } from "react";
import api from "@/lib/api"; // Axios istemcimiz

// Tipleri tanımla
type Slider = {
  id: string;
  imageUrl: string;
  caption_tr: string;
  caption_en: string;
  linkUrl: string;
  order: number;
};

// YENİ: Tailwind için Input stilini tanımla
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
// YENİ: Tailwind için Button stilini tanımla
const buttonClass = "px-4 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function SliderManager({ initialSliders }: { initialSliders: Slider[] }) {
  const [sliders, setSliders] = useState<Slider[]>(initialSliders);
  const [file, setFile] = useState<File | null>(null);
  const [newItem, setNewItem] = useState({
    caption_tr: "",
    caption_en: "",
    linkUrl: "",
    order: 0,
  });
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Lütfen önce bir resim dosyası seçin.");
      return;
    }

    setMessage("1/2 Resim yükleniyor...");
    
    try {
      // 1. Resmi /api/upload/single'a yükle
      const formData = new FormData();
      formData.append("image", file);
      
      const uploadResponse = await api.post("/upload/single", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { imageUrl } = uploadResponse.data;
      setMessage("2/2 Slider verisi kaydediliyor...");

      // 2. Gelen URL'yi ve diğer bilgileri /api/slider'a kaydet
      const saveResponse = await api.post("/slider", {
        imageUrl: imageUrl,
        caption_tr: newItem.caption_tr,
        caption_en: newItem.caption_en,
        linkUrl: newItem.linkUrl,
        order: Number(newItem.order),
      });

      // 3. Başarılı olunca listeyi güncelle
      setSliders([...sliders, saveResponse.data]);
      setMessage("Slider başarıyla eklendi!");
      setNewItem({ caption_tr: "", caption_en: "", linkUrl: "", order: 0 });
      setFile(null);
      (e.target as HTMLFormElement).reset();

    } catch (error) {
      console.error(error);
      setMessage("Hata: Slider eklenemedi.");
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (!window.confirm("Bu öğeyi silmek istediğinizden emin misiniz?")) {
      return;
    }
    try {
      await api.delete(`/slider/${id}`);
      setSliders(sliders.filter(s => s.id !== id));
      setMessage("Slider öğesi silindi.");
    } catch (error) {
      console.error(error);
      setMessage("Hata: Slider silinemedi.");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Yeni Slider Ekleme Formu */}
      <form 
        onSubmit={handleAddSlider} 
        className="p-6 bg-white rounded-lg shadow-md space-y-4"
      >
        <h3 className="text-xl font-semibold text-gray-900">Yeni Slider Ekle</h3>
        
        {/* Form Alanları Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Resim Dosyası</label>
            <input 
              type="file" 
              onChange={handleFileChange} 
              required 
              className={`${inputClass} p-0 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sıra</label>
            <input name="order" type="number" value={newItem.order} onChange={handleNewItemChange} placeholder="Sıra (örn: 0)" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (TR)</label>
            <input name="caption_tr" value={newItem.caption_tr} onChange={handleNewItemChange} placeholder="Açıklama (TR)" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (EN)</label>
            <input name="caption_en" value={newItem.caption_en} onChange={handleNewItemChange} placeholder="Açıklama (EN)" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Link URL</label>
            <input name="linkUrl" value={newItem.linkUrl} onChange={handleNewItemChange} placeholder="Link URL (örn: /products/abc)" className={inputClass} />
          </div>
        </div>

        {/* Buton ve Mesaj Alanı */}
        <div className="flex items-center justify-between">
          <button type="submit" className={buttonClass}>
            Ekle
          </button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>
      </form>

      {/* 2. Mevcut Slider'lar Listesi */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Mevcut Slider'lar</h3>
        {sliders.length === 0 && <p className="text-gray-500">Henüz slider eklenmemiş.</p>}
        
        <div className="space-y-3">
          {sliders.map(slider => (
            <div 
              key={slider.id} 
              className="flex items-center gap-4 p-3 bg-gray-50 border rounded-md"
            >
              <img 
                src={slider.imageUrl} 
                alt={slider.caption_tr} 
                className="w-24 h-12 object-cover rounded"
              />
              <div className="flex-1 text-sm">
                <p className="font-medium text-gray-800">TR: {slider.caption_tr} | EN: {slider.caption_en}</p>
                <small className="text-gray-500">Sıra: {slider.order} | Link: {slider.linkUrl}</small>
              </div>
              <button 
                onClick={() => handleDeleteSlider(slider.id)} 
                className="ml-auto px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 