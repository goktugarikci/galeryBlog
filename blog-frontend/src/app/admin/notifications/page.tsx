// src/app/admin/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import Link from "next/link";

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
  type: string;
};

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    await api.put("/notifications/read-all");
    fetchNotifications();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
         <h1 className="text-2xl font-bold text-gray-800">Bildirimler</h1>
         <button onClick={markAllRead} className="text-sm text-teal-600 hover:underline">Tümünü Okundu İşaretle</button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500">Bildiriminiz yok.</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={`p-4 rounded-lg border flex items-start gap-4 ${notif.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
               <div className={`text-2xl p-2 rounded-full ${notif.type === 'order' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {notif.type === 'order' ? '📦' : '🔔'}
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-gray-900">{notif.title}</h4>
                 <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                 <div className="mt-2 flex justify-between items-center">
                    {notif.link && (
                      <Link href={notif.link} className="text-xs font-bold text-teal-600 hover:underline">
                        Detayları Gör →
                      </Link>
                    )}
                    <span className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString()}</span>
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}