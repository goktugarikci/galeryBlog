import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/shop/ProductDetail';

// --- VERİ ÇEKME FONKSİYONLARI ---

// 1. Ürün Verisini Çek
async function getProduct(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      cache: "no-store" // Stok durumu ve fiyat değişimleri için her zaman güncel veri
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// 2. Site Ayarlarını Çek (Katalog Modu kontrolü için gerekli)
async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { 
      next: { revalidate: 60 } // Ayarları 1 dakikada bir kontrol et
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) { return null; }
}

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Next.js 15: params await edilmeli
  const product = await getProduct(id);
  
  // Çerezden dili al
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';

  // Dile göre başlık seçimi
  const title = lang === 'en' && product?.name_en ? product.name_en : product?.name_tr;

  return {
    title: title || 'Ürün Detayı',
    description: product?.shortDescription_tr || 'Ürün detay sayfası'
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Next.js 15: params await edilmeli
  
  // 3. Verileri Paralel Olarak Çek (Hız İçin)
  const [product, settings] = await Promise.all([
    getProduct(id),
    getSettings()
  ]);

  // Ürün bulunamazsa 404 sayfasına yönlendir
  if (!product) {
    notFound();
  }

  // Aktif dili belirle
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';

  return (
    // PublicLayout (layout.tsx) sayesinde Navbar ve Footer otomatik gelir.
    // Biz sadece içerik alanının arka plan ve yazı renklerini ayarlıyoruz.
    <div className="min-h-screen py-8 md:py-12 bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* Ürün Detay Bileşeni */}
        {/* ProductDetail içinde tüm mantık (Sepet, WhatsApp, Galeri) mevcuttur */}
        <ProductDetail 
          product={product} 
          lang={lang} 
          settings={settings} 
        />
        
      </div>
    </div>
  );
}