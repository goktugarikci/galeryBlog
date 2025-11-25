"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from './AuthContext';

// ... (CartItem tipi aynı)
type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name_tr: string;
    name_en?: string;
    price: number;
    originalPrice?: number;
    stock: number;
    galleryImages: { imageUrl: string }[];
  };
};

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  isCartOpen: boolean;
  totalAmount: number;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>; // YENİ: Dışarıdan tetiklenebilir yenileme
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/shop/cart');
      setCartItems(res.data);
    } catch (error) {
      console.error("Sepet yüklenemedi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ... (addToCart, removeFromCart, updateQuantity fonksiyonları AYNI)
  const addToCart = async (productId: string, quantity: number) => {
    try {
      await api.post('/shop/cart', { productId, quantity });
      await fetchCart();
      setIsCartOpen(true);
    } catch (error: any) {
      alert(error.response?.data?.error || "Sepete eklenemedi.");
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`/shop/cart/${itemId}`);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) { console.error(error); }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity } : item));
      await api.put(`/shop/cart/${itemId}`, { quantity });
    } catch (error: any) {
      console.error(error);
      fetchCart();
    }
  };

  const totalAmount = cartItems.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems, isLoading, isCartOpen, totalAmount,
      openCart: () => setIsCartOpen(true),
      closeCart: () => setIsCartOpen(false),
      addToCart, removeFromCart, updateQuantity,
      refreshCart: fetchCart // YENİ: Fonksiyonu dışarı açtık
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error('useCart must be used within a CartProvider');
  return context;
};