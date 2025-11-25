// src/components/admin/CampaignForm.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

// Basit ürün tipi (Seçim listesi için)
type ProductSummary = { id: string; name_tr: string; price: number; };
type CampaignData = {
  id?: string;
  title_tr: string;
  title_en: string;
  slug: string;
  description_tr: string;
  description_en: string;
  isActive: boolean;
  productIds: string[];
};

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // Düzenleme için gelen veri
};

// Stiller
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm";
const labelClass = "block text-sm font-medium text-gray-700";

export default function CampaignForm({ onClose, onSuccess, initialData }: Props) {
  const [formData, setFormData] = useState<CampaignData>({
    title_tr: initialData?.title_tr || "",
    title_en: initialData?.title_en || "",
    slug: initialData?.slug || "",
    description_tr: initialData?.description_tr || "",
    description_en: initialData?.description_en || "",
    isActive: initialData?.isActive ?? true,
    productIds: initialData?.products?.map((p: any) => p.id) || [],
  });

  const [allProducts, setAllProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Ürünleri çek
  useEffect(() => {
    api.get('/products').then(res => setAllProducts(res.data));
  }, []);

  // Ürün Seç/Kaldır
  const toggleProduct = (id: string) => {
    if (formData.productIds.includes(id)) {
      setFormData(prev => ({ ...prev, productIds: prev.productIds.filter(pid => pid !== id) }));
    } else {
      setFormData(prev => ({ ...prev, productIds: [...prev.productIds, id] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (initialData?.id) {
        // Güncelleme
        await api.put(`/campaigns/${initialData.id}`, formData);
      } else {
        // Yeni Ekleme
        await api.post('/campaigns', formData);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("İşlem başarısız.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Arka Plan (Bulanık ve Yarı Saydam)
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* Modal İçeriği */}
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-teal-800">
            {initialData ? "Kampanyayı Düzenle" : "Yeni Kampanya Oluştur"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Başlıklar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Kampanya Başlığı (TR) *</label>
              <input required value={formData.title_tr} onChange={e => setFormData({...formData, title_tr: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Kampanya Başlığı (EN)</label>
              <input value={formData.title_en} onChange={e => setFormData({...formData, title_en: e.target.value})} className={inputClass} />
            </div>
          </div>

          {/* URL ve Durum */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className={labelClass}>URL Slug (örn: yaz-firsatlari) *</label>
              <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className={inputClass} />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 text-teal-600 rounded" />
                <span className="ml-2 text-gray-700 font-medium">Kampanya Aktif</span>
              </label>
            </div>
          </div>

          {/* Açıklamalar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Açıklama (TR)</label>
              <textarea rows={3} value={formData.description_tr} onChange={e => setFormData({...formData, description_tr: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Açıklama (EN)</label>
              <textarea rows={3} value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} className={inputClass} />
            </div>
          </div>

          {/* Ürün Seçimi */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
              <span>Dahil Edilecek Ürünler</span>
              <span className="text-xs font-normal bg-teal-100 text-teal-800 px-2 py-1 rounded-full">{formData.productIds.length} Seçili</span>
            </div>
            <div className="max-h-60 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allProducts.map(product => (
                <label key={product.id} className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${formData.productIds.includes(product.id) ? 'bg-teal-50 border-teal-300' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.productIds.includes(product.id)}
                    onChange={() => toggleProduct(product.id)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-gray-800">{product.name_tr}</div>
                    <div className="text-xs text-gray-500">{product.price} TL</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">İptal</button>
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-2 bg-teal-700 text-white font-semibold rounded-md hover:bg-teal-800 shadow-sm disabled:opacity-50"
            >
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}