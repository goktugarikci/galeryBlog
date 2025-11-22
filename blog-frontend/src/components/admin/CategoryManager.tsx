"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// Tipleri tanımla
type SubCategory = {
  id: string;
  name_tr: string;
  name_en?: string;
  description_tr?: string;
  description_en?: string;
  categoryId: string;
};

type Category = {
  id: string;
  name_tr: string;
  name_en?: string;
  description_tr?: string;
  description_en?: string;
  subCategories?: SubCategory[];
};

type CategoryManagerProps = {
  initialCategories: Category[];
};

// Stiller
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
const buttonClass = "px-4 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500";
const deleteButtonClass = "px-3 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-700 ml-2";
const editButtonClass = "px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 ml-2";
const cancelButtonClass = "px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 ml-2";
const formCardClass = "p-6 bg-white rounded-lg shadow-md space-y-4";

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [message, setMessage] = useState("");
  const router = useRouter();

  // --- FORM STATE'LERİ ---
  // Ana Kategori Formu
  const [mainCat, setMainCat] = useState({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "" });
  const [isEditingMain, setIsEditingMain] = useState(false);

  // Alt Kategori Formu
  const [subCat, setSubCat] = useState({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "", categoryId: "" });
  const [isEditingSub, setIsEditingSub] = useState(false);

  // --- GENEL FONKSİYONLAR ---
  const refreshData = () => {
    router.refresh();
    // Sayfayı yenilemeden state'i güncellemek için API'dan tekrar çekebiliriz ama 
    // şimdilik router.refresh() ile sunucu bileşenini tetikliyoruz.
    // Daha hızlı tepki için manuel state güncellemesi de yapılabilir.
  };

  // --- ANA KATEGORİ İŞLEMLERİ ---
  const handleMainCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingMain) {
        await api.put(`/products/categories/${mainCat.id}`, mainCat);
        setMessage("Ana kategori güncellendi.");
      } else {
        const res = await api.post("/products/categories", mainCat);
        setCategories([...categories, res.data]); // Listeye ekle
        setMessage("Ana kategori eklendi.");
      }
      setMainCat({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "" });
      setIsEditingMain(false);
      refreshData();
    } catch (err) {
      console.error(err);
      setMessage("Hata oluştu.");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyi ve içindeki tüm ürünleri silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/products/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
      setMessage("Kategori silindi.");
    } catch (err) {
      console.error(err);
      alert("Silinemedi.");
    }
  };

  const startEditCategory = (cat: Category) => {
    setMainCat({
      id: cat.id,
      name_tr: cat.name_tr,
      name_en: cat.name_en || "",
      description_tr: cat.description_tr || "",
      description_en: cat.description_en || ""
    });
    setIsEditingMain(true);
    // Sayfanın başına (forma) kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- ALT KATEGORİ İŞLEMLERİ ---
  const handleSubCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingSub) {
        await api.put(`/products/subcategories/${subCat.id}`, subCat);
        setMessage("Alt kategori güncellendi.");
      } else {
        await api.post("/products/subcategories", subCat);
        setMessage("Alt kategori eklendi.");
      }
      setSubCat({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "", categoryId: "" });
      setIsEditingSub(false);
      refreshData();
    } catch (err) {
      console.error(err);
      setMessage("Hata oluştu.");
    }
  };

  const deleteSubCategory = async (id: string) => {
    if (!confirm("Bu alt kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/products/subcategories/${id}`);
      setMessage("Alt kategori silindi.");
      refreshData(); // Alt kategoriler iç içe olduğu için tüm listeyi yenilemek en kolayı
    } catch (err) {
      console.error(err);
      alert("Silinemedi.");
    }
  };

  const startEditSubCategory = (sub: SubCategory) => {
    setSubCat({
      id: sub.id,
      name_tr: sub.name_tr,
      name_en: sub.name_en || "",
      description_tr: sub.description_tr || "",
      description_en: sub.description_en || "",
      categoryId: sub.categoryId
    });
    setIsEditingSub(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 pb-10">
      {/* BİLGİ MESAJI */}
      {message && <div className="p-4 bg-teal-100 text-teal-800 rounded-md text-center font-medium">{message}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. ANA KATEGORİ FORMU */}
        <form onSubmit={handleMainCatSubmit} className={formCardClass}>
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
            {isEditingMain ? "Ana Kategoriyi Düzenle" : "Yeni Ana Kategori Ekle"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Kategori Adı (TR)</label>
              <input 
                value={mainCat.name_tr} 
                onChange={(e) => setMainCat({...mainCat, name_tr: e.target.value})} 
                className={inputClass} required 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Kategori Adı (EN)</label>
              <input 
                value={mainCat.name_en} 
                onChange={(e) => setMainCat({...mainCat, name_en: e.target.value})} 
                className={inputClass} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Açıklama (TR)</label>
              <input 
                value={mainCat.description_tr} 
                onChange={(e) => setMainCat({...mainCat, description_tr: e.target.value})} 
                className={inputClass} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Açıklama (EN)</label>
              <input 
                value={mainCat.description_en} 
                onChange={(e) => setMainCat({...mainCat, description_en: e.target.value})} 
                className={inputClass} 
              />
            </div>
          </div>
          
          <div className="pt-2">
            <button type="submit" className={buttonClass}>
              {isEditingMain ? "Güncelle" : "Kaydet"}
            </button>
            {isEditingMain && (
              <button 
                type="button" 
                onClick={() => { setIsEditingMain(false); setMainCat({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "" }); }} 
                className={cancelButtonClass}
              >
                İptal
              </button>
            )}
          </div>
        </form>

        {/* 2. ALT KATEGORİ FORMU */}
        <form onSubmit={handleSubCatSubmit} className={formCardClass}>
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
            {isEditingSub ? "Alt Kategoriyi Düzenle" : "Yeni Alt Kategori Ekle"}
          </h3>
          
          <div>
            <label className="text-sm font-medium">Ana Kategori Seçin</label>
            <select 
              value={subCat.categoryId} 
              onChange={(e) => setSubCat({...subCat, categoryId: e.target.value})} 
              className={inputClass} 
              required
            >
              <option value="">-- Seçiniz --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name_tr}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Alt Kategori Adı (TR)</label>
              <input 
                value={subCat.name_tr} 
                onChange={(e) => setSubCat({...subCat, name_tr: e.target.value})} 
                className={inputClass} required 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Alt Kategori Adı (EN)</label>
              <input 
                value={subCat.name_en} 
                onChange={(e) => setSubCat({...subCat, name_en: e.target.value})} 
                className={inputClass} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Açıklama (TR)</label>
              <input 
                value={subCat.description_tr} 
                onChange={(e) => setSubCat({...subCat, description_tr: e.target.value})} 
                className={inputClass} 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Açıklama (EN)</label>
              <input 
                value={subCat.description_en} 
                onChange={(e) => setSubCat({...subCat, description_en: e.target.value})} 
                className={inputClass} 
              />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" className={buttonClass}>
              {isEditingSub ? "Güncelle" : "Kaydet"}
            </button>
            {isEditingSub && (
              <button 
                type="button" 
                onClick={() => { setIsEditingSub(false); setSubCat({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "", categoryId: "" }); }} 
                className={cancelButtonClass}
              >
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 3. MEVCUT KATEGORİLERİ LİSTELEME (Tablo Görünümü) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Kategori Listesi</h3>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Henüz kategori eklenmemiş.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 hover:bg-gray-50 transition-colors">
                {/* Ana Kategori Satırı */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-lg text-teal-900">{cat.name_tr}</span>
                    <span className="text-sm text-gray-500 ml-2">({cat.name_en || "-"})</span>
                  </div>
                  <div>
                    <button onClick={() => startEditCategory(cat)} className={editButtonClass}>Düzenle</button>
                    <button onClick={() => deleteCategory(cat.id)} className={deleteButtonClass}>Sil</button>
                  </div>
                </div>

                {/* Alt Kategoriler Listesi */}
                <div className="mt-3 ml-6 pl-4 border-l-2 border-gray-200 space-y-2">
                  {cat.subCategories && cat.subCategories.length > 0 ? (
                    cat.subCategories.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100 shadow-sm">
                        <span className="text-gray-700">↳ {sub.name_tr} <span className="text-xs text-gray-400">({sub.name_en})</span></span>
                        <div>
                          <button onClick={() => startEditSubCategory(sub)} className="text-blue-600 hover:text-blue-800 text-sm px-2">Düzenle</button>
                          <button onClick={() => deleteSubCategory(sub.id)} className="text-red-600 hover:text-red-800 text-sm px-2">Sil</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">Alt kategori yok.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}