"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, 
  Clock, Coffee, Hotel, MoreHorizontal, Loader2,
  Calendar, User, LogOut, ChevronRight, DoorOpen, X,
  Wallet, Receipt, Phone, FileText, MessageSquare
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = "http://127.0.0.1:8000";

interface Order {
  id: number;
  status: string;
  created_at: string;
  total_amount_gateway: number;
  user_name: string;
  special_request: string;
  midtrans_id: string;
  hotel_items: any[];
  resto_items: any[];
  customer_name: string;
  customer_phone: string;
  room_number: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState(''); 

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminAccessToken');
    toast.success("Logout berhasil");
    router.push('/admin/login');
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminAccessToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      let url = `${API_URL}/api/admin/orders/`;
      if (filterStatus !== 'ALL') {
        url += `?status=${filterStatus}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        toast.error("Sesi admin berakhir.");
        handleLogout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setOrders(data.results || data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data pesanan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const filteredOrders = useMemo(() => {
    if (!filterDate) return orders;

    return orders.filter(order => {
        const hasHotelDate = order.hotel_items.some((item: any) => 
            item.check_in === filterDate
        );
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        
        return hasHotelDate || orderDate === filterDate;
    });
  }, [orders, filterDate]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if(!confirm(`Konfirmasi perubahan status pesanan #${orderId} menjadi ${newStatus}?`)) return;
    
    setIsUpdating(true);
    try {
        const token = localStorage.getItem('adminAccessToken');
        const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/update_status/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if(res.ok) {
            toast.success(`Status berhasil diperbarui`, {
                icon: '✨',
                style: { borderRadius: '10px', background: '#333', color: '#fff' }
            });
            fetchOrders();
            setSelectedOrder(null);
        } else {
            toast.error("Gagal mengubah status");
        }
    } catch(e) {
        toast.error("Terjadi kesalahan server");
    } finally {
        setIsUpdating(false);
    }
  };

  const isRestoOnly = (order: Order) => order.hotel_items.length === 0 && order.resto_items.length > 0;

