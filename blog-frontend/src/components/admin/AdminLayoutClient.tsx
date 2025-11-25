"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import socket from "@/lib/socket";
import api from "@/lib/api";
import toast from "react-hot-toast"; // Görsel bildirim için

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

  // State'ler
  const [isPinned, setIsPinned] = useState(true); 
  const [isHovered, setIsHovered] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const isSidebarVisible = isPinned || isHovered;

// --- SES OYNATMA FONKSİYONU (GÜNCELLENMİŞ) ---
  const playNotificationSound = () => {
    // 1. Dosya yolunu kontrol et
    const audio = new Audio('/notification.mp3');
    
    // 2. Oynatmayı dene ve hataları yakala
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("🔊 Bildirim sesi çalındı.");
        })
        .catch((error) => {
          console.warn("🔇 Ses çalınamadı. Sebebi:");
          if (error.name === 'NotAllowedError') {
            console.error("⚠️ Tarayıcı otomatik ses çalmayı engelledi. Sayfada bir yere tıklamanız gerekiyor.");
          } else if (error.name === 'NotSupportedError') {
             console.error("⚠️ Ses formatı desteklenmiyor veya dosya yolu yanlış.");
          } else {
             console.error("⚠️ Dosya bulunamadı (404) veya başka bir hata:", error);
          }
        });
    }
  };
  // Kategorileri Çek
  useEffect(() => {
    if (user && user.role === 'admin') {
      api.get('/products/categories')
        .then(res => setCategories(res.data))
        .catch(err => console.error("Kategoriler yüklenemedi", err));
    }
  }, [user]);

 useEffect(() => {
    if (user && user.role === "admin") {
      if (!socket.connected) socket.connect();
      socket.emit("admin_connected");

      // 1. CANLI DESTEK MESAJI GELDİĞİNDE
      const handleNewChatMessage = (message: any) => {
        playNotificationSound();
        // Alert yerine Toast kullanıyoruz
        toast((t) => (
          <div onClick={() => {
             toast.dismiss(t.id);
             router.push('/admin/chats');
          }} className="cursor-pointer">
             <b>💬 Yeni Destek Mesajı!</b><br/>
             <span className="text-sm">{message.content}</span>
          </div>
        ), { duration: 5000, icon: '🔔' });
      };

      // 2. İLETİŞİM FORMU GELDİĞİNDE
      const handleNewContact = (submission: any) => {
        playNotificationSound();
        toast((t) => (
           <div>
             <b>📩 Yeni İletişim Formu</b><br/>
             <span className="text-sm">{submission.firstName} size yazdı.</span>
           </div>
        ), { duration: 6000, icon: '📬' });
      };


  // 3. YENİ SİPARİŞ GELDİĞİNDE
      socket.on("admin_new_order", (order: any) => {
        playNotificationSound(); // Ses Çal

        toast((t) => (
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => {
              toast.dismiss(t.id);
              router.push('/admin/orders'); // Tıklayınca siparişlere git
            }}
          >
            <div className="text-2xl bg-green-100 p-2 rounded-full">📦</div>
            <div>
              <p className="font-bold text-gray-900">Yeni Sipariş!</p>
              <p className="text-sm text-gray-500">
                {order.customerName} - {order.totalAmount} TL
              </p>
              <span className="text-xs text-teal-600 font-medium mt-1 block">İncelemek için tıkla</span>
            </div>
          </div>
        ), { 
          duration: 8000, // Biraz daha uzun kalsın
          position: 'top-right',
          style: { borderLeft: '4px solid #10b981', minWidth: '300px' } 
        });
      });

      socket.on("admin_new_chat_message", handleNewChatMessage);
      socket.on("admin_new_contact_message", handleNewContact);

      return () => {
        socket.off("admin_new_chat_message", handleNewChatMessage);
        socket.off("admin_new_contact_message", handleNewContact);
        socket.off("admin_new_order"); // Temizlik
      };
    }
  }, [user, router]);



  // Yetki Kontrolü
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return <div className="bg-gray-900 text-white h-screen grid place-items-center">Yükleniyor...</div>;
  }

  // --- FONKSİYONLAR ---
  const toggleDropdown = (categoryId: string) => {
    if (openDropdowns.includes(categoryId)) {
      setOpenDropdowns(openDropdowns.filter(id => id !== categoryId));
    } else {
      setOpenDropdowns([...openDropdowns, categoryId]);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (isPinned) setIsHovered(false);
  };

  // Stiller
  const sidebarStyle: React.CSSProperties = {
    width: isSidebarVisible ? "260px" : "60px",
    backgroundColor: "var(--color-secondary)",
    color: "var(--color-text)",
    borderRight: "1px solid var(--color-primary)",
    transition: "width 0.3s ease",
    overflowX: "hidden",
    overflowY: "auto",
    whiteSpace: "nowrap",
    zIndex: 50,
    position: "relative"
  };

  const linkHoverClass = "block p-3 rounded-md transition-colors hover:bg-white/10 hover:text-[var(--color-primary)] flex items-center gap-3 text-sm font-medium";

  return (
    <div className="flex min-h-screen">
      
      {/* SOL SIDEBAR */}
      <nav 
        style={sidebarStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex-shrink-0 h-screen sticky top-0 scrollbar-none shadow-2xl"
      >
        <div className="w-[260px] p-4 flex flex-col h-full">
          
          {/* Header & Pin */}
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 h-12">
            <h3 className={`text-xl font-bold text-[var(--color-primary)] transition-opacity duration-200 ${isSidebarVisible ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Yönetim
            </h3>
            <button onClick={togglePin} className="p-1 rounded hover:bg-white/20 text-white ml-auto">
              {isPinned ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 opacity-60"><path fillRule="evenodd" d="M13.5 4.938a7 7 0 1 1-9.006 1.737c.2.267.59.267.783 0a.687.687 0 0 1 .978.01c.15.15.254.356.292.569a5.5 5.5 0 1 0 6.34-2.312.69.69 0 0 1 1.056-.213c.254.19.32.537.157.809Z" clipRule="evenodd" /><path d="M5 8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8Z" /></svg>
              )}
            </button>
          </div>

          {/* Linkler */}
          <ul className="space-y-1 flex-1">
            <li><Link href="/admin" className={linkHoverClass}>📊 <span>Dashboard</span></Link></li>
            <li><Link href="/admin/settings" className={linkHoverClass}>⚙️ <span>Site Ayarları</span></Link></li>
            <li><Link href="/admin/slider" className={linkHoverClass}>🖼️ <span>Slider Ayarları</span></Link></li>
            
            <li className={`pt-4 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider ${!isSidebarVisible && 'hidden'}`}>İçerik Yönetimi</li>
            
            <li><Link href="/admin/content/products" className={linkHoverClass}>📦 <span>Tüm Ürünler</span></Link></li>
            <li><Link href="/admin/campaigns" className={linkHoverClass}>🎁 <span>Kampanyalar</span></Link></li>
            <li><Link href="/admin/content/categories" className={linkHoverClass}>Hs <span>Kategoriler</span></Link></li>

            {/* Kategoriler Dropdown */}
            {categories.map(cat => (
              <li key={cat.id}>
                <button onClick={() => toggleDropdown(cat.id)} className={`${linkHoverClass} w-full justify-between group`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📂</span> 
                    <span className="truncate">{cat.name_tr}</span>
                  </div>
                  {isSidebarVisible && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ${openDropdowns.includes(cat.id) ? 'rotate-180' : ''}`}><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                  )}
                </button>
                {openDropdowns.includes(cat.id) && isSidebarVisible && (
                  <ul className="ml-9 mt-1 space-y-1 border-l border-white/10 pl-2">
                    {cat.subCategories.map(sub => (
                      <li key={sub.id}>
                        <Link href={`/admin/content/products?subCategory=${sub.id}`} className="block p-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                          {sub.name_tr}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}

            <li className={`pt-4 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider ${!isSidebarVisible && 'hidden'}`}>Diğer</li>
            <li><Link href="/admin/content/posts" className={linkHoverClass}>📝 <span>Blog Yazıları</span></Link></li>
            <li><Link href="/admin/content/pages" className={linkHoverClass}>📄 <span>Özel Sayfalar</span></Link></li>
            <li><Link href="/admin/orders" className={linkHoverClass}>🛒 <span>Siparişler</span></Link></li>
            
            {/* Mesajlar ve Canlı Destek */}
            <li><Link href="/admin/messages" className={linkHoverClass}>📩 <span>Mesajlar</span></Link></li>
            <li><Link href="/admin/chats" className={linkHoverClass}>💬 <span>Canlı Destek</span></Link></li>
          </ul>
        </div>
      </nav>

      {/* ANA İÇERİK */}
      <main className="flex-1 p-6 sm:p-8 bg-gray-100 overflow-x-auto text-gray-900 min-h-screen">
        {children}
      </main>
    </div>
  );
}