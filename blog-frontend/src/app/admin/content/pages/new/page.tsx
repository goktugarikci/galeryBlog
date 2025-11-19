// src/app/admin/content/pages/new/page.tsx
import PageForm from "@/components/admin/PageForm"; // Bir sonraki adımda oluşturacağız

export default function NewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Yeni Özel Sayfa Oluştur</h1>
      {/* Formu ayrı bir client component'te tutmak en iyisidir */}
      <PageForm />
    </div>
  );
}