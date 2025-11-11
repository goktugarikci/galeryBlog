"use client";

import { useState } from "react";
import api from "@/lib/api"; // Axios istemcimiz

// Tipleri tanımla (Çoklu dil şemasına göre)
type Slider = {
  id: string;
  imageUrl: string;
  caption_tr: string;
  caption_en: string;
  linkUrl: string;
  order: number;
};

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
      // Formu temizlemek için (eğer bir <form> elementi kullanıyorsanız)
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
      // Listeden sil
      setSliders(sliders.filter(s => s.id !== id));
      setMessage("Slider öğesi silindi.");
    } catch (error) {
      console.error(error);
      setMessage("Hata: Slider silinemedi.");
    }
  };

  return (
    <div>
      {/* Yeni Slider Ekleme Formu */}
      <form onSubmit={handleAddSlider} style={{ background: 'white', padding: '1rem', marginTop: '1rem' }}>
        <h3>Yeni Slider Ekle</h3>
        <input type="file" onChange={handleFileChange} required />
        <input name="caption_tr" value={newItem.caption_tr} onChange={handleNewItemChange} placeholder="Açıklama (TR)" />
        <input name="caption_en" value={newItem.caption_en} onChange={handleNewItemChange} placeholder="Açıklama (EN)" />
        <input name="linkUrl" value={newItem.linkUrl} onChange={handleNewItemChange} placeholder="Link URL (örn: /products/abc)" />
        <input name="order" type="number" value={newItem.order} onChange={handleNewItemChange} placeholder="Sıra" />
        <button type="submit">Ekle</button>
        {message && <p>{message}</p>}
      </form>

      {/* Mevcut Slider'lar Listesi */}
      <div style={{ marginTop: '2rem' }}>
        <h3>Mevcut Slider'lar</h3>
        {sliders.length === 0 && <p>Henüz slider eklenmemiş.</p>}
        {sliders.map(slider => (
          <div key={slider.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '0.5rem', marginBottom: '0.5rem' }}>
            <img src={slider.imageUrl} alt={slider.caption_tr} width={100} height={50} style={{ objectFit: 'cover' }} />
            <div>
              <p>TR: {slider.caption_tr} | EN: {slider.caption_en}</p>
              <small>Sıra: {slider.order} | Link: {slider.linkUrl}</small>
            </div>
            <button onClick={() => handleDeleteSlider(slider.id)} style={{ marginLeft: 'auto', background: 'red', color: 'white' }}>
              Sil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}