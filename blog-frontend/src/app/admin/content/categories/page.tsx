import CategoryManager from "@/components/admin/CategoryManager"; // DOĞRUSU BU OLMALI
import api from "@/lib/api";

// Fonksiyon adını daha açıklayıcı yapabilirsiniz (opsiyonel)
async function getSiteCategories() {
  try {
    // API yolunuzu kontrol edin, /products/categories olabilir
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/categories`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Kategoriler yüklenemedi", error);
    return [];
  }
}

export default async function CategoryPage() {
  const categories = await getSiteCategories();

  return (
    <div>
      <h1 className="lg:text-2xl">Kategori ve Alt Kategori Yönetimi</h1>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}