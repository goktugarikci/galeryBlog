// src/app/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Tip (backend'den gelen tam veri)
type DynamicPage = {
  title_tr: string;
  title_en?: string;
  layoutJson_tr?: string;
  layoutJson_en?: string;
  sliderEnabled: boolean;
  sliderPosition: 'top' | 'bottom';
  sliderImages: { imageUrl: string; caption_tr?: string; }[];
};

// Sunucuda veriyi slug'a göre çek
async function getPageData(slug: string): Promise<DynamicPage | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/${slug}`, {
      next: { revalidate: 3600 } // 1 saat cache
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// Sayfa Başlığını (Metadata) dinamik olarak ayarla
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPageData(params.slug);
  // TODO: Dil seçimine göre title_en'i de destekle
  return {
    title: page?.title_tr || 'Sayfa Bulunamadı'
  };
}


export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await getPageData(params.slug);

  // Sayfa bulunamazsa 404 göster
  if (!page) {
    notFound();
  }

  // TODO: Dil seçimine göre _en olanları tercih et
  const title = page.title_tr;
  const content = page.layoutJson_tr;

  // Slider bileşenini (varsa) render et
  const PageSlider = () => (
    page.sliderEnabled && page.sliderImages.length > 0 ? (
      <section className="w-full h-64 bg-gray-300 mb-8">
        {/* Buraya <Slider> bileşeni gelecek (şimdilik placeholder) */}
        <img 
          src={page.sliderImages[0].imageUrl} 
          alt={page.sliderImages[0].caption_tr || title}
          className="w-full h-full object-cover" 
        />
      </section>
    ) : null
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        
        {/* Slider Konumu: Üstte */}
        {page.sliderPosition === 'top' && <PageSlider />}

        {/* İçerik Metni Konumu */}
        <article className="prose lg:prose-xl max-w-none">
          <h1>{title}</h1>
          {/* 'layoutJson' normalde JSON'dır ve özel bir render'dan geçmelidir.
            Şimdilik basit metin olarak basıyoruz.
          */}
          <div>{content}</div>
        </article>

        {/* Slider Konumu: Altta */}
        {page.sliderPosition === 'bottom' && <PageSlider />}

      </main>
      <Footer />
    </div>
  );
}