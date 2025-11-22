// src/app/admin/slider/page.tsx
import SliderManager from "@/components/admin/SliderManager";

async function getSliders() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/slider`, {
      cache: "no-store", // Her zaman en güncel veriyi çek
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Slider verisi çekilemedi:", error);
    return []; // Hata olursa boş dizi döndür ki sayfa çökmesin
  }
}

export default async function SliderPage() {
  const sliders = await getSliders();

  return (
    <div>
      {/* Başlıkları kaldırdık, SliderManager içinde zaten var */}
      <SliderManager initialSliders={sliders} />
    </div>
  );
}