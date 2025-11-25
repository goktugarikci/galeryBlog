// src/components/shop/CartDrawer.tsx
"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function CartDrawer() {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, totalAmount } = useCart();
  const { lang } = useLanguage();
  const isEn = lang === 'en';

  // URL Düzeltici
  const getImageUrl = (url: string) => {
    if (url.startsWith('/uploads')) return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`;
    return url;
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      
      {/* Arka Plan Karartma */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      ></div>

      {/* Çekmece İçeriği */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800">
            {isEn ? "Shopping Cart" : "Alışveriş Sepeti"} 
            <span className="ml-2 text-sm font-normal text-gray-500">({cartItems.length})</span>
          </h2>
          <button onClick={closeCart} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full">
            ✕
          </button>
        </div>

        {/* Sepet Listesi */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 opacity-60">
              <span className="text-4xl block mb-2">🛒</span>
              <p>{isEn ? "Your cart is empty." : "Sepetiniz boş."}</p>
              <button onClick={closeCart} className="mt-4 text-[var(--color-primary)] underline">
                {isEn ? "Start Shopping" : "Alışverişe Başla"}
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0">
                {/* Resim */}
                <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                  <Image 
                    src={getImageUrl(item.product.galleryImages[0]?.imageUrl || '/placeholder.png')} 
                    alt={item.product.name_tr} 
                    fill 
                    className="object-cover"
                    unoptimized={true}
                  />
                </div>

                {/* Bilgi */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2">
                       {isEn && item.product.name_en ? item.product.name_en : item.product.name_tr}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                       {isEn ? 'Unit Price:' : 'Birim Fiyat:'} {item.product.price.toLocaleString()} TL
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    {/* Miktar Arttır/Azalt */}
                    <div className="flex items-center border rounded-md h-8">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 hover:bg-gray-100 disabled:opacity-50"
                        disabled={item.quantity <= 1}
                      >-</button>
                      <span className="px-2 text-sm font-bold min-w-[1.5rem] text-center">{item.quantity}</span>
                      <button 
                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
                         className="px-2.5 hover:bg-gray-100 disabled:opacity-50"
                         disabled={item.quantity >= item.product.stock}
                      >+</button>
                    </div>
                    
                    {/* Sil */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      {isEn ? "Remove" : "Kaldır"}
                    </button>
                  </div>
                </div>
                
                {/* Toplam Fiyat */}
                <div className="font-bold text-gray-800 text-sm">
                  {(item.product.price * item.quantity).toLocaleString()} TL
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer (Toplam ve Checkout) */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4 text-lg font-bold">
              <span>{isEn ? "Subtotal" : "Ara Toplam"}</span>
              <span className="text-[var(--color-primary)]">{totalAmount.toLocaleString()} TL</span>
            </div>
            <Link 
               href="/checkout" 
               onClick={closeCart}
               className="block w-full py-3 text-center bg-[var(--color-primary)] text-[var(--color-secondary)] font-bold rounded-lg hover:brightness-110 transition-all shadow-md"
            >
              {isEn ? "Checkout" : "Siparişi Tamamla"}
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}