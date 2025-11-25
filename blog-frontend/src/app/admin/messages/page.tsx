// src/app/admin/messages/page.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import socket from "@/lib/socket";

// Mesaj Veri Tipi
type Message = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  // Verileri Çek
  const fetchMessages = async () => {
    try {
      const res = await api.get("/contact/admin");
      setMessages(res.data);
    } catch (error) {
      console.error("Mesajlar yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Socket.io ile anlık yeni mesajları dinle
    if (!socket.connected) socket.connect();
    
    socket.on("admin_new_contact_message", (newMessage: Message) => {
      // Yeni mesajı listenin en başına ekle
      setMessages((prev) => [newMessage, ...prev]);
      // Sesli veya görsel bir uyarı da verebilirsiniz
    });

    return () => {
      socket.off("admin_new_contact_message");
    };
  }, []);

  // Okundu Olarak İşaretle
  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Satıra tıklamayı engelle
    try {
      await api.put(`/contact/admin/${id}/read`);
      // State'i güncelle
      setMessages((prev) => 
        prev.map((msg) => msg.id === id ? { ...msg, isRead: true } : msg)
      );
    } catch (error) {
      console.error("Güncelleme hatası:", error);
    }
  };

  // Sil
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    
    try {
      await api.delete(`/contact/admin/${id}`);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  // Mesaj Detayını Aç/Kapa
  const toggleExpand = (id: string) => {
    if (expandedMessageId === id) {
      setExpandedMessageId(null);
    } else {
      setExpandedMessageId(id);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[80vh]">
      
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gelen Mesajlar</h1>
          <p className="text-sm text-gray-500">İletişim formundan gelen talepleri yönetin.</p>
        </div>
        <div className="text-sm text-gray-600">
          Toplam: <span className="font-bold">{messages.length}</span> Mesaj
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gönderen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Konu</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Yükleniyor...</td></tr>
            ) : messages.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Henüz mesaj yok.</td></tr>
            ) : (
              messages.map((msg) => (
                <>
                  {/* Ana Satır */}
                  <tr 
                    key={msg.id} 
                    onClick={() => toggleExpand(msg.id)}
                    className={`cursor-pointer transition-colors ${msg.isRead ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {msg.isRead ? (
                        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Okundu</span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full animate-pulse">Yeni</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{msg.firstName} {msg.lastName}</div>
                      <div className="text-xs text-gray-500">{msg.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                      {msg.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString('tr-TR')} <span className="text-xs">{new Date(msg.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {!msg.isRead && (
                        <button 
                          onClick={(e) => markAsRead(msg.id, e)}
                          className="text-teal-600 hover:text-teal-900 mr-4"
                          title="Okundu İşaretle"
                        >
                          ✓
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleDelete(msg.id, e)}
                        className="text-red-600 hover:text-red-900"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>

                  {/* Detay Satırı (Accordion) */}
                  {expandedMessageId === msg.id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4 border-b border-gray-200">
                        <div className="text-sm text-gray-800 space-y-2">
                          <p><strong>Mesaj:</strong></p>
                          <p className="p-3 bg-white border rounded-md whitespace-pre-wrap">{msg.message}</p>
                          <div className="flex gap-4 text-xs text-gray-500 mt-2">
                            <span><strong>Telefon:</strong> {msg.phone || "-"}</span>
                            <span><strong>Email:</strong> {msg.email}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}