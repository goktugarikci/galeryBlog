"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import PageSliderModal, { SliderImage } from "./PageSliderModal";
import RichTextEditor from "./RichTextEditor"; // Editör bileşeni

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

// Form props
type PageFormProps = {
  initialData?: PageFormState & { id: string; sliderImages: SliderImage[] };
};

// Stil sabitleri
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
          sliderEnabled: false,
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

  // YENİ: Editörden gelen veriyi state'e yazmak için handler
  const handleEditorChange = (lang: 'tr' | 'en', value: string) => {
    setFormData(prev => ({
      ...prev,
      [lang === 'tr' ? 'layoutJson_tr' : 'layoutJson_en']: value
    }));
  };

  // Modal'dan gelen güncel resimleri kaydet
  const handleSliderSave = (updatedImages: SliderImage[]) => {
    setSliderImages(updatedImages);
    setIsSliderModalOpen(false);
  };

  // Formu Gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Kaydediliyor...");
    setIsLoading(true);
    
    try {
      const pageData = {
        ...formData,
        sliderImages: sliderImages,
        sliderHeightPx_mobile: formData.sliderHeightPx_mobile || 200,
        sliderHeightPx_desktop: formData.sliderHeightPx_desktop || 400,
      };

      if (initialData?.id) {
        await api.put(`/pages/${initialData.id}`, pageData);
        setMessage("Sayfa başarıyla güncellendi.");
      } else {
        await api.post("/pages", pageData);
        setMessage("Sayfa başarıyla oluşturuldu.");
      }
      
      router.push("/admin/content/pages");
      router.refresh();

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

        {formData.sliderEnabled && (
          <div className="mt-6 border-t border-gray-200 pt-6">
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
                  <option value="cover">Cover (Alanı Doldur)</option>
                  <option value="contain">Contain (Tamamını Göster)</option>
                </select>
              </div>
            </div>

            <div className="bg-white p-4 rounded border border-gray-200">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-md font-bold text-gray-800">Slider Görselleri</h4>
                    <p className="text-sm text-gray-500">{sliderImages.length} adet görsel ekli.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSliderModalOpen(true)}
                    className="px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    Görselleri Yönet & Düzenle
                  </button>
               </div>
               {sliderImages.length > 0 && (
                 <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                   {sliderImages.map((img, idx) => (
                     <img key={idx} src={img.imageUrl} className="w-20 h-14 object-cover rounded border border-gray-300" alt={`Slide ${idx}`} />
                   ))}
                 </div>
               )}
            </div>
          </div>
        )}
      </fieldset>
      
      {/* --- BÖLÜM 3: İçerik Alanı (ZENGİN METİN EDİTÖRÜ) --- */}
      <fieldset className="border border-gray-200 p-5 rounded-lg bg-white shadow-sm">
        <legend className="text-lg font-semibold text-gray-800 px-2">Sayfa İçeriği</legend>
        <p className="text-sm text-gray-500 mb-6 px-2">
          Sayfanızın içeriğini aşağıdan düzenleyebilirsiniz. HTML ve Görsel mod arasında geçiş yapabilirsiniz.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Türkçe Editör */}
          <div>
            <RichTextEditor 
              label="İçerik (Türkçe)"
              value={formData.layoutJson_tr}
              onChange={(val) => handleEditorChange('tr', val)}
            />
          </div>

          {/* İngilizce Editör */}
          <div>
            <RichTextEditor 
              label="İçerik (İngilizce)"
              value={formData.layoutJson_en}
              onChange={(val) => handleEditorChange('en', val)}
            />
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