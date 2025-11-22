// src/components/layout/PublicLayout.tsx
"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

type Settings = {
  navLayout: string;
  // ... diğer ayarlar
  [key: string]: any;
};

export default function PublicLayout({ 
  children, 
  settings 
}: { 
  children: React.ReactNode;
  settings: Settings | null;
}) {
  const pathname = usePathname();
  // Eğer link "/admin" ile başlıyorsa, bu bir admin sayfasıdır.
  const isAdminPage = pathname?.startsWith("/admin");

  // 1. DURUM: Admin Sayfası
  // Hiçbir özel stil, navbar veya footer ekleme.
  // AdminLayoutClient kendi işini kendisi yapar.
  if (isAdminPage) {
    return <>{children}</>;
  }

  // 2. DURUM: Halka Açık Site (Preview)
  const isLeftLayout = settings?.navLayout === 'left';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar'ı buraya koyuyoruz, böylece her sayfaya elle eklemek zorunda kalmazsınız */}
      <Navbar />

      {/* İçerik Alanı */}
      {/* Sol menü aktifse, içeriği 250px sağa itiyoruz (md:pl-[250px]) */}
      <main 
        className={`flex-1 w-full transition-all duration-300 ${
          isLeftLayout ? 'md:pl-[250px]' : ''
        }`}
      >
        {children}
      </main>

      {/* Footer Alanı */}
      <div className={`${isLeftLayout ? 'md:pl-[250px]' : ''}`}>
        <Footer />
      </div>
    </div>
  );
}