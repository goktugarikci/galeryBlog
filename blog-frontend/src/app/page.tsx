// src/app/page.tsx
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar'; // Navbar ve Footer'ı import ediyoruz
import Footer from '@/components/layout/Footer';

// Veri Tipleri
type Slider = { id: string; imageUrl: string; caption_tr?: string; caption_en?: string; linkUrl?: string; };
type Product = { 
  id: string; 
  name_tr: string; name_en?: string; 
  shortDescription_tr?: string; shortDescription_en?: string;
  price: number; 
  originalPrice?: number;
  discountLabel?: string;
  galleryImages: { imageUrl: string }[];
};
// SiteSettings için tip
type Settings = {
  enableEnglish: boolean;
};

// ===================================
// API VERİ ÇEKME FONKSİYONLARI (Sunucu Tarafında)
// ===================================

async function getSliders(): Promise<Slider[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/slider`, {
      next: { revalidate: 60 } 
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

async function getRecentProducts(): Promise<Product[]> {
  try {
    // TODO: Backend product.controller.js'de 'limit' parametresini destekle
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=8`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

// GÜNCELLEME: 'enableEnglish' ayarını çekmek için bu fonksiyon eklendi
async function getSiteSettings(): Promise<Settings | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Sadece ihtiyacımız olan ayarları döndür
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
    getSiteSettings() // Dil ayarlarını çek
  ]);

  // === HATA DÜZELTMESİ (Burada yapıldı) ===
  
  // 1. 'lang' değişkeninin tipini 'string' olarak belirttik.
  //    (TODO: Bu 'lang' değerini bir cookie'den veya URL'den almalısınız)
  const lang: string = 'tr'; 
  
  // 2. 'enableEnglish' değerini hardcode yapmak yerine API'dan (settings) aldık.
  const enableEnglish = settings?.enableEnglish || false; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      
      {/* 1. NAVBAR */}
      <Navbar />

      <main style={{ flex: 1, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
        
        {/* 2. SLIDER */}
        {sliders.length > 0 && (
          <section style={{ height: '400px', backgroundColor: '#333', position: 'relative', overflow: 'hidden', color: 'white' }}>
            <img 
              src={sliders[0].imageUrl} 
              alt={sliders[0].caption_tr || 'Slider'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', background: 'rgba(0,0,0,0.5)', padding: '1rem' }}>
              {/* HATA DÜZELDİ: 'lang' artık 'string' olduğu için hata vermez */}
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


// Ayrı bir Ürün Kartı bileşeni (Değişiklik yok)
function ProductCard({ product, lang, enableEnglish }: { product: Product, lang: string, enableEnglish: boolean }) {
  
  const title = (lang === 'en' && enableEnglish && product.name_en) ? product.name_en : product.name_tr;
  const description = (lang === 'en' && enableEnglish && product.shortDescription_en) 
                      ? product.shortDescription_en 
                      : product.shortDescription_tr;

  const cardStyle: React.CSSProperties = {
    border: '1px solid var(--color-secondary)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    overflow: 'hidden',
  };
  
  const buttonStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-btn-addtocart)',
    color: 'var(--color-btn-addtocart-text)',
    padding: '0.5rem',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  return (
    <div style={cardStyle}>
      <img 
        src={product.galleryImages[0]?.imageUrl || 'https://via.placeholder.com/300'} 
        alt={title}
        style={{ width: '100%', height: '200px', objectFit: 'cover' }} 
      />
      <div style={{ padding: '1rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{title}</h3>
        {product.discountLabel && (
          <span style={{ color: 'red', fontWeight: 'bold' }}>{product.discountLabel}</span>
        )}
        <div>
          <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>{product.price} TL</span>
          {product.originalPrice && (
            <span style={{ textDecoration: 'line-through', marginLeft: '0.5rem', opacity: 0.7 }}>
              {product.originalPrice} TL
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, margin: '0.5rem 0' }}>
          {description}
        </p>
      </div>
      <button style={buttonStyle}>
        İncele
      </button>
    </div>
  );
}