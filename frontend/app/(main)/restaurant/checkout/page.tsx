"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useResto } from '@/context/RestoContext';
import { useAuth } from '@/context/AuthContext';

export default function RestoCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, removeFromCart, updateQty, totalAmount } = useResto();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    roomNumber: '',
    note: ''
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || '',
      }));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fakeOrderId = 'ORD-' + Math.floor(Math.random() * 1000000);
    
    setTimeout(() => {
      router.push(
        `/payment?orderId=${fakeOrderId}&amount=${totalAmount}&name=${encodeURIComponent(formData.fullName)}&phone=${encodeURIComponent(formData.phone)}&room=${encodeURIComponent(formData.roomNumber)}&note=${encodeURIComponent(formData.note)}&type=resto`
      );
    }, 1000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-[#2D2D2D]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        </div>
        <p className="text-xl font-serif mb-2">Keranjang pesanan kosong.</p>
        <Link href="/restaurant" className="px-8 py-3 bg-[#2D2D2D] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#BFA06D] transition shadow-lg mt-4">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#2D2D2D] font-sans pt-28 pb-12 px-4 md:px-8">
      
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link href="/restaurant" className="group flex items-center gap-2 text-gray-500 hover:text-[#BFA06D] transition-colors text-sm font-bold uppercase tracking-widest">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Add More Items
        </Link>
        <h1 className="text-2xl md:text-3xl font-serif">Finalize Your Order</h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <motion.div 
          className="lg:col-span-2 order-2 lg:order-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-200 ring-1 ring-black/5 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#BFA06D]" />

              <h2 className="text-sm font-bold uppercase tracking-widest text-[#BFA06D] mb-8 border-b border-gray-100 pb-4">Customer Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nama Lengkap</label>
                      <input 
                        required
                        type="text" 
                        className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#BFA06D] focus:bg-white transition-all font-medium focus:shadow-md"
                        placeholder="e.g. Budi Santoso"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">No. Handphone (WA)</label>
                      <input 
                        required
                        type="tel" 
                        className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#BFA06D] focus:bg-white transition-all font-medium focus:shadow-md"
                        placeholder="e.g. 08123456789"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nomor Kamar</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#BFA06D] focus:bg-white transition-all font-medium focus:shadow-md"
                      placeholder="e.g. Kamar 101 atau Meja 5"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                    />
                  </div>

                  {/* Baris 3: Catatan */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Catatan Tambahan</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#BFA06D] focus:bg-white transition-all resize-none font-medium focus:shadow-md"
                      placeholder="Contoh: Jangan terlalu pedas, minta sendok lebih..."
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                    />
                  </div>
                  
                  <div className="pt-8 mt-4 border-t border-gray-100">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-[#2D2D2D] text-white py-4 rounded-xl font-bold uppercase tracking-[0.15em] hover:bg-[#BFA06D] shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2 disabled:bg-gray-400 transform hover:-translate-y-1"
                    >
                        {isSubmitting ? (
                            <span>Processing...</span>
                        ) : (
                            <>
                                <span>Continue to Payment</span>
                                <span className="text-lg">→</span>
                            </>
                        )}
                    </button>
                  </div>
              </form>
           </div>
        </motion.div>

        {/* Bagian Kanan (Summary) Tetap Sama */}
        <motion.div 
          className="lg:col-span-1 order-1 lg:order-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="sticky top-28 space-y-6"> 
            
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-200 ring-1 ring-black/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#BFA06D]/50" />
                
                <div className="flex items-center justify-between mb-4 mt-2">
                    <h3 className="text-lg font-serif font-bold text-[#2D2D2D]">Order Summary</h3>
                </div>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto p-2 -mx-2 custom-scrollbar">
                    {cart.map((item, idx) => (
                        <div key={item.uniqueId} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex gap-4 relative group hover:bg-white hover:shadow-md transition-all">
                            <button 
                                type="button"
                                onClick={() => removeFromCart(item.uniqueId)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-md z-10 hover:scale-110 transition-transform cursor-pointer"
                            >
                                ✕
                            </button>
                            
                            <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-sm text-[#2D2D2D] leading-tight line-clamp-1">{item.name}</h4>
                                    {item.note && <p className="text-[10px] text-gray-500 italic mt-1">{item.note}</p>}
                                </div>
                                
                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden h-6">
                                        <button onClick={() => updateQty(item.uniqueId, -1)} className="px-2 hover:bg-gray-100 text-xs">-</button>
                                        <span className="px-2 text-xs font-bold border-l border-r border-gray-300 min-w-[20px] text-center">{item.qty}</span>
                                        <button onClick={() => updateQty(item.uniqueId, 1)} className="px-2 hover:bg-gray-100 text-xs">+</button>
                                    </div>
                                    <span className="font-bold text-[#2D2D2D] text-xs">
                                        IDR {(item.price * item.qty).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#2D2D2D] text-white p-8 rounded-3xl shadow-2xl ring-1 ring-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-sm opacity-60 uppercase tracking-widest">Total Items</span>
                    <span className="font-bold text-xl">{cart.reduce((a,b) => a + b.qty, 0)}</span>
                </div>
                <div className="border-t border-white/10 my-4 relative z-10" />
                <div className="flex justify-between items-center relative z-10">
                    <span className="text-lg font-serif">Grand Total</span>
                    <span className="text-xl lg:text-2xl font-bold text-[#BFA06D]">IDR {totalAmount.toLocaleString('id-ID')}</span>
                </div>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}