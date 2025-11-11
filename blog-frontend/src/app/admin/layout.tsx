// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext"; // Düzeltilmiş yol

const inter = Inter({ subsets: ["latin"] });

// Dinamik veriyi (renkler) almak için API fonksiyonu
async function getSiteSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 60 } // 60 saniyede bir ayarları kontrol et
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Layout settings fetch failed:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  // Veritabanından gelen SEO ayarlarını kullan
  return {
    title: settings?.seoTitle || "GaleryBlog",
    description: settings?.seoDescription || "Proje Açıklaması",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  // Veritabanından gelen renkleri CSS değişkenlerine dönüştür
  const themeStyles = settings ? {
    '--color-background': settings.colorBackground,
    '--color-text': settings.colorText,
    '--color-primary': settings.colorPrimary,
    '--color-secondary': settings.colorSecondary,
    '--color-btn-addtocart': settings.colorButtonAddToCart,
    '--color-btn-addtocart-text': settings.colorButtonAddToCartText,
    '--color-btn-buynow': settings.colorButtonBuyNow,
    '--color-btn-buynow-text': settings.colorButtonBuyNowText,
    '--nav-layout': settings.navLayout || 'top', // 'top' veya 'left'
  } as React.CSSProperties : {};

  return (
    <html lang="tr">
      {/* CSS değişkenlerini body'ye ekle */}
      <body className={inter.className} style={themeStyles}>
        <AuthProvider>
          {/* Buraya Navbar ve Footer bileşenlerini ekleyerek 
            tüm sayfalarda görünmesini sağlayabiliriz.
            Şimdilik ana sayfada (page.tsx) tutuyoruz.
          */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}