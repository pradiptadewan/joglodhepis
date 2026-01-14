"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface RestoCartItem {
  uniqueId: string;
  menuId: number;
  name: string;
  price: number;
  qty: number;
  type: 'food' | 'drink';
  image: string;
  note: string;
}

interface RestoContextType {
  cart: RestoCartItem[];
  addToCart: (item: RestoCartItem) => void;
  removeFromCart: (uniqueId: string) => void;
  updateQty: (uniqueId: string, delta: number) => void;
  clearCart: () => void;
  totalAmount: number;
}

const RestoContext = createContext<RestoContextType | undefined>(undefined);

export function RestoProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<RestoCartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem('restoCart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse resto cart", e);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('restoCart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (newItem: RestoCartItem) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.uniqueId === newItem.uniqueId);
      if (existingItem) {
        return prev.map((item) =>
          item.uniqueId === newItem.uniqueId
            ? { ...item, qty: item.qty + newItem.qty }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (uniqueId: string) => {
    setCart((prev) => prev.filter((item) => item.uniqueId !== uniqueId));
  };

  const updateQty = (uniqueId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.uniqueId === uniqueId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <RestoContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalAmount }}>
      {children}
    </RestoContext.Provider>
  );
}

export function useResto() {
  const context = useContext(RestoContext);
  if (!context) {
    throw new Error("useResto must be used within a RestoProvider");
  }
  return context;
}