// src/app/admin/content/products/page.tsx (GÜNCELLENMİŞ HALİ)
"use client"; // Modal state'i için client component olmalı

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm"; // Form bileşenimiz

// Tipleri tanımlayalım
type SubCategory = { id: string; name_tr: string; name_en?: string; };
type Category = { id: string; name_tr: string; name_en?: string; subCategories: SubCategory[]; };
type Product = {
  id: string;
  name_tr: string;
  name_en: string;
  price: number;
  stock: number;
  status: string;
};

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // YENİ: Modal'ın durumunu yönet
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const router = useRouter();

  // Verileri çekmek için fonksiyon
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`)
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Veri yüklenemedi:", error);
    }
    setIsLoading(false);
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchData();
  }, []);

  // Form başarıyla gönderildiğinde listeyi tazelemek için
  const handleSuccess = () => {
    setIsModalOpen(false); // Modalı kapat
    fetchData(); // Listeyi yeniden çek
    router.refresh(); // Sunucu tarafını (gerekirse) yenile
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Sayfa Başlığı ve Yeni Ekle Butonu */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
        
        {/* YENİ: Artık Link değil, modal'ı açan bir buton */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700"
        >
          + Yeni Ürün Ekle
        </button>
      </div>

      {/* Ürün Listesi Tablosu */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* ... (table head kısmı aynı) ... */}
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı (TR)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Düzenle</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Yükleniyor...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Henüz ürün eklenmemiş.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  {/* ... (table data kısmı aynı) ... */}
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{product.name_tr}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm text-gray-900">{product.price} TL</div></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.stock} adet</span></td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'published' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{product.status === 'published' ? 'Yayımda' : 'Taslak'}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><a href="#" className="text-teal-600 hover:text-teal-900">Düzenle</a></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* YENİ: Modal Alanı */}
      {isModalOpen && (
        <ProductForm 
          initialCategories={categories}
          onClose={() => setIsModalOpen(false)} // Modalı kapatma fonksiyonu
          onSuccess={handleSuccess} // Başarı durumunda listeyi yenileme fonksiyonu
        />
      )}
    </div>
  );
}