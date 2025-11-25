"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductFilterPopup({ lang }: { lang: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEn = lang === 'en';
  const modalRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [min, setMin] = useState(searchParams.get('minPrice') || '');
  const [max, setMax] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('minPrice', min); else params.delete('minPrice');
    if (max) params.set('maxPrice', max); else params.delete('maxPrice');
    if (sort) params.set('sort', sort);
    router.push(`?${params.toString()}`);
    setIsOpen(false);
  };

  const clearFilter = () => {
    setMin(''); setMax(''); setSort('newest');
    router.push('?');
    setIsOpen(false);
  };

  // Ortak Stil Değişkenleri
  const primaryBg = { backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' };
  const primaryText = { color: 'var(--color-primary)' };
  const secondaryBg = { backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' };

  return (
    <>
      {/* --- FİLTRE BUTONU (ARTIK SABİT DEĞİL, İÇERİK AKIŞINDA) --- */}
      <button
        onClick={() => setIsOpen(true)}
        // DEĞİŞİKLİK: 'fixed' yerine 'relative' veya class yok. Boyut ve şekil ayarlandı.
        className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-md transition-all hover:scale-105 flex items-center justify-center border border-[var(--color-text)]/20 ml-4"
        style={primaryBg}
        aria-label="Filtrele"
        title={isEn ? "Filter & Sort" : "Filtrele & Sırala"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
        </svg>
      </button>

      {/* --- POPUP (MODAL) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div 
            ref={modalRef}
            style={secondaryBg}
            className="rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-[var(--color-primary)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-text)]/10">
              <h3 className="text-xl font-bold" style={primaryText}>
                {isEn ? 'Filter & Sort' : 'Filtrele & Sırala'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="opacity-60 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* İçerik */}
            <div className="p-6 space-y-6">
              {/* Sıralama */}
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide opacity-70">
                  {isEn ? 'Sort By' : 'Sıralama'}
                </label>
                <select 
                  value={sort} onChange={(e) => setSort(e.target.value)}
                  className="w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] appearance-none bg-black/20 border border-[var(--color-text)]/20"
                  style={{ color: 'var(--color-text)' }}
                >
                  <option value="newest">{isEn ? 'Newest' : 'En Yeni'}</option>
                  <option value="oldest">{isEn ? 'Oldest' : 'En Eski'}</option>
                  <option value="price_asc">{isEn ? 'Price: Low to High' : 'Fiyat: Artan'}</option>
                  <option value="price_desc">{isEn ? 'Price: High to Low' : 'Fiyat: Azalan'}</option>
                </select>
              </div>
              {/* Fiyat Aralığı */}
              <div>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide opacity-70">
                  {isEn ? 'Price Range' : 'Fiyat Aralığı (TL)'}
                </label>
                <div className="flex items-center gap-3">
                  <input type="number" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} className="w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-black/20 border border-[var(--color-text)]/20" style={{ color: 'var(--color-text)' }} />
                  <span className="font-bold">-</span>
                  <input type="number" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} className="w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-black/20 border border-[var(--color-text)]/20" style={{ color: 'var(--color-text)' }} />
                </div>
              </div>
            </div>

            {/* Footer Butonları */}
            <div className="p-5 border-t border-[var(--color-text)]/10 flex gap-3 bg-black/10">
              {(min || max || sort !== 'newest') && (
                <button onClick={clearFilter} className="flex-1 py-3.5 rounded-xl font-bold border border-[var(--color-text)]/20 hover:bg-white/10 transition-all">
                  {isEn ? 'Clear' : 'Temizle'}
                </button>
              )}
              <button onClick={applyFilters} className="flex-[2] py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:brightness-110" style={primaryBg}>
                {isEn ? 'Apply' : 'Uygula'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}