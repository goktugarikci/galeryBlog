// src/components/admin/PageSliderModal.tsx
"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";

// Slider Resim Tipi
export type SliderImage = {
  imageUrl: string;
  caption_tr: string;
  caption_en: string;
  description_tr: string; // Yeni alan
  description_en: string; // Yeni alan
  order: number;
};

type PageSliderModalProps = {
  initialImages: SliderImage[];
  onClose: () => void;
  onSave: (images: SliderImage[]) => void;
};

export default function PageSliderModal({ initialImages, onClose, onSave }: PageSliderModalProps) {
  const [images, setImages] = useState<SliderImage[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Yeni resimler seçildiğinde yükleme işlemi
  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < e.target.files.length; i++) {
        formData.append("gallery", e.target.files[i]);
      }

      const res = await api.post("/upload/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImages: SliderImage[] = res.data.imageUrls.map((url: string) => ({
        imageUrl: url,
        caption_tr: "",
        caption_en: "",
        description_tr: "",
        description_en: "",
        order: images.length,
      }));

      setImages([...images, ...newImages]);
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
      alert("Resimler yüklenemedi.");
    } finally {
      setIsUploading(false);
      // Input'u temizle ki aynı dosyayı tekrar seçebilelim
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    }
  };

  // Metin alanlarını güncelleme
  const handleTextChange = (index: number, field: keyof SliderImage, value: string) => {
    const updatedImages = [...images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setImages(updatedImages);
  };

  // Resmi silme
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Kaydet ve Kapat
  const handleSave = () => {
    // Sıralamayı (index'e göre) güncelle
    const orderedImages = images.map((img, index) => ({ ...img, order: index }));
    onSave(orderedImages);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Slider Görsellerini Yönet</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Dosya Yükleme Alanı */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFilesChange} 
              accept="image/*"
            />
            <div className="text-gray-500">
              {isUploading ? (
                <span>Yükleniyor...</span>
              ) : (
                <>
                  <span className="text-3xl block mb-2">📷</span>
                  <span className="font-medium">Yeni Görseller Eklemek İçin Tıklayın</span>
                  <p className="text-sm mt-1">veya dosyaları buraya sürükleyin</p>
                </>
              )}
            </div>
          </div>

          {/* Resim Listesi */}
          <div className="grid grid-cols-1 gap-6">
            {images.map((img, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-white border rounded-lg shadow-sm relative group">
                
                {/* Resim Önizleme */}
                <div className="w-full md:w-48 h-32 md:h-auto relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={img.imageUrl} alt="Slide" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Sıra: {index + 1}
                  </div>
                </div>

                {/* Form Alanları */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Türkçe Alanlar */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-teal-700 uppercase">Türkçe İçerik</label>
                    <input
                      type="text"
                      placeholder="Alt Mesaj (Başlık)"
                      value={img.caption_tr || ""}
                      onChange={(e) => handleTextChange(index, "caption_tr", e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                    <textarea
                      placeholder="Açıklama (Detay)"
                      value={img.description_tr || ""}
                      onChange={(e) => handleTextChange(index, "description_tr", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border rounded text-sm focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  {/* İngilizce Alanlar */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-blue-700 uppercase">İngilizce İçerik</label>
                    <input
                      type="text"
                      placeholder="Sub Message (Title)"
                      value={img.caption_en || ""}
                      onChange={(e) => handleTextChange(index, "caption_en", e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <textarea
                      placeholder="Description (Detail)"
                      value={img.description_en || ""}
                      onChange={(e) => handleTextChange(index, "description_en", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Silme Butonu */}
                <button 
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                  title="Resmi Sil"
                >
                  ✕
                </button>
              </div>
            ))}
            
            {images.length === 0 && !isUploading && (
              <p className="text-center text-gray-400 py-8">Henüz görsel eklenmedi.</p>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100"
          >
            İptal
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 text-white bg-teal-700 rounded-md hover:bg-teal-800 font-semibold shadow-sm"
          >
            Değişiklikleri Kaydet ({images.length} Görsel)
          </button>
        </div>

      </div>
    </div>
  );
}