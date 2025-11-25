"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- TİPLER ---
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

// --- STİLLER (Tailwind) ---
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm";
const buttonClass = "px-4 py-2 font-semibold text-white bg-teal-700 rounded-md hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm transition-colors";
const deleteButtonClass = "px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 ml-2 transition-colors";
const editButtonClass = "px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 ml-2 transition-colors";
const cancelButtonClass = "px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 ml-2 transition-colors";
const formCardClass = "p-6 bg-white rounded-lg shadow-md space-y-4 border border-gray-200";

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

  // --- YARDIMCI FONKSİYONLAR ---
  
  const refreshData = () => {
    router.refresh(); // Sunucu tarafını yenile
  };

  // --- ANA KATEGORİ İŞLEMLERİ ---

  const handleMainCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingMain) {
        // Güncelleme
        const res = await api.put(`/products/categories/${mainCat.id}`, mainCat);
        // Listeyi yerel state'de güncelle
        setCategories(categories.map(c => c.id === mainCat.id ? { ...res.data, subCategories: c.subCategories } : c));
        setMessage("Ana kategori başarıyla güncellendi.");
      } else {
        // Ekleme
        const res = await api.post("/products/categories", mainCat);
        setCategories([...categories, { ...res.data, subCategories: [] }]);
        setMessage("Ana kategori başarıyla eklendi.");
      }
      // Formu sıfırla
      setMainCat({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "" });
      setIsEditingMain(false);
      refreshData();
    } catch (err: any) {
      console.error(err);
      setMessage(`Hata: ${err.response?.data?.error || "İşlem başarısız."}`);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Bu kategoriyi ve içindeki tüm ürünleri silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/products/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
      setMessage("Kategori silindi.");
      refreshData();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- ALT KATEGORİ İŞLEMLERİ ---

  const handleSubCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditingSub) {
        // Güncelleme
        await api.put(`/products/subcategories/${subCat.id}`, subCat);
        setMessage("Alt kategori güncellendi.");
      } else {
        // Ekleme
        await api.post("/products/subcategories", subCat);
        setMessage("Alt kategori eklendi.");
      }
      
      // Formu sıfırla
      setSubCat({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "", categoryId: "" });
      setIsEditingSub(false);
      
      // Alt kategori listesi ana kategori içinde olduğu için tüm listeyi yeniden çekmek veya sayfayı yenilemek en kolayıdır.
      // Burada router.refresh() kullanarak veriyi tazeliyoruz.
      refreshData(); 
      
      // Not: Gerçek zamanlı UI güncellemesi için 'categories' state'ini manuel güncellemek daha karmaşık olurdu (nested array update),
      // bu yüzden refresh ve api fetch kombinasyonu daha güvenli.
      
    } catch (err: any) {
      console.error(err);
      setMessage(`Hata: ${err.response?.data?.error || "İşlem başarısız."}`);
    }
  };

  const deleteSubCategory = async (id: string) => {
    if (!confirm("Bu alt kategoriyi silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/products/subcategories/${id}`);
      setMessage("Alt kategori silindi.");
      refreshData();
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
      
      {/* MESAJ KUTUSU */}
      {message && (
        <div className={`p-4 rounded-md text-center font-medium ${message.includes("Hata") ? "bg-red-100 text-red-800" : "bg-teal-100 text-teal-800"}`}>
          {message}
        </div>
      )}

      {/* FORMLAR (YAN YANA) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. ANA KATEGORİ FORMU */}
        <form onSubmit={handleMainCatSubmit} className={formCardClass}>
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
            <span className="text-2xl">📂</span> 
            {isEditingMain ? "Ana Kategoriyi Düzenle" : "Yeni Ana Kategori Ekle"}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Ad (TR) *</label>
                <input 
                  value={mainCat.name_tr} 
                  onChange={(e) => setMainCat({...mainCat, name_tr: e.target.value})} 
                  className={inputClass} required 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Ad (EN)</label>
                <input 
                  value={mainCat.name_en} 
                  onChange={(e) => setMainCat({...mainCat, name_en: e.target.value})} 
                  className={inputClass} 
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Açıklama (TR)</label>
                <input 
                  value={mainCat.description_tr} 
                  onChange={(e) => setMainCat({...mainCat, description_tr: e.target.value})} 
                  className={inputClass} 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Açıklama (EN)</label>
                <input 
                  value={mainCat.description_en} 
                  onChange={(e) => setMainCat({...mainCat, description_en: e.target.value})} 
                  className={inputClass} 
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            {isEditingMain && (
              <button 
                type="button" 
                onClick={() => { setIsEditingMain(false); setMainCat({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "" }); }} 
                className={cancelButtonClass}
              >
                İptal
              </button>
            )}
            <button type="submit" className={`${buttonClass} ml-2`}>
              {isEditingMain ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>

        {/* 2. ALT KATEGORİ FORMU */}
        <form onSubmit={handleSubCatSubmit} className={formCardClass}>
          <h3 className="text-lg font-bold text-gray-800 border-b pb-3 mb-4 flex items-center gap-2">
            <span className="text-2xl">qx</span> 
            {isEditingSub ? "Alt Kategoriyi Düzenle" : "Yeni Alt Kategori Ekle"}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Bağlı Olduğu Ana Kategori *</label>
              <select 
                value={subCat.categoryId} 
                onChange={(e) => setSubCat({...subCat, categoryId: e.target.value})} 
                className={inputClass} 
                required
              >
                <option value="">-- Kategori Seçiniz --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name_tr}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Ad (TR) *</label>
                <input 
                  value={subCat.name_tr} 
                  onChange={(e) => setSubCat({...subCat, name_tr: e.target.value})} 
                  className={inputClass} required 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Ad (EN)</label>
                <input 
                  value={subCat.name_en} 
                  onChange={(e) => setSubCat({...subCat, name_en: e.target.value})} 
                  className={inputClass} 
                />
              </div>
            </div>
            
            {/* Açıklama alanları opsiyonel olarak buraya da eklenebilir */}
          </div>

          <div className="pt-4 flex justify-end">
            {isEditingSub && (
              <button 
                type="button" 
                onClick={() => { setIsEditingSub(false); setSubCat({ id: "", name_tr: "", name_en: "", description_tr: "", description_en: "", categoryId: "" }); }} 
                className={cancelButtonClass}
              >
                İptal
              </button>
            )}
            <button type="submit" className={`${buttonClass} ml-2`}>
              {isEditingSub ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>

      {/* 3. KATEGORİ LİSTESİ */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">Mevcut Kategoriler</h3>
          <span className="text-sm text-gray-500">{categories.length} Ana Kategori</span>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500 italic">Henüz kategori eklenmemiş.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 hover:bg-gray-50 transition-colors group">
                
                {/* Ana Kategori Satırı */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    
                    {/* TIKLANABİLİR LINK (ÜRÜNLERİ FİLTRELE) */}
                    <Link 
                      href={`/admin/content/products?categoryId=${cat.id}`}
                      className="font-bold text-lg text-teal-900 hover:text-teal-600 hover:underline flex items-center gap-2 transition-colors"
                      title="Bu kategorideki ürünleri gör"
                    >
                      <span className="text-xl">📁</span> {cat.name_tr}
                    </Link>
                    
                    {cat.name_en && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">EN: {cat.name_en}</span>}
                  </div>
                  
                  <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditCategory(cat)} className={editButtonClass}>Düzenle</button>
                    <button onClick={() => deleteCategory(cat.id)} className={deleteButtonClass}>Sil</button>
                  </div>
                </div>

                {/* Alt Kategoriler */}
                <div className="mt-3 ml-8 pl-4 border-l-2 border-gray-200 space-y-2">
                  {cat.subCategories && cat.subCategories.length > 0 ? (
                    cat.subCategories.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100 shadow-sm hover:border-teal-200 transition-colors">
                        <div className="flex items-center gap-2">
                           {/* TIKLANABİLİR LINK (ÜRÜNLERİ FİLTRELE) */}
                           <Link 
                             href={`/admin/content/products?subCategory=${sub.id}`}
                             className="text-gray-700 hover:text-teal-600 hover:underline font-medium flex items-center gap-2"
                             title="Bu alt kategorideki ürünleri gör"
                           >
                             <span className="text-gray-400">↳</span> 📂 {sub.name_tr}
                           </Link>
                           {sub.name_en && <span className="text-[10px] text-gray-400">({sub.name_en})</span>}
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => startEditSubCategory(sub)} className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100">Düz.</button>
                          <button onClick={() => deleteSubCategory(sub.id)} className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100">Sil</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic pl-2">Bu kategoride alt kategori yok.</p>
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