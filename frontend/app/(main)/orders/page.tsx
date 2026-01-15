'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import Script from 'next/script';
import { 
  Calendar, Clock, Hotel, Utensils, Car, FileText, User, 
  AlertCircle, CheckCircle2, XCircle, ShoppingBag, Info, 
  CreditCard, Ban, Timer, Loader2, AlertTriangle, MessageCircle, Wallet
} from 'lucide-react';

import { API_URL, MIDTRANS_CLIENT_KEY, HOTEL_WA_NUMBER } from '@/lib/config';

declare global {
  interface Window {
    snap: any;
  }
}

interface RoomDetail { id: number; name: string; type: string; }
interface MenuDetail { id: number; name: string; }
interface DrinkDetail { id: number; name: string; }
interface VWDetail { id: number; name: string; }

interface OrderItemHotel {
  id: number; room_detail: RoomDetail; check_in: string; check_out: string; price_at_booking: string;
}

interface OrderItemResto {
  id: number; 
  menu_detail: MenuDetail | null; 
  drink_detail: DrinkDetail | null; 
  quantity: number; 
  price_at_booking: string;
  note?: string; 
}

interface OrderItemVW {
  id: number; vw_detail: VWDetail; trip_date: string; total_unit: number; price_at_booking: string;
}

interface Order {
  id: number;
  status: 'CART' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCEL' | 'PAY_AT_HOTEL';
  created_at: string;
  total_amount_gateway: string;
  user_name?: string;
  customer_name?: string;
  special_request?: string;
  midtrans_id?: string;
  payment_method?: string;
  hotel_items: OrderItemHotel[];
  resto_items: OrderItemResto[];
  vw_items: OrderItemVW[];
}

const CountdownTimer = ({ createdAt, onExpire }: { createdAt: string, onExpire: () => void }) => {
  const [timeLeft, setTimeLeft] = useState<string>("--:--");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const created = new Date(createdAt).getTime();
      const expireTime = created + 10 * 60 * 1000;
      const now = new Date().getTime();
      const distance = expireTime - now;

      if (distance < 0) {
        setTimeLeft("00:00");
        onExpire();
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [createdAt, onExpire]);

  return <span className="font-mono font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-red-100">{timeLeft}</span>;
};

function OrderHistoryContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
  const checkedOrdersRef = useRef<Set<number>>(new Set());
  const hasShownToast = useRef(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchOrders = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) { router.push('/auth/login'); return; }
      
      const res = await fetch(`${API_URL}/api/orders/`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [router]);

  const updateOrderStatus = async (midtransOrderId: string) => {
    try {
        const token = localStorage.getItem('accessToken');
        await fetch(`${API_URL}/api/transactions/check-status/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ order_id: midtransOrderId })
        });
        fetchOrders();
    } catch (error) {
        console.error(error);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
        orders.forEach(order => {
            if (order.status === 'PENDING' && order.midtrans_id && order.payment_method !== 'hotel' && !checkedOrdersRef.current.has(order.id)) {
                checkedOrdersRef.current.add(order.id);
                updateOrderStatus(order.midtrans_id);
            }
        });
    }
  }, [orders]);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    
    if (statusParam && !hasShownToast.current) {
        hasShownToast.current = true;
        if (statusParam === 'success') toast.success("Pembayaran Berhasil!");
        else if (statusParam === 'pending') toast("Menunggu Pembayaran...", { icon: '⏳' });
        else if (statusParam === 'failed') toast.error("Pembayaran Gagal.");
        else if (statusParam === 'hotel_booked') toast.success("Pesanan Diterima! Silakan konfirmasi via WhatsApp.", { duration: 5000 });
        
        router.replace('/orders');
    }
  }, [searchParams, router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const requestCancelOrder = (orderId: number) => {
    setOrderToCancel(orderId);
  };

  const executeCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setProcessingId(orderToCancel);
    setOrderToCancel(null); 

    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/orders/${orderToCancel}/cancel/`, {
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (res.ok) { toast.success("Pesanan dibatalkan"); fetchOrders(); }
      else toast.error("Gagal membatalkan");
    } catch (e) { toast.error("Error sistem"); } finally { setProcessingId(null); }
  };

  const handleContinuePayment = async (orderId: number) => {
    if (typeof window !== 'undefined' && !window.snap) {
        toast.loading("Sistem pembayaran sedang dimuat, coba sesaat lagi...");
        return;
    }

    setProcessingId(orderId);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`${API_URL}/api/orders/${orderId}/pay/`, {
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        const data = await res.json();
        
        if (window.snap && data.token) {
            window.snap.pay(data.token, {
                onSuccess: async function(result: any) {
                    toast.success("Pembayaran Berhasil!");
                    await updateOrderStatus(result.order_id);
                },
                onPending: async function(result: any) {
                    toast("Menunggu pembayaran...", { icon: '⏳' });
                    await updateOrderStatus(result.order_id);
                },
                onError: function(result: any) {
                    toast.error("Pembayaran Gagal");
                },
                onClose: function() {
                    fetchOrders(); 
                }
            });
        } else {
            if(data.redirect_url) window.location.href = data.redirect_url;
        }

      } else {
          const errData = await res.json();
          toast.error(errData.error || "Gagal memproses pembayaran");
      }
    } catch (e) { 
        toast.error("Koneksi error"); 
    } finally { 
        setProcessingId(null); 
    }
  };

  const sendWhatsAppConfirmation = (order: Order) => {
    let details = "";
    
    if (order.hotel_items && order.hotel_items.length > 0) {
        order.hotel_items.forEach((item) => {
            details += `\n🏨 ${item.room_detail.name} (Check-in: ${item.check_in})`;
        });
    }

    let foodDetails = "";
    if (order.resto_items && order.resto_items.length > 0) {
        foodDetails += "\n\n🍽️ *F&B Items:*";
        order.resto_items.forEach(item => {
            const name = item.menu_detail?.name || item.drink_detail?.name || 'Item';
            const icon = item.drink_detail ? '🥤' : '🍛';
            const noteText = item.note ? ` _(${item.note})_` : '';
            foodDetails += `\n${icon} ${name}${noteText} (${item.quantity}x)`;
        });
    }

    let noteDetails = order.special_request ? `\n\n📝 *Catatan:*\n${order.special_request}` : "";

    const message = `Halo Joglo Dhepis, saya ingin konfirmasi pesanan (Pay at Hotel).

🛎️ *Order ID:* #${order.id}
👤 *Nama:* ${order.user_name || 'Guest'}

${details}${foodDetails}${noteDetails}

💰 *Total Tagihan:* ${formatRupiah(order.total_amount_gateway)}

Mohon diproses. Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${HOTEL_WA_NUMBER}?text=${encodedMessage}`;
    window.open(waUrl, '_blank');
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const formatRupiah = (amount: string) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(parseFloat(amount));
  
  const getStatusConfig = (order: Order) => {
    switch (order.status) {
      case 'PAY_AT_HOTEL':
        return {
            cardStyle: 'bg-blue-50 border-blue-200',
            badgeStyle: 'bg-blue-100 text-blue-800 border-blue-200',
            icon: <Wallet size={16} />,
            label: 'Pay at Hotel'
        };
      case 'PAID': 
        return { 
          cardStyle: 'bg-green-50 border-green-300', 
          badgeStyle: 'bg-green-100 text-green-800 border-green-200', 
          icon: <CheckCircle2 size={16} />, 
          label: 'Lunas' 
        };
      case 'PENDING': 
        return { 
          cardStyle: 'bg-yellow-50 border-yellow-300', 
          badgeStyle: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: <Clock size={16} />, 
          label: 'Menunggu Bayar' 
        };
      case 'FAILED': 
        return { 
          cardStyle: 'bg-red-50 border-red-300', 
          badgeStyle: 'bg-red-100 text-red-800 border-red-200', 
          icon: <XCircle size={16} />, 
          label: 'Gagal' 
        };
      case 'CANCEL': 
        return { 
          cardStyle: 'bg-red-50 border-red-300', 
          badgeStyle: 'bg-red-100 text-red-800 border-red-200', 
          icon: <Ban size={16} />, 
          label: 'Dibatalkan' 
        };
      default: 
        return { 
          cardStyle: 'bg-gray-50 border-gray-200', 
          badgeStyle: 'bg-gray-100 text-gray-600 border-gray-200', 
          icon: <AlertCircle size={16} />, 
          label: order.status 
        };
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]"><Loader2 className="animate-spin text-[#BFA06D]" /></div>;

  return (
    <div className="min-h-screen bg-[#FDFCF8] pt-28 pb-16 px-4 md:px-8">
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <Toaster position="top-center" />
      
      {orderToCancel && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setOrderToCancel(null)}
          ></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-red-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Batalkan Pesanan?</h3>
              <p className="text-gray-500 text-sm mb-6">
                Apakah Anda yakin ingin membatalkan pesanan <span className="font-mono font-bold text-gray-700">#{orderToCancel}</span>? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setOrderToCancel(null)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                >
                  Tidak, Kembali
                </button>
                <button 
                  onClick={executeCancelOrder}
                  className="flex-1 px-4 py-2.5 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2D2D] mb-10">Riwayat Pemesanan</h1>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
              <ShoppingBag className="mx-auto text-gray-300 mb-4" size={32} />
              <p className="text-gray-900 font-medium">Belum ada riwayat pemesanan</p>
              <button onClick={() => router.push('/')} className="mt-6 px-8 py-3 bg-[#BFA06D] text-white rounded-full font-medium shadow-lg hover:bg-[#a68b5d]">Mulai Pesan</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = getStatusConfig(order); 
              const isProcessing = processingId === order.id;
              
              return (
                <div key={order.id} className={`rounded-3xl border-2 shadow-sm overflow-hidden mb-6 transition-all ${status.cardStyle}`}>
                  <div className="px-6 py-5 border-b border-black/5 flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm w-full sm:w-auto">
                      <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-black/5 shadow-sm">
                        <FileText size={14} className="text-[#BFA06D]" />
                        <span className="font-mono font-medium text-gray-800">#{order.id}</span>
                      </div>
                      <span className="hidden sm:block text-gray-600 font-medium">{formatDate(order.created_at)}</span>
                      <div className="flex items-center gap-2 sm:pl-4 sm:border-l sm:border-black/10">
                        <User size={14} className="text-gray-500" />
                        <span className="font-medium text-gray-800">
                          {order.customer_name || order.user_name || 'Guest'}
                        </span>
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${status.badgeStyle} text-xs font-bold uppercase`}>
                      {status.icon} {status.label}
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {order.status === 'PENDING' && (
                        <div className="flex items-start gap-3 bg-white p-4 rounded-xl border border-yellow-200 shadow-sm text-yellow-800">
                            <Timer className="shrink-0 mt-0.5 animate-pulse text-yellow-600" size={20} />
                            <div className="w-full">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-bold text-sm text-yellow-900">Selesaikan Pembayaran</p>
                                    <CountdownTimer 
                                        createdAt={order.created_at} 
                                        onExpire={() => fetchOrders()} 
                                    />
                                </div>
                                <p className="text-xs leading-relaxed opacity-90 text-yellow-700">
                                    Pesanan otomatis dibatalkan jika tidak dibayar dalam waktu yang ditentukan.
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {order.status === 'PAY_AT_HOTEL' && (
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 items-start">
                            <Info className="text-blue-500 mt-0.5 shrink-0" size={18} />
                            <div>
                                <p className="font-bold text-blue-800 text-sm">Konfirmasi Diperlukan</p>
                                <p className="text-blue-600 text-xs mt-1">
                                    Anda wajib melakukan konfirmasi pesanan melalui WhatsApp agar pesanan diproses oleh resepsionis.
                                </p>
                            </div>
                        </div>
                    )}

                    {order.hotel_items?.map(item => (
                        <div key={item.id} className="flex flex-col sm:flex-row justify-between p-5 bg-white rounded-xl border border-gray-100 shadow-sm items-start sm:items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Hotel size={16} className="text-[#BFA06D]"/>
                                    <p className="font-bold text-[#2D2D2D] text-lg">{item.room_detail?.name}</p>
                                </div>
                                <p className="text-sm text-gray-500">Check-in: <span className="font-medium text-gray-800">{item.check_in}</span> • Out: <span className="font-medium text-gray-800">{item.check_out}</span></p>
                            </div>
                            <p className="font-bold text-[#BFA06D] text-lg mt-2 sm:mt-0">{formatRupiah(item.price_at_booking)}</p>
                        </div>
                    ))}

                    {order.special_request && (
                      <div className="flex gap-3 bg-white p-4 rounded-xl border border-gray-200/60">
                        <Info className="text-[#BFA06D] shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Catatan Khusus</p>
                          <p className="text-sm text-gray-700 italic">"{order.special_request}"</p>
                        </div>
                      </div>
                    )}

                    {order.resto_items?.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                                <Utensils size={16} className="text-orange-500" />
                                <h4 className="font-bold text-gray-800">Pesanan Resto</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {order.resto_items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-orange-500 text-xs font-bold border border-orange-100 shadow-sm">{item.quantity}x</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{item.menu_detail?.name || item.drink_detail?.name}</p>
                                                {item.note && (
                                                    <p className="text-[11px] text-[#BFA06D] italic mt-0.5">Note: {item.note}</p>
                                                )}
                                                <p className="text-[10px] text-gray-400 uppercase mt-0.5">{item.drink_detail ? 'Minuman' : 'Makanan'}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">{formatRupiah(item.price_at_booking)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {order.vw_items?.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-5 bg-white rounded-xl border border-blue-100 shadow-sm">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Car size={16} className="text-blue-500"/>
                                    <p className="font-bold text-gray-800">{item.vw_detail?.name}</p>
                                </div>
                                <p className="text-sm text-gray-500">Trip: <span className="font-medium text-blue-600">{item.trip_date}</span> • {item.total_unit} Unit</p>
                            </div>
                            <p className="text-lg font-bold text-blue-600">{formatRupiah(item.price_at_booking)}</p>
                        </div>
                    ))}

                    <div className="pt-6 border-t border-black/10 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6">
                      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            {(order.status === 'PENDING' || order.status === 'PAY_AT_HOTEL') && (
                                <button 
                                    disabled={isProcessing} 
                                    onClick={() => requestCancelOrder(order.id)} 
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold shadow-sm disabled:opacity-50 w-full sm:w-auto transition-all"
                                >
                                    {isProcessing ? <Loader2 size={16} className="animate-spin"/> : <Ban size={16}/>} Batalkan
                                </button>
                            )}

                            {order.status === 'PENDING' && (
                                <button disabled={isProcessing} onClick={() => handleContinuePayment(order.id)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#BFA06D] text-white hover:bg-[#a68b5d] shadow-lg shadow-[#BFA06D]/20 text-sm font-bold disabled:opacity-50 w-full sm:w-auto transition-all">
                                    {isProcessing ? <Loader2 size={16} className="animate-spin"/> : <CreditCard size={16}/>} Bayar Online
                                </button>
                            )}

                            {(order.status === 'PENDING' || order.status === 'PAY_AT_HOTEL') && (
                                <button 
                                    onClick={() => sendWhatsAppConfirmation(order)} 
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#25D366] text-white hover:bg-[#128c7e] shadow-lg text-sm font-bold w-full sm:w-auto transition-all"
                                >
                                    <MessageCircle size={16} /> Konfirmasi WA
                                </button>
                            )}
                      </div>
                      
                      <div className="text-right w-full sm:w-auto">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Total Pembayaran</p>
                        <p className="text-2xl font-serif font-bold text-[#2D2D2D] bg-white/50 inline-block px-2 rounded-lg">{formatRupiah(order.total_amount_gateway)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
            <Loader2 className="animate-spin text-[#BFA06D]" />
        </div>
    }>
      <OrderHistoryContent />
    </Suspense>
  );
}