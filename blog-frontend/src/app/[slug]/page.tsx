import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import DynamicPageSlider from '@/components/common/DynamicPageSlider';

// --- TİP TANIMLARI ---
type SliderImage = { 
  imageUrl: string; 
  caption_tr?: string; 
  caption_en?: string; 
  linkUrl?: string;
};

type DynamicPage = {
  title_tr: string;
  title_en?: string;
  layoutJson_tr?: string;
  layoutJson_en?: string;
  
  // Slider Ayarları
  sliderEnabled: boolean;
  sliderPosition: 'top' | 'bottom';
  sliderImages: SliderImage[]; 
  sliderHeightPx_mobile: number;
  sliderHeightPx_desktop: number;
  sliderObjectFit: 'cover' | 'contain';
};

// Sunucuda veriyi slug'a göre çeken fonksiyon
async function getPageData(slug: string): Promise<DynamicPage | null> {
  try {
    // Cache'i devre dışı bırakarak her zaman güncel veriyi alıyoruz
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/${slug}`, {
      cache: "no-store" 
    });
    
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

// Sayfa Başlığını (Metadata) dinamik olarak ayarla
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params; // await eklendi
  const page = await getPageData(params.slug);
  
  return {
    title: page?.title_tr || 'Sayfa Bulunamadı',
  };
}

// --- SAYFA BİLEŞENİ ---
export default async function DynamicPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params; // await eklendi
  const page = await getPageData(params.slug);

  // Sayfa bulunamazsa 404 sayfasına yönlendir
  if (!page) {
    notFound();
  }

  // Aktif Dili Belirle (Çerezlerden)
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';

  // Dile göre içerik seçimi (EN yoksa TR göster)
  const title = lang === 'en' && page.title_en ? page.title_en : page.title_tr;
  const content = lang === 'en' && page.layoutJson_en ? page.layoutJson_en : page.layoutJson_tr;

  // Slider Bileşeni
  const PageSlider = () => (
    page.sliderEnabled && page.sliderImages.length > 0 ? (
      <div className="mb-8 w-full">
        <DynamicPageSlider
          images={page.sliderImages}
          heightMobilePx={page.sliderHeightPx_mobile || 200}
          heightDesktopPx={page.sliderHeightPx_desktop || 400}
          objectFit={page.sliderObjectFit || 'cover'}
          altTextDefault={title}
        />
      </div>
    ) : null
  );

  return (
    // Tema renklerini kullanan kapsayıcı
    <div className="flex flex-col min-h-screen text-[var(--color-text)]">
      
      <main className="flex-1 container mx-auto p-4 md:p-8">
        
        {/* 1. DURUM: Slider İçeriğin Üstündeyse */}
        {page.sliderPosition === 'top' && <PageSlider />}

        {/* Sayfa İçeriği */}
        <article className="prose lg:prose-xl max-w-none mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[var(--color-primary)]">
            {title}
          </h1>
          
          {/* İçerik Metni (HTML olarak render edilir) */}
          <div 
            className="whitespace-pre-wrap leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content || '' }} 
          />
        </article>

        {/* 2. DURUM: Slider İçeriğin Altındaysa */}
        {page.sliderPosition === 'bottom' && <PageSlider />}

      </main>
      
    </div>
  );
}