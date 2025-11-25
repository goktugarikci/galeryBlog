import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/shop/ProductDetail';

// --- VERİ ÇEKME FONKSİYONLARI ---

// 1. Ürün Verisini Çek
async function getProduct(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
      cache: "no-store" // Stok ve fiyat her zaman güncel olmalı
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// 2. Site Ayarlarını Çek (DÜZELTME BURADA)
async function getSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, { 
      // ESKİ: next: { revalidate: 60 } -> Bu 60 saniye eski veriyi tutuyordu.
      cache: "no-store" // YENİ: Önbellek yok, anlık ayarları çek.
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) { return null; }
}

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';
  const title = lang === 'en' && product?.name_en ? product.name_en : product?.name_tr;

  return {
    title: title || 'Ürün Detayı',
    description: product?.shortDescription_tr || 'Ürün detay sayfası'
  };
}

// --- ANA BİLEŞEN ---
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Verileri Paralel Olarak Çek
  const [product, settings] = await Promise.all([
    getProduct(id),
    getSettings()
  ]);

  if (!product) {
    notFound();
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';

  return (
    <div className="min-h-screen py-8 md:py-12 bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        {/* ProductDetail, güncel 'settings' verisini alacak */}
        <ProductDetail 
          product={product} 
          lang={lang} 
          settings={settings} 
        />
        
      </div>
    </div>
  );
}