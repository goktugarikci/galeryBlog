"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import socket from "@/lib/socket";

type ChatRoom = {
  id: string;
  guestName?: string;
  user?: { firstName: string; lastName: string; email: string };
  status: string;
  messages: { content: string; createdAt: string }[];
  _count: { messages: number }; // Okunmamış
  updatedAt: string;
};

type Message = {
  id: string;
  content: string;
  authorRole: string;
  createdAt: string;
};

export default function AdminChatsPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Odaları Çek
  const fetchRooms = async () => {
    try {
      const res = await api.get("/admin/chats");
      setRooms(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchRooms();
    if (!socket.connected) socket.connect();
    socket.emit("admin_connected");
    
    socket.on("admin_new_chat_message", () => {
      fetchRooms(); // Yeni mesaj gelince listeyi yenile
      if (selectedRoomId) loadMessages(selectedRoomId); // Açıksa mesajları da yenile
    });

    return () => { socket.off("admin_new_chat_message"); };
  }, [selectedRoomId]);

  // 2. Mesajları Yükle
  const loadMessages = async (roomId: string) => {
    setSelectedRoomId(roomId);
    try {
      const res = await api.get(`/admin/chats/${roomId}`);
      setMessages(res.data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
      // Okundu yapınca listeyi güncelle (bildirim sayısını düşürmek için)
      fetchRooms(); 
    } catch (e) { console.error(e); }
  };

  // 3. Mesaj Gönder
  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedRoomId) return;

    socket.emit("send_message", {
      roomId: selectedRoomId,
      authorRole: "admin",
      content: reply
    });

    // Optimistic UI update
    setMessages(prev => [...prev, { id: "temp", content: reply, authorRole: "admin", createdAt: new Date().toISOString() }]);
    setReply("");
    setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
  };

  // 4. Sohbeti Kapat / Sil
  const updateStatus = async (id: string, status: string) => {
    await api.put(`/admin/chats/${id}/status`, { status });
    fetchRooms();
    if (selectedRoomId === id) setSelectedRoomId(null); // Kapanınca seçimi kaldır
  };

  const deleteChat = async (id: string) => {
    if(!confirm("Bu sohbeti silmek istediğinize emin misiniz?")) return;
    await api.delete(`/admin/chats/${id}`);
    fetchRooms();
    if (selectedRoomId === id) setSelectedRoomId(null);
  };

  return (
    <div className="flex h-[80vh] gap-4">
      
      {/* SOL: Sohbet Listesi */}
      <div className="w-1/3 bg-white rounded-lg shadow overflow-y-auto border border-gray-200">
        <div className="p-4 border-b bg-gray-50 font-bold text-gray-700">Sohbetler</div>
        {rooms.map(room => (
          <div 
            key={room.id} 
            onClick={() => loadMessages(room.id)}
            className={`p-4 border-b cursor-pointer hover:bg-blue-50 transition-colors ${selectedRoomId === room.id ? 'bg-blue-100' : ''} ${room.status === 'closed' ? 'opacity-60' : ''}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-sm text-gray-800">
                  {room.user ? `${room.user.firstName} ${room.user.lastName}` : `Misafir: ${room.guestName}`}
                </h4>
                <p className="text-xs text-gray-500 truncate mt-1">
                  {room.messages[0]?.content || "Mesaj yok"}
                </p>
              </div>
              {room._count.messages > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{room._count.messages}</span>
              )}
            </div>
            <div className="mt-2 flex justify-between items-center">
               <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${room.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                 {room.status === 'open' ? 'Açık' : 'Kapalı'}
               </span>
               <span className="text-[10px] text-gray-400">
                 {new Date(room.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
               </span>
            </div>
          </div>
        ))}
      </div>

      {/* SAĞ: Mesajlaşma Alanı */}
      <div className="flex-1 bg-white rounded-lg shadow border border-gray-200 flex flex-col">
        {selectedRoomId ? (
          <>
            {/* Header & Actions */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold">Sohbet Detayı</h3>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(selectedRoomId, 'closed')} className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">Sohbeti Kapat</button>
                <button onClick={() => deleteChat(selectedRoomId)} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Sil</button>
              </div>
            </div>

            {/* Mesajlar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.authorRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg text-sm ${msg.authorRole === 'admin' ? 'bg-teal-600 text-white' : 'bg-white border text-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendReply} className="p-4 border-t flex gap-2">
              <input 
                value={reply} 
                onChange={(e) => setReply(e.target.value)} 
                className="flex-1 border rounded p-2 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Yanıt yaz..."
              />
              <button type="submit" className="bg-teal-600 text-white px-6 py-2 rounded font-bold hover:bg-teal-700">Gönder</button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Bir sohbet seçin.
          </div>
        )}
      </div>

    </div>
  );
}