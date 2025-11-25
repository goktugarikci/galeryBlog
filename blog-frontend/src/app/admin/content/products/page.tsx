"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import ProductForm from "@/components/admin/ProductForm";

// --- TİP TANIMLARI ---
type SubCategory = {
  id: string;
  name_tr: string;
};

type Category = {
  id: string;
  name_tr: string;
  subCategories: SubCategory[];
};

type Product = {
  id: string;
  name_tr: string;
  name_en: string;
  price: number;
  stock: number;
  status: string;
  // Alt kategori ve onun bağlı olduğu ana kategori bilgisi
  subCategory?: { 
    name_tr: string; 
    category: { name_tr: string } 
  };
  galleryImages: { imageUrl: string }[];
};

// --- İÇ BİLEŞEN (LİSTELEME VE MANTIK) ---
function ProductListContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Form için gerekli
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal Durumu
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL'den filtre parametrelerini al
  const categoryIdFilter = searchParams.get('categoryId');
  const subCategoryIdFilter = searchParams.get('subCategory');

  // Verileri Çek (Ürünler ve Kategoriler)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Filtre parametrelerini hazırla
      const params = new URLSearchParams();
      if (categoryIdFilter) params.set('categoryId', categoryIdFilter);
      if (subCategoryIdFilter) params.set('subCategory', subCategoryIdFilter);

      // 2. API İsteklerini Paralel At
      const [productsRes, categoriesRes] = await Promise.all([
        api.get(`/products?${params.toString()}`), // Filtreli ürünleri çek
        api.get(`/products/categories`)             // Kategori listesini çek (Form için)
      ]);
      
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);

    } catch (error) {
      console.error("Veri yüklenemedi:", error);
      // Hata durumunda boş liste göster
      setProducts([]); 
    } finally {
      setIsLoading(false);
    }
  };

  // Filtreler değiştiğinde veya sayfa ilk açıldığında çalışır
  useEffect(() => {
    fetchData();
  }, [categoryIdFilter, subCategoryIdFilter]);

  // Ürün Silme İşlemi
  const handleDelete = async (id: string) => {
    if (!confirm("Bu ürünü silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/products/${id}`);
      // Listeden çıkararak UI'ı güncelle
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Ürün silinemedi.");
    }
  };

  // Form Başarılı Olduğunda (Modal kapanınca)
  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchData(); // Listeyi yenile
    router.refresh(); // Gerekirse sunucu tarafını da yenile
  };

  // Başlık Metnini Belirle
  let pageTitle = "Tüm Ürünler";
  if (categoryIdFilter) pageTitle = "Kategori Ürünleri";
  if (subCategoryIdFilter) pageTitle = "Alt Kategori Ürünleri";

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[80vh]">
      
      {/* --- ÜST BAR (BAŞLIK VE BUTON) --- */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div className="flex items-center gap-4">
           <div>
             <h1 className="text-2xl font-bold text-gray-800">{pageTitle}</h1>
             <p className="text-sm text-gray-500">
               {products.length} ürün listeleniyor
             </p>
           </div>

           {/* Filtre varsa Temizle Butonu Göster */}
           {(categoryIdFilter || subCategoryIdFilter) && (
             <button 
               onClick={() => router.push('/admin/content/products')} 
               className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors"
             >
               ✕ Filtreyi Temizle
             </button>
           )}
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-teal-700 text-white font-semibold rounded-md hover:bg-teal-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Yeni Ürün
        </button>
      </div>

      {/* --- ÜRÜN TABLOSU --- */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Bilgisi</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat / Stok</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Kayıtlı ürün bulunamadı.</td></tr>
            ) : (
                products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    
                    {/* Ürün Adı */}
                    <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{product.name_tr}</div>
                        <div className="text-xs text-gray-500">{product.name_en || "-"}</div>
                    </td>

                    {/* Kategori Yolu */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                        {product.subCategory ? (
                          <span>
                            <span className="font-semibold">{product.subCategory.category.name_tr}</span>
                            <span className="mx-1 text-gray-400">&gt;</span>
                            <span>{product.subCategory.name_tr}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Kategorisiz</span>
                        )}
                    </td>

                    {/* Fiyat ve Stok */}
                    <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">{product.price} TL</div>
                        <div className={`text-xs font-medium mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `${product.stock} Adet` : 'Stok Yok'}
                        </div>
                    </td>

                    {/* Durum */}
                    <td className="px-6 py-4">
                        {product.status === 'published' ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Yayımda
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Taslak
                          </span>
                        )}
                    </td>

                    {/* İşlemler */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* TODO: Düzenle butonu için ayrı bir modal veya sayfa yapılabilir */}
                        <button className="text-teal-600 hover:text-teal-900 mr-4 font-medium">Düzenle</button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Sil
                        </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- ÜRÜN EKLEME MODALI --- */}
      {isModalOpen && (
        <ProductForm 
          initialCategories={categories}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
        />
      )}

    </div>
  );
}

// --- ANA BİLEŞEN ---
export default function ProductsPage() {
  // useSearchParams kullandığımız için Suspense içine alıyoruz
  return (
    <Suspense fallback={<div className="p-6 text-center">Yükleniyor...</div>}>
      <ProductListContent />
    </Suspense>
  );
}