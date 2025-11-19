// src/app/page.tsx
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard'; // Ürün kartını ayırdık

// ===================================
// TİP TANIMLARI (TYPES)
// ===================================
type Slider = { 
  id: string; 
  imageUrl: string; 
  caption_tr?: string; 
  caption_en?: string; 
  linkUrl?: string; 
};

type Product = { 
  id: string; 
  name_tr: string; name_en?: string; 
  shortDescription_tr?: string; shortDescription_en?: string;
  price: number; 
  originalPrice?: number;
  discountLabel?: string;
  galleryImages: { imageUrl: string }[];
};

type Settings = {
  enableEnglish: boolean;
};

// ===================================
// API VERİ ÇEKME FONKSİYONLARI (Sunucu Tarafında)
// ===================================

async function getSliders(): Promise<Slider[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/slider`, {
      next: { revalidate: 60 } // 1 dakikada bir yenile
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

async function getRecentProducts(): Promise<Product[]> {
  try {
    // Backend'de /products rotası 'limit' desteklemiyor olabilir, 
    // ama frontend'de hazır olması için ekliyoruz.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

async function getSiteSettings(): Promise<Settings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { 
      enableEnglish: data.enableEnglish 
    };
  } catch (e) { return null; }
}

// ===================================
// ANA SAYFA (SERVER COMPONENT)
// ===================================
export default async function Home() {
  
  // 1. Gerekli tüm verileri paralel olarak çek
  const [sliders, products, settings] = await Promise.all([
    getSliders(),
    getRecentProducts(),
    getSiteSettings()
  ]);

  // --- HATA DÜZELTMELERİ ---
  // Dil state'ini (şimdilik 'tr') ve tipini ('string') belirliyoruz.
  const lang: string = 'tr'; 
  // 'enableEnglish' ayarını API'dan alıyoruz.
  const enableEnglish = settings?.enableEnglish || false;
  // --- Bitiş ---

  return (
    // 'layout.tsx'den gelen tema renklerini kullanır
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      
      {/* 1. NAVBAR */}
      <Navbar />

      <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        
        {/* 2. SLIDER */}
        {sliders.length > 0 && (
          <section style={{ height: '400px', backgroundColor: '#333', position: 'relative', overflow: 'hidden', color: 'white' }}>
            {/* TODO: Buraya 'react-slick', 'swiper' vb. bir kütüphane entegre edilmeli */}
            <img 
              src={sliders[0].imageUrl} 
              alt={sliders[0].caption_tr || 'Slider'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
              {/* Düzeltildi */}
              <h2>{lang === 'en' && enableEnglish ? sliders[0].caption_en : sliders[0].caption_tr}</h2>
            </div>
          </section>
        )}

        {/* 3. EN SON EKLENEN ÜRÜNLER */}
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
            Yeni Ürünler
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} enableEnglish={enableEnglish} />
            ))}
          </div>
        </section>

      </main>

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
}