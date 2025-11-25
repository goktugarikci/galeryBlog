"use client";

import Link from 'next/link';
import Image from 'next/image';

// Tip Tanımı
type Product = {
  id: string;
  name_tr: string;
  name_en?: string;
  shortDescription_tr?: string;
  shortDescription_en?: string;
  price: number;
  originalPrice?: number;
  discountLabel?: string;
  sku?: string;
  stock: number;
  status: string;
  galleryImages: { imageUrl: string }[];
  subCategory?: {
    name_tr: string;
    name_en?: string;
    category: { name_tr: string; name_en?: string; }
  };
};

export default function ProductCard({ product, lang }: { product: Product, lang: string }) {
  const isEn = lang === 'en';
  
  const title = isEn && product.name_en ? product.name_en : product.name_tr;
  const description = (isEn && product.shortDescription_en) 
                      ? product.shortDescription_en 
                      : (product.shortDescription_tr || "");

  // Resim URL Düzeltme
  let imageUrl = product.galleryImages && product.galleryImages.length > 0 
    ? product.galleryImages[0].imageUrl 
    : 'https://via.placeholder.com/400x300?text=No+Image';
    
  if (imageUrl.startsWith('/uploads')) {
    imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`;
  }

  // Stok Metni
  const stockStatus = product.stock > 0 
    ? (isEn ? 'In Stock' : 'Stokta Var') 
    : (isEn ? 'Out of Stock' : 'Tükendi');

  return (
    <Link 
      href={`/products/${product.id}`}
      className="group flex flex-col rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full border"
      // --- TEMA RENKLERİ (Veritabanından Gelen Yeni Kart Renkleri) ---
      style={{
        backgroundColor: 'var(--color-card-background)', // Kart Arka Planı
        color: 'var(--color-card-text)',                 // Kart Yazı Rengi
        borderColor: 'rgba(255, 255, 255, 0.1)'          // Hafif Çerçeve
      }}
    >
      
      {/* Resim Alanı */}
      <div className="relative w-full h-64 bg-black/20 overflow-hidden">
        <Image 
          src={imageUrl} 
          alt={title} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
          unoptimized={true}
        />
        
        {/* İndirim Etiketi */}
        {product.discountLabel && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
            {product.discountLabel}
          </div>
        )}

        {/* Stok Tükendi */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
             <span className="text-white font-bold uppercase tracking-widest border-2 border-white px-4 py-2">
               {stockStatus}
             </span>
          </div>
        )}
      </div>

      {/* Bilgi Alanı */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Başlık */}
        <h3 
          className="text-lg font-bold mb-2 line-clamp-2 leading-tight transition-colors group-hover:text-[var(--color-primary)]"
        >
          {title}
        </h3>
        
        {/* Açıklama */}
        <p className="text-sm opacity-70 mb-4 line-clamp-2 flex-1">
          {description}
        </p>
        
        {/* Alt Kısım: Fiyat ve Buton */}
        <div 
          className="mt-auto pt-4 border-t flex items-center justify-between"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs opacity-50 line-through decoration-red-500 mb-0.5">
                {product.originalPrice.toLocaleString('tr-TR')} TL
              </span>
            )}
            <span 
              className="text-xl font-bold" 
              style={{ color: 'var(--color-primary)' }} 
            >
              {product.price.toLocaleString('tr-TR')} TL
            </span>
          </div>

          <button 
            className="px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:brightness-110 transition-all active:scale-95"
            style={{
              backgroundColor: 'var(--color-btn-addtocart)',
              color: 'var(--color-btn-addtocart-text)'
            }}
          >
            {isEn ? 'View' : 'İncele'}
          </button>
        </div>
      </div>
    </Link>
  );
}