"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link"; // Link bileşenini ekledik
import CampaignForm from "@/components/admin/CampaignForm";

type Campaign = {
  id: string;
  title_tr: string;
  slug: string;
  isActive: boolean;
  _count?: {
    products: number;
  };
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

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

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCampaign(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    fetchCampaigns();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[80vh]">
      
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

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık (TR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL Slug (Görüntüle)</th>
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
                  
                  {/* --- URL SLUG (LİNK HALİNE GETİRİLDİ) --- */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link 
                      href={`/campaign/${campaign.slug}`} 
                      target="_blank" 
                      className="text-teal-600 hover:underline flex items-center gap-1 font-medium"
                      title="Sayfayı yeni sekmede aç"
                    >
                      /{campaign.slug}
                      {/* Dış bağlantı ikonu */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </td>
                  {/* --------------------------------------- */}

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

      {isModalOpen && (
        <CampaignForm 
          onClose={handleCloseModal} 
          onSuccess={handleSuccess}
          initialData={selectedCampaign} 
        />
      )}
    </div>
  );
}