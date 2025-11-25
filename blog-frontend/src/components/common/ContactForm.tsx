"use client";

import { useState } from "react";
import api from "@/lib/api";

export default function ContactForm({ lang }: { lang: string }) {
  const isEn = lang === 'en';
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await api.post('/contact', formData);
      setStatus('success');
      setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.response?.data?.error || "Bir hata oluştu.");
    }
  };

  // Inputlar için stil:
  // Arka planı hafif şeffaf beyaz/siyah yaparak her temada okunur olmasını sağlıyoruz.
  // Metin rengini ise 'text-gray-800' gibi sabit vermek yerine temaya uyumlu yapıyoruz.
  const inputClass = "w-full p-3 border rounded-lg outline-none transition-colors focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent bg-white text-black";

  return (
    <div 
      className="p-8 rounded-xl shadow-lg border"
      // 1. DÜZELTME: Arka plan ve yazı rengini veritabanı değişkenlerine bağladık
      style={{ 
        backgroundColor: 'var(--color-secondary)', 
        color: 'var(--color-text)',
        borderColor: 'var(--color-primary)' // Çerçeveye de ana rengi verdik
      }}
    >
      <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
        {isEn ? "Send us a Message" : "Bize Mesaj Gönderin"}
      </h2>

      {status === 'success' ? (
        <div className="bg-green-100 text-green-800 p-6 rounded-lg text-center border border-green-200">
          <p className="font-bold text-lg mb-2">✓ {isEn ? "Message Sent!" : "Mesajınız Gönderildi!"}</p>
          <p>{isEn ? "We will get back to you soon." : "En kısa sürede size dönüş yapacağız."}</p>
          <button 
            onClick={() => setStatus('idle')}
            className="mt-4 font-bold underline"
            style={{ color: 'var(--color-text)' }}
          >
            {isEn ? "Send another message" : "Yeni mesaj gönder"}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* Label renkleri artık kapsayıcıdan (var(--color-text)) miras alacak */}
              <label className="block text-sm font-medium mb-1 opacity-90">{isEn ? "First Name" : "Adınız"} *</label>
              <input required name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-90">{isEn ? "Last Name" : "Soyadınız"} *</label>
              <input required name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-90">{isEn ? "Email" : "E-posta"} *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 opacity-90">{isEn ? "Phone" : "Telefon"}</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-90">{isEn ? "Subject" : "Konu"} *</label>
            <input required name="subject" value={formData.subject} onChange={handleChange} className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-90">{isEn ? "Message" : "Mesajınız"} *</label>
            <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} className={inputClass}></textarea>
          </div>

          {status === 'error' && (
            <div className="p-3 bg-red-100 text-red-700 rounded border border-red-200 text-sm">
              {errorMessage}
            </div>
          )}

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full font-bold py-4 rounded-lg hover:brightness-110 transition-all disabled:opacity-50 shadow-md mt-4"
            style={{
                backgroundColor: 'var(--color-primary)',
                // Buton üzerindeki yazı rengini, okunabilirlik için 'secondary' renk yapıyoruz 
                // (Genelde sarı buton üzerine siyah yazı gibi)
                color: 'var(--color-secondary)' 
            }}
          >
            {status === 'loading' ? (isEn ? "Sending..." : "Gönderiliyor...") : (isEn ? "Send Message" : "Mesajı Gönder")}
          </button>

        </form>
      )}
    </div>
  );
}