import { cookies } from 'next/headers';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar'; // Navbar layout içinde olsa da burada server-side render için gerekebilir, ama PublicLayout kullanıyorsanız gerekmez. (Aşağıda temizlenmiş halini veriyorum)
import DynamicPageSlider from '@/components/common/DynamicPageSlider';

// --- TİP TANIMLARI ---
type Slider = { 
  id: string; 
  imageUrl: string; 
  caption_tr?: string; 
  caption_en?: string; 
  linkUrl?: string; 
};

type Product = { 
  id: string; 
  name_tr: string; 
  name_en?: string; 
  shortDescription_tr?: string; 
  shortDescription_en?: string;
  price: number; 
  originalPrice?: number;
  discountLabel?: string;
  galleryImages: { imageUrl: string }[];
};

type Settings = { 
  enableEnglish: boolean; 
  showHomeSlider: boolean; // Slider gösterme ayarı
};

// --- VERİ ÇEKME FONKSİYONLARI ---

// 1. Slider Verileri
async function getSliders(): Promise<Slider[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/slider`, {
      cache: "no-store" // Slider değişiklikleri hemen görünsün
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

// 2. Son Eklenen Ürünler
async function getRecentProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      next: { revalidate: 10 } // Ürünler 10 saniyede bir güncellensin (daha performanslı)
    });
    if (!res.ok) return [];
    const allProducts = await res.json();
    return allProducts.slice(0, 8);
  } catch (e) { return []; }
}

// 3. Site Ayarları (HATA BURADAYDI)
async function getSiteSettings(): Promise<Settings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      // ESKİ: next: { revalidate: 3600 } -> 1 saat bekletiyordu
      cache: "no-store" // YENİ: Her istekte güncel ayarları çek
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) { return null; }
}

// --- ANA SAYFA BİLEŞENİ ---
export default async function Home() {
  
  const [sliders, products, settings] = await Promise.all([
    getSliders(),
    getRecentProducts(),
    getSiteSettings()
  ]);

  // Aktif Dili Belirle
  const cookieStore = await cookies();
  const storedLang = cookieStore.get('currentLang')?.value;
  const enableEnglish = settings?.enableEnglish || false;
  const currentLang = enableEnglish && storedLang === 'en' ? 'en' : 'tr';

  // Slider Gösterim Kontrolü
  // 1. Ayarlardan "showHomeSlider" açık mı? (Varsayılan true kabul ettik)
  // 2. Slider verisi var mı?
  const showSlider = (settings?.showHomeSlider ?? true) && sliders.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* Not: Navbar layout.tsx'den geliyorsa buraya eklemeyin. Eğer PublicLayout kullanıyorsanız burası boş kalmalı. */}

      <main className="flex-1 w-full">
        
        {/* 1. SLIDER ALANI */}
        {showSlider && (
          <section className="w-full mb-12 shadow-sm relative group">
            <DynamicPageSlider
              images={sliders} 
              heightMobilePx={300} 
              heightDesktopPx={600} 
              objectFit="cover"     
              altTextDefault="Slider"
            />
          </section>
        )}

        {/* 2. ÜRÜNLER ALANI */}
        <section className="container mx-auto px-4 mb-16">
          
          <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--color-primary)] pb-2">
            <h2 className="text-2xl md:text-3xl font-bold">
              {currentLang === 'en' ? 'New Arrivals' : 'Yeni Ürünler'}
            </h2>
            <Link 
              href="/products"
              className="text-sm font-semibold opacity-70 hover:opacity-100 hover:text-[var(--color-primary)] transition-colors"
            >
              {currentLang === 'en' ? 'View All →' : 'Tümünü Gör →'}
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  lang={currentLang} 
                />
              ))}
            </div>
          ) : (
            <p className="text-center opacity-60 py-10 bg-gray-50/5 rounded-lg border border-gray-200/20">
              {currentLang === 'en' ? 'No products found.' : 'Henüz ürün eklenmemiş.'}
            </p>
          )}

        </section>

      </main>
    </div>
  );
}

// --- YARDIMCI BİLEŞEN: ÜRÜN KARTI ---
function ProductCard({ product, lang }: { product: Product, lang: string }) {
  const title = lang === 'en' && product.name_en ? product.name_en : product.name_tr;
  const description = (lang === 'en' && product.shortDescription_en) ? product.shortDescription_en : (product.shortDescription_tr || "");

  return (
    <div className="group border border-gray-200/20 bg-white/5 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        <img 
          src={product.galleryImages[0]?.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        {product.discountLabel && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
            {product.discountLabel}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
          {title}
        </h3>
        <p className="text-sm opacity-70 mb-3 line-clamp-2 flex-1">
          {description}
        </p>
        <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100/10">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs opacity-50 line-through">
                {product.originalPrice.toLocaleString('tr-TR')} TL
              </span>
            )}
            <span className="text-lg font-bold text-[var(--color-primary)]">
              {product.price.toLocaleString('tr-TR')} TL
            </span>
          </div>
          <Link 
            href={`/products/${product.id}`}
            className="px-4 py-2 text-sm font-semibold bg-[var(--color-btn-addtocart)] text-[var(--color-btn-addtocart-text)] rounded hover:opacity-90 transition-opacity shadow-sm"
          >
            {lang === 'en' ? 'View' : 'İncele'}
          </Link>
        </div>
      </div>
    </div>
  );
}