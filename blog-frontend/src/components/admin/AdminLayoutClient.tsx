"use client"; // Hook kullanmak için (useAuth, useRouter)

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import socket from "@/lib/socket"; // Sesli bildirim için

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // --- Sesli Bildirim Altyapısı ---
  useEffect(() => {
    // Sadece admin ise socket'e bağlan ve dinle
    if (user && user.role === "admin") {
      // 1. Socket'i bağla (eğer zaten bağlı değilse)
      if (!socket.connected) {
        socket.connect();
      }

      // 2. Admin odasına katıl
      socket.emit("admin_connected");

      // 3. Yeni canlı destek mesajı dinleyicisi
      socket.on("admin_new_chat_message", (message) => {
        console.log("Admin'e Yeni Canlı Destek Mesajı:", message);
        // (Burada bir ses çalma fonksiyonu çağırabilirsiniz)
        // const audio = new Audio('/sounds/notification.mp3');
        // audio.play();
        alert("Yeni Canlı Destek Mesajı!");
      });

      // 4. Yeni iletişim formu mesajı dinleyicisi
      socket.on("admin_new_contact_message", (submission) => {
        console.log("Admin'e Yeni İletişim Formu Mesajı:", submission);
        // (Burada bir ses çalma fonksiyonu çağırabilirsiniz)
        alert("Yeni İletişim Formu Mesajı!");
      });
    }

    // Bileşen unmount olduğunda dinleyicileri kapat
    return () => {
      socket.off("admin_new_chat_message");
      socket.off("admin_new_contact_message");
    };
  }, [user]); // 'user' değiştiğinde (giriş yaptığında) çalışır

  // --- Yetki Kontrolü ---
  useEffect(() => {
    if (!isLoading && !user) {
      // Yükleme bittiyse ve kullanıcı yoksa (giriş yapmamışsa) ana sayfaya yönlendir
      router.push("/");
    } else if (!isLoading && user && user.role !== "admin") {
      // Yükleme bittiyse, kullanıcı var ama 'admin' değilse ana sayfaya yönlendir
      router.push("/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    // Yüklenirken veya yetkisizse (yönlendirme gerçekleşene kadar) boş bir ekran göster
    return (
      <div style={{ backgroundColor: '#000', color: 'white', height: '100vh', display: 'grid', placeItems: 'center' }}>
        Yükleniyor veya Yetkiniz Yok...
      </div>
    );
  }

  // --- Admin Paneli Arayüzü ---
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sol Kenar Menü (Navbar) */}
      <nav style={{ width: "250px", backgroundColor: "#1a1a1a", color: "white", padding: "1rem" }}>
        <h3>Admin Paneli</h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <Link href="/admin">Dashboard</Link>
          </li>
          <li>
            <Link href="/admin/settings">Site Ayarları</Link>
          </li>
          <li>
            <Link href="/admin/slider">Slider Ayarları</Link>
          </li>
          <li>
            <Link href="/admin/content/products">Ürünler</Link>
          </li>
          <li>
            <Link href="/admin/content/posts">Blog Yazıları</Link>
          </li>
          <li>
            <Link href="/admin/content/pages">Özel Sayfalar</Link>
          </li>
          <li>
            <Link href="/admin/orders">Siparişler</Link>
          </li>
          <li>
            <Link href="/admin/chats">Canlı Destek</Link>
          </li>
          {/* Diğer linkler buraya eklenebilir */}
        </ul>
      </nav>

      {/* Ana İçerik Alanı */}
      <main style={{ flex: 1, padding: "2rem", backgroundColor: "#f0f0f0" }}>
        {children}
      </main>
    </div>
  );
}