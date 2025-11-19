// src/components/admin/CategoryManager.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// Tipleri tanımla (schema.prisma'ya göre)
type Category = {
  id: string;
  name_tr: string;
  name_en?: string;
  description_tr?: string;
  description_en?: string;
  subCategories?: SubCategory[]; // Opsiyonel alt kategoriler
};

type SubCategory = {
  id: string;
  name_tr: string;
  name_en?: string;
  categoryId: string;
};

// Props tipini tanımla
type CategoryManagerProps = {
  initialCategories: Category[];
};

// Tailwind stil sabitleri
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
const buttonClass = "px-4 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500";
const formCardClass = "p-6 bg-white rounded-lg shadow-md space-y-4";

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Ana Kategori Form State'i
  const [mainCat, setMainCat] = useState({ name_tr: "", name_en: "", description_tr: "", description_en: "" });
  
  // Alt Kategori Form State'i
  const [subCat, setSubCat] = useState({ name_tr: "", name_en: "", description_tr: "", description_en: "", categoryId: "" });

  // --- Input Değişim Fonksiyonları ---
  const handleMainCatChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setMainCat({ ...mainCat, [e.target.name]: e.target.value });
  };
  
  const handleSubCatChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSubCat({ ...subCat, [e.target.name]: e.target.value });
  };

  // --- Form Gönderme Fonksiyonları ---
  
  // 1. YENİ ANA KATEGORİ KAYDET
  const handleMainCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainCat.name_tr) {
      setMessage("Ana Kategori Adı (TR) zorunludur.");
      return;
    }
    try {
      // Backend API'nız /api/products/categories rotasını kullanıyor
      const res = await api.post("/products/categories", mainCat);
      setCategories([...categories, res.data]); // Listeyi anlık güncelle
      setMessage("Ana kategori başarıyla eklendi.");
      setMainCat({ name_tr: "", name_en: "", description_tr: "", description_en: "" }); // Formu temizle
      router.refresh(); // Sunucudan veriyi tazelemek için
    } catch (err) {
      setMessage("Hata: Ana kategori eklenemedi.");
      console.error(err);
    }
  };

  // 2. YENİ ALT KATEGORİ KAYDET
  const handleSubCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCat.name_tr || !subCat.categoryId) {
      setMessage("Alt Kategori Adı (TR) ve Ana Kategori seçimi zorunludur.");
      return;
    }
    try {
      // Backend API'nız /api/products/subcategories rotasını kullanıyor
      const res = await api.post("/products/subcategories", subCat);
      setMessage("Alt kategori başarıyla eklendi.");
      setSubCat({ name_tr: "", name_en: "", description_tr: "", description_en: "", categoryId: "" }); // Formu temizle
      router.refresh(); // Sunucudan veriyi tazelemek için
    } catch (err) {
      setMessage("Hata: Alt kategori eklenemedi.");
      console.error(err);
    }
  };

  return (
    // Ana sarmalayıcı (Formları alt alta dizer)
    <div className="space-y-8">
      
      {/* 1. YENİ ANA KATEGORİ EKLE FORMU */}
      <form onSubmit={handleMainCatSubmit} className={formCardClass}>
        <h3 className="text-xl font-semibold text-gray-900">Yeni Ana Kategori Ekle</h3>
        
        {/* İsteğiniz üzerine 2x2 grid düzeni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori Adı (TR)</label>
            <input name="name_tr" value={mainCat.name_tr} onChange={handleMainCatChange} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kategori Adı (EN)</label>
            <input name="name_en" value={mainCat.name_en} onChange={handleMainCatChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (TR)</label>
            <input name="description_tr" value={mainCat.description_tr} onChange={handleMainCatChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (EN)</label>
            <input name="description_en" value={mainCat.description_en} onChange={handleMainCatChange} className={inputClass} />
          </div>
        </div>
        
        <div>
          <button type="submit" className={buttonClass}>Ana Kategoriyi Kaydet</button>
        </div>
      </form>

      {/* 2. YENİ ALT KATEGORİ EKLE FORMU */}
      <form onSubmit={handleSubCatSubmit} className={formCardClass}>
        <h3 className="text-xl font-semibold text-gray-900">Yeni Alt Kategori Ekle</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Ana Kategori Seçin</label>
          <select 
            name="categoryId" 
            value={subCat.categoryId} 
            onChange={handleSubCatChange} 
            className={inputClass} 
            required
          >
            <option value="">-- Ana Kategori Seçin --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name_tr}</option>
            ))}
          </select>
        </div>

        {/* İsteğiniz üzerine 2x2 grid düzeni */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Alt Kategori Adı (TR)</label>
            <input name="name_tr" value={subCat.name_tr} onChange={handleSubCatChange} className={inputClass} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Alt Kategori Adı (EN)</label>
            <input name="name_en" value={subCat.name_en} onChange={handleSubCatChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (TR)</label>
            <input name="description_tr" value={subCat.description_tr} onChange={handleSubCatChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Açıklama (EN)</label>
            <input name="description_en" value={subCat.description_en} onChange={handleSubCatChange} className={inputClass} />
          </div>
        </div>

        <div>
          <button type="submit" className={buttonClass}>Alt Kategoriyi Kaydet</button>
        </div>
      </form>

      {message && <p className="text-center text-gray-600">{message}</p>}

      <div className={formCardClass}>
        <h3 className="text-xl font-semibold text-gray-900">Mevcut Kategoriler</h3>
        <div className="space-y-3">
          {categories.length === 0 && <p className="text-gray-500">Henüz ana kategori eklenmemiş.</p>}
          {categories.map((cat) => (
            <details key={cat.id} className="bg-gray-50 p-3 rounded-md">
              <summary className="font-semibold text-teal-800 cursor-pointer">{cat.name_tr}</summary>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                {cat.subCategories && cat.subCategories.length > 0 ? (
                  cat.subCategories.map((sub) => (
                    <li key={sub.id} className="text-gray-700">{sub.name_tr}</li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">Bu kategoriye ait alt kategori bulunmuyor.</li>
                )}
              </ul>
            </details>
          ))}
        </div>
      </div>

    </div>
  );
}