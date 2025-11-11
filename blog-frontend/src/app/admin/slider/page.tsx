// src/app/admin/slider/page.tsx
import SliderManager from "@/components/admin/SliderManager";

async function getSliders() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/slider`, {
    cache: "no-store", // Her zaman en güncel slider'ları al
  });
  if (!res.ok) throw new Error("Slider verisi yüklenemedi");
  return res.json();
}

export default async function SliderPage() {
  const sliders = await getSliders();

  return (
    <div>
      <h1>Slider Ayarları</h1>
      <p>Anasayfa slider görsellerini, yazılarını ve sıralamasını yönetin.</p>
      
      {/* Client bileşeni, veriyi prop olarak alır */}
      <SliderManager initialSliders={sliders} />
    </div>
  );
}