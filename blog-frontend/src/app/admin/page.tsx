// src/app/admin/page.tsx

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Admin paneline hoş geldiniz.</p>
      
      <div className="mt-8 p-4 bg-white shadow rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800">Hızlı İstatistikler</h2>
        <p className="text-gray-600 mt-2">
          Buraya toplam sipariş sayısı, bekleyen siparişler, 
          yeni kullanıcılar gibi özet bilgiler gelecek.
        </p>
        {/* Burada backend'in /api/admin/orders veya /api/admin/users 
          rotalarından veri çekerek bir özet gösterebilirsiniz.
        */}
      </div>
    </div>
  );
}   