"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

// --- TİP TANIMLARI ---
type Feature = { 
  key_tr: string; 
  value_tr: string; 
  key_en: string; 
  value_en: string; 
};

type Product = {
  id: string;
  name_tr: string; name_en?: string;
  description_tr: string; description_en?: string;
  shortDescription_tr?: string; shortDescription_en?: string;
  price: number; originalPrice?: number; discountLabel?: string;
  sku: string; stock: number;
  galleryImages: { imageUrl: string; altText?: string }[];
  features: Feature[];
};

type Settings = {
  eCommerceEnabled: boolean;
  whatsAppNumber?: string;
  whatsAppMessageTemplate?: string;
};

export default function ProductDetail({ product, lang, settings }: { product: Product, lang: string, settings: Settings | null }) {
  const { user } = useAuth();
  const { openModal } = useModal();
  const { addToCart } = useCart(); 
  const router = useRouter();

  // --- STATE ---
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'features'>('description');
  const [isAdding, setIsAdding] = useState(false);

  // --- AYARLAR VE DİL ---
  const isEn = lang === 'en';
  const isEcommerce = settings?.eCommerceEnabled ?? true;

  // İçerik Çevirisi
  const name = isEn && product.name_en ? product.name_en : product.name_tr;
  const description = isEn && product.description_en ? product.description_en : product.description_tr;
  const shortDesc = isEn && product.shortDescription_en ? product.shortDescription_en : product.shortDescription_tr;
  
  // --- RESİM URL DÜZELTME ---
  const getImageUrl = (url: string) => {
    if (url.startsWith('/uploads')) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`;
    }
    return url;
  };

  // --- SEPETE EKLEME (E-TİCARET MODU) ---
  const handleAddToCart = async () => {
    if (!user) {
      alert(isEn ? "Please login to add items to cart." : "Sepete ürün eklemek için lütfen giriş yapın.");
      openModal('login'); 
      return;
    }

    if (product.stock < quantity) {
      alert(isEn ? "Insufficient stock!" : "Yetersiz stok!");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  // --- WHATSAPP SİPARİŞ (KATALOG MODU) ---
  const handleWhatsAppOrder = () => {
    const phoneNumber = settings?.whatsAppNumber?.replace(/[^0-9]/g, "") || ""; 
    let messageTemplate = settings?.whatsAppMessageTemplate || "Merhaba, [ÜRÜN_ADI] hakkında bilgi almak istiyorum.";
    
    const message = messageTemplate.replace("[ÜRÜN_ADI]", name);
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Stok Durumu Metni
  const stockStatus = product.stock > 0 
    ? (isEn ? 'In Stock' : 'Stokta Var') 
    : (isEn ? 'Out of Stock' : 'Tükendi');

  // --- ORTAK STİLLER (Veritabanından) ---
  const cardStyle = {
    backgroundColor: 'var(--color-card-background)', // Kart Arka Planı (YENİ)
    color: 'var(--color-card-text)',                 // Kart Yazı Rengi (YENİ)
    borderColor: 'var(--color-primary)'              // Çerçeve (Ana Renk)
  };

  return (
    <div 
      className="rounded-xl shadow-sm border overflow-hidden"
      style={cardStyle}
    >
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
        
        {/* 1. SOL KOLON: GALERİ */}
        <div className="p-6 bg-black/10 flex flex-col gap-4">
          {/* Büyük Resim */}
          <div className="relative w-full aspect-square bg-white/5 rounded-lg overflow-hidden shadow-sm border border-white/10 group">
            <Image 
              src={getImageUrl(product.galleryImages[selectedImageIndex]?.imageUrl || '/placeholder.png')} 
              alt={name}
              fill
              className="object-contain hover:scale-105 transition-transform duration-500"
              unoptimized={true}
            />
            {/* İndirim Etiketi */}
            {product.discountLabel && (
               <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md z-10">
                 {product.discountLabel}
               </div>
            )}
          </div>
          
          {/* Küçük Resimler */}
          {product.galleryImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
              {product.galleryImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-[var(--color-primary)] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <Image 
                    src={getImageUrl(img.imageUrl)} 
                    alt={`thumb-${idx}`} 
                    fill 
                    className="object-cover" 
                    unoptimized={true} 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. SAĞ KOLON: BİLGİLER */}
        <div className="p-6 md:p-8 flex flex-col">
          
          {/* Başlık */}
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-card-text)' }}>
            {name}
          </h1>
          
          {/* SKU ve Stok */}
          <div className="flex items-center gap-4 text-sm opacity-70 mb-6">
             <span>SKU: {product.sku || 'N/A'}</span>
             <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${product.stock > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
               {stockStatus}
             </span>
          </div>

          {/* Fiyat */}
          <div className="mb-8 pb-6 border-b border-white/10">
            {product.originalPrice && (
              <span className="text-lg opacity-50 line-through mr-3">
                {product.originalPrice.toLocaleString('tr-TR')} TL
              </span>
            )}
            <span className="text-4xl font-bold" style={{ color: 'var(--color-primary)' }}>
              {product.price.toLocaleString('tr-TR')} TL
            </span>
          </div>

          {/* Kısa Açıklama */}
          {shortDesc && (
            <p className="mb-8 leading-relaxed opacity-80">
              {shortDesc}
            </p>
          )}

          {/* --- AKSİYON ALANI (SEPET veya WHATSAPP) --- */}
          <div className="mt-auto space-y-6">
            
            {isEcommerce ? (
              /* E-TİCARET MODU: Miktar ve Sepete Ekle */
              <>
                <div className="flex items-center gap-4">
                  <span className="font-medium opacity-80">{isEn ? "Quantity:" : "Adet:"}</span>
                  <div className="flex items-center border border-white/20 rounded-md h-10 bg-white/5">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 h-full hover:bg-white/10 disabled:opacity-50"
                      disabled={quantity <= 1}
                    > - </button>
                    <span className="px-4 font-bold min-w-[2.5rem] text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 h-full hover:bg-white/10 disabled:opacity-50"
                      disabled={quantity >= product.stock}
                    > + </button>
                  </div>
                  <span className="text-xs opacity-60 ml-auto">
                    {isEn ? `${product.stock} available` : `${product.stock} stokta`}
                  </span>
                </div>

                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock <= 0}
                  className="w-full py-4 rounded-lg font-bold text-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-btn-addtocart)',
                    color: 'var(--color-btn-addtocart-text)'
                  }}
                >
                  {isAdding ? (
                    <span className="animate-pulse">{isEn ? 'Adding...' : 'Ekleniyor...'}</span>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 5.407c.636 2.726.954 4.089.068 5.169-.886 1.08-2.367 1.08-5.33 1.08H8.904c-2.963 0-4.444 0-5.33-1.08-.886-1.08-.568-2.443.068-5.17l1.263-5.406c.24-1.029.36-1.544.709-1.877C5.963 6.333 6.492 6.333 7.55 6.333h8.9c1.058 0 1.587 0 1.938.352.35.352.47.867.709 1.896Z" />
                      </svg>
                      {isEn ? 'Add to Cart' : 'Sepete Ekle'}
                    </>
                  )}
                </button>
              </>
            ) : (
              /* KATALOG MODU: WhatsApp Butonu */
              <button 
                onClick={handleWhatsAppOrder}
                className="w-full py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                {isEn ? 'Order via WhatsApp' : 'WhatsApp İle Sipariş Ver'}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* 3. ALT BÖLÜM: TABLAR (Açıklama / Özellikler) */}
      <div className="border-t border-white/10">
        {/* Tab Başlıkları */}
        <div className="flex border-b border-white/10 bg-black/5">
          <button 
            onClick={() => setActiveTab('description')}
            className={`px-8 py-4 font-bold text-sm uppercase tracking-wider transition-colors border-r border-white/10 
                ${activeTab === 'description' 
                    ? 'bg-[var(--color-card-background)] text-[var(--color-primary)] border-t-2 border-t-[var(--color-primary)]' 
                    : 'text-[var(--color-card-text)] opacity-60 hover:opacity-100 hover:bg-black/10'}`}
          >
            {isEn ? 'Description' : 'Ürün Açıklaması'}
          </button>
          <button 
            onClick={() => setActiveTab('features')}
            className={`px-8 py-4 font-bold text-sm uppercase tracking-wider transition-colors border-r border-white/10 
                ${activeTab === 'features' 
                    ? 'bg-[var(--color-card-background)] text-[var(--color-primary)] border-t-2 border-t-[var(--color-primary)]' 
                    : 'text-[var(--color-card-text)] opacity-60 hover:opacity-100 hover:bg-black/10'}`}
          >
            {isEn ? 'Features' : 'Özellikler'}
          </button>
        </div>

        {/* Tab İçeriği */}
        <div className="p-8 min-h-[200px] bg-[var(--color-card-background)]">
          {activeTab === 'description' && (
             <div className="prose max-w-none whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--color-card-text)' }}>
               {description || (isEn ? "No description available." : "Açıklama bulunmuyor.")}
             </div>
          )}

          {activeTab === 'features' && (
             <div className="max-w-2xl">
               {product.features && product.features.length > 0 ? (
                 <table className="w-full border-collapse text-sm" style={{ color: 'var(--color-card-text)' }}>
                   <tbody>
                     {product.features.map((feature, idx) => (
                       <tr key={idx} className="border-b border-white/10 last:border-0 hover:bg-white/5">
                         <td className="py-3 px-4 font-bold w-1/3 bg-black/10 opacity-80">
                           {isEn ? (feature.key_en || feature.key_tr) : feature.key_tr}
                         </td>
                         <td className="py-3 px-4 opacity-90">
                           {isEn ? (feature.value_en || feature.value_tr) : feature.value_tr}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                 <p className="italic opacity-60" style={{ color: 'var(--color-card-text)' }}>
                    {isEn ? "No features specified." : "Özellik belirtilmemiş."}
                 </p>
               )}
             </div>
          )}
        </div>
      </div>

    </div>
  );
}