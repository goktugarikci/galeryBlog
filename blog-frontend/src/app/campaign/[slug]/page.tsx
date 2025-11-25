import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// --- TİP TANIMLARI ---
type Product = {
  id: string;
  name_tr: string;
  name_en?: string;
  price: number;
  originalPrice?: number;
  discountLabel?: string;
  galleryImages: { imageUrl: string }[];
};

type Campaign = {
  id: string;
  title_tr: string;
  title_en?: string;
  description_tr?: string;
  description_en?: string;
  products: Product[];
};

// --- VERİ ÇEKME ---
async function getCampaign(slug: string): Promise<Campaign | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/slug/${slug}`, {
      cache: 'no-store', // Her zaman güncel veriyi al
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);
  return {
    title: campaign?.title_tr || 'Kampanya Bulunamadı',
    description: campaign?.description_tr || 'Kampanya detayları',
  };
}

// --- ANA BİLEŞEN ---
export default async function CampaignDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  if (!campaign) {
    notFound();
  }

  // Dil Desteği
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';
  const isEn = lang === 'en';

  const title = isEn && campaign.title_en ? campaign.title_en : campaign.title_tr;
  const description = isEn && campaign.description_en ? campaign.description_en : campaign.description_tr;

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      
      {/* Kampanya Başlık Alanı (Banner gibi) */}
      <div className="bg-[var(--color-secondary)] py-12 md:py-16 border-b border-[var(--color-primary)]">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-[var(--color-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Ürün Listesi */}
      <div className="container mx-auto px-4 py-12">
        
        <div className="flex items-center justify-between mb-8">
          <span className="text-sm font-medium opacity-60">
            {campaign.products.length} {isEn ? 'Products Found' : 'Ürün Bulundu'}
          </span>
        </div>

        {campaign.products.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-xl text-gray-400">
              {isEn ? 'No products in this campaign yet.' : 'Bu kampanyada henüz ürün bulunmuyor.'}
            </p>
            <Link href="/" className="text-teal-600 hover:underline mt-2 block">
              {isEn ? 'Go to Home' : 'Anasayfaya Dön'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {campaign.products.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// --- ÜRÜN KARTI BİLEŞENİ (Local) ---
function ProductCard({ product, lang }: { product: Product; lang: string }) {
  const isEn = lang === 'en';
  const title = isEn && product.name_en ? product.name_en : product.name_tr;
  
  // Resim URL Düzeltme
  let imageUrl = product.galleryImages[0]?.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image';
  if (imageUrl.startsWith('/uploads')) {
    imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`;
  }

  return (
    <Link 
      href={`/products/${product.id}`} 
      className="group flex flex-col bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
    >
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized={true}
        />
        {product.discountLabel && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
            {product.discountLabel}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-2 text-[var(--color-text)]">
          {title}
        </h3>
        
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs opacity-50 line-through text-[var(--color-text)]">
                {product.originalPrice.toLocaleString('tr-TR')} TL
              </span>
            )}
            <span className="text-lg font-bold text-[var(--color-primary)]">
              {product.price.toLocaleString('tr-TR')} TL
            </span>
          </div>
          <span className="text-xs font-bold uppercase tracking-wide bg-[var(--color-primary)] text-black px-3 py-1 rounded-full">
            {isEn ? 'View' : 'İncele'}
          </span>
        </div>
      </div>
    </Link>
  );
}