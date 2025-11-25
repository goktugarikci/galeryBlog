"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// --- TİP TANIMLARI ---

type SubCategory = {
  id: string;
  name_tr: string;
  name_en?: string;
};

type Category = {
  id: string;
  name_tr: string;
  name_en?: string;
  subCategories: SubCategory[];
};

type Feature = {
  key_tr: string;
  value_tr: string;
  key_en: string;
  value_en: string;
};

type ProductState = {
  name_tr: string;
  name_en: string;
  description_tr: string;
  description_en: string;
  shortDescription_tr: string;
  shortDescription_en: string;
  price: number;
  sku: string;
  stock: number;
  status: 'published' | 'draft';
  subCategoryId: string | null;
  features: Feature[]; // Dinamik özellikler
};

// Modal Prop'ları
type ProductFormProps = {
  initialCategories: Category[];
  onClose: () => void;
  onSuccess: () => void;
};

// --- STİL SABİTLERİ ---
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm";
const labelClass = "block text-sm font-medium text-gray-700";
const buttonClass = "px-6 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors";

export default function ProductForm({ initialCategories, onClose, onSuccess }: ProductFormProps) {
  const router = useRouter();
  
  // --- STATE ---
  const [product, setProduct] = useState<ProductState>({
    name_tr: "",
    name_en: "",
    description_tr: "",
    description_en: "",
    shortDescription_tr: "",
    shortDescription_en: "",
    price: 0,
    sku: "",
    stock: 0,
    status: 'draft',
    subCategoryId: null,
    features: [], // Başlangıçta boş özellik listesi
  });

  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLERS ---

  // Input Değişikliği
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setProduct(prev => ({ ...prev, [name]: val }));
  };

  // Dosya Seçimi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setGalleryFiles(e.target.files);
  };

  // Özellik Ekleme
  const addFeature = () => {
    setProduct(prev => ({
      ...prev,
      features: [...prev.features, { key_tr: "", value_tr: "", key_en: "", value_en: "" }]
    }));
  };

  // Özellik Silme
  const removeFeature = (index: number) => {
    setProduct(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Özellik Güncelleme
  const handleFeatureChange = (index: number, field: keyof Feature, value: string) => {
    const updatedFeatures = [...product.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setProduct(prev => ({ ...prev, features: updatedFeatures }));
  };

  // Form Gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Ürün kaydediliyor...");

    try {
      // 1. Resim Yükleme
      let galleryImageUrls = [];
      if (galleryFiles && galleryFiles.length > 0) {
        setMessage("1/2 Resimler yükleniyor...");
        const formData = new FormData();
        for (let i = 0; i < galleryFiles.length; i++) {
          formData.append('gallery', galleryFiles[i]);
        }
        const uploadRes = await api.post('/upload/multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        galleryImageUrls = uploadRes.data.imageUrls;
      }

      // 2. Veri Kaydetme
      setMessage("2/2 Ürün bilgileri kaydediliyor...");
      
      const productData = {
        ...product,
        // Resimleri şemaya uygun formata getir
        galleryImages: galleryImageUrls.map((url: string, index: number) => ({
          imageUrl: url,
          altText: product.name_tr,
          order: index,
        })),
        // Özellikleri olduğu gibi gönder (Backend controller bunları işleyecek)
        features: product.features
      };

      await api.post('/products', productData);

      setMessage("Ürün başarıyla oluşturuldu!");
      setIsLoading(false);
      onSuccess(); // Listeyi yenile ve modalı kapat (opsiyonel olarak modalı burada kapatabiliriz)

    } catch (err) {
      console.error(err);
      setMessage("Hata: Ürün oluşturulamadı.");
      setIsLoading(false);
    }
  };

  return (
    // Dış Katman: Yarı saydam siyah + Bulanıklık (backdrop-blur)
    // onClick={onClose} KALDIRILDI -> Dışarı tıklayınca kapanmaz.
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm p-4"
    >
      {/* Modal İçeriği */}
      <div
        className="relative w-full max-w-5xl bg-white rounded-xl shadow-2xl text-gray-900 flex flex-col max-h-[90vh]"
      >
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-teal-900">Yeni Ürün Ekle</h2>
          {/* Kapatma Butonu */}
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
            title="Pencereyi Kapat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* --- BODY (Scrollable) --- */}
        <div className="overflow-y-auto p-6 space-y-8">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Temel Bilgiler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name_tr" className={labelClass}>Ürün Adı (TR) *</label>
                <input id="name_tr" name="name_tr" type="text" value={product.name_tr} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="name_en" className={labelClass}>Ürün Adı (EN)</label>
                <input id="name_en" name="name_en" type="text" value={product.name_en} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* 2. Fiyat ve Stok */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <label htmlFor="price" className={labelClass}>Fiyat (TL) *</label>
                <input id="price" name="price" type="number" step="0.01" value={product.price} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label htmlFor="sku" className={labelClass}>SKU (Stok Kodu)</label>
                <input id="sku" name="sku" type="text" value={product.sku} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label htmlFor="stock" className={labelClass}>Stok Adedi *</label>
                <input id="stock" name="stock" type="number" value={product.stock} onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            {/* 3. Kategori ve Durum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="subCategoryId" className={labelClass}>Kategori *</label>
                <select id="subCategoryId" name="subCategoryId" value={product.subCategoryId || ''} onChange={handleChange} className={inputClass} required>
                  <option value="">-- Alt Kategori Seçin --</option>
                  {initialCategories.map(cat => (
                    <optgroup label={cat.name_tr} key={cat.id}>
                      {cat.subCategories.map(subCat => (
                        <option key={subCat.id} value={subCat.id}>{subCat.name_tr}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className={labelClass}>Durum</label>
                <select id="status" name="status" value={product.status} onChange={handleChange} className={inputClass}>
                  <option value="draft">Taslak (Gizli)</option>
                  <option value="published">Yayımda (Görünür)</option>
                </select>
              </div>
            </div>

            {/* 4. Açıklamalar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="shortDescription_tr" className={labelClass}>Kısa Açıklama (TR)</label>
                <textarea id="shortDescription_tr" name="shortDescription_tr" value={product.shortDescription_tr} onChange={handleChange} rows={2} className={inputClass}></textarea>
              </div>
              <div>
                <label htmlFor="shortDescription_en" className={labelClass}>Kısa Açıklama (EN)</label>
                <textarea id="shortDescription_en" name="shortDescription_en" value={product.shortDescription_en} onChange={handleChange} rows={2} className={inputClass}></textarea>
              </div>
              
              <div className="md:col-span-2 border-t pt-4">
                 <label htmlFor="description_tr" className={labelClass}>Ana Açıklama (TR) *</label>
                 <textarea id="description_tr" name="description_tr" value={product.description_tr} onChange={handleChange} rows={6} className={inputClass} required></textarea>
              </div>
               <div className="md:col-span-2">
                 <label htmlFor="description_en" className={labelClass}>Ana Açıklama (EN)</label>
                 <textarea id="description_en" name="description_en" value={product.description_en} onChange={handleChange} rows={6} className={inputClass}></textarea>
              </div>
            </div>

            {/* 5. Ürün Özellikleri (Dinamik Liste) */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Ürün Özellikleri (Örn: Renk, Beden)</h3>
                <button 
                  type="button" 
                  onClick={addFeature}
                  className="px-3 py-1.5 text-sm bg-white border border-teal-500 text-teal-700 rounded hover:bg-teal-50 transition-colors"
                >
                  + Özellik Ekle
                </button>
              </div>
              
              {product.features.length === 0 && <p className="text-sm text-gray-500 italic">Henüz özellik eklenmedi.</p>}

              <div className="space-y-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-9 gap-3 items-end bg-white p-3 rounded shadow-sm border border-gray-200">
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Ad (TR)</label>
                      <input placeholder="Renk" value={feature.key_tr} onChange={(e) => handleFeatureChange(index, 'key_tr', e.target.value)} className="w-full text-sm border-gray-300 rounded" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Değer (TR)</label>
                      <input placeholder="Kırmızı" value={feature.value_tr} onChange={(e) => handleFeatureChange(index, 'value_tr', e.target.value)} className="w-full text-sm border-gray-300 rounded" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Ad (EN)</label>
                      <input placeholder="Color" value={feature.key_en} onChange={(e) => handleFeatureChange(index, 'key_en', e.target.value)} className="w-full text-sm border-gray-300 rounded" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-500 block mb-1">Değer (EN)</label>
                      <input placeholder="Red" value={feature.value_en} onChange={(e) => handleFeatureChange(index, 'value_en', e.target.value)} className="w-full text-sm border-gray-300 rounded" />
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      <button type="button" onClick={() => removeFeature(index)} className="text-red-500 hover:text-red-700 p-1">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Resim Galerisi */}
            <div className="border-t pt-6">
              <label htmlFor="galleryImages" className="block text-md font-medium text-gray-900 mb-2">Ürün Görselleri</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Resim yüklemek için tıklayın</span> veya sürükleyin</p>
                        <p className="text-xs text-gray-500">PNG, JPG (Çoklu seçim yapılabilir)</p>
                    </div>
                    <input id="galleryImages" type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
              {galleryFiles && (
                <p className="mt-2 text-sm text-teal-600 font-medium text-center">
                  {galleryFiles.length} dosya seçildi.
                </p>
              )}
            </div>

          </form>
        </div>

        {/* --- FOOTER (Sabit Butonlar) --- */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center">
           <p className={`text-sm font-medium ${message.includes("Hata") ? "text-red-600" : "text-teal-700"}`}>
              {message}
           </p>
           <div className="flex gap-3">
             <button 
               type="button" 
               onClick={onClose} 
               className="px-6 py-2 font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
             >
               İptal
             </button>
             <button 
               form="product-form" // Form ID'sini hedefle
               type="submit" 
               className={buttonClass} 
               disabled={isLoading}
             >
               {isLoading ? "Kaydediliyor..." : "Ürünü Kaydet"}
             </button>
           </div>
        </div>

      </div>
    </div>
  );
}