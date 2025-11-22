// src/components/admin/PageForm.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import PageSliderModal, { SliderImage } from "./PageSliderModal"; // Modal bileşenini import ediyoruz

// Sayfa formu state tipi
type PageFormState = {
  title_tr: string;
  title_en: string;
  slug: string;
  layoutJson_tr: string;
  layoutJson_en: string;
  
  // Slider Ayarları
  sliderEnabled: boolean;
  sliderPosition: "top" | "bottom";
  sliderHeightPx_mobile: number | null;
  sliderHeightPx_desktop: number | null;
  sliderObjectFit: "cover" | "contain";
};

// Form props (Düzenleme için veri gelirse)
type PageFormProps = {
  initialData?: PageFormState & { id: string; sliderImages: SliderImage[] };
};

// Stil sabitleri (Tailwind)
const inputClass = "block w-full px-3 py-2 mt-1 text-gray-800 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500";
const labelClass = "block text-sm font-medium text-gray-700";
const buttonClass = "px-6 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500";

export default function PageForm({ initialData }: PageFormProps) {
  const router = useRouter();
  
  // 1. Form Verileri State'i
  const [formData, setFormData] = useState<PageFormState>(
    initialData
      ? { 
          title_tr: initialData.title_tr,
          title_en: initialData.title_en || "",
          slug: initialData.slug,
          layoutJson_tr: initialData.layoutJson_tr || "",
          layoutJson_en: initialData.layoutJson_en || "",
          sliderEnabled: initialData.sliderEnabled,
          sliderPosition: initialData.sliderPosition,
          sliderHeightPx_mobile: initialData.sliderHeightPx_mobile || 200,
          sliderHeightPx_desktop: initialData.sliderHeightPx_desktop || 400,
          sliderObjectFit: initialData.sliderObjectFit || "cover",
        }
      : {
          title_tr: "",
          title_en: "",
          slug: "",
          layoutJson_tr: "",
          layoutJson_en: "",
          sliderEnabled: false, // Varsayılan kapalı
          sliderPosition: "top",
          sliderHeightPx_mobile: 200,
          sliderHeightPx_desktop: 400,
          sliderObjectFit: "cover",
        }
  );
  
  // 2. Slider Görselleri State'i
  const [sliderImages, setSliderImages] = useState<SliderImage[]>(initialData?.sliderImages || []);
  
  // 3. Modal Görünürlük State'i
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  // Input Değişikliklerini İşle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    const val = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : (type === 'number' ? parseInt(value) || 0 : value);

    setFormData(prev => ({
      ...prev,
      [name]: val,
    }));
  };

  // Modal'dan gelen güncel resimleri kaydet
  const handleSliderSave = (updatedImages: SliderImage[]) => {
    setSliderImages(updatedImages);
    setIsSliderModalOpen(false); // Modalı kapat
  };

  // Formu Gönder (Kaydet)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Kaydediliyor...");
    setIsLoading(true);
    
    try {
      // API'ye gidecek veri paketi
      const pageData = {
        ...formData,
        // Slider görsellerini ekle
        sliderImages: sliderImages,
        // Sayısal değerleri kontrol et (0 ise null yapma, 0 kalsın veya ihtiyaca göre)
        sliderHeightPx_mobile: formData.sliderHeightPx_mobile || 200,
        sliderHeightPx_desktop: formData.sliderHeightPx_desktop || 400,
      };

      if (initialData?.id) {
        // Düzenleme (PUT)
        await api.put(`/pages/${initialData.id}`, pageData);
        setMessage("Sayfa başarıyla güncellendi.");
      } else {
        // Yeni Ekleme (POST)
        await api.post("/pages", pageData);
        setMessage("Sayfa başarıyla oluşturuldu.");
      }
      
      router.push("/admin/content/pages"); // Listeye dön
      router.refresh(); // Verileri tazelemek için

    } catch (err: any) {
      console.error(err);
      setMessage(`Hata: ${err.response?.data?.error || "İşlem başarısız."}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md space-y-8">
      
      {/* --- BÖLÜM 1: Temel Bilgiler --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title_tr" className={labelClass}>Sayfa Başlığı (TR) *</label>
          <input id="title_tr" name="title_tr" type="text" value={formData.title_tr} onChange={handleChange} className={inputClass} required />
        </div>
        <div>
          <label htmlFor="title_en" className={labelClass}>Sayfa Başlığı (EN)</label>
          <input id="title_en" name="title_en" type="text" value={formData.title_en} onChange={handleChange} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor="slug" className={labelClass}>URL (Slug) *</label>
        <div className="flex items-center">
          <span className="bg-gray-100 border border-r-0 border-gray-300 px-3 py-2 rounded-l-md text-gray-500">/</span>
          <input id="slug" name="slug" type="text" value={formData.slug} onChange={handleChange} className={`${inputClass} mt-0 rounded-l-none`} placeholder="hakkimizda" required />
        </div>
      </div>

      {/* --- BÖLÜM 2: Slider ve Düzen Ayarları --- */}
      <fieldset className="border border-gray-200 p-5 rounded-lg bg-gray-50">
        <legend className="text-lg font-semibold text-teal-800 px-2">Slider Ayarları</legend>
        
        {/* Aktif/Pasif ve Konum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div className="flex items-center h-full pt-6">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="sliderEnabled" 
                checked={formData.sliderEnabled} 
                onChange={handleChange} 
                className="w-5 h-5 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
              />
              <span className="ml-3 text-gray-900 font-medium">Bu Sayfada Slider Göster</span>
            </label>
          </div>
          <div>
            <label htmlFor="sliderPosition" className={labelClass}>Slider Konumu</label>
            <select id="sliderPosition" name="sliderPosition" value={formData.sliderPosition} onChange={handleChange} className={inputClass} disabled={!formData.sliderEnabled}>
              <option value="top">İçeriğin Üstünde (Header Altı)</option>
              <option value="bottom">İçeriğin Altında (Footer Üstü)</option>
            </select>
          </div>
        </div>

        {/* Detaylı Slider Ayarları (Sadece aktifse görünür) */}
        {formData.sliderEnabled && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            
            {/* Boyut Ayarları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className={labelClass}>Mobil Yükseklik (px)</label>
                <input name="sliderHeightPx_mobile" type="number" value={formData.sliderHeightPx_mobile || ''} onChange={handleChange} className={inputClass} placeholder="200" />
              </div>
              <div>
                <label className={labelClass}>Masaüstü Yükseklik (px)</label>
                <input name="sliderHeightPx_desktop" type="number" value={formData.sliderHeightPx_desktop || ''} onChange={handleChange} className={inputClass} placeholder="400" />
              </div>
              <div>
                <label className={labelClass}>Görsel Sığdırma</label>
                <select name="sliderObjectFit" value={formData.sliderObjectFit} onChange={handleChange} className={inputClass}>
                  <option value="cover">Cover (Alanı Doldur - Kırpılabilir)</option>
                  <option value="contain">Contain (Tamamını Göster - Boşluk Kalabilir)</option>
                </select>
              </div>
            </div>

            {/* Görsel Yönetim Alanı */}
            <div className="bg-white p-4 rounded border border-gray-200">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-md font-bold text-gray-800">Slider Görselleri</h4>
                    <p className="text-sm text-gray-500">Şu an {sliderImages.length} adet görsel ekli.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSliderModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    Görselleri Yönet & Düzenle
                  </button>
               </div>

               {/* Küçük Önizleme Şeridi */}
               {sliderImages.length > 0 && (
                 <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                   {sliderImages.map((img, idx) => (
                     <div key={idx} className="relative flex-shrink-0 group">
                        <img src={img.imageUrl} className="w-20 h-14 object-cover rounded border border-gray-300" alt={`Slide ${idx}`} />
                        <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white text-[10px] px-1 rounded-tl">
                          #{idx + 1}
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>

          </div>
        )}
      </fieldset>
      
      {/* --- BÖLÜM 3: İçerik Alanı --- */}
      <fieldset className="border border-gray-200 p-5 rounded-lg">
        <legend className="text-lg font-semibold text-gray-700 px-2">Sayfa İçeriği</legend>
        <p className="text-sm text-gray-500 mb-4 px-1">Buraya sayfanızın ana metnini girebilirsiniz. (HTML etiketleri kullanılabilir)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="layoutJson_tr" className={labelClass}>İçerik (Türkçe)</label>
            <textarea 
              id="layoutJson_tr" 
              name="layoutJson_tr" 
              value={formData.layoutJson_tr} 
              onChange={handleChange} 
              rows={12} 
              className={`${inputClass} font-mono text-sm`}
              placeholder="<p>Sayfa içeriğiniz...</p>"
            ></textarea>
          </div>
          <div>
            <label htmlFor="layoutJson_en" className={labelClass}>İçerik (İngilizce)</label>
            <textarea 
              id="layoutJson_en" 
              name="layoutJson_en" 
              value={formData.layoutJson_en} 
              onChange={handleChange} 
              rows={12} 
              className={`${inputClass} font-mono text-sm`}
              placeholder="<p>Page content...</p>"
            ></textarea>
          </div>
        </div>
      </fieldset>
      
      {/* --- Kaydet Butonu --- */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        {message && (
          <span className={`text-sm font-medium ${message.includes("Hata") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </span>
        )}
        <button 
          type="submit" 
          className={`${buttonClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? "İşleniyor..." : (initialData?.id ? "Güncelle" : "Kaydet")}
        </button>
      </div>

      {/* --- SLIDER MODALI --- */}
      {isSliderModalOpen && (
         <PageSliderModal
           initialImages={sliderImages}
           onClose={() => setIsSliderModalOpen(false)}
           onSave={handleSliderSave}
         />
       )}

    </form>
  );
}