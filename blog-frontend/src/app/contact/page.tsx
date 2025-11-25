// src/app/contact/page.tsx
import { cookies } from 'next/headers';
import ContactForm from '@/components/common/ContactForm';
import api from '@/lib/api'; // API çağrısı için gerekebilir ama server component'te fetch kullanmak daha iyidir

// İletişim ayarlarını çek (WhatsApp no vb. için)
async function getContactSettings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
      cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export const metadata = {
  title: 'İletişim - Bize Ulaşın',
  description: 'Bizimle iletişime geçin.',
};

export default async function ContactPage() {
  const settings = await getContactSettings();
  const cookieStore = await cookies();
  const lang = cookieStore.get('currentLang')?.value || 'tr';
  const isEn = lang === 'en';

  // Kartların stili (Navbar rengini kullanır)
  const infoCardStyle = {
    backgroundColor: 'var(--color-secondary)',
    color: 'var(--color-text)',
    borderColor: 'var(--color-primary)'
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)] pb-20">
      
      {/* Header Banner */}
      <div className="py-16 text-center border-b-4 border-[var(--color-primary)]" style={{ backgroundColor: 'var(--color-secondary)' }}>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-primary)]">
          {isEn ? "Contact Us" : "İletişim"}
        </h1>
        <p className="opacity-80 text-lg max-w-2xl mx-auto px-4" style={{ color: 'var(--color-text)' }}>
          {isEn 
            ? "Have questions? We'd love to hear from you." 
            : "Sorularınız mı var? Bizimle iletişime geçmekten çekinmeyin."}
        </p>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* SOL TARA: İletişim Bilgileri & Harita */}
          <div className="space-y-8">
            
            {/* Bilgi Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               
               {/* Telefon Kartı */}
               <div className="p-6 rounded-xl shadow-lg border flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300" style={infoCardStyle}>
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-2xl">
                   📞
                 </div>
                 <h3 className="font-bold text-lg mb-2">{isEn ? "Phone & WhatsApp" : "Telefon & WhatsApp"}</h3>
                 <p className="opacity-80">{settings?.whatsAppNumber || "+90 555 000 00 00"}</p>
               </div>

               {/* E-posta Kartı */}
               <div className="p-6 rounded-xl shadow-lg border flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300" style={infoCardStyle}>
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-2xl">
                   ✉️
                 </div>
                 <h3 className="font-bold text-lg mb-2">{isEn ? "Email" : "E-posta"}</h3>
                 <p className="opacity-80">info@galeryblog.com</p>
               </div>

               {/* Adres Kartı */}
               <div className="p-6 rounded-xl shadow-lg border flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 col-span-1 sm:col-span-2" style={infoCardStyle}>
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4 text-2xl">
                   📍
                 </div>
                 <h3 className="font-bold text-lg mb-2">{isEn ? "Address" : "Adres"}</h3>
                 <p className="opacity-80">
                   Örnek Mahallesi, Teknoloji Caddesi, No: 123<br/>
                   İstanbul / Türkiye
                 </p>
               </div>
            </div>

            {/* Google Harita (Embed) */}
            <div className="w-full h-72 bg-gray-200 rounded-xl overflow-hidden shadow-lg border border-[var(--color-primary)]">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.650490019739!2d29.02133937654958!3d40.99034997135258!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab86193f10675%3A0x7461173735250644!2zS2FkxLFrw7B5LCDEsHN0YW5idWw!5e0!3m2!1str!2str!4v1708524000000!5m2!1str!2str" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

          </div>

          {/* SAĞ TARAF: İletişim Formu */}
          <div>
            {/* Formun arka planı kendi içinde beyaz, onu ContactForm.tsx'de ayarladık */}
            <ContactForm lang={lang} />
          </div>

        </div>
      </div>
    </div>
  );
}