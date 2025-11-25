import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// --- EKSİK OLAN IMPORT BU SATIR ---
import ProductFilterPopup from '@/components/shop/ProductFilter'; 
// ----------------------------------

// --- TİP TANIMLARI ---
type SubCategory = { 
  id: string; 
  name_tr: string; 
  name_en?: string; 
};

type Category = { 
  id: string; 
  name_tr: string; 
  name_en?: string; 
  subCategories: SubCategory[]; 
};

type Product = { 
  id: string; 
  name_tr: string; 
  name_en?: string; 
  price: number; 
  originalPrice?: number; 
  discountLabel?: string; 
  galleryImages: { imageUrl: string }[]; 
  subCategory?: {
    name_tr: string;
    name_en?: string;
    category: { name_tr: string; name_en?: string; }
  };
};

// --- VERİ ÇEKME FONKSİYONLARI ---

async function getCategory(id: string): Promise<Category | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories/${id}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) { return null; }
}

async function getCategoryProducts(categoryId: string, searchParams?: any): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    params.set('categoryId', categoryId);
    
    if (searchParams?.minPrice) params.set('minPrice', searchParams.minPrice);
    if (searchParams?.maxPrice) params.set('maxPrice', searchParams.maxPrice);
    if (searchParams?.sort) params.set('sort', searchParams.sort);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${params.toString()}`, { 
      cache: 'no-store' 
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) { return []; }
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const category = await getCategory(params.id);
    return { 
      title: category?.name_tr || 'Kategori' 
    };
}

// --- ANA BİLEŞEN ---
export default async function CategoryPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const [category, products] = await Promise.all([
    getCategory(params.id),
    getCategoryProducts(params.id, searchParams)
  ]);

  if (!category) {
    notFound();
  }

  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';
  const isEn = lang === 'en';
  
  const categoryName = isEn && category.name_en ? category.name_en : category.name_tr;

return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] py-8">
      <div className="container mx-auto px-4">
        
        {/* BAŞLIK ALANI */}
        <div className="mb-8 border-b-2 border-[var(--color-primary)] pb-6">
          
          {/* FLEX YAPISI: Başlık ve Filtre Butonunu Yan Yana Koyar */}
          <div className="flex items-center justify-between">
             <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)]">
               {categoryName}
             </h1>
             
             {/* Filtre Butonu Burada */}
             <ProductFilterPopup lang={lang} />
          </div>
          
          {/* Alt Kategoriler */}
          {category.subCategories.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {category.subCategories.map(sub => (
                <Link 
                  key={sub.id} 
                  href={`/category/sub/${sub.id}`}
                  className="px-4 py-2 text-sm font-medium bg-[var(--color-secondary)] border border-[var(--color-text)]/20 rounded-full hover:bg-[var(--color-primary)] hover:text-black transition-all"
                >
                  {isEn && sub.name_en ? sub.name_en : sub.name_tr}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Listesi */}
        <div className="w-full">
            {products.length === 0 ? (
              <div className="text-center py-20 bg-[var(--color-secondary)] rounded-xl border border-dashed border-[var(--color-text)]/20">
                <p className="text-lg opacity-70">
                  {isEn ? 'No products found based on filters.' : 'Filtrelere uygun ürün bulunamadı.'}
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

    </div>
  );
}

// --- ÜRÜN KARTI BİLEŞENİ ---
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
        <div className="relative w-full h-64 bg-black/20 overflow-hidden">
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
            
            <div 
              className="px-3 py-1 rounded text-xs font-bold uppercase transition-transform group-hover:scale-105"
              style={{
                backgroundColor: 'var(--color-btn-addtocart)',
                color: 'var(--color-btn-addtocart-text)'
              }}
            >
              {isEn ? 'View' : 'İncele'}
            </div>
          </div>
        </div>
      </Link>
    );
}