// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext"; 
import { LanguageProvider } from "@/context/LanguageContext";
import AuthModal from "@/components/auth/AuthModal";
import PublicLayout from "@/components/layout/PublicLayout"; // YENİ: İmport
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/shop/CartDrawer";

const inter = Inter({ subsets: ["latin"] });

// ... (getSiteSettings ve generateMetadata aynı kalır) ...
async function getSiteSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      next: { revalidate: 0 } 
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) { return null; }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
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

  const themeStyles = settings ? {
    '--color-background': settings.colorBackground || '#ffffff',
    '--color-text': settings.colorText || '#000000',
    '--color-primary': settings.colorPrimary || '#FFD700',
    '--color-secondary': settings.colorSecondary || '#333333',
    // ... diğer renkler
    '--color-btn-addtocart': settings.colorButtonAddToCart || '#FFD700',
    '--color-btn-addtocart-text': settings.colorButtonAddToCartText || '#000000',
    '--color-btn-buynow': settings.colorButtonBuyNow || '#000000',
    '--color-btn-buynow-text': settings.colorButtonBuyNowText || '#ffffff',
    '--color-card-background': settings.colorCardBackground || '#343a40',
    '--color-card-text': settings.colorCardText || '#ffffff',
  } as React.CSSProperties : {};

return (
    <html lang="tr">
      <body className={inter.className} style={themeStyles}>
        <LanguageProvider>
          <AuthProvider>
            {/* CartProvider AuthProvider'ın içinde olmalı */}
            <CartProvider> 
              <ModalProvider>
                
                <PublicLayout settings={settings}>
                  {children}
                </PublicLayout>
                
                <AuthModal />
                <CartDrawer /> {/* YENİ: Sepet Çekmecesi */}

              </ModalProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}