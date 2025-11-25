"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Ödeme Ayarları Tipi (SiteSettings'ten gelen)
type Settings = {
    paymentCashEnabled: boolean;
    paymentIbanEnabled: boolean;
    paymentIbanInfo: string;
    paymentPosEnabled: boolean;
};

export default function CheckoutPage() {
  const { cartItems, totalAmount, refreshCart } = useCart();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const router = useRouter();
  const isEn = lang === 'en';

  // Form State
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    shippingAddress: "",
    paymentMethod: "" // Başlangıçta boş, ayarlara göre dolacak
  });
  
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Kullanıcı Bilgilerini ve Site Ayarlarını Çek
  useEffect(() => {
    // Kullanıcı bilgilerini doldur
    if (user) {
      setFormData(prev => ({
        ...prev,
        customerName: `${user.firstName} ${user.lastName}`,
        // Telefon ve adres user objesinde varsa buraya ekleyin:
        customerPhone: user.phone || "",
        shippingAddress: user.address || ""
      }));
    }

    // Site Ayarlarını Çek (Ödeme yöntemleri için)
    api.get('/settings').then(res => {
        const s = res.data;
        setSettings(s);
        
        // Varsayılan ödeme yöntemini, aktif olan ilk yönteme göre belirle
        if (s.paymentCashEnabled) setFormData(prev => ({ ...prev, paymentMethod: "kapida_nakit" }));
        else if (s.paymentIbanEnabled) setFormData(prev => ({ ...prev, paymentMethod: "havale" }));
        else if (s.paymentPosEnabled) setFormData(prev => ({ ...prev, paymentMethod: "kredi_karti" }));
    });
  }, [user]);

  // Resim URL Düzeltme
  const getImageUrl = (url: string) => {
    if (url.startsWith('/uploads')) return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${url}`;
    return url;
  };

  // Form Gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paymentMethod) {
        alert(isEn ? "Please select a payment method." : "Lütfen bir ödeme yöntemi seçin.");
        return;
    }

    setIsSubmitting(true);

    try {
      // 1. Siparişi Oluştur
      await api.post('/shop/checkout', {
        ...formData,
        lang // Siparişin dilini de gönderiyoruz (Backend'de ürün adını kaydetmek için)
      });

      // 2. Başarılı
      alert(isEn ? "Order placed successfully!" : "Siparişiniz başarıyla alındı!");
      
      // 3. Sepeti Temizle
      await refreshCart();

      // 4. Yönlendir
      router.push('/profile'); // Siparişlerim sayfasına yönlendir

    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.error || (isEn ? "Order failed." : "Sipariş oluşturulamadı."));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sepet boşsa uyar
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
        <h1 className="text-2xl font-bold mb-4">{isEn ? "Your cart is empty" : "Sepetiniz Boş"}</h1>
        <button onClick={() => router.push('/')} className="text-[var(--color-primary)] underline hover:no-underline">
          {isEn ? "Go back to shopping" : "Alışverişe Dön"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] py-12 transition-colors duration-300">
      <div className="container mx-auto px-4">
        
        <h1 className="text-3xl font-bold mb-8 text-[var(--color-primary)] border-b border-[var(--color-text)]/10 pb-4">
          {isEn ? "Checkout" : "Siparişi Tamamla"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- SOL KOLON: FORM --- */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 text-gray-800">
              
              {/* 1. İletişim Bilgileri */}
              <h2 className="text-xl font-bold mb-6 pb-2 border-b flex items-center gap-2">
                <span className="bg-[var(--color-primary)] w-2 h-6 rounded-sm block"></span>
                {isEn ? "Shipping Information" : "Teslimat Bilgileri"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-80">{isEn ? "Full Name" : "Ad Soyad"} *</label>
                  <input 
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder={isEn ? "John Doe" : "Ad Soyad"}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 opacity-80">{isEn ? "Phone" : "Telefon"} *</label>
                  <input 
                    required
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder="05..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 opacity-80">{isEn ? "Address" : "Adres"} *</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({...formData, shippingAddress: e.target.value})}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                    placeholder={isEn ? "Full address..." : "Mahalle, Sokak, No, İlçe/İl..."}
                  />
                </div>
              </div>

              {/* 2. Ödeme Yöntemleri */}
              <h2 className="text-xl font-bold mb-6 pb-2 border-b flex items-center gap-2">
                <span className="bg-[var(--color-primary)] w-2 h-6 rounded-sm block"></span>
                {isEn ? "Payment Method" : "Ödeme Yöntemi"}
              </h2>

              {settings ? (
                  <div className="space-y-4 mb-8">
                    
                    {/* Kapıda Ödeme */}
                    {settings.paymentCashEnabled && (
                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${formData.paymentMethod === 'kapida_nakit' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-1 ring-[var(--color-primary)]' : 'border-gray-200 hover:border-gray-300'}`}>
                           <div className="flex items-center h-5">
                             <input type="radio" name="payment" value="kapida_nakit" checked={formData.paymentMethod === 'kapida_nakit'} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                           </div>
                           <div className="ml-4 text-sm">
                             <span className="font-bold block text-base">{isEn ? "Cash on Delivery" : "Kapıda Nakit Ödeme"}</span>
                             <span className="text-gray-500 text-xs">{isEn ? "Pay when you receive your order." : "Ürünü teslim alırken nakit olarak ödeyin."}</span>
                           </div>
                        </label>
                    )}

                    {/* Havale / EFT */}
                    {settings.paymentIbanEnabled && (
                        <div className={`border rounded-xl transition-all ${formData.paymentMethod === 'havale' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-1 ring-[var(--color-primary)]' : 'border-gray-200 hover:border-gray-300'}`}>
                            <label className="flex items-center p-4 cursor-pointer">
                                <div className="flex items-center h-5">
                                  <input type="radio" name="payment" value="havale" checked={formData.paymentMethod === 'havale'} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                                </div>
                                <div className="ml-4 text-sm">
                                  <span className="font-bold block text-base">{isEn ? "Bank Transfer (EFT)" : "Havale / EFT"}</span>
                                  <span className="text-gray-500 text-xs">{isEn ? "Direct bank transfer to our account." : "Hesabımıza doğrudan havale yapın."}</span>
                                </div>
                            </label>
                            
                            {/* IBAN Bilgisi (Sadece seçiliyse açılır) */}
                            {formData.paymentMethod === 'havale' && (
                                <div className="px-4 pb-4 ml-9 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <div className="p-4 bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-600">
                                        <p className="whitespace-pre-wrap font-mono text-xs md:text-sm">{settings.paymentIbanInfo}</p>
                                        <div className="mt-2 text-xs text-[var(--color-primary)] bg-black/5 inline-block px-2 py-1 rounded">
                                          ℹ️ {isEn ? "Please include your name in the transfer description." : "Lütfen açıklama kısmına Ad Soyad yazınız."}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Kredi Kartı */}
                    {settings.paymentPosEnabled && (
                        <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${formData.paymentMethod === 'kredi_karti' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-1 ring-[var(--color-primary)]' : 'border-gray-200 hover:border-gray-300'}`}>
                           <div className="flex items-center h-5">
                             <input type="radio" name="payment" value="kredi_karti" checked={formData.paymentMethod === 'kredi_karti'} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-5 h-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                           </div>
                           <div className="ml-4 text-sm">
                             <span className="font-bold block text-base">{isEn ? "Credit Card" : "Kredi Kartı ile Öde"}</span>
                             <span className="text-gray-500 text-xs">{isEn ? "Secure payment via Iyzico/Stripe." : "Güvenli online ödeme."}</span>
                           </div>
                        </label>
                    )}

                    {/* Hiçbiri aktif değilse uyarı */}
                    {!settings.paymentCashEnabled && !settings.paymentIbanEnabled && !settings.paymentPosEnabled && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center">
                          {isEn ? "No payment methods available right now." : "Şu an aktif bir ödeme yöntemi bulunmamaktadır. Lütfen yönetici ile iletişime geçin."}
                        </div>
                    )}

                  </div>
              ) : (
                  <div className="py-10 text-center text-gray-400 animate-pulse">Ayarlar yükleniyor...</div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting || (!settings?.paymentCashEnabled && !settings?.paymentIbanEnabled && !settings?.paymentPosEnabled)}
                className="w-full py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' }}
              >
                {isSubmitting 
                  ? (isEn ? 'Processing Order...' : 'Sipariş İşleniyor...') 
                  : (isEn ? `Complete Order (${totalAmount.toLocaleString()} TL)` : `Siparişi Tamamla (${totalAmount.toLocaleString()} TL)`)
                }
              </button>

            </form>
          </div>

          {/* --- SAĞ KOLON: SİPARİŞ ÖZETİ --- */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--color-secondary)] p-6 rounded-xl border border-[var(--color-text)]/10 sticky top-24 shadow-lg">
              <h3 className="text-xl font-bold mb-6 pb-2 border-b border-[var(--color-text)]/10 text-[var(--color-primary)]">
                {isEn ? "Order Summary" : "Sipariş Özeti"}
              </h3>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-3 items-start pb-4 border-b border-[var(--color-text)]/5 last:border-0 last:pb-0">
                    <div className="w-16 h-16 bg-white/10 rounded-lg overflow-hidden relative flex-shrink-0 border border-[var(--color-text)]/10">
                      <Image 
                        src={getImageUrl(item.product.galleryImages[0]?.imageUrl || '/placeholder.png')} 
                        alt={item.product.name_tr} 
                        fill 
                        className="object-cover"
                        unoptimized={true}
                      />
                    </div>
                    <div className="flex-1 text-sm">
                      <div className="line-clamp-2 font-medium mb-1 text-[var(--color-text)]">
                        {isEn && item.product.name_en ? item.product.name_en : item.product.name_tr}
                      </div>
                      <div className="opacity-60 text-xs flex justify-between items-center">
                        <span>{item.quantity} x {item.product.price.toLocaleString()}</span>
                        <span className="font-bold text-[var(--color-text)]">{(item.quantity * item.product.price).toLocaleString()} TL</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--color-text)]/20 pt-4 space-y-2 text-sm">
                <div className="flex justify-between opacity-80">
                  <span>{isEn ? "Subtotal" : "Ara Toplam"}</span>
                  <span>{totalAmount.toLocaleString()} TL</span>
                </div>
                <div className="flex justify-between opacity-80">
                  <span>{isEn ? "Shipping" : "Kargo"}</span>
                  <span className="text-green-400 font-medium">{isEn ? "Free" : "Ücretsiz"}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-[var(--color-primary)] pt-4 border-t border-[var(--color-text)]/20 mt-4">
                  <span>{isEn ? "Total" : "Toplam"}</span>
                  <span>{totalAmount.toLocaleString()} TL</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}