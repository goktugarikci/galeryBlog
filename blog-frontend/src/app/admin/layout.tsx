// src/app/admin/layout.tsx (DÜZELTİLMİŞ HALİ)

import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

/*
  Bu dosya ana layout'un (src/app/layout.tsx) İÇİNE yerleşir.
  Bu yüzden burada <html>, <body> veya AuthProvider etiketlerine 
  gerek YOKTUR. Onlar zaten ana layout'ta mevcut.
*/

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Bu layout'un tek görevi, /admin altındaki tüm sayfaları
  // (children) AdminLayoutClient (yani turkuaz menü) ile sarmalamaktır.
  return (
    <AdminLayoutClient>
      {children}
    </AdminLayoutClient>
  );
}