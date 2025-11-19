// src/app/admin/content/pages/page.tsx
import Link from "next/link";

type Page = {
  id: string;
  title_tr: string;
  slug: string;
  createdAt: string;
};

// Sunucuda sayfaları çek
async function getPages(): Promise<Page[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages`, {
      cache: "no-store",
      // (Not: Bu rotanın admin yetkisi gerektirdiğini varsayıyoruz,
      //  gerçekte fetch için admin token'ı gerekecek, 
      //  bunu yönetmek için bir admin-api servisi oluşturmalısınız)
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Sayfalar yüklenemedi:", error);
    return [];
  }
}

export default async function PagesListPage() {
  const pages = await getPages();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Özel Sayfalar</h1>
        <Link 
          href="/admin/content/pages/new"
          className="px-4 py-2 font-semibold text-white bg-teal-800 rounded-md hover:bg-teal-700"
        >
          + Yeni Sayfa Ekle
        </Link>
      </div>

      {/* Sayfa Listesi Tablosu */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sayfa Adı (TR)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL (Slug)</th>
              <th className="relative px-6 py-3"><span className="sr-only">Düzenle</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{page.title_tr}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">/{page.slug}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a href="#" className="text-teal-600 hover:text-teal-900">Düzenle</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}