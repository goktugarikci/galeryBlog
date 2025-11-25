"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

// --- TİP TANIMLARI ---
type Slider = {
  id: string;
  imageUrl: string;
  caption_tr: string | null;
  caption_en: string | null;
  linkUrl: string | null;
  order: number;
};

// Dropdown için özet veri tipleri
type ProductSummary = { id: string; name_tr: string; };
type CampaignSummary = { id: string; title_tr: string; slug: string; };

// Tailwind Stilleri
const inputClass = "block w-full px-3 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500";
const labelClass = "block text-xs font-medium text-gray-500 mb-1";
const buttonClass = "px-4 py-2 text-sm font-semibold text-white bg-teal-700 rounded-md hover:bg-teal-800 transition-colors shadow-sm disabled:opacity-50";

export default function SliderManager({ initialSliders }: { initialSliders: Slider[] }) {
  const [sliders, setSliders] = useState<Slider[]>(initialSliders);
  
  // --- State'ler ---
  const [isSliderEnabled, setIsSliderEnabled] = useState(false);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);
  
  // Link Seçimi İçin Veriler
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  
  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    id: "", 
    caption_tr: "",
    caption_en: "",
    linkUrl: "", 
    order: 0,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // --- VERİ ÇEKME İŞLEMLERİ (Ayarlar, Ürünler, Kampanyalar) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Site Ayarlarını Çek (Slider Durumu)
        const settingsRes = await api.get("/settings");
        setIsSliderEnabled(settingsRes.data.showHomeSlider ?? false);
        setIsSettingsLoading(false);

        // 2. Ürünleri Çek (Listeleme için)
        const productsRes = await api.get("/products");
        setProducts(productsRes.data);

        // 3. Kampanyaları Çek
        const campaignsRes = await api.get("/campaigns"); 
        setCampaigns(campaignsRes.data);

      } catch (error) {
        console.error("Veri yükleme hatası:", error);
      }
    };
    loadData();
  }, []);

  // --- FONKSİYONLAR ---

  // 1. Slider Aktif/Pasif Değiştir
  const toggleSliderStatus = async () => {
    const newState = !isSliderEnabled;
    setIsSliderEnabled(newState);
    try {
      const currentSettingsRes = await api.get("/settings");
      await api.put("/settings", { 
        ...currentSettingsRes.data, 
        showHomeSlider: newState 
      });
      setMessage(newState ? "Slider aktif edildi." : "Slider deaktif edildi.");
    } catch (error) {
      console.error(error);
      setIsSliderEnabled(!newState);
      setMessage("Durum değiştirilemedi.");
    }
  };

  // 2. Form Input Değişimi
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 3. Düzenleme Modu Başlat
  const startEdit = (slider: Slider) => {
    setFormData({
      id: slider.id,
      caption_tr: slider.caption_tr || "",
      caption_en: slider.caption_en || "",
      linkUrl: slider.linkUrl || "",
      order: slider.order,
    });
    setFile(null); 
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMessage("Düzenleme modu aktif.");
  };

  // 4. İptal Et
  const cancelEdit = () => {
    setFormData({ id: "", caption_tr: "", caption_en: "", linkUrl: "", order: 0 });
    setFile(null);
    setMessage("");
  };

  // 5. Kaydetme İşlemi (Ekle veya Güncelle)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("İşleniyor...");

    try {
      let imageUrl = "";
      // Yeni resim seçildiyse yükle
      if (file) {
        const uploadFormData = new FormData();
        uploadFormData.append("image", file);
        const uploadRes = await api.post("/upload/single", uploadFormData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = uploadRes.data.imageUrl;
      }

      if (formData.id) {
        // Güncelleme (PUT)
        const updateData: any = { ...formData };
        if (imageUrl) updateData.imageUrl = imageUrl;
        
        const res = await api.put(`/slider/${formData.id}`, updateData);
        setSliders(sliders.map(s => s.id === formData.id ? res.data : s));
        setMessage("Slider güncellendi.");
      } else {
        // Ekleme (POST)
        if (!imageUrl) {
          setMessage("Lütfen resim seçin.");
          setIsLoading(false);
          return;
        }
        const res = await api.post("/slider", { ...formData, imageUrl });
        setSliders([...sliders, res.data]);
        setMessage("Yeni slider eklendi.");
      }
      cancelEdit();
    } catch (error) {
      console.error(error);
      setMessage("Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Silme İşlemi
  const handleDelete = async (id: string) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/slider/${id}`);
      setSliders(sliders.filter(s => s.id !== id));
      setMessage("Görsel silindi.");
    } catch (error) {
      console.error(error);
      setMessage("Silinemedi.");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* --- BÖLÜM 1: GENEL DURUM --- */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Genel Durum</h2>
          <p className="text-sm text-gray-500">Anasayfadaki slider alanını buradan açıp kapatabilirsiniz.</p>
        </div>
        {isSettingsLoading ? (
          <span className="text-sm text-gray-400">Yükleniyor...</span>
        ) : (
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={isSliderEnabled} onChange={toggleSliderStatus} />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">{isSliderEnabled ? "AKTİF" : "PASİF"}</span>
          </label>
        )}
      </div>

      {/* --- BÖLÜM 2: EKLEME/DÜZENLEME FORMU --- */}
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h3 className="text-xl font-bold text-teal-800">{formData.id ? "Slider Düzenle" : "Yeni Slider Ekle"}</h3>
          {formData.id && <button type="button" onClick={cancelEdit} className="text-sm text-red-600 hover:underline font-medium">Vazgeç</button>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Resim Seçimi */}
          <div className="md:col-span-4">
            <label className={labelClass}>Görsel Seç {formData.id && "(Değiştirmek isterseniz)"}</label>
            <input type="file" onChange={(e) => e.target.files && setFile(e.target.files[0])} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"/>
          </div>

          {/* Bilgiler */}
          <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
               <label className={labelClass}>Sıralama</label>
               <input type="number" name="order" value={formData.order} onChange={handleInputChange} className={inputClass} placeholder="0" />
            </div>
            <div>
               <label className={labelClass}>Başlık (TR)</label>
               <input type="text" name="caption_tr" value={formData.caption_tr} onChange={handleInputChange} className={inputClass} />
            </div>
            <div>
               <label className={labelClass}>Başlık (EN)</label>
               <input type="text" name="caption_en" value={formData.caption_en} onChange={handleInputChange} className={inputClass} />
            </div>
            
            {/* --- YÖNLENDİRME LİNKİ (Dropdown) --- */}
            <div className="md:col-span-2">
               <label className={labelClass}>Yönlendirme Linki (Hedef Sayfa)</label>
               <select 
                 name="linkUrl" 
                 value={formData.linkUrl || ""} 
                 onChange={handleInputChange} 
                 className={inputClass}
               >
                 <option value="">-- Link Yok --</option>
                 
                 {/* Kampanyalar Grubu */}
                 {campaigns.length > 0 && (
                   <optgroup label="Kampanyalar">
                     {campaigns.map(campaign => (
                       <option key={campaign.id} value={`/campaign/${campaign.slug}`}>
                         Kampanya: {campaign.title_tr}
                       </option>
                     ))}
                   </optgroup>
                 )}

                 {/* Ürünler Grubu */}
                 {products.length > 0 && (
                   <optgroup label="Ürünler">
                     {products.map(product => (
                       <option key={product.id} value={`/products/${product.id}`}>
                         Ürün: {product.name_tr}
                       </option>
                     ))}
                   </optgroup>
                 )}
                 
               </select>
               <p className="text-[10px] text-gray-400 mt-1">Sadece Kampanyalar ve Ürünler listelenir.</p>
            </div>

          </div>
        </div>

        <div className="mt-6 flex justify-between items-center pt-4 border-t">
           <p className="text-sm font-medium text-teal-600">{message}</p>
           <button type="submit" className={buttonClass} disabled={isLoading}>
             {isLoading ? "İşleniyor..." : (formData.id ? "Güncelle" : "Ekle")}
           </button>
        </div>
      </form>

      {/* --- BÖLÜM 3: MEVCUT LİSTE --- */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b"><h3 className="text-sm font-bold text-gray-700 uppercase">Mevcut Slider Görselleri</h3></div>
        <div className="divide-y divide-gray-100">
            {sliders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Henüz eklenmiş bir görsel yok.</div>
            ) : (
              sliders.map((slider) => (
                <div key={slider.id} className="p-4 flex flex-col sm:flex-row items-center gap-4 hover:bg-gray-50 transition">
                  <img src={slider.imageUrl} alt="Slide" className="w-24 h-16 object-cover rounded border" />
                  <div className="flex-1 text-center sm:text-left w-full">
                    <p className="font-bold text-gray-800 text-sm">{slider.caption_tr || "(Başlık Yok)"}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{slider.linkUrl || "Link yok"}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-center">
                    <button onClick={() => startEdit(slider)} className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100">Düzenle</button>
                    <button onClick={() => handleDelete(slider.id)} className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded border border-red-200 hover:bg-red-100">Sil</button>
                  </div>
                </div>
              ))
            )}
        </div>
      </div>
    </div>
  );
}