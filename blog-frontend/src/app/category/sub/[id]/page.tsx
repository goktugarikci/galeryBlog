import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProductFilterPopup from '@/components/shop/ProductFilter';

// --- TİP TANIMLARI ---
type Category = { id: string; name_tr: string; name_en?: string; };
type SubCategory = { 
  id: string; 
  name_tr: string; 
  name_en?: string; 
  category: Category; 
};

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

// --- VERİ ÇEKME FONKSİYONLARI ---

// Alt Kategori Bilgisini Çek (Başlık ve Navigasyon için)
async function getSubCategory(id: string): Promise<SubCategory | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/subcategories/${id}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) { return null; }
}

// Alt Kategoriye Ait Ürünleri Çek
async function getSubCategoryProducts(subCategoryId: string): Promise<Product[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?subCategory=${subCategoryId}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const sub = await getSubCategory(id);
    return { title: sub?.name_tr || 'Alt Kategori' };
}

// --- ANA BİLEŞEN ---
export default async function SubCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Verileri Paralel Çek
  const [subCategory, products] = await Promise.all([
    getSubCategory(id),
    getSubCategoryProducts(id)
  ]);

  if (!subCategory) {
    notFound();
  }

  // Dil Ayarı (Çerezlerden)
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';
  const isEn = lang === 'en';
  
  // İsimleri Dile Göre Ayarla
  const subName = isEn && subCategory.name_en ? subCategory.name_en : subCategory.name_tr;
  const parentName = isEn && subCategory.category.name_en ? subCategory.category.name_en : subCategory.category.name_tr;

return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] py-8">
      <div className="container mx-auto px-4">
        
        {/* BAŞLIK ALANI */}
        <div className="mb-8 border-b-2 border-[var(--color-primary)] pb-4">
          <div className="text-sm opacity-60 mb-1 flex items-center gap-2">
            <Link href={`/category/${subCategory.category.id}`} className="hover:underline hover:text-[var(--color-primary)]">
              {parentName}
            </Link>
            <span>/</span>
            <span className="font-semibold">{subName}</span>
          </div>
          
          {/* FLEX YAPISI: Başlık ve Filtre */}
          <div className="flex items-center justify-between">
             <h1 className="text-3xl font-bold text-[var(--color-primary)]">{subName}</h1>
             
             {/* Filtre Butonu */}
             <ProductFilterPopup lang={lang} />
          </div>
        </div>

        {/* Ürün Listesi */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-secondary)] rounded-lg border border-dashed border-[var(--color-text)]/20">
            <p className="text-lg opacity-70">
              {isEn ? 'No products found in this category.' : 'Bu alt kategoride henüz ürün bulunmuyor.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- ÜRÜN KARTI BİLEŞENİ (Tema Uyumlu) ---
function ProductCard({ product, lang }: { product: Product, lang: string }) {
    const isEn = lang === 'en';
    const title = isEn && product.name_en ? product.name_en : product.name_tr;
    
    let imageUrl = product.galleryImages[0]?.imageUrl || 'https://via.placeholder.com/300x300?text=No+Image';
    if (imageUrl.startsWith('/uploads')) {
      imageUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${imageUrl}`;
    }
  
    return (
      <Link 
        href={`/products/${product.id}`} 
        className="group flex flex-col bg-[var(--color-secondary)] border border-[var(--color-text)]/10 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full hover:border-[var(--color-primary)]"
      >
        {/* Resim Alanı */}
        <div className="relative w-full h-64 bg-black/20 overflow-hidden">
          <Image 
            src={imageUrl} 
            alt={title} 
            fill 
            className="object-cover transition-transform duration-500 group-hover:scale-110" 
            unoptimized={true} 
          />
          
          {/* İndirim Etiketi */}
          {product.discountLabel && (
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
              {product.discountLabel}
            </div>
          )}
        </div>

        {/* Bilgi Alanı */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors text-[var(--color-text)]">
            {title}
          </h3>
          
          <div className="mt-auto pt-3 border-t border-[var(--color-text)]/10 flex justify-between items-center">
            <div className="flex flex-col">
               {product.originalPrice && (
                 <span className="text-xs opacity-50 line-through decoration-red-500 text-[var(--color-text)]">
                   {product.originalPrice.toLocaleString('tr-TR')} TL
                 </span>
               )}
               <span className="text-xl font-bold text-[var(--color-primary)]">
                 {product.price.toLocaleString('tr-TR')} TL
               </span>
            </div>
            
            {/* İncele Butonu */}
            <div className="px-3 py-1 rounded text-xs font-bold uppercase bg-[var(--color-btn-addtocart)] text-[var(--color-btn-addtocart-text)] transition-transform group-hover:scale-105">
              {isEn ? 'View' : 'İncele'}
            </div>
          </div>
        </div>
      </Link>
    );
}