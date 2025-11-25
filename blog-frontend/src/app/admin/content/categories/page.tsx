// src/app/admin/content/categories/page.tsx

// HATA 1: Import yolunu 'ProductForm' yerine 'CategoryManager' olarak düzeltin
import CategoryManager from "@/components/admin/CategoryManager"; 
import api from "@/lib/api";

// Kategorileri çeken fonksiyon
async function getCategories() {
  try {
    // API yolunu kontrol edin (Backend rotalarınıza göre)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, {
      cache: "no-store",
    });
    
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Kategoriler yüklenemedi:", error);
    return [];
  }
}

export default async function CategoryPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kategori Yönetimi</h1>
      </div>

      {/* HATA 2: Prop ismini düzeltin. 
         CategoryManager.tsx dosyasında muhtemelen 'initialCategories' kullanıyorsunuz.
         'parentCategories' yerine 'initialCategories' yazın.
      */}
      <CategoryManager initialCategories={categories} />
    </div>
  );
}