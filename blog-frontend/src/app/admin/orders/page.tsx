"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import socket from "@/lib/socket";

// Order tipi güncellendi: Adres ve Telefon eklendi
type Order = {
  id: string;
  customerName: string;
  customerPhone: string;   // YENİ
  shippingAddress: string; // YENİ
  totalAmount: number;
  status: string;         
  paymentMethod: string;  
  paymentStatus: string;  
  createdAt: string;
  items: any[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Hangi siparişin detayının açık olduğunu tutar
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const url = filterStatus === 'all' ? '/admin/orders' : `/admin/orders?status=${filterStatus}`;
      const res = await api.get(url);
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    if (!socket.connected) socket.connect();
    socket.on("admin_new_order", () => {
        fetchOrders();
    });
    return () => {
        socket.off("admin_new_order");
    };
  }, [filterStatus]);

  const updateStatus = async (id: string, newStatus: string) => {
    if(!confirm(`Sipariş durumunu "${newStatus}" olarak değiştirmek istiyor musunuz?`)) return;
    try {
      await api.put(`/admin/orders/${id}/status`, { status: newStatus });
      fetchOrders(); 
    } catch (error) {
      alert("Güncelleme başarısız.");
    }
  };

  const updatePayment = async (id: string, newPaymentStatus: string) => {
    try {
      await api.put(`/admin/orders/${id}/payment`, { paymentStatus: newPaymentStatus });
      fetchOrders();
    } catch (error) {
      alert("Ödeme durumu güncellenemedi.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-bold">Bekliyor</span>;
      case 'processing': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">Hazırlanıyor</span>;
      case 'shipped': return <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-bold">Kargolandı</span>;
      case 'completed': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">Tamamlandı</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold">İptal</span>;
      default: return status;
    }
  };

  const getPaymentBadge = (status: string) => {
     switch (status) {
        case 'paid': return <span className="text-green-600 font-bold text-xs">Ödendi</span>;
        case 'unpaid': return <span className="text-red-600 font-bold text-xs">Ödenmedi</span>;
        case 'pending_confirmation': return <span className="text-orange-600 font-bold text-xs">Onay Bekliyor</span>;
        default: return status;
     }
  };

  // Detay aç/kapa
  const toggleExpand = (id: string) => {
    if (expandedOrderId === id) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(id);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md min-h-[80vh]">
      
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
         <h1 className="text-2xl font-bold text-gray-800">Siparişler</h1>
         <select 
           value={filterStatus} 
           onChange={(e) => setFilterStatus(e.target.value)}
           className="border border-gray-300 rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-teal-500"
         >
           <option value="all">Tüm Siparişler</option>
           <option value="pending">Bekleyenler</option>
           <option value="completed">Tamamlananlar</option>
           <option value="cancelled">İptal Edilenler</option>
         </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Sipariş ID / Tarih</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Müşteri</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Tutar / Ödeme</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Durum</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? <tr><td colSpan={5} className="p-4 text-center">Yükleniyor...</td></tr> : 
             orders.length === 0 ? <tr><td colSpan={5} className="p-4 text-center text-gray-500">Sipariş bulunamadı.</td></tr> :
             orders.map((order) => (
              <>
                {/* ANA SATIR */}
                <tr 
                  key={order.id} 
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedOrderId === order.id ? 'bg-gray-50' : ''}`}
                  onClick={() => toggleExpand(order.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs text-gray-500 font-bold">#{order.id.slice(-6)}</div>
                    <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{order.customerName}</div>
                    {/* Küçük Telefon Bilgisi */}
                    <div className="text-xs text-gray-500">{order.customerPhone}</div> 
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-800">{order.totalAmount.toLocaleString()} TL</div>
                    <div className="text-xs text-gray-500 mt-1">
                       {order.paymentMethod === 'havale' ? 'Havale/EFT' : order.paymentMethod === 'kapida_nakit' ? 'Kapıda Ödeme' : 'Kredi Kartı'}
                    </div>
                    <div className="mt-1">{getPaymentBadge(order.paymentStatus)}</div>
                  </td>
                  <td className="px-6 py-4">
                     {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                     
                     {/* Ödeme Onayı Butonu */}
                     {order.paymentStatus !== 'paid' && order.status !== 'cancelled' && (
                       <button 
                         onClick={() => updatePayment(order.id, 'paid')}
                         className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100 border border-green-200 transition-colors"
                         title="Ödemeyi Onayla"
                       >
                         Ödeme Alındı
                       </button>
                     )}

                     {/* Durum Değiştirme */}
                     <select 
                       value={order.status} 
                       onChange={(e) => updateStatus(order.id, e.target.value)}
                       className="border border-gray-300 rounded text-xs p-1 ml-2 outline-none focus:border-teal-500"
                     >
                       <option value="pending">Bekliyor</option>
                       <option value="processing">Hazırlanıyor</option>
                       <option value="shipped">Kargolandı</option>
                       <option value="completed">Tamamlandı</option>
                       <option value="cancelled">İptal Et</option>
                     </select>
                     
                     {/* Aç/Kapa İkonu */}
                     <button className="ml-2 text-gray-400 hover:text-gray-600">
                        {expandedOrderId === order.id ? '▲' : '▼'}
                     </button>
                  </td>
                </tr>

                {/* DETAY SATIRI (ACCORDION) */}
                {expandedOrderId === order.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-6 py-4 border-t border-gray-200 shadow-inner">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        {/* Müşteri ve Adres Bilgileri (YENİ EKLENEN KISIM) */}
                        <div className="bg-white p-4 rounded border border-gray-200">
                           <h4 className="font-bold text-gray-700 text-xs uppercase mb-2 border-b pb-1">Teslimat Bilgileri</h4>
                           <p className="text-sm text-gray-800"><span className="font-semibold">Alıcı:</span> {order.customerName}</p>
                           <p className="text-sm text-gray-800"><span className="font-semibold">Telefon:</span> {order.customerPhone}</p>
                           <p className="text-sm text-gray-800 mt-2"><span className="font-semibold">Adres:</span></p>
                           <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.shippingAddress}</p>
                        </div>

                        {/* Ürün Listesi */}
                        <div className="bg-white p-4 rounded border border-gray-200">
                           <h4 className="font-bold text-gray-700 text-xs uppercase mb-2 border-b pb-1">Sipariş İçeriği</h4>
                           <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                             {order.items.map((item: any) => (
                               <li key={item.id} className="flex justify-between text-sm">
                                 <span>{item.quantity}x {item.productName}</span>
                                 <span className="font-medium text-gray-600">{(item.priceAtPurchase * item.quantity).toLocaleString()} TL</span>
                               </li>
                             ))}
                           </ul>
                           <div className="mt-3 pt-2 border-t flex justify-between font-bold text-gray-800">
                             <span>Toplam Tutar:</span>
                             <span>{order.totalAmount.toLocaleString()} TL</span>
                           </div>
                        </div>
                      </div>

                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}