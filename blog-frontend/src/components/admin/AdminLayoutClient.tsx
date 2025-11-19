"use client"; // Hook kullanmak için (useAuth, useRouter, useState)

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; 
import Link from "next/link";
import socket from "@/lib/socket";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  // --- Sesli Bildirim Altyapısı ---
  useEffect(() => {
    if (user && user.role === "admin") {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("admin_connected");
      socket.on("admin_new_chat_message", (message) => {
        console.log("Admin'e Yeni Canlı Destek Mesajı:", message);
        alert("Yeni Canlı Destek Mesajı!");
      });
      socket.on("admin_new_contact_message", (submission) => {
        console.log("Admin'e Yeni İletişim Formu Mesajı:", submission);
        alert("Yeni İletişim Formu Mesajı!");
      });
    }
    return () => {
      socket.off("admin_new_chat_message");
      socket.off("admin_new_contact_message");
    };
  }, [user]); 

  // --- Yetki Kontrolü ---
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    } else if (!isLoading && user && user.role !== "admin") {
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    // Tailwind class'ları ile yükleme ekranı
    return (
      <div className="bg-gray-900 text-white h-screen grid place-items-center">
        Yükleniyor veya Yetkiniz Yok...
      </div>
    );
  }

const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  return (
    <div className="flex min-h-screen">
      
      {/* Sol Kenar Menü (Navbar) */}
      <nav 
        className="bg-teal-900 text-teal-50 flex-shrink-0 transition-all duration-300 ease-in-out"
        style={{
          width: isSidebarVisible ? "250px" : "0px",
          overflow: "hidden",
        }}
      >
        <div className="w-[250px] p-4"> 
          <h3 className="text-xl font-bold mb-4 text-white">Admin Paneli</h3>
          <ul className="space-y-1">
            <li><Link href="/admin" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Dashboard</Link></li>
            <li><Link href="/admin/settings" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Site Ayarları</Link></li>
            <li><Link href="/admin/slider" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Slider Ayarları</Link></li>
            <li><Link href="/admin/content/products" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Ürünler</Link></li>
            <li><Link href="/admin/content/categories" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Kategoriler</Link></li>
            <li><Link href="/admin/content/posts" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Blog Yazıları</Link></li>
            <li><Link href="/admin/content/pages" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Özel Sayfalar</Link></li>
            <li><Link href="/admin/orders" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Siparişler</Link></li>
            <li><Link href="/admin/chats" className="block p-2 rounded-md hover:bg-teal-700 hover:text-white">Canlı Destek</Link></li>
          </ul>
        </div>
      </nav>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 p-6 sm:p-8 bg-gray-100 overflow-x-auto text-gray-900">
        
        {/* YENİ: Menü butonunda ikonlar */}
        <button 
          onClick={toggleSidebar} 
          className="mb-4 p-2 bg-teal-800 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 flex items-center justify-center"
          aria-label={isSidebarVisible ? "Menüyü Gizle" : "Menüyü Göster"} // Erişilebilirlik için
        >
          {isSidebarVisible ? (
            // Sidebar görünürken: "Menüyü Gizle" (sol ok)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          ) : (
            // Sidebar gizliyken: "Menüyü Göster" (sağ ok)
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          )}
        </button>
        
        {/* Sayfa içeriği */}
        {children}

      </main>
    </div>
  );
}