  const formatRupiah = (num: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-[#E6F4EA] text-[#1E8E3E] border-[#1E8E3E]/20';
      case 'PENDING': return 'bg-[#FEF7E0] text-[#B08800] border-[#B08800]/20';
      case 'PAY_AT_HOTEL': return 'bg-[#E3F2FD] text-[#1565C0] border-[#1565C0]/20'; 
      case 'CANCEL': return 'bg-[#FCE8E6] text-[#C5221F] border-[#C5221F]/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
      switch (status) {
          case 'PAID': return <CheckCircle size={14}/>;
          case 'PENDING': return <Clock size={14}/>;
          case 'PAY_AT_HOTEL': return <Wallet size={14}/>;
          case 'CANCEL': return <XCircle size={14}/>;
          default: return <MoreHorizontal size={14}/>;
      }
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#2D2D2D] font-sans selection:bg-[#BFA06D] selection:text-white pb-20 lg:pb-0">
      <Toaster position="top-center" toastOptions={{ className: 'font-medium text-sm shadow-xl' }} />
      
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200/80 backdrop-blur-xl bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
             <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-[#2D2D2D] to-[#1A1A1A] rounded-xl flex items-center justify-center text-[#BFA06D] shadow-lg shadow-black/10">
                <Hotel size={18} strokeWidth={2.5} className="md:w-5 md:h-5" />
             </div>
             <div>
                <h1 className="text-base md:text-lg font-serif font-bold text-[#1a1a1a] tracking-tight leading-tight">Joglo Dhepis</h1>
                <p className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#BFA06D] font-bold">Admin Console</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">System Online</span>
            </div>
            <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>
            <button 
                onClick={handleLogout}
                className="group flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all duration-300"
            >
                <span className="text-xs font-bold hidden sm:block">Sign Out</span>
                <LogOut size={18} strokeWidth={2.5}/>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8 md:mb-10">
            <div className="space-y-1 md:space-y-2 w-full lg:w-auto">
                <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#1A1A1A]">Dashboard</h2>
                <p className="text-gray-500 text-xs md:text-sm font-medium">Overview booking kamar & layanan restoran.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                
                <div className="relative group w-full md:w-auto">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#BFA06D] transition-colors">
                        <Calendar size={16} />
                    </div>
                    <input 
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="pl-10 pr-10 py-2.5 md:py-3 bg-white border border-gray-200 hover:border-gray-300 focus:border-[#BFA06D] focus:ring-1 focus:ring-[#BFA06D] outline-none rounded-xl text-sm font-medium text-gray-700 w-full md:w-48 transition-all shadow-sm"
                    />
                    {filterDate && (
                        <button onClick={() => setFilterDate('')} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-red-500">
                            <X size={14} />
                        </button>
                    )}
                </div>

                <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto w-full md:w-auto scrollbar-hide">
                    {['ALL', 'PENDING', 'PAY_AT_HOTEL', 'PAID', 'CANCEL'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 md:px-4 py-2 text-[10px] md:text-[11px] font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${
                                filterStatus === status 
                                ? 'bg-[#2D2D2D] text-white shadow-md' 
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            {status === 'PAY_AT_HOTEL' ? 'PAY AT HOTEL' : status}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {loading ? (
           <div className="flex flex-col items-center justify-center py-20 md:py-40">
                <Loader2 className="animate-spin text-[#BFA06D] mb-4" size={40} strokeWidth={1.5}/>
                <p className="text-gray-400 text-xs md:text-sm font-medium tracking-wide animate-pulse uppercase">Memuat Data...</p>
           </div>
        ) : (
           <>
                <div className="hidden lg:block bg-white rounded-[2rem] shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-[#FAF9F6] border-b border-gray-200">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Order ID & Date</th>
                                    <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Guest Info</th>
                                    <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Items Detail</th>
                                    <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Total Amount</th>
                                    <th className="px-6 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">Status</th>
                                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="group hover:bg-[#FAF9F6] transition-colors duration-200 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                        <td className="px-8 py-6 align-top">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-sm font-bold text-[#1A1A1A]">#{order.id}</span>
                                                <div className="flex items-center gap-1 mt-1.5 text-gray-400 text-[11px] font-medium">
                                                    <Calendar size={12}/> {formatDate(order.created_at)}
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-6 py-6 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5E6D3] to-[#E6D0B3] text-[#8C6B40] flex items-center justify-center text-sm font-bold shadow-inner shrink-0">
                                                    {(isRestoOnly(order) ? (order.customer_name || order.user_name) : order.user_name).charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    {isRestoOnly(order) ? (
                                                        <>
                                                            <p className="text-sm font-bold text-[#2D2D2D]">{order.customer_name || order.user_name}</p>
                                                            <div className="flex flex-col gap-0.5 mt-1">
                                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                                                    <Phone size={10} className="text-[#BFA06D]" /> 
                                                                    {order.customer_phone || '-'}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                                                                    <DoorOpen size={10} className="text-[#BFA06D]" /> 
                                                                    {order.room_number || 'No Room Info'}
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <p className="text-sm font-bold text-[#2D2D2D]">{order.user_name}</p>
                                                            <p className="text-[11px] text-gray-400 font-medium">Verified Guest</p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-6 align-top">
                                            <div className="flex flex-wrap gap-2">
                                                {order.hotel_items.length > 0 && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wide">
                                                        <Hotel size={12}/> {order.hotel_items.length} Room
                                                    </span>
                                                )}
                                                {order.resto_items.length > 0 && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                                                        <Coffee size={12}/> {order.resto_items.length} F&B
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 align-top">
                                            <span className="text-sm font-serif font-bold text-[#1A1A1A]">{formatRupiah(order.total_amount_gateway)}</span>
                                        </td>
                                        <td className="px-6 py-6 align-top">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-sm ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 align-top text-right">
                                            <button className="text-gray-300 group-hover:text-[#BFA06D] transition-colors p-2 hover:bg-white rounded-full hover:shadow-sm border border-transparent hover:border-gray-100">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="lg:hidden space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.99] transition-transform relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#2D2D2D] text-[#BFA06D] flex items-center justify-center text-base font-bold shadow-md shadow-gray-200 shrink-0">
                                        {(isRestoOnly(order) ? (order.customer_name || order.user_name) : order.user_name).charAt(0).toUpperCase()}
                                    </div>
                                    <div className="w-full">
                                        {isRestoOnly(order) ? (
                                            <>
                                                <h3 className="font-bold text-[#1A1A1A] text-base leading-tight">{order.customer_name || order.user_name}</h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-gray-500">
                                                    <span className="flex items-center gap-1"><Phone size={10}/> {order.customer_phone || '-'}</span>
                                                    <span className="flex items-center gap-1"><DoorOpen size={10}/> {order.room_number || '-'}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="font-bold text-[#1A1A1A] text-base">{order.user_name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-mono text-[10px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">#{order.id}</span>
                                                    <span className="text-[10px] text-gray-400">{formatDate(order.created_at).split(',')[0]}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold border uppercase tracking-wide whitespace-nowrap ${getStatusColor(order.status)}`}>
                                    {order.status.replace(/_/g, ' ')}
                                </span>
                            </div>

                            <div className="flex gap-2 mb-4">
                                {order.hotel_items.length > 0 && (
                                    <div className="flex-1 bg-orange-50/50 border border-orange-100 py-2 px-3 rounded-lg flex items-center justify-center gap-2">
                                        <Hotel size={14} className="text-orange-600"/>
                                        <span className="text-[10px] font-bold text-orange-800">{order.hotel_items.length} Room</span>
                                    </div>
                                )}
                                {order.resto_items.length > 0 && (
                                    <div className="flex-1 bg-blue-50/50 border border-blue-100 py-2 px-3 rounded-lg flex items-center justify-center gap-2">
                                        <Coffee size={14} className="text-blue-600"/>
                                        <span className="text-[10px] font-bold text-blue-800">{order.resto_items.length} Menu</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Total</p>
                                    <p className="text-lg font-serif font-bold text-[#1A1A1A]">{formatRupiah(order.total_amount_gateway)}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                                    <ChevronRight size={16}/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Search size={32} strokeWidth={1.5}/>
                        </div>
                        <h3 className="text-lg font-serif font-bold text-[#1A1A1A]">Tidak ada data</h3>
                        <p className="text-gray-400 text-xs mt-1 max-w-xs mx-auto">
                            Coba ubah filter status atau tanggal.
                        </p>
                        {(filterDate || filterStatus !== 'ALL') && (
                            <button onClick={() => { setFilterDate(''); setFilterStatus('ALL'); }} className="mt-4 px-5 py-2 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-600 shadow-sm hover:shadow-md transition-all">
                                Reset Filter
                            </button>
                        )}
                    </div>
                )}
           </>
        )}
      </main>

      <AnimatePresence>
        {selectedOrder && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-[#1a1a1a]/80 backdrop-blur-sm"
                onClick={() => setSelectedOrder(null)}
            >
                <motion.div 
                    initial={{ y: "100%" }} 
                    animate={{ y: 0 }} 
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="bg-[#FDFCF8] w-full sm:max-w-2xl sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-[#2D2D2D] z-0 overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col h-full">
                        
                        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6 flex justify-between items-start text-white shrink-0">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BFA06D] mb-1">Invoice</p>
                                <h2 className="text-2xl sm:text-3xl font-serif font-bold">#{selectedOrder.id}</h2>
                                <p className="text-white/50 text-[10px] font-mono mt-0.5">{selectedOrder.midtrans_id || 'MANUAL'}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(null)} 
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6 space-y-6 bg-[#FDFCF8] rounded-t-[1.5rem] sm:rounded-t-[2rem]">
                            
                            <div className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border ${getStatusColor(selectedOrder.status)}`}>
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 sm:p-2 bg-white rounded-full shadow-sm">
                                        {getStatusIcon(selectedOrder.status)}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Status</p>
                                        <p className="font-bold text-xs sm:text-sm">{selectedOrder.status.replace(/_/g, ' ')}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-70">Method</p>
                                    <p className="font-bold text-xs sm:text-sm">
                                        {selectedOrder.status === 'PAY_AT_HOTEL' ? 'Pay at Hotel' : 'Gateway'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1.5">Customer</h3>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#BFA06D] flex items-center justify-center text-base font-bold shrink-0">
                                            {(isRestoOnly(selectedOrder) ? (selectedOrder.customer_name || selectedOrder.user_name) : selectedOrder.user_name).charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {isRestoOnly(selectedOrder) ? (
                                                <>
                                                    <p className="font-bold text-base text-[#2D2D2D] truncate">{selectedOrder.customer_name || selectedOrder.user_name}</p>
                                                    <div className="space-y-1 mt-1.5 mb-2">
                                                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                            <Phone size={12} className="text-[#BFA06D] shrink-0"/> 
                                                            <span className="font-mono truncate">{selectedOrder.customer_phone || '-'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                                                            <DoorOpen size={12} className="text-[#BFA06D] shrink-0"/> 
                                                            <span className="truncate">{selectedOrder.room_number ? `${selectedOrder.room_number}` : 'No Room'}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-bold text-base text-[#2D2D2D] truncate">{selectedOrder.user_name}</p>
                                                    <p className="text-xs text-gray-500 mb-2">Guest User</p>
                                                </>
                                            )}
                                            
                                            {selectedOrder.special_request && (
                                                <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg space-y-1.5 mt-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <FileText size={12} className="text-amber-600"/>
                                                        <p className="text-[9px] font-bold text-amber-800 uppercase">Note</p>
                                                    </div>
                                                    <p className="text-[11px] text-amber-900 leading-relaxed font-medium bg-white/60 p-1.5 rounded border border-amber-100/50">
                                                        {selectedOrder.special_request}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1.5">Items</h3>
                                    
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                        {selectedOrder.hotel_items.map((item: any, idx) => (
                                            <div key={idx} className="flex justify-between items-start">
                                                <div className="flex gap-2.5">
                                                    <div className="w-7 h-7 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                        <Hotel size={14}/>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-[#2D2D2D] leading-tight">{item.room_detail.name}</p>
                                                        <p className="text-[9px] text-gray-500 mt-0.5">{item.check_in}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] font-bold text-[#2D2D2D] whitespace-nowrap">{formatRupiah(item.price_at_booking)}</p>
                                            </div>
                                        ))}

                                        {selectedOrder.resto_items.map((item: any, idx) => (
                                            <div key={idx} className="flex justify-between items-start">
                                                <div className="flex gap-2.5">
                                                    <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                                        <Coffee size={14}/>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-[#2D2D2D] leading-tight">{item.menu_detail?.name || item.drink_detail?.name}</p>
                                                        <p className="text-[9px] text-gray-500 mt-0.5">x{item.quantity} {item.note && `(${item.note})`}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[11px] font-bold text-[#2D2D2D] whitespace-nowrap">{formatRupiah(item.price_at_booking)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6 bg-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 safe-area-bottom">
                            <div className="w-full sm:w-auto flex justify-between sm:block items-center">
                                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Total</p>
                                <p className="text-2xl font-serif font-bold text-[#1A1A1A]">{formatRupiah(selectedOrder.total_amount_gateway)}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PAY_AT_HOTEL') && (
                                    <>
                                        <button 
                                            disabled={isUpdating}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCEL')}
                                            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            disabled={isUpdating}
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'PAID')}
                                            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#1A1A1A] text-[#BFA06D] font-bold text-xs hover:bg-black hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isUpdating ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14}/>}
                                            Mark PAID
                                        </button>
                                    </>
                                )}
                                {selectedOrder.status === 'PAID' && (
                                    <button disabled className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E6F4EA] text-[#1E8E3E] font-bold text-xs flex items-center justify-center gap-2 border border-[#1E8E3E]/20 opacity-80">
                                        <CheckCircle size={14}/> Verified
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}