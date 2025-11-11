// src/app/page.tsx (Next.js 14+ App Router Örneği)
// Bu, sunucu tarafında (Server Component) çalışır, en hızlı yöntemdir.

// Veri tipi (Opsiyonel ama iyi bir pratiktir)
interface SiteSettings {
  siteName: string;
  themeColor: string;
  seoTitle: string;
  colorBackground: string;
  colorText: string;
}

// Backend'den veri çeken asenkron fonksiyon
async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    // .env.local dosyasındaki API adresimizi kullanıyoruz
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      // ISR için (Sitenin hızlı kalmasını sağlar):
      // Her 60 saniyede bir veriyi arka planda yeniden kontrol et
      next: { revalidate: 60 } 
    });

    if (!res.ok) {
      throw new Error('Ayarlar yüklenemedi');
    }
    
    return res.json();
    
  } catch (error) {
    console.error(error);
    return null;
  }
}


// Ana Sayfa Komponenti
export default async function Home() {
  const settings = await getSiteSettings();

  if (!settings) {
    return (
      <main style={{ padding: '2rem', backgroundColor: '#333', color: 'white' }}>
        <h1>Site Yüklenemedi</h1>
        <p>Backend sunucunuzun (http://localhost:3001) çalıştığından emin olun.</p>
      </main>
    );
  }

  return (
    // Veritabanından (Sarı/Siyah) gelen renkleri doğrudan uygula
    <main style={{ 
      backgroundColor: settings.colorBackground, 
      color: settings.colorText, 
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <h1>{settings.siteName}</h1>
      <h2>{settings.seoTitle}</h2>
      <p>
        Bu sayfa, Next.js (Frontend) tarafından render edildi ancak veriler 
        Express.js (Backend) API'nizden çekildi.
      </p>
      <p>
        Tema Ana Rengi (Veritabanından): {settings.themeColor}
      </p>
    </main>
  );
}