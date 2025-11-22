"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import socket from "@/lib/socket";
import api from "@/lib/api"; // API istekleri için

// Kategori Tipleri
type SubCategory = { id: string; name_tr: string; };
type Category = { id: string; name_tr: string; subCategories: SubCategory[] };

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // --- STATE'LER ---
  // Menü Sabit mi? (Kilitli mi)
  const [isPinned, setIsPinned] = useState(true); 
  // Fare üzerinde mi?
  const [isHovered, setIsHovered] = useState(false);
  // Kategoriler
  const [categories, setCategories] = useState<Category[]>([]);
  // Açık olan dropdown menüler (Kategori ID'leri tutulur)
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  // Menü o an görünür mü? (Sabitse VEYA fare üzerindeyse)
  const isSidebarVisible = isPinned || isHovered;

  // --- KATEGORİLERİ ÇEK ---
  useEffect(() => {
    if (user && user.role === 'admin') {
      api.get('/products/categories')
        .then(res => setCategories(res.data))
        .catch(err => console.error("Kategoriler menüye yüklenemedi", err));
    }
  }, [user]);

  // --- SOCKET & AUTH KONTROLLERİ (Aynı Kalıyor) ---
  useEffect(() => {
    if (user && user.role === "admin") {
      if (!socket.connected) socket.connect();
      socket.emit("admin_connected");
      socket.on("admin_new_chat_message", () => alert("Yeni Canlı Destek Mesajı!"));
      socket.on("admin_new_contact_message", () => alert("Yeni İletişim Formu Mesajı!"));
    }
    return () => {
      socket.off("admin_new_chat_message");
      socket.off("admin_new_contact_message");
    };
  }, [user]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return <div className="bg-gray-900 text-white h-screen grid place-items-center">Yükleniyor...</div>;
  }

  // --- FONKSİYONLAR ---
  
  // Dropdown Aç/Kapa
  const toggleDropdown = (categoryId: string) => {
    if (openDropdowns.includes(categoryId)) {
      setOpenDropdowns(openDropdowns.filter(id => id !== categoryId));
    } else {
      setOpenDropdowns([...openDropdowns, categoryId]);
    }
  };

  // Menü Sabitle/Çöz
  const togglePin = () => {
    setIsPinned(!isPinned);
    // Eğer pin kaldırılırsa hover'ı da kapat ki menü hemen küçülsün
    if (isPinned) setIsHovered(false);
  };

  // --- STİLLER (Veritabanı Renkleri) ---
  const sidebarStyle: React.CSSProperties = {
    width: isSidebarVisible ? "260px" : "20px", // Kapalıyken ince bir şerit (hover alanı)
    backgroundColor: "var(--color-secondary)", // DB'den gelen renk
    color: "var(--color-text)",               // DB'den gelen renk
    borderRight: "1px solid var(--color-primary)",
    transition: "width 0.3s ease",
    overflowX: "hidden",
    overflowY: "auto",
    whiteSpace: "nowrap",
    zIndex: 50,
    position: "relative" // Sayfa akışında kalsın ama z-index çalışsın
  };

  const linkHoverClass = "block p-2 rounded-md transition-colors hover:bg-white/10 hover:text-[var(--color-primary)] flex items-center gap-2";

  return (
    <div className="flex min-h-screen">
      
      {/* SOL SIDEBAR */}
      <nav 
        style={sidebarStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex-shrink-0 h-screen sticky top-0 scrollbar-thin scrollbar-thumb-gray-600"
      >
        <div className="w-[260px] p-4 flex flex-col h-full">
          
          {/* Header & Pin Butonu */}
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-2">
            <h3 className={`text-xl font-bold text-[var(--color-primary)] transition-opacity duration-200 ${isSidebarVisible ? 'opacity-100' : 'opacity-0'}`}>
              Yönetim Paneli
            </h3>
            
            {/* Sabitleme Butonu (Pin Icon) */}
            <button 
              onClick={togglePin} 
              className={`p-1 rounded hover:bg-white/20 text-white ${!isSidebarVisible && 'hidden'}`}
              title={isPinned ? "Menüyü Serbest Bırak" : "Menüyü Sabitle"}
            >
              {isPinned ? (
                // Kilitli İkonu
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                </svg>
              ) : (
                // Açık Kilit İkonu
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-60">
                  <path fillRule="evenodd" d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.2.267.59.267.783 0a.687.687 0 0 1 .978.01c.15.15.254.356.292.569a5.5 5.5 0 1 0 6.34-2.312.69.69 0 0 1 1.056-.213c.254.19.32.537.157.809Z" clipRule="evenodd" />
                  <path d="M5 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8Z" />
                </svg>
              )}
            </button>
          </div>

          {/* Menü Linkleri */}
          <ul className={`space-y-1 flex-1 ${!isSidebarVisible && 'opacity-0'}`}>
            
            {/* Temel Sayfalar */}
            <li><Link href="/admin" className={linkHoverClass}>📊 Dashboard</Link></li>
            <li><Link href="/admin/settings" className={linkHoverClass}>⚙️ Site Ayarları</Link></li>
            <li><Link href="/admin/slider" className={linkHoverClass}>🖼️ Slider Ayarları</Link></li>
            
            {/* Ürün Yönetimi */}
            <li className="pt-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">İçerik Yönetimi</li>
            <li><Link href="/admin/content/products" className={linkHoverClass}>📦 Tüm Ürünler</Link></li>
            <li><Link href="/admin/content/categories" className={linkHoverClass}>Hs Kategoriler</Link></li>

            {/* Dinamik Kategori Dropdownları */}
            {categories.map(cat => (
              <li key={cat.id}>
                <button 
                  onClick={() => toggleDropdown(cat.id)}
                  className={`${linkHoverClass} w-full justify-between`}
                >
                  <span className="truncate">{cat.name_tr}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    className={`w-4 h-4 transition-transform ${openDropdowns.includes(cat.id) ? 'rotate-180' : ''}`}
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Alt Kategoriler */}
                {openDropdowns.includes(cat.id) && (
                  <ul className="ml-4 mt-1 space-y-1 border-l border-gray-600 pl-2">
                    {cat.subCategories.length > 0 ? (
                      cat.subCategories.map(sub => (
                        <li key={sub.id}>
                          {/* Alt kategoriye tıklandığında o kategoriye ait ürünleri filtrele */}
                          <Link 
                            href={`/admin/content/products?subCategory=${sub.id}`} 
                            className="block p-1.5 text-sm text-gray-300 hover:text-white rounded hover:bg-white/5"
                          >
                            {sub.name_tr}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li className="p-1.5 text-xs text-gray-500 italic">Alt kategori yok</li>
                    )}
                  </ul>
                )}
              </li>
            ))}

            <li className="pt-4 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Diğer</li>
            <li><Link href="/admin/content/posts" className={linkHoverClass}>📝 Blog Yazıları</Link></li>
            <li><Link href="/admin/content/pages" className={linkHoverClass}>📄 Özel Sayfalar</Link></li>
            <li><Link href="/admin/orders" className={linkHoverClass}>🛒 Siparişler</Link></li>
            <li><Link href="/admin/chats" className={linkHoverClass}>💬 Canlı Destek</Link></li>
          </ul>
        </div>
      </nav>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-6 sm:p-8 bg-gray-100 overflow-x-auto text-gray-900">
        {children}
      </main>
    </div>
  );
}