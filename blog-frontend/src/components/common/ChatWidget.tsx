"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import socket from "@/lib/socket";

type Message = {
  id?: string;
  authorRole: "user" | "admin" | "guest"; // 'guest' eklendi
  content: string;
  createdAt?: string;
};

export default function ChatWidget() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  
  // --- STATE ---
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  
  // Misafir İşlemleri
  const [guestName, setGuestName] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isEn = lang === "en";

  // 1. Otomatik Bağlantı (Kayıtlı Kullanıcılar İçin)
  useEffect(() => {
    if (user && isOpen && !isConnected) {
      startChatSession({ userId: user.id });
    }
  }, [user, isOpen]);

  // 2. Socket Dinleyicileri
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onJoinedRoom = (data: { roomId: string; messages?: Message[] }) => {
      setRoomId(data.roomId);
      setIsConnected(true);
      setIsChatStarted(true);
      if (data.messages) setMessages(data.messages);
      // Bildirim sesi çalınabilir
    };

    const onReceiveMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    };

    socket.on("joined_room", onJoinedRoom);
    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.off("joined_room", onJoinedRoom);
      socket.off("receive_message", onReceiveMessage);
    };
  }, []);

  // Sohbeti Başlatma Fonksiyonu (Ortak)
  const startChatSession = (data: { userId?: string; guestName?: string }) => {
    if (!socket.connected) socket.connect();
    socket.emit("join_chat", data);
  };

  // Misafir Girişi
  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    startChatSession({ guestName });
  };

  // Otomatik kaydırma
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Mesaj Gönderme
  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !roomId) return;

    const msgData = {
      roomId,
      authorId: user ? user.id : null, // Misafir ise null
      authorRole: user ? "user" : "guest", // Rol belirle
      content: input
    };

    socket.emit("send_message", msgData);
    setInput("");
  };

  return (
    <>
      {/* --- AÇ/KAPA BUTONU (BALON) --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
        style={{ 
            backgroundColor: 'var(--color-primary)', 
            color: 'var(--color-secondary)' 
        }}
        aria-label="Canlı Destek"
      >
        {isOpen ? (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
        )}
      </button>

      {/* --- SOHBET PENCERESİ --- */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-200">
          
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between shadow-sm"
            style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
              <h3 className="font-bold text-lg">{isEn ? "Live Support" : "Canlı Destek"}</h3>
            </div>
          </div>

          {/* İÇERİK ALANI (Duruma Göre Değişir) */}
          
          {/* DURUM 1: Sohbet Başlamadı ve Kullanıcı Giriş Yapmamış (Misafir Girişi) */}
          {!user && !isChatStarted ? (
            <div className="flex-1 p-6 flex flex-col justify-center items-center bg-gray-50 text-center">
               <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-3xl">👋</div>
               <h4 className="font-bold text-gray-800 mb-2 text-lg">
                 {isEn ? "Welcome!" : "Hoş Geldiniz!"}
               </h4>
               <p className="text-sm text-gray-500 mb-6">
                 {isEn 
                   ? "Please enter your name to start chatting with us." 
                   : "Bizimle sohbet etmek için lütfen adınızı yazın."}
               </p>
               
               <form onSubmit={handleGuestLogin} className="w-full space-y-3">
                 <input 
                   required
                   value={guestName}
                   onChange={(e) => setGuestName(e.target.value)}
                   placeholder={isEn ? "Your Name" : "Adınız"}
                   className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-gray-900"
                 />
                 <button 
                   type="submit"
                   className="w-full py-3 rounded-lg font-bold transition-colors hover:brightness-110 shadow-md"
                   style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' }}
                 >
                   {isEn ? "Start Chat" : "Sohbete Başla"}
                 </button>
               </form>
            </div>
          ) : (
            // DURUM 2: Sohbet Aktif (Kullanıcı veya Misafir)
            <>
              {/* Mesaj Listesi */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3 custom-scrollbar">
                {messages.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mt-10">
                    {isEn ? "How can we help you today?" : "Size nasıl yardımcı olabiliriz?"}
                  </p>
                )}
                
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.authorRole === 'admin' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div 
                      className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm relative ${
                        msg.authorRole === 'admin' 
                          ? 'bg-white text-gray-800 border border-gray-200 rounded-bl-none' 
                          : 'text-white rounded-br-none'
                      }`}
                      style={msg.authorRole !== 'admin' ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' } : {}}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Alanı */}
              <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isEn ? "Type a message..." : "Bir mesaj yazın..."}
                  className="flex-1 p-2.5 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-sm text-gray-900 placeholder-gray-500"
                />
                <button 
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 rounded-lg transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
                  style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                  </svg>
                </button>
              </form>
            </>
          )}

        </div>
      )}
    </>
  );
}