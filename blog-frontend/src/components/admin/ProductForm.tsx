// src/components/admin/ProductForm.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// Tipler
type SubCategory = { id: string; name_tr: string; name_en?: string; };
type Category = { id: string; name_tr: string; name_en?: string; subCategories: SubCategory[]; };

// Modal için prop'lar
type ProductFormProps = {
  initialCategories: Category[];
  onClose: () => void; // Modalı kapatmak için
  onSuccess: () => void; // Listeyi yenilemek için
};

// YENİ: Form state'i için tip (İndirim alanları kaldırıldı)
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
};

// Tailwind stil sabitleri
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
const labelClass = "block text-sm font-medium text-gray-700";
const buttonClass = "px-6 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function ProductForm({ initialCategories, onClose, onSuccess }: ProductFormProps) {
  const router = useRouter(); 
  
  // YENİ: State'in ilk değeri (İndirim alanları kaldırıldı)
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
  });
  
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form inputlarını state'e kaydet
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setProduct(prev => ({ ...prev, [name]: val }));
  };

  // Galeri resimlerini state'e kaydet
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setGalleryFiles(e.target.files);
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("Ürün kaydediliyor...");

    try {
      // 1. Adım: Galeri Resimlerini Yükle
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

      // 2. Adım: Ürün Bilgilerini Kaydet
      setMessage("2/2 Ürün bilgileri kaydediliyor...");
      
      // YENİ: Gönderilen veri (İndirim alanları yok)
      const productData = {
        ...product, // price, stock, sku, status vb.
        galleryImages: galleryImageUrls.map((url: string, index: number) => ({
          imageUrl: url,
          altText: product.name_tr,
          order: index,
        })),
      };

      await api.post('/products', productData);

      setMessage("Ürün başarıyla oluşturuldu!");
      setIsLoading(false);
      onSuccess(); // Sayfayı (listeyi) yenile

    } catch (err) {
      console.error(err);
      setMessage("Hata: Ürün oluşturulamadı.");
      setIsLoading(false);
    }
  };

return (
    // DEĞİŞİKLİK: Buradaki 'onClick={onClose}' satırını SİLDİK.
    // Artık dışarı tıklayınca kapanmayacak.
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-40 backdrop-blur-sm"
    >
      <div
        className="relative w-full max-w-4xl p-6 bg-white rounded-lg shadow-lg text-gray-900 max-h-[90vh] overflow-y-auto"
        // onClick={(e) => e.stopPropagation()} // Buna da artık gerek kalmadı ama durabilir, zararı yok.
      >
        
        {/* Kapatma Butonu (Sadece burası kapatacak) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 p-1 rounded-full"
          title="Pencereyi Kapat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold mb-6 text-teal-800 border-b pb-2">Yeni Ürün Ekle</h2>
        
        {/* Asıl Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Bölüm: Ürün Adları */}
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

          {/* 2. Bölüm: Fiyat ve Stok Bilgileri (GÜNCELLENDİ - 3'lü grid) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* 3. Bölüm: Kategori ve Durum */}
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

          {/* 4. Bölüm: Kısa Açıklamalar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="shortDescription_tr" className={labelClass}>Kısa Açıklama (TR)</label>
              <textarea id="shortDescription_tr" name="shortDescription_tr" value={product.shortDescription_tr} onChange={handleChange} rows={3} className={inputClass}></textarea>
            </div>
            <div>
              <label htmlFor="shortDescription_en" className={labelClass}>Kısa Açıklama (EN)</label>
              <textarea id="shortDescription_en" name="shortDescription_en" value={product.shortDescription_en} onChange={handleChange} rows={3} className={inputClass}></textarea>
            </div>
          </div>

          {/* 5. Bölüm: Ana Açıklamalar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="description_tr" className={labelClass}>Ana Açıklama (TR) *</label>
              <textarea id="description_tr" name="description_tr" value={product.description_tr} onChange={handleChange} rows={8} className={inputClass} required></textarea>
            </div>
            <div>
              <label htmlFor="description_en" className={labelClass}>Ana Açıklama (EN)</label>
              <textarea id="description_en" name="description_en" value={product.description_en} onChange={handleChange} rows={8} className={inputClass}></textarea>
            </div>
          </div>

          {/* 6. Bölüm: Resim Galerisi */}
          <div>
            <label htmlFor="galleryImages" className={labelClass}>Ürün Galerisi</label>
            <input id="galleryImages" name="galleryImages" type="file" multiple onChange={handleFileChange} className={`${inputClass} p-0 file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300`} />
          </div>

          {/* 7. Bölüm: Kaydet Butonu */}
          <div className="border-t pt-4 flex items-center space-x-4">
            <button type="submit" className={buttonClass} disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Ürünü Kaydet"}
            </button>
            {message && (
              <p className={`text-sm ${isLoading ? 'text-gray-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>
          
        </form>
      </div>
    </div>
  );
}