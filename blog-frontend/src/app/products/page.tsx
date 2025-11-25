import { cookies } from 'next/headers';
import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard'; // Kart bileşeni
import ProductFilterPopup from '@/components/shop/ProductFilterPopup'; // Filtreleme butonu

// --- TİP TANIMLARI ---
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
  shortDescription_tr?: string;
  shortDescription_en?: string;
  stock: number;
  status: string;
  sku?: string;
};

// --- VERİ ÇEKME FONKSİYONU ---
// searchParams parametresi ile filtreleri alıp API'ye iletiyoruz
async function getProducts(searchParams?: any): Promise<Product[]> {
  try {
    // URL parametrelerini oluştur
    const params = new URLSearchParams();
    
    if (searchParams?.minPrice) params.set('minPrice', searchParams.minPrice);
    if (searchParams?.maxPrice) params.set('maxPrice', searchParams.maxPrice);
    if (searchParams?.sort) params.set('sort', searchParams.sort);

    // API isteği
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`, {
      cache: "no-store" // Her zaman güncel veri
    });

    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

// --- SEO METADATA ---
export const metadata = {
  title: 'Tüm Ürünler',
  description: 'Mağazamızdaki tüm ürünleri inceleyin.',
};

// --- ANA BİLEŞEN ---
export default async function ProductsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams; // Next.js 15: await gerekli
  const products = await getProducts(searchParams);
  
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';
  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* Başlık */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--color-primary)] pb-4">
          <div>
             <h1 className="text-3xl font-bold">
               {isEn ? 'All Products' : 'Tüm Ürünler'}
             </h1>
             <p className="text-sm opacity-60 mt-1">
               {products.length} {isEn ? 'products listed' : 'ürün listeleniyor'}
             </p>
          </div>
          
          {/* Eğer filtre varsa temizleme butonu */}
          {(searchParams?.minPrice || searchParams?.maxPrice || (searchParams?.sort && searchParams?.sort !== 'newest')) && (
             <Link href="/products" className="text-sm text-red-500 hover:underline">
               {isEn ? 'Clear Filters' : 'Filtreleri Temizle'}
             </Link>
          )}
        </div>

        {/* Ürün Listesi */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-secondary)] rounded-xl border border-dashed border-[var(--color-text)]/20">
            <p className="text-lg opacity-70">
              {isEn ? 'No products found.' : 'Aradığınız kriterlere uygun ürün bulunamadı.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              // ProductCard bileşeni artık renkleri ve düzeni kendi içinde yönetiyor
              <ProductCard 
                key={product.id} 
                product={product} 
                lang={lang} 
              />
            ))}
          </div>
        )}

      </div>

      {/* Filtreleme Butonu (Popup) */}
      <ProductFilterPopup lang={lang} />

    </div>
  );
}