// src/components/admin/SliderManager.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api"; 

type Slider = {
  id: string;
  imageUrl: string;
  caption_tr: string;
  caption_en: string;
  linkUrl: string;
  order: number;
};

// Tailwind stilleri
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
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
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem({ ...newItem, [e.target.name]: e.target.value });
  };

  const handleAddSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Lütfen resim seçin.");
      return;
    }

    setMessage("Yükleniyor...");
    try {
      const formData = new FormData();
      formData.append("image", file);
      
      const uploadRes = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const saveResponse = await api.post("/slider", {
        imageUrl: uploadRes.data.imageUrl,
        caption_tr: newItem.caption_tr,
        caption_en: newItem.caption_en,
        linkUrl: newItem.linkUrl,
        order: Number(newItem.order),
      });

      setSliders([...sliders, saveResponse.data]); // Listeyi güncelle
      setMessage("Slider eklendi!");
      setNewItem({ caption_tr: "", caption_en: "", linkUrl: "", order: 0 });
      setFile(null);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error(error);
      setMessage("Hata oluştu.");
    }
  };

  const handleDeleteSlider = async (id: string) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/slider/${id}`);
      setSliders(sliders.filter(s => s.id !== id)); // Listeden sil
    } catch (error) {
      console.error(error);
      alert("Silinemedi.");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Form Alanı */}
      <form onSubmit={handleAddSlider} className="p-6 bg-white rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Yeni Slider Ekle</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Resim</label>
            <input type="file" onChange={handleFileChange} required className={`${inputClass} p-0 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sıra</label>
            <input name="order" type="number" value={newItem.order} onChange={handleNewItemChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (TR)</label>
            <input name="caption_tr" value={newItem.caption_tr} onChange={handleNewItemChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (EN)</label>
            <input name="caption_en" value={newItem.caption_en} onChange={handleNewItemChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Link URL</label>
            <input name="linkUrl" value={newItem.linkUrl} onChange={handleNewItemChange} className={inputClass} placeholder="/products/urun-adi" />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button type="submit" className={buttonClass}>Ekle</button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </div>
      </form>

      {/* 2. Liste Alanı (BURASI EKSİK OLABİLİR) */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Mevcut Slider'lar</h3>
        
        {sliders.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Henüz slider eklenmemiş.</p>
        ) : (
          <div className="space-y-3">
            {sliders.map(slider => (
              <div key={slider.id} className="flex items-center gap-4 p-3 bg-gray-50 border rounded-md">
                <img src={slider.imageUrl} alt="Slider" className="w-24 h-14 object-cover rounded border" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{slider.caption_tr || "(Başlık Yok)"}</p>
                  <p className="text-xs text-gray-500">Sıra: {slider.order} | Link: {slider.linkUrl || "-"}</p>
                </div>
                <button 
                  onClick={() => handleDeleteSlider(slider.id)} 
                  className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition"
                >
                  Sil
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}