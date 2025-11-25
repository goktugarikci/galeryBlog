import { cookies } from 'next/headers';
import Link from 'next/link';
import DynamicPageSlider from '@/components/common/DynamicPageSlider';
import ProductCard from '@/components/shop/ProductCard'; // Kart bileşenini import ediyoruz

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
  stock: number;
  status: string;
  sku?: string;
  subCategory?: {
     name_tr: string;
     name_en?: string;
     category: { name_tr: string; name_en?: string; }
  };
};

type Settings = { 
  enableEnglish: boolean; 
  showHomeSlider: boolean; 
};

// --- VERİ ÇEKME FONKSİYONLARI ---

// 1. Slider Verileri
async function getSliders(): Promise<Slider[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/slider`, {
      cache: "no-store" // Slider güncellemelerini anında görmek için
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

// 2. Son Eklenen Ürünler
async function getRecentProducts(): Promise<Product[]> {
  try {
    // Backend'den ürünleri çek
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
      next: { revalidate: 10 } // 10 saniyede bir yenile
    });
    if (!res.ok) return [];
    const allProducts = await res.json();
    // İlk 8 ürünü göster
    return allProducts.slice(0, 8);
  } catch (e) { return []; }
}

// 3. Site Ayarları
async function getSiteSettings(): Promise<Settings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      cache: "no-store" // Ayarları her zaman güncel tut
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) { return null; }
}

// --- ANA SAYFA BİLEŞENİ ---
export default async function Home() {
  
  // Tüm verileri paralel olarak çek (Performans)
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
  const showSlider = (settings?.showHomeSlider ?? true) && sliders.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* Navbar ve Footer, layout.tsx (PublicLayout) tarafından sağlandığı için buraya eklenmez */}

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

        {/* 2. YENİ ÜRÜNLER ALANI */}
        <section className="container mx-auto px-4 mb-16">
          
          <div className="flex items-center justify-between mb-8 border-b-2 border-[var(--color-primary)] pb-2 p-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--color-primary)]">
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
            <div className="text-center py-20 bg-[var(--color-secondary)] rounded-lg border border-dashed border-[var(--color-text)]/20">
              <p className="text-lg opacity-70">
                {currentLang === 'en' ? 'No products found.' : 'Henüz ürün eklenmemiş.'}
              </p>
            </div>
          )}

        </section>

      </main>
    </div>
  );
}