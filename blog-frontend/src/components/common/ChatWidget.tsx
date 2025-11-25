"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import socket from "@/lib/socket";
import toast from "react-hot-toast"; 

type Message = {
  id?: string;
  authorRole: "user" | "admin" | "guest";
  content: string;
  createdAt?: string;
};

export default function ChatWidget() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0); 
  
  const [guestName, setGuestName] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isEn = lang === "en";

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3'); 
      audio.play().catch(() => {});
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    if (user && isOpen && !isConnected) {
      startChatSession({ userId: user.id });
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const onJoinedRoom = (data: { roomId: string; messages?: Message[] }) => {
      setRoomId(data.roomId);
      setIsConnected(true);
      setIsChatStarted(true);
      if (data.messages) setMessages(data.messages);
    };

    const onReceiveMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();

      if (message.authorRole === 'admin') {
        if (!isOpen) {
          playNotificationSound();
          setUnreadCount((prev) => prev + 1);
          toast(isEn ? "New message from support!" : "Destek ekibinden yeni mesaj!", {
            icon: '💬',
            position: 'bottom-right',
            style: { marginBottom: '80px', background: '#333', color: '#fff' }
          });
        } else {
           playNotificationSound();
        }
      }
    };

    socket.on("joined_room", onJoinedRoom);
    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.off("joined_room", onJoinedRoom);
      socket.off("receive_message", onReceiveMessage);
    };
  }, [isOpen, isEn]); 

  const startChatSession = (data: { userId?: string; guestName?: string }) => {
    if (!socket.connected) socket.connect();
    socket.emit("join_chat", data);
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    startChatSession({ guestName });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const toggleChat = () => {
    if (!isOpen) {
      setUnreadCount(0);
      setTimeout(scrollToBottom, 200); 
    }
    setIsOpen(!isOpen);
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !roomId) return;

    const msgData = {
      roomId,
      authorId: user ? user.id : null, 
      authorRole: user ? "user" : "guest", 
      content: input
    };

    socket.emit("send_message", msgData);
    setInput("");
  };

  return (
    // 'fixed' ve 'z-[9999]' ile en üst katmanda ve ekrana çivili olmasını sağlıyoruz.
    // 'bottom-5 right-5' ile sağ alt köşeye sabitliyoruz.
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-4">
      
      {/* --- SOHBET PENCERESİ --- */}
      {isOpen && (
        <div 
          className="w-80 md:w-96 h-[450px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-200 mb-2"
          style={{ 
            backgroundColor: 'var(--color-card-background)', // Kart Rengi
            borderColor: 'var(--color-primary)'              // Çerçeve Rengi
          }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between shadow-md"
            style={{ 
                backgroundColor: 'var(--color-secondary)', 
                color: 'var(--color-primary)',
                borderBottom: '1px solid var(--color-primary)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-xl">🎧</div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--color-secondary)] ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              </div>
              <div>
                <h3 className="font-bold text-base">{isEn ? "Live Support" : "Canlı Destek"}</h3>
                <span className="text-xs opacity-80 block">{isEn ? "We're online!" : "Çevrimiçiyiz!"}</span>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white/50 hover:text-white transition-colors">
              ✕
            </button>
          </div>

          {/* Mesaj Alanı */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-black/20">
            {!user && !isChatStarted ? (
              // MİSAFİR GİRİŞİ
              <div className="h-full flex flex-col justify-center items-center text-center">
                 <h4 className="font-bold mb-2 text-lg" style={{ color: 'var(--color-primary)' }}>
                   {isEn ? "Welcome!" : "Hoş Geldiniz"}
                 </h4>
                 <p className="text-sm mb-6 opacity-70" style={{ color: 'var(--color-card-text)' }}>
                   {isEn ? "Please enter your name to start." : "Devam etmek için adınızı yazın."}
                 </p>
                 <form onSubmit={handleGuestLogin} className="w-full space-y-3">
                   <input required value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder={isEn ? "Your Name" : "Adınız"} className="w-full p-3 border rounded-lg outline-none bg-white/10 focus:bg-white focus:text-black focus:ring-2 focus:ring-[var(--color-primary)] transition-all text-sm" style={{ borderColor: 'var(--color-primary)', color: 'var(--color-card-text)' }} />
                   <button type="submit" className="w-full py-2.5 rounded-lg font-bold transition-all hover:brightness-110 shadow-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' }}>
                     {isEn ? "Start Chat" : "Başla"}
                   </button>
                 </form>
              </div>
            ) : (
              // MESAJLAR
              <>
                {messages.length === 0 && (
                  <div className="text-center mt-8 opacity-50 text-sm" style={{ color: 'var(--color-card-text)' }}>
                    {isEn ? "Start a conversation..." : "Bir mesaj yazın..."}
                  </div>
                )}
                
                {messages.map((msg, idx) => {
                  const isMe = msg.authorRole === 'user' || msg.authorRole === 'guest';
                  const isAdminMsg = msg.authorRole === 'admin';

                  return (
                    <div key={idx} className={`flex flex-col ${!isMe ? 'items-start' : 'items-end'}`}>
                      {/* Admin Etiketi */}
                      {isAdminMsg && (
                        <span className="text-[10px] opacity-60 mb-1 ml-1 font-bold" style={{ color: 'var(--color-card-text)' }}>
                           {isEn ? "Support Agent" : "Müşteri Temsilcisi"}
                        </span>
                      )}
                      
                      <div 
                        className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm relative break-words ${
                          !isMe 
                            ? 'bg-white text-gray-900 border border-gray-200 rounded-tl-none' 
                            : 'rounded-tr-none'
                        }`}
                        style={isMe ? { backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' } : {}}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] opacity-40 mt-1 px-1" style={{ color: 'var(--color-card-text)' }}>
                         {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          {(user || isChatStarted) && (
            <form onSubmit={handleSend} className="p-3 border-t flex gap-2 bg-[var(--color-card-background)]" style={{ borderColor: 'var(--color-primary)' }}>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isEn ? "Type a message..." : "Bir mesaj yazın..."}
                className="flex-1 p-3 rounded-full outline-none text-sm focus:ring-1 focus:ring-[var(--color-primary)] bg-white/10 text-[var(--color-card-text)] placeholder-gray-500 border border-white/10"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="p-3 rounded-full transition-all disabled:opacity-50 hover:scale-105 active:scale-95 flex-shrink-0 shadow-md"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                </svg>
              </button>
            </form>
          )}
        </div>
      )}

      {/* --- BALON BUTON (EN SAĞ ALTA SABİTLİ) --- */}
      <button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 border-2 border-white/20 group"
        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-secondary)' }}
        aria-label="Canlı Destek"
      >
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold h-6 w-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm z-10">
            {unreadCount}
          </span>
        )}
        
        {isOpen ? (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 group-hover:animate-wiggle"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
        )}
      </button>

    </div>
  );
}