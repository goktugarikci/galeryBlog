import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';

// --- Veri Tipleri ---
type Category = { id: string; name_tr: string; name_en?: string; };
type SubCategory = { id: string; name_tr: string; name_en?: string; category: Category; };
type Product = { 
  id: string; 
  name_tr: string; 
  name_en?: string; 
  price: number; 
  originalPrice?: number;
  discountLabel?: string;
  galleryImages: { imageUrl: string }[];
  subCategory?: SubCategory; 
};

// --- Veri Çekme Fonksiyonu ---
async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      cache: "no-store" 
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

// --- Ana Sayfa Bileşeni ---
export default async function ProductsPage() {
  const products = await getProducts();
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';

  return (
    // Ana arka plan rengini kullanıyoruz
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      <main className="flex-1 container mx-auto p-4 md:p-8">
        
        {/* Başlık - Alt Çizgi Primary Renk */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--color-primary)] pb-4">
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'All Products' : 'Tüm Ürünler'}
          </h1>
          <span className="text-sm opacity-60">{products.length} {lang === 'en' ? 'Products Listed' : 'Ürün Listeleniyor'}</span>
        </div>

        {/* Ürün Listesi Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-secondary)] rounded-lg border border-dashed border-[var(--color-text)]/20">
            <p className="text-lg opacity-70">{lang === 'en' ? 'No products found.' : 'Henüz ürün eklenmemiş.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

// --- Ürün Kartı Bileşeni (TEMA GÜNCELLEMESİ) ---
function ProductCard({ product, lang }: { product: Product, lang: string }) {
  const isEn = lang === 'en';
  
  const title = isEn && product.name_en ? product.name_en : product.name_tr;
  
  const subCat = product.subCategory;
  const parentCat = subCat?.category;

  const categoryName = isEn 
    ? (parentCat?.name_en || parentCat?.name_tr) 
    : parentCat?.name_tr;
    
  const subCategoryName = isEn 
    ? (subCat?.name_en || subCat?.name_tr) 
    : subCat?.name_tr;

  const breadcrumb = categoryName && subCategoryName 
    ? `${categoryName} > ${subCategoryName}` 
    : (subCategoryName || '');

  let imageUrl = product.galleryImages[0]?.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';
  if (imageUrl.startsWith('/uploads')) {
    imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`;
  }

  return (
    <Link 
      href={`/products/${product.id}`} 
      // DEĞİŞİKLİK: bg-white yerine bg-[var(--color-secondary)]
      // DEĞİŞİKLİK: border-gray-200 yerine border-[var(--color-text)]/10 (Hafif görünür sınır)
      className="group flex flex-col bg-[var(--color-secondary)] border border-[var(--color-text)]/10 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full hover:border-[var(--color-primary)]"
    >
      {/* 1. Ürün Görseli */}
      <div className="relative w-full h-64 bg-black/20 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized={true} 
        />
        
        {product.discountLabel && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            {product.discountLabel}
          </div>
        )}
      </div>

      {/* 2. Ürün Bilgileri */}
      <div className="p-4 flex flex-col flex-1">
        
        {/* Kategori Yolu - Rengi opaklık ile ayarlandı */}
        <div className="text-xs font-medium opacity-50 mb-1 uppercase tracking-wide truncate text-[var(--color-text)]">
          {breadcrumb}
        </div>

        {/* Ürün Adı - Ana metin rengi */}
        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors text-[var(--color-text)]">
          {title}
        </h3>

        {/* Fiyat Alanı */}
        <div className="mt-auto pt-3 border-t border-[var(--color-text)]/10 flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs opacity-50 line-through decoration-red-500 text-[var(--color-text)]">
                {product.originalPrice.toLocaleString('tr-TR')} TL
              </span>
            )}
            {/* Fiyat her zaman Primary (Sarı) renk */}
            <span className="text-xl font-bold text-[var(--color-primary)]">
              {product.price.toLocaleString('tr-TR')} TL
            </span>
          </div>
          
          {/* Buton İkonu: Arka planı Primary, İkonu Secondary (Koyu) */}
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-secondary)] group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}