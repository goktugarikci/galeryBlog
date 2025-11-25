"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- TİP TANIMLARI ---
type OrderItem = {
  id: string;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
  // Backend'den gelen ilişkisel ürün verisi
  product?: {
      galleryImages: { imageUrl: string }[];
  };
};

type Order = {
  id: string;
  createdAt: string;
  totalAmount: number;
  status: string;       
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
};

export default function OrdersPage() {
  const { user, isLoading } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const isEn = lang === 'en';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // --- VERİ ÇEKME ---
  useEffect(() => {
    // 1. Kullanıcı kontrolü
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    // 2. Siparişleri getir
    if (user) {
      const fetchOrders = async () => {
        try {
          const res = await api.get("/shop/orders");
          setOrders(res.data);
        } catch (error) {
          console.error("Siparişler yüklenemedi", error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user, isLoading, router]);

  // --- YARDIMCI FONKSİYONLAR ---

  // Durum Rozeti (Renk ve Çeviri)
  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { tr: string; en: string; color: string } } = {
      pending:    { tr: "Onay Bekliyor", en: "Pending", color: "bg-yellow-100 text-yellow-800" },
      processing: { tr: "Hazırlanıyor", en: "Processing", color: "bg-blue-100 text-blue-800" },
      shipped:    { tr: "Kargolandı", en: "Shipped", color: "bg-purple-100 text-purple-800" },
      completed:  { tr: "Tamamlandı", en: "Completed", color: "bg-green-100 text-green-800" },
      cancelled:  { tr: "İptal Edildi", en: "Cancelled", color: "bg-red-100 text-red-800" },
      returned:   { tr: "İade Edildi", en: "Returned", color: "bg-orange-100 text-orange-800" },
    };

    const s = statusMap[status] || { tr: status, en: status, color: "bg-gray-100 text-gray-800" };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.color} border border-black/5`}>
        {isEn ? s.en : s.tr}
      </span>
    );
  };

  // Resim URL Düzeltme
  const getImageUrl = (url: string) => {
    if (url.startsWith('/uploads')) return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`;
    return url;
  };

  // --- YÜKLENİYOR EKRANI ---
  if (isLoading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <div className="animate-pulse">Yükleniyor...</div>
      </div>
    );
  }

  // --- ANA GÖRÜNÜM ---
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] py-12 transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Başlık */}
        <h1 className="text-3xl font-bold mb-8 text-[var(--color-primary)] border-b border-[var(--color-text)]/20 pb-4">
          {isEn ? "My Orders" : "Siparişlerim"}
        </h1>

        {/* Liste */}
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-secondary)] rounded-xl border border-dashed border-[var(--color-text)]/20">
            <p className="text-lg opacity-70 mb-4">
              {isEn ? "You have no orders yet." : "Henüz hiç sipariş vermediniz."}
            </p>
            <Link href="/products" className="text-[var(--color-primary)] hover:underline font-bold text-lg">
              {isEn ? "Start Shopping" : "Alışverişe Başla"}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-[var(--color-secondary)] border border-[var(--color-text)]/10 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:border-[var(--color-primary)]/50"
              >
                {/* --- SİPARİŞ ÖZETİ (Header) --- */}
                <div 
                  className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold opacity-80">#{order.id.slice(-6)}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="text-sm opacity-60 flex gap-2">
                      <span>📅 {new Date(order.createdAt).toLocaleDateString("tr-TR", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      <span>⏰ {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                      <div className="font-bold text-xl text-[var(--color-primary)]">
                        {order.totalAmount.toLocaleString()} TL
                      </div>
                      <div className="text-xs opacity-50 uppercase tracking-wide">
                        {order.paymentMethod === 'havale' ? (isEn ? 'Transfer' : 'Havale') : (isEn ? 'Cash' : 'Kapıda Ödeme')}
                      </div>
                    </div>
                    
                    {/* Ok İkonu */}
                    <div className={`transform transition-transform duration-300 text-[var(--color-primary)] ${expandedOrderId === order.id ? 'rotate-180' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* --- SİPARİŞ DETAYLARI (Accordion Body) --- */}
                {expandedOrderId === order.id && (
                  <div className="border-t border-[var(--color-text)]/10 bg-black/5 p-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    <h4 className="font-bold mb-4 text-xs uppercase opacity-50 tracking-wider">
                      {isEn ? "Order Items" : "SİPARİŞ İÇERİĞİ"}
                    </h4>
                    
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-[var(--color-background)] p-3 rounded-lg border border-[var(--color-text)]/5 shadow-sm">
                          
                          {/* 1. Ürün Görseli */}
                          <div className="w-16 h-16 bg-white/10 rounded-md overflow-hidden relative flex-shrink-0 border border-[var(--color-text)]/10">
                             <Image 
                               src={getImageUrl(item.product?.galleryImages[0]?.imageUrl || '/placeholder.png')}
                               alt={item.productName}
                               fill
                               className="object-cover"
                               unoptimized={true}
                             />
                          </div>

                          {/* 2. Ürün Bilgisi */}
                          <div className="flex-1">
                             <div className="font-bold text-sm text-[var(--color-text)] line-clamp-1">{item.productName}</div>
                             <div className="text-xs opacity-60 mt-1">
                               {item.quantity} x {item.priceAtPurchase.toLocaleString()} TL
                             </div>
                          </div>

                          {/* 3. Toplam Fiyat */}
                          <div className="font-bold text-[var(--color-primary)] text-sm whitespace-nowrap">
                            {(item.priceAtPurchase * item.quantity).toLocaleString()} TL
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Destek Linki */}
                    <div className="mt-6 pt-4 border-t border-[var(--color-text)]/10 flex justify-between items-center">
                       <div className="text-xs opacity-40">
                         {isEn ? "Need help?" : "Yardıma mı ihtiyacınız var?"}
                       </div>
                       <Link 
                         href="/contact" 
                         className="text-sm font-bold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors flex items-center gap-1"
                       >
                         <span>💬</span> {isEn ? "Contact Support" : "Destek ile İletişime Geç"}
                       </Link>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}