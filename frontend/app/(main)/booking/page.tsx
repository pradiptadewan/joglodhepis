"use client";

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useBooking } from '@/context/BookingContext';

function BookingContent() {
  const router = useRouter();
  const { cart, removeFromCart } = useBooking(); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    specialRequest: ''
  });

  const grandTotal = cart.reduce((total, item) => total + (item.price * item.nights), 0);

  const displayCheckIn = cart.length > 0 ? cart[0].checkIn : '';
  const displayCheckOut = cart.length > 0 ? cart[0].checkOut : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const fakeOrderId = 'INV-' + Math.floor(Math.random() * 1000000);
    
    console.log("Redirecting to payment...");
    
    setTimeout(() => {
      router.push(
        `/payment?orderId=${fakeOrderId}&amount=${grandTotal}&name=${encodeURIComponent(formData.fullName)}&note=${encodeURIComponent(formData.specialRequest)}`
      );
    }, 1000);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-[#2D2D2D]">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        </div>
        <p className="text-xl font-serif mb-2">Keranjang booking Anda kosong.</p>
        <p className="text-sm text-gray-500 mb-8">Silakan pilih kamar terlebih dahulu.</p>
        <Link href="/hotel" className="px-8 py-3 bg-[#2D2D2D] text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#BFA06D] transition shadow-lg">
          Browse Rooms
        </Link>
      </div>
    );
  }

  return (
    // Background sedikit lebih gelap (gray-50) agar kartu putih lebih menonjol, atau tetap FDFCF8 dengan shadow kuat
    <div className="min-h-screen bg-[#F8F7F4] text-[#2D2D2D] font-sans selection:bg-[#BFA06D] selection:text-white pt-28 pb-12 px-4 md:px-8">
      
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link href="/hotel" className="group flex items-center gap-2 text-gray-500 hover:text-[#BFA06D] transition-colors text-sm font-bold uppercase tracking-widest">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Add More Rooms
        </Link>
        <h1 className="text-2xl md:text-3xl font-serif">Finalize Your Stay</h1>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* KIRI: FORM DATA DIRI */}
        <motion.div 
          className="lg:col-span-2 order-2 lg:order-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
           {/* MODIFIKASI: Shadow-2xl, Border-gray-200, Ring-1 */}
           <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-gray-200 ring-1 ring-black/5 mb-8 relative overflow-hidden">
              {/* Dekorasi Aksen Emas di atas */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#BFA06D]" />

              <h2 className="text-sm font-bold uppercase tracking-widest text-[#BFA06D] mb-8 border-b border-gray-100 pb-4">Contact Details</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* --- TANGGAL CHECKIN/CHECKOUT (READ ONLY) --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        Check-in Date 
                        <span className="text-[10px] font-normal text-gray-300">(Fixed)</span>
                      </label>
                      <div className="relative group">
                        <input 
                          type="date" 
                          readOnly
                          className="w-full bg-white border border-gray-200 text-gray-500 rounded-xl px-4 py-3.5 cursor-not-allowed focus:outline-none font-medium"
                          value={displayCheckIn}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                        Check-out Date
                        <span className="text-[10px] font-normal text-gray-300">(Fixed)</span>
                      </label>
                      <div className="relative group">
                        <input 
                          type="date" 
                          readOnly
                          className="w-full bg-white border border-gray-200 text-gray-500 rounded-xl px-4 py-3.5 cursor-not-allowed focus:outline-none font-medium"
                          value={displayCheckOut}
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
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
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
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
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <input 
                      required
                      type="email" 
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#BFA06D] focus:bg-white transition-all font-medium focus:shadow-md"
                      placeholder="e.g. budi@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Special Requests</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-[#FAF9F6] border border-gray-200 rounded-xl px-4 py-3.5 focus:outline-none focus:border-[#BFA06D] focus:bg-white transition-all resize-none font-medium focus:shadow-md"
                      placeholder="Catatan tambahan..."
                      value={formData.specialRequest}
                      onChange={(e) => setFormData({...formData, specialRequest: e.target.value})}
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

        {/* KANAN: LIST ITEM DI CART */}
        <motion.div 
          className="lg:col-span-1 order-1 lg:order-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="sticky top-28 space-y-6"> 
            
            {/* MODIFIKASI: Membungkus List Kamar menjadi 1 KARTU PUTIH yang Menonjol */}
            <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-200 ring-1 ring-black/5 relative overflow-hidden">
                {/* Aksen Emas tipis */}
                <div className="absolute top-0 left-0 w-full h-1 bg-[#BFA06D]/50" />
                
                <div className="flex items-center justify-between mb-4 mt-2">
                    <h3 className="text-lg font-serif font-bold text-[#2D2D2D]">Booking Summary</h3>
                </div>
                
                {/* List Kamar (Di dalam kartu) */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto p-2 -mx-2 custom-scrollbar">
                    {cart.map((item, idx) => (
                        // Item kamar diubah backgroundnya jadi gray-50 agar kontras dengan kartu putih
                        <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex gap-4 relative group hover:bg-white hover:shadow-md transition-all">
                            {/* TOMBOL X */}
                            <button 
                                onClick={() => removeFromCart(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center shadow-md z-10 hover:scale-110 transition-transform cursor-pointer"
                            >
                                ✕
                            </button>
                            
                            <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                <img src={item.image} alt={item.roomName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-bold text-[#BFA06D] uppercase tracking-wide">{item.category}</span>
                                    <h4 className="font-bold text-sm text-[#2D2D2D] leading-tight mt-1 line-clamp-1">{item.roomName}</h4>
                                </div>
                                
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-[10px] text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">{item.nights} Night(s)</span>
                                    <span className="font-bold text-[#2D2D2D] text-sm">
                                        IDR {(item.price * item.nights).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Grand Total - Dibuat lebih gelap dan shadow lebih dalam */}
            <div className="bg-[#2D2D2D] text-white p-8 rounded-3xl shadow-2xl ring-1 ring-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-sm opacity-60 uppercase tracking-widest">Total Rooms</span>
                    <span className="font-bold text-xl">{cart.length}</span>
                </div>
                <div className="border-t border-white/10 my-4 relative z-10" />
                <div className="flex justify-between items-center relative z-10">
                    <span className="text-lg font-serif">Grand Total</span>
                    <span className="text-xl lg:text-2xl font-bold text-[#BFA06D]">IDR {grandTotal.toLocaleString('id-ID')}</span>
                </div>
                <p className="text-[10px] text-white/40 mt-4 text-right relative z-10">Termasuk pajak & biaya layanan</p>
            </div>

          </div>
        </motion.div>

      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <BookingContent />
    </Suspense>
  );
}