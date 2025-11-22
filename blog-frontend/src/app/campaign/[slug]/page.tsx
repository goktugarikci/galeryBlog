// src/app/campaign/[slug]/page.tsx
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Veri çekme
async function getCampaign(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/campaigns/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return res.json();
  } catch (e) { return null; }
}

export default async function CampaignPage({ params }: { params: { slug: string } }) {
  const campaign = await getCampaign(params.slug);

  if (!campaign) return notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto p-4">
        
        {/* Kampanya Başlığı ve Açıklaması */}
        <div className="mb-8 text-center bg-gray-100 p-8 rounded-lg">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-2">{campaign.title_tr}</h1>
          <p className="text-lg text-gray-600">{campaign.description_tr}</p>
        </div>

        {/* Ürün Listesi */}
        {campaign.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {campaign.products.map((product: any) => (
              // Mevcut ProductCard bileşenini kullanın
              <div key={product.id} className="border p-4 rounded">
                 <img src={product.galleryImages[0]?.imageUrl} className="w-full h-48 object-cover mb-4" />
                 <h3 className="font-bold">{product.name_tr}</h3>
                 <p className="text-teal-600 font-bold">{product.price} TL</p>
                 {/* Detay butonu vb... */}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Bu kampanyada henüz ürün bulunmuyor.</p>
        )}

      </main>
      <Footer />
    </div>
  );
}