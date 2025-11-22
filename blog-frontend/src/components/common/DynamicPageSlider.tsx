// src/components/common/DynamicPageSlider.tsx
"use client";

import Image from 'next/image';
import Link from 'next/link'; // YENİ: Link bileşeni eklendi

// Slider resim veri tipi (linkUrl eklendi)
type SliderImage = {
  imageUrl: string;
  caption_tr?: string;
  caption_en?: string;
  linkUrl?: string; // YENİ: Link alanı
};

type DynamicPageSliderProps = {
  images: SliderImage[];
  heightMobilePx: number;
  heightDesktopPx: number;
  objectFit: 'cover' | 'contain';
  altTextDefault: string;
};

export default function DynamicPageSlider({
  images,
  heightMobilePx,
  heightDesktopPx,
  objectFit,
  altTextDefault,
}: DynamicPageSliderProps) {
  
  if (!images || images.length === 0) {
    return null;
  }

  // Şimdilik sadece ilk resmi gösteriyoruz (Tekli Slider)
  // İleride buraya Swiper.js gibi bir kütüphane eklenerek çoklu geçiş yapılabilir.
  const firstImage = images[0];
  const altText = firstImage.caption_tr || altTextDefault;

  // Resim İçeriği (Tekrar kullanılmak üzere değişkene atandı)
  const ImageContent = (
    <>
      <Image
        src={firstImage.imageUrl}
        alt={altText}
        fill
        priority // Anasayfa LCP performansı için önemli
        sizes="100vw"
        style={{ objectFit: objectFit }}
        className="block"
      />
      {/* Başlık (Caption) varsa göster */}
      {(firstImage.caption_tr || firstImage.caption_en) && (
         <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-md text-sm md:text-base z-10">
           {firstImage.caption_tr}
         </div>
      )}
    </>
  );

  return (
    <div 
      className="relative w-full overflow-hidden group"
      // Yükseklik ayarları
      style={{ height: `${heightMobilePx}px` }}
    >
      {/* Masaüstü yüksekliği için style bloğu */}
      <style jsx>{`
        @media (min-width: 768px) {
          div {
            height: ${heightDesktopPx}px !important;
          }
        }
      `}</style>

      {/* EĞER LİNK VARSA: Resmi Link ile sarmala */}
      {firstImage.linkUrl ? (
        <Link href={firstImage.linkUrl} className="block w-full h-full relative cursor-pointer">
          {ImageContent}
        </Link>
      ) : (
        // YOKSA: Sadece resmi göster
        <div className="w-full h-full relative">
          {ImageContent}
        </div>
      )}
      
    </div>
  );
}