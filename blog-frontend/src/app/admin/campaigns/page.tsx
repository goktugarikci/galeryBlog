// src/app/admin/campaigns/page.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import CampaignForm from "@/components/admin/CampaignForm"; // Form bileşeni (Aşağıda oluşturacağız)

// Kampanya Tipi
type Campaign = {
  id: string;
  title_tr: string;
  slug: string;
  isActive: boolean;
  _count?: {
    products: number; // İlişkili ürün sayısı
  };
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null); // Düzenleme için

  // Verileri Çek
  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/campaigns");
      setCampaigns(res.data);
    } catch (error) {
      console.error("Kampanyalar yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Silme İşlemi
  const handleDelete = async (id: string) => {
    if (!confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;
    try {
      await api.delete(`/campaigns/${id}`);
      setCampaigns(campaigns.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
      alert("Silinemedi.");
    }
  };

  // Düzenleme Modunu Başlat
  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  // Modal Kapandığında
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  // Başarılı Kayıt Sonrası
  const handleSuccess = () => {
    handleCloseModal();
    fetchCampaigns(); // Listeyi yenile
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[80vh]">
      
      {/* Başlık ve Ekle Butonu */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kampanyalar</h1>
          <p className="text-sm text-gray-500">Özel fırsat sayfaları oluşturun ve yönetin.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-teal-700 text-white font-semibold rounded-md hover:bg-teal-800 transition-colors shadow-sm flex items-center gap-2"
        >
          <span>+</span> Yeni Kampanya
        </button>
      </div>

      {/* Liste Tablosu */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık (TR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Sayısı</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Henüz kampanya oluşturulmamış.</td></tr>
            ) : (
              campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{campaign.title_tr}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{campaign.slug}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                      {campaign._count?.products || 0} Ürün
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {campaign.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Pasif</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(campaign)}
                      className="text-teal-600 hover:text-teal-900 mr-4"
                    >
                      Düzenle
                    </button>
                    <button 
                      onClick={() => handleDelete(campaign.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Bileşeni */}
      {isModalOpen && (
        <CampaignForm 
          onClose={handleCloseModal} 
          onSuccess={handleSuccess}
          initialData={selectedCampaign} // Düzenleme ise veriyi gönder
        />
      )}
    </div>
  );
}