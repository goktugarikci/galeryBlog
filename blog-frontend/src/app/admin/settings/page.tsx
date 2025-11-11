// src/app/admin/settings/page.tsx
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";

// Sunucu tarafında veriyi çek
async function getSettings() {
  // .env.local dosyasındaki API adresini kullanıyoruz
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
    cache: "no-store", // Ayarların her zaman en güncel halini al
  });

  if (!res.ok) {
    throw new Error("Ayarlar yüklenemedi");
  }
  return res.json();
}

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1>Site Ayarları</h1>
      <p>Sitenizin genel görünümünü, SEO, tema ve dil ayarlarını buradan yönetin.</p>
      
      {/* SiteSettingsForm, "use client" bileşenidir.
        Başlangıç verisi olarak sunucuda çektiğimiz 'settings'i veriyoruz.
      */}
      <SiteSettingsForm initialSettings={settings} />
    </div>
  );
}