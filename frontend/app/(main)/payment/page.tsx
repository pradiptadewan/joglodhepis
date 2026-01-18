"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '@/context/BookingContext';
import { useResto } from '@/context/RestoContext';
import Script from 'next/script';

import { API_URL, MIDTRANS_CLIENT_KEY } from '@/lib/config';

declare global {
  interface Window {
    snap: any;
  }
}

interface BaseItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string | null;
}

interface Menu extends BaseItem {
  type: 'food';
  is_package: boolean;
  package_content?: string;
  min_order_qty?: number;
  has_flavor_option?: boolean;
}

interface Drink extends BaseItem {
  type: 'drink';
  serving_type: 'both' | 'ice_only' | 'hot_only';
  has_sugar_option: boolean;
}

type SelectedItem = Menu | Drink;

interface FoodOrderItem {
  menuId: number;
  name: string;
  price: number;
  qty: number;
  type: 'food' | 'drink';
  note: string;
}

const ConfirmModal = ({ isOpen, onClose, onConfirm, isProcessing }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center"
      >
        <h3 className="text-xl font-serif font-bold text-[#2D2D2D] mb-2">Konfirmasi Pesanan</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Lakukan pembayaran di hotel?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isProcessing} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50">
            Batal
          </button>
          <button onClick={onConfirm} disabled={isProcessing} className="flex-1 py-2.5 rounded-lg bg-[#BFA06D] text-white font-bold text-sm hover:bg-[#a68b5d] flex justify-center items-center">
             {isProcessing ? 'Processing...' : 'Yes, Book Now'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { cart: bookingCart, clearCart: clearBookingCart } = useBooking(); 
  const { cart: restoCart, clearCart: clearRestoCart } = useResto();

  const [token, setToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('bca');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const [availableItems, setAvailableItems] = useState<SelectedItem[]>([]);
  const [foodCart, setFoodCart] = useState<FoodOrderItem[]>([]);
  
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [sugarLevel, setSugarLevel] = useState<string>('Normal');
  const [tempSelection, setTempSelection] = useState<'Ice' | 'Hot'>('Ice');
  const [flavorSelection, setFlavorSelection] = useState<string>('Sedang');

  const orderId = searchParams.get('orderId') || 'INV-000000';
  const paymentType = searchParams.get('type');
  const rawAmount = Number(searchParams.get('amount')) || 0;
  
  const roomTotalAmount = paymentType === 'resto' ? 0 : rawAmount;
  const specialRequest = searchParams.get('note') || '';
  const customerName = searchParams.get('name') || '';
  const customerPhone = searchParams.get('phone') || '';
  const customerRoom = searchParams.get('room') || '';

  useEffect(() => {
    if (paymentType === 'resto' && restoCart.length > 0 && foodCart.length === 0) {
      const mappedItems: FoodOrderItem[] = restoCart.map(item => ({
        menuId: item.menuId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        type: item.type,
        note: item.note
      }));
      setFoodCart(mappedItems);
    }
  }, [paymentType, restoCart, foodCart.length]);

  useEffect(() => {
    if (selectedItem) {
      setSugarLevel('Normal');
      setFlavorSelection('Sedang'); 
      if (selectedItem.type === 'drink') {
        if (selectedItem.serving_type === 'hot_only') setTempSelection('Hot');
        else setTempSelection('Ice');
      }
    }
  }, [selectedItem]);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      alert("Silakan login terlebih dahulu untuk melanjutkan pembayaran.");
      router.push('/auth/login');
      return;
    }

    setToken(storedToken);
    setIsAuthChecking(false);

    async function initData() {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        const headers = { 'Authorization': `Bearer ${storedToken}` };
        const [resMenu, resDrink] = await Promise.all([
          fetch(`${API_URL}/api/menus/`, { headers }), 
          fetch(`${API_URL}/api/drinks/`, { headers })
        ]);

        let combinedItems: SelectedItem[] = [];
        if (resMenu.ok) {
          const menuData = await resMenu.json();
          const dailyFood = menuData
            .filter((m: any) => !m.is_package)
            .map((m: any) => ({ ...m, type: 'food' }));
          combinedItems = [...combinedItems, ...dailyFood];
        }
        if (resDrink.ok) {
          const drinkData = await resDrink.json();
          const drinks = drinkData.map((d: any) => ({ ...d, type: 'drink' }));
          combinedItems = [...combinedItems, ...drinks];
        }
        setAvailableItems(combinedItems);
      } catch (err) {
        console.error("Gagal memuat menu:", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [router]);

  const handleConfirmAddItem = () => {
    if (!selectedItem) return;
    let noteParts: string[] = [];
    if (selectedItem.type === 'drink') {
        if (selectedItem.serving_type === 'both') noteParts.push(tempSelection);
        else if (selectedItem.serving_type === 'ice_only') noteParts.push('Ice');
        else if (selectedItem.serving_type === 'hot_only') noteParts.push('Hot');
        if (selectedItem.has_sugar_option && sugarLevel !== 'Normal') noteParts.push(sugarLevel);
    } else if (selectedItem.type === 'food') {
        if (selectedItem.has_flavor_option) noteParts.push(flavorSelection);
    }
    const finalNote = noteParts.join(', ');
    addToFoodCart(selectedItem, finalNote);
    setSelectedItem(null);
  };

  const addToFoodCart = (item: SelectedItem, note: string) => {
    setFoodCart(prev => {
      const existingIndex = prev.findIndex(i => 
        i.menuId === item.id && i.type === item.type && i.note === note
      );
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].qty += 1;
        return updated;
      }
      return [...prev, {
        menuId: item.id, name: item.name, price: item.price, type: item.type, qty: 1, note: note
      }];
    });
  };

  const updateFoodQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    setFoodCart(prev => prev.map((item, i) => i === index ? { ...item, qty: newQty } : item));
  };

  const removeFoodItem = (index: number) => {
    setFoodCart(prev => prev.filter((_, i) => i !== index));
  };

  const foodTotalAmount = foodCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const grandTotal = roomTotalAmount + foodTotalAmount;

  const performCleanup = () => {
    if (paymentType === 'resto') {
        clearRestoCart();
    } else {
        clearBookingCart();
    }
  };

  const updateOrderStatus = async (midtransOrderId: string) => {
    try {
        await fetch(`${API_URL}/api/check-status/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ order_id: midtransOrderId })
        });
    } catch (error) {
        console.error("Gagal update status:", error);
    }
  };

  const handlePaymentButtonClick = () => {
    if (grandTotal < 1) {
        alert("Total pembayaran tidak boleh 0!");
        return;
    }

    if (!token) {
        alert("Sesi Anda habis. Silakan login kembali.");
        router.push('/auth/login');
        return;
    }

    if (selectedMethod === 'hotel') {
        setShowConfirmModal(true);
    } else {
        processTransaction();
    }
  };

  const processTransaction = async () => {
    setIsProcessingPayment(true);
    
    try {
        const hotelItemsPayload = paymentType === 'resto' ? [] : bookingCart.map(item => ({
            room_type_id: item.roomId || item.id,
            check_in: item.checkIn,
            check_out: item.checkOut
        }));

        const payload = {
            customer_name: customerName,
            customer_phone: customerPhone,
            room_number: customerRoom,
            special_request: specialRequest,
            note: specialRequest,
            payment_method: selectedMethod,
            hotel_items: hotelItemsPayload,
            resto_items: foodCart.map(item => ({
                menu_id: item.menuId,
                quantity: item.qty,
                item_type: item.type,
                note: item.note
            })),
            vw_items: []
        };

        const response = await fetch(`${API_URL}/api/checkout/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                router.push('/auth/login');
                return;
            }
            throw new Error(data.message || data.error || 'Gagal memproses pesanan');
        }

        if (selectedMethod === 'hotel') {
            performCleanup();
            setShowConfirmModal(false);
            router.push('/orders?status=hotel_booked');
        } else {
            if (window.snap && data.token) {
                window.snap.pay(data.token, {
                    onSuccess: async function(result: any) {
                        await updateOrderStatus(data.midtrans_order_id);
                        performCleanup();
                        router.push('/orders?status=success');
                    },
                    onPending: async function(result: any) {
                        await updateOrderStatus(data.midtrans_order_id);
                        performCleanup();
                        router.push('/orders?status=pending');
                    },
                    onError: async function(result: any) {
                        console.error('Error:', result);
                        router.push('/orders?status=failed');
                    },
                    onClose: function() {
                        router.push('/orders?status=closed');
                    }
                });
            } else {
                performCleanup();
                router.push('/orders?status=hotel_booked');
            }
        }

    } catch (error: any) {
        console.error("Transaction Error:", error);
        alert(error.message || "Terjadi kesalahan saat memproses pesanan.");
        setShowConfirmModal(false);
    } finally {
        setIsProcessingPayment(false);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-food.jpg";
    return path.startsWith("http") ? path : `${API_URL}${path}`;
  };

  if (isAuthChecking || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8]">
        <div className="w-16 h-16 border-2 border-gray-100 border-t-[#BFA06D] rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-400 font-medium tracking-widest uppercase">
            {isAuthChecking ? 'Checking Session...' : 'Preparing Payment...'}
        </p>
      </div>
    );
  }

  return (
    <>
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="min-h-screen bg-[#FDFCF8] text-[#2D2D2D] font-sans pt-28 pb-12 px-4 md:px-8 relative">
        <ConfirmModal 
            isOpen={showConfirmModal} 
            onClose={() => setShowConfirmModal(false)} 
            onConfirm={processTransaction}
            isProcessing={isProcessingPayment}
        />

        <div className="max-w-5xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-serif mb-2">Payment & Add-ons</h1>
            <p className="text-gray-500 text-sm">Order ID: <span className="font-mono font-bold text-[#2D2D2D]">{orderId}</span></p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              
              <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                 {paymentType !== 'resto' && (
                   <>
                     <div className="p-6 border-b border-gray-100 bg-gray-50">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-[#BFA06D]/10 rounded-full flex items-center justify-center text-[#BFA06D]">
                                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                             </div>
                             <div>
                                 <h3 className="font-bold text-[#2D2D2D] text-sm uppercase tracking-wide">Lengkapi Pesanan</h3>
                                 <p className="text-xs text-gray-500">Tambah menu makanan & minuman lainnya.</p>
                             </div>
                         </div>
                     </div>

                     <div className="p-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                             {availableItems.map((item, idx) => (
                                 <div key={`${item.type}-${item.id}-${idx}`} className="flex gap-3 p-3 border border-gray-100 rounded-xl hover:border-[#BFA06D]/50 transition-all group bg-white cursor-pointer" onClick={() => setSelectedItem(item)}>
                                     <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                                         <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${getImageUrl(item.image)}')` }} />
                                         {item.type === 'drink' && (
                                             <div className="absolute top-1 left-1 bg-blue-500/80 text-white text-[8px] px-1.5 py-0.5 rounded backdrop-blur-sm">DRINK</div>
                                         )}
                                     </div>
                                     <div className="flex-1 flex flex-col justify-between">
                                         <div>
                                             <h4 className="font-bold text-sm text-[#2D2D2D] line-clamp-1">{item.name}</h4>
                                             <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                                         </div>
                                         <div className="flex justify-between items-end mt-2">
                                             <span className="text-[#BFA06D] font-bold text-xs">IDR {Number(item.price).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                                             <button 
                                                 onClick={(e) => {
                                                     e.stopPropagation();
                                                     setSelectedItem(item);
                                                 }}
                                                 className="bg-[#2D2D2D] text-white text-[10px] px-3 py-1.5 rounded-full uppercase font-bold tracking-wider hover:bg-[#BFA06D] transition-colors shadow-sm"
                                             >
                                                 Add
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                   </>
                 )}

                 {foodCart.length > 0 && (
                     <div className="bg-[#FAF9F6] p-6 border-t border-dashed border-gray-200">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ringkasan F&B</h4>
                         <div className="space-y-4">
                             {foodCart.map((item, idx) => (
                                 <div key={`${item.type}-${item.menuId}-${idx}`} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                     <div className="flex-1">
                                         <div className="flex items-center gap-2">
                                             <span className="text-lg">{item.type === 'drink' ? '🥤' : '🍛'}</span>
                                             <div>
                                                 <h5 className="font-bold text-sm text-[#2D2D2D]">{item.name}</h5>
                                                 {item.note && <p className="text-[10px] text-gray-500 italic">Note: {item.note}</p>}
                                                 <div className="text-xs text-[#BFA06D] font-medium mt-1">IDR {(item.price * item.qty).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
                                             </div>
                                         </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                         <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                                             <button onClick={() => updateFoodQty(idx, item.qty - 1)} className="px-3 py-1 hover:bg-gray-100 text-gray-500 font-bold">-</button>
                                             <span className="px-2 text-xs font-bold w-8 text-center">{item.qty}</span>
                                             <button onClick={() => updateFoodQty(idx, item.qty + 1)} className="px-3 py-1 hover:bg-gray-100 text-gray-500 font-bold">+</button>
                                         </div>
                                         <button onClick={() => removeFoodItem(idx)} className="text-red-400 hover:text-red-600 bg-red-50 p-1.5 rounded-full">
                                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                         </button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
              </motion.div>

              <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
              >
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest mb-6">Select Payment Method</h3>
                      <div className="space-y-4">
                          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${selectedMethod === 'bca' ? 'border-[#BFA06D] bg-[#BFA06D]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                              <div className="flex items-center gap-4">
                                  <input type="radio" name="payment" value="bca" checked={selectedMethod === 'bca'} onChange={(e) => setSelectedMethod(e.target.value)} className="w-5 h-5 text-[#BFA06D] focus:ring-[#BFA06D]" />
                                  <div className="flex flex-col">
                                      <span className="font-bold text-sm">Pay Now</span>
                                      <span className="text-xs text-gray-400">Transfer Bank / QRIS</span>
                                  </div>
                              </div>
                          </label>

                          <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${selectedMethod === 'hotel' ? 'border-[#BFA06D] bg-[#BFA06D]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                              <div className="flex items-center gap-4">
                                  <input type="radio" name="payment" value="hotel" checked={selectedMethod === 'hotel'} onChange={(e) => setSelectedMethod(e.target.value)} className="w-5 h-5 text-[#BFA06D] focus:ring-[#BFA06D]" />
                                  <div className="flex flex-col">
                                      <span className="font-bold text-sm">Pay at Hotel</span>
                                      <span className="text-xs text-gray-400">Bayar di hotel (Wajib Konfirmasi WA)</span>
                                  </div>
                              </div>
                              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          </label>
                      </div>
                  </div>
              </motion.div>
            </div>

            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="bg-[#2D2D2D] text-white p-8 rounded-3xl shadow-xl sticky top-8">
                <h3 className="font-serif text-lg mb-6">Order Summary</h3>
                
                <div className="space-y-4 text-sm opacity-80">
                  <div className="flex justify-between">
                    <span>Room / Main Charge</span>
                    <span>IDR {Number(roomTotalAmount).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                  </div>
                  {foodTotalAmount > 0 && (
                      <div className="flex justify-between text-[#BFA06D]">
                          <span>Food & Bev ({foodCart.reduce((a,b)=>a+b.qty,0)} items)</span>
                          <span>+ IDR {Number(foodTotalAmount).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                      </div>
                  )}
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>IDR 0</span>
                  </div>
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <div className="flex justify-between items-center font-bold text-white text-lg">
                      <span>Total</span>
                      <span className="text-[#BFA06D]">IDR {Number(grandTotal).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handlePaymentButtonClick}
                  disabled={isProcessingPayment} 
                  className={`w-full mt-8 py-4 rounded-xl font-bold uppercase tracking-[0.15em] transition-all shadow-lg hover:shadow-[#BFA06D]/30 flex items-center justify-center gap-2 
                      ${selectedMethod === 'hotel' 
                          ? 'bg-white text-[#2D2D2D] hover:bg-gray-100' 
                          : 'bg-[#BFA06D] hover:bg-[#A88B5D] text-white'
                      } ${isProcessingPayment ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isProcessingPayment ? (
                    <span className="animate-pulse">Processing...</span>
                  ) : selectedMethod === 'hotel' ? (
                      <span className="text-sm">Book Now</span>
                  ) : 'Pay Now'}
                </button>

                <p className="text-[10px] text-center mt-4 text-white/30">
                  By clicking the button, you agree to our Terms & Conditions.
                </p>
              </div>
            </motion.div>

          </div>
        </div>

        <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-[#1a1a1a]/90 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)} />
            
            <motion.div
              className="relative bg-[#FDFCF8] rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl flex flex-col max-h-[85vh]"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
                <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-8 h-8 rounded-full z-10 transition backdrop-blur flex items-center justify-center">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="h-56 bg-gray-200 flex-shrink-0 relative">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${getImageUrl(selectedItem.image)}')` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-8 right-8">
                       <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded border border-white text-white`}>
                           {selectedItem.type === 'drink' ? 'Beverage' : 'Food'}
                       </span>
                       <h2 className="text-2xl font-serif text-white mt-2 leading-tight">{selectedItem.name}</h2>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-gray-100">
                        <div className="text-2xl font-light text-[#2D2D2D]">
                            IDR {selectedItem.price.toLocaleString('id-ID')}
                        </div>
                    </div>

                    <div className="space-y-6">
                          <div>
                             <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2D2D] mb-3">Description</h4>
                             <p className="text-gray-600 leading-7 font-light text-justify text-sm">
                                {selectedItem.description || "Menu spesial dari Joglo Dhepis."}
                             </p>
                          </div>
                        
                          {selectedItem.type === 'drink' && (
                             <div className="bg-[#FAF9F6] p-5 rounded-lg border border-gray-100">
                                 {selectedItem.serving_type === 'both' && (
                                     <div className="mb-4">
                                         <h4 className="text-xs font-bold text-[#2D2D2D] mb-3 uppercase tracking-wider">Temperature :</h4>
                                         <div className="flex gap-2">
                                             <button onClick={() => setTempSelection('Ice')} className={`px-4 py-2 rounded text-xs font-bold transition flex-1 border ${tempSelection === 'Ice' ? 'bg-[#BFA06D] text-white border-[#BFA06D]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#BFA06D]'}`}>ICE</button>
                                             <button onClick={() => setTempSelection('Hot')} className={`px-4 py-2 rounded text-xs font-bold transition flex-1 border ${tempSelection === 'Hot' ? 'bg-[#BFA06D] text-white border-[#BFA06D]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#BFA06D]'}`}>HOT</button>
                                         </div>
                                     </div>
                                 )}

                                 {selectedItem.has_sugar_option && (
                                     <div>
                                         <h4 className="text-xs font-bold text-[#2D2D2D] mb-3 uppercase tracking-wider">Sugar Level :</h4>
                                         <div className="flex flex-wrap gap-2">
                                             {['Normal', 'Less Sugar', 'No Sugar'].map((level) => (
                                                 <button key={level} onClick={() => setSugarLevel(level)} className={`px-4 py-2 rounded text-xs font-bold transition border ${sugarLevel === level ? 'bg-[#BFA06D] text-white border-[#BFA06D]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#BFA06D]'}`}>{level}</button>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                          )}

                          {selectedItem.type === 'food' && selectedItem.has_flavor_option && (
                              <div className="bg-[#FAF9F6] p-5 rounded-lg border border-gray-100">
                                     <h4 className="text-xs font-bold text-[#2D2D2D] mb-3 uppercase tracking-wider">Level Pedas</h4>
                                     <div className="flex flex-wrap gap-2">
                                            {['Gurih', 'Sedang', 'Pedas'].map((flavor) => (
                                                <button
                                                    key={flavor}
                                                    onClick={() => setFlavorSelection(flavor)}
                                                    className={`px-4 py-2 rounded text-xs font-bold transition border ${
                                                        flavorSelection === flavor
                                                            ? 'bg-[#BFA06D] text-white border-[#BFA06D] shadow-sm'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-[#BFA06D] hover:text-[#BFA06D]'
                                                    }`}
                                                >
                                                    {flavor}
                                                </button>
                                            ))}
                                     </div>
                              </div>
                          )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button 
                            onClick={handleConfirmAddItem}
                            className="w-full bg-[#2D2D2D] text-white py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#BFA06D] transition-all duration-300 shadow-xl hover:shadow-[#BFA06D]/20 flex justify-between px-8 items-center rounded-lg"
                        >
                            <span>Add to Order</span>
                            <div className="flex gap-2 text-[10px] font-normal tracking-normal opacity-80">
                                {selectedItem.type === 'drink' && (
                                    <>
                                            <span className="bg-white/20 px-2 py-0.5 rounded">
                                                {selectedItem.serving_type === 'both' ? tempSelection : 
                                                selectedItem.serving_type === 'hot_only' ? 'HOT' : 'ICE'}
                                            </span>
                                            {selectedItem.has_sugar_option && sugarLevel !== 'Normal' && (
                                                <span className="bg-white/20 px-2 py-0.5 rounded">{sugarLevel}</span>
                                            )}
                                    </>
                                )}
                                {selectedItem.type === 'food' && selectedItem.has_flavor_option && (
                                    <span className="bg-white/20 px-2 py-0.5 rounded">{flavorSelection}</span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}