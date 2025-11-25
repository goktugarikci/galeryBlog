"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type SliderImage = {
  imageUrl: string;
  caption_tr?: string;
  caption_en?: string;
  linkUrl?: string;
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
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const getCorrectUrl = (url: string) => {
    if (url.startsWith('/uploads')) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`;
    }
    return url;
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToSlide = (slideIndex: number) => {
    setCurrentIndex(slideIndex);
  };

  useEffect(() => {
    if (isHovered || images.length <= 1) return;
    const slideInterval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(slideInterval);
  }, [isHovered, nextSlide, images.length]);

  if (!images || images.length === 0) return null;

  return (
    <div 
      className="relative w-full overflow-hidden group bg-gray-900"
      style={{ height: `${heightMobilePx}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style jsx>{`
        @media (min-width: 768px) {
          div { height: ${heightDesktopPx}px !important; }
        }
      `}</style>

      {images.map((image, index) => {
        const isActive = index === currentIndex;
        const imageSrc = getCorrectUrl(image.imageUrl);
        const captionText = image.caption_tr || image.caption_en;
        const altText = captionText || altTextDefault;

        return (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Resim */}
            {image.linkUrl ? (
              <Link href={image.linkUrl} className="block w-full h-full relative">
                <Image
                  src={imageSrc}
                  alt={altText}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  style={{ objectFit: objectFit }}
                  unoptimized={true}
                />
              </Link>
            ) : (
              <Image
                src={imageSrc}
                alt={altText}
                fill
                priority={index === 0}
                sizes="100vw"
                style={{ objectFit: objectFit }}
                unoptimized={true}
              />
            )}

            {isActive && captionText && (
              // DEĞİŞİKLİK 1: 'inset-0' yerine 'bottom-10 left-10' kullanıyoruz.
              // DEĞİŞİKLİK 2: 'w-auto' ve 'max-w' ile genişliği sınırlıyoruz.
              <div className="absolute bottom-10 top-130 left-4 md:left-10 z-20 w-auto max-w-[80%] md:max-w-lg pointer-events-none">
                
                {/* İç Kutu: Metin ve Arka Plan */}
                <div className="bg-black/60 backdrop-blur-sm text-white px-5 py-3 rounded-r-lg border-l-4 border-[var(--color-primary)] shadow-lg pointer-events-auto inline-block">
                  <h3 className="text-base md:text-xl leading-snug">
                    {captionText}
                  </h3>
                  {/* Eğer description varsa buraya küçük bir text olarak eklenebilir */}
                </div>

              </div>
            )}
          </div>
        );
      })}

      {/* --- NAVİGASYON --- */}
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); prevSlide(); }} className="absolute top-1/2 left-4 -translate-y-1/2 z-30 p-3 rounded-full text-white bg-black/20 hover:bg-black/50 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          </button>

          <button onClick={(e) => { e.preventDefault(); nextSlide(); }} className="absolute top-1/2 right-4 -translate-y-1/2 z-30 p-3 rounded-full text-white bg-black/20 hover:bg-black/50 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {images.map((_, index) => (
              <button key={index} onClick={(e) => { e.preventDefault(); goToSlide(index); }} className={`h-2.5 rounded-full transition-all duration-300 ease-out shadow-sm border border-white/20 ${index === currentIndex ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}