"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useBooking } from '@/context/BookingContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

import { API_URL } from '@/lib/config';

interface Facility {
  id: number;
  name: string;
}

interface RoomImage {
  id: number;
  image: string;
}

interface RoomType {
  id: number;
  name: string;
  category: string;
  location: string;
  price: number;
  capacity: number;
  description: string;
  image: string | null;
  images: RoomImage[];
  facilities: Facility[];
  total_rooms: number;
}

const fadeInUp: Variants = { 
  hidden: { opacity: 0, y: 40 }, 
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
  } 
};

const staggerContainer: Variants = { 
  hidden: { opacity: 0 }, 
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1 } 
  } 
};

const cardVariant: Variants = { 
  hidden: { opacity: 0, y: 20 }, 
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  } 
};

function SearchContent() {
  const router = useRouter();
  const searchParamsUrl = useSearchParams();
  const { addToCart, cart } = useBooking();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [showToast, setShowToast] = useState<{show: boolean, message: string}>({show: false, message: ''});

  const [searchParams, setSearchParams] = useState({
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  useEffect(() => {
    const checkInParam = searchParamsUrl.get('checkIn');
    const checkOutParam = searchParamsUrl.get('checkOut');
    const guestsParam = searchParamsUrl.get('guests');

    if (checkInParam || checkOutParam || guestsParam) {
      const initialParams = {
        checkIn: checkInParam || '',
        checkOut: checkOutParam || '',
        guests: guestsParam || ''
      };
      setSearchParams(initialParams);

      const guestCount = parseInt(guestsParam || '0', 10);
      if (guestCount >= 3) {
        setSelectedFilter('family');
      } else if (guestCount > 0) {
        setSelectedFilter('standard');
      }

      fetchRooms(initialParams);
    } else {
      fetchRooms();
    }
  }, []);

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder-room.jpg";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  const fetchRooms = useCallback(async (params?: typeof searchParams) => {
    setLoading(true);
    try {
      const url = new URL(`${API_URL}/api/rooms/`);
      
      if (params) {
        if (params.checkIn) url.searchParams.append('check_in', params.checkIn);
        if (params.checkOut) url.searchParams.append('check_out', params.checkOut);
        if (params.guests) url.searchParams.append('capacity', params.guests.toString());
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();

      const mappedData = data.map((item: any) => ({
        ...item,
        price: Number(item.price_per_night || item.price || 0),
        category: (item.category || 'standard').toLowerCase(),
        location: item.location || 'lantai 1',
        total_rooms: Number(item.total_rooms || 0),
      }));

      setRooms(mappedData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = () => {
    fetchRooms(searchParams);
    
    const guestCount = parseInt(searchParams.guests || '0', 10);
    if (guestCount >= 3) {
      setSelectedFilter('family');
    } else {
      setSelectedFilter('standard');
    }
  };

  const filteredRooms = useMemo(() => {
    if (selectedFilter === 'all') return rooms;
    return rooms.filter(room => 
      room.category.includes(selectedFilter.toLowerCase())
    );
  }, [rooms, selectedFilter]);

  const modalImages = useMemo(() => {
    if (!selectedRoom) return [];
    const mainImg = selectedRoom.image ? [selectedRoom.image] : [];
    const galleryImgs = (selectedRoom.images || []).map(img => img.image);
    return [...mainImg, ...galleryImgs];
  }, [selectedRoom]);

  useEffect(() => {
    if (selectedRoom) setCurrentSlide(0);
  }, [selectedRoom]);

  const nextSlide = () => {
    if (modalImages.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % modalImages.length);
  };

  const prevSlide = () => {
    if (modalImages.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  };

  const calculateNights = (inDate: string, outDate: string) => {
    const start = new Date(inDate);
    const end = new Date(outDate);
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24)) || 1;
  };

  const triggerToast = (message: string) => {
    setShowToast({ show: true, message });
    setTimeout(() => {
      setShowToast({ show: false, message: '' });
    }, 3000);
  };

  const isRoomInCart = (roomId: number) => {
    return cart.some(item => item.roomId === roomId);
  };

  return (
    <>
      <AnimatePresence>
        {showToast.show && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-24 left-0 right-0 z-[100] flex justify-center pointer-events-none"
          >
            <div className="bg-[#2D2D2D] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-[#BFA06D]/30 backdrop-blur-md">
              <div className="w-5 h-5 bg-[#BFA06D] rounded-full flex items-center justify-center text-black font-bold text-xs">✓</div>
              <span className="text-sm font-medium tracking-wide">{showToast.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: 'url("/heroRoom.jpg")' }} 
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="mb-6 flex justify-center">
              <span className="px-4 py-1.5 border border-[#BFA06D]/50 text-[#BFA06D] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] rounded-full bg-black/20 backdrop-blur-sm">
                The Art of Stay
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-[1.1] tracking-tight">
              Where Comfort <br/>
              <span className="italic font-light text-[#BFA06D]">Meets</span> Tradition
            </h1>
            <p className="text-gray-200 text-sm md:text-base max-w-lg mx-auto leading-relaxed tracking-wide font-light">
              Rasakan kehangatan suasana seperti di rumah sendiri. <i>A perfect sanctuary</i> untuk melepas penat dengan pelayanan sepenuh hati.
            </p>
          </motion.div>
        </div>
      </section>

      <motion.div 
        className="relative z-30 -mt-10 mb-12"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className="w-[95%] max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="px-2">
              <label className="block text-xs text-[#BFA06D] uppercase font-semibold mb-2 tracking-wider">Check in</label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 border border-gray-100">
                <input 
                  type="date" 
                  name="checkIn"
                  value={searchParams.checkIn}
                  onChange={handleSearchChange}
                  className="w-full h-12 bg-transparent text-[#2D2D2D] outline-none font-medium text-base cursor-pointer placeholder-gray-400" 
                />
              </div>
            </div>

            <div className="px-2">
              <label className="block text-xs text-[#BFA06D] uppercase font-semibold mb-2 tracking-wider">Check out</label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 border border-gray-100">
                <input 
                  type="date" 
                  name="checkOut"
                  value={searchParams.checkOut}
                  onChange={handleSearchChange}
                  className="w-full h-12 bg-transparent text-[#2D2D2D] outline-none font-medium text-base cursor-pointer placeholder-gray-400" 
                />
              </div>
            </div>

            <div className="px-2">
              <label className="block text-xs text-[#BFA06D] uppercase font-semibold mb-2 tracking-wider">Guests</label>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 border border-gray-100">
                <input 
                  type="number"
                  min="1" 
                  name="guests"
                  value={searchParams.guests}
                  onChange={handleSearchChange}
                  placeholder="e.g. 2" 
                  className="w-full h-12 bg-transparent text-[#2D2D2D] outline-none font-medium text-base placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end">
                <button 
                  onClick={handleSearchSubmit}
                  className="w-full bg-[#2D2D2D] text-white h-12 rounded-xl text-sm font-semibold hover:bg-[#BFA06D] transition shadow-lg whitespace-nowrap flex items-center justify-center"
                >
                  Check Availability
                </button>
            </div>

          </div>
        </div>
      </motion.div>

      <div className="sticky top-0 z-40 bg-[#FDFCF8]/80 backdrop-blur-xl border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-6 overflow-x-auto no-scrollbar">
          <div className="flex justify-center min-w-max gap-2 md:gap-4">
            {['all', 'standard', 'family'].map((filterId) => (
              <button
                key={filterId}
                onClick={() => setSelectedFilter(filterId)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 relative group overflow-hidden ${
                  selectedFilter === filterId
                    ? 'text-white shadow-lg shadow-[#2D2D2D]/20'
                    : 'text-gray-500 hover:text-[#2D2D2D] hover:bg-gray-100'
                }`}
              >
                {selectedFilter === filterId && (
                  <motion.div
                    layoutId="activeFilter"
                    className="absolute inset-0 bg-[#2D2D2D]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 capitalize tracking-wide">
                  {filterId === 'all' ? 'Show All' : filterId}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <button 
            onClick={() => router.push('/booking')}
            className="bg-[#BFA06D] hover:bg-[#A88B5D] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            </div>
            <span className="font-bold uppercase text-sm tracking-wide">Checkout</span>
          </button>
        </motion.div>
      )}

      <section className="py-24 px-4 md:px-8 max-w-[1400px] mx-auto min-h-screen">
        {loading ? (
           <div className="flex flex-col justify-center items-center h-64 gap-4">
             <div className="w-16 h-16 border-2 border-gray-100 border-t-[#BFA06D] rounded-full animate-spin" />
             <p className="text-xs uppercase tracking-widest text-gray-400 animate-pulse">Checking Availability...</p>
           </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
             <div className="text-6xl mb-4 opacity-20">❖</div>
             <p className="text-xl font-serif text-gray-400">Tidak ada kamar tersedia untuk pencarian ini.</p>
             <button onClick={() => {
                setSearchParams({ checkIn: '', checkOut: '', guests: '' });
                fetchRooms();
                setSelectedFilter('all');
             }} className="mt-4 text-xs uppercase tracking-widest border-b border-[#BFA06D] pb-1 hover:text-[#BFA06D]">
                Reset Search
             </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12" 
            variants={staggerContainer} 
            initial="hidden" 
            animate="visible"
          >
            <AnimatePresence mode="popLayout">
              {filteredRooms.map((room) => {
                const inCart = isRoomInCart(room.id);
                const isFullyBooked = room.total_rooms <= 0;
                
                const isClickable = !inCart && !isFullyBooked;

                return (
                  <motion.div 
                    key={room.id} 
                    variants={cardVariant}
                    layoutId={`room-${room.id}`}
                    className={`group relative flex flex-col transition-all duration-300 
                      ${!isClickable ? 'cursor-not-allowed opacity-60 grayscale' : 'cursor-pointer'}
                    `}
                    onClick={() => {
                      if (isClickable) setSelectedRoom(room);
                    }}
                  >
                    <div className="relative aspect-[4/5] md:aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 mb-6">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                      <div 
                        className="w-full h-full bg-cover bg-center transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110" 
                        style={{ backgroundImage: `url('${getImageUrl(room.image)}')` }} 
                      />
                      
                      <div className="absolute top-4 left-4 z-20">
                        {inCart ? (
                           <span className="px-3 py-1 bg-gray-800/90 text-white text-[10px] font-bold uppercase tracking-widest border border-gray-600">
                             Selected
                           </span>
                        ) : isFullyBooked ? (
                           <span className="px-3 py-1 bg-[#2D2D2D] text-white text-[10px] font-bold uppercase tracking-widest border border-gray-500 shadow-lg">
                             Fully Booked
                           </span>
                        ) : (
                           <span className="px-3 py-1 bg-white/90 text-[#2D2D2D] text-[10px] font-bold uppercase tracking-widest">
                             Available: {room.total_rooms}
                           </span>
                        )}
                      </div>

                      {isClickable && (
                        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 flex justify-between items-end">
                            <span className="text-white text-xs uppercase tracking-wider border-b border-white pb-1">Lihat Detail</span>
                        </div>
                      )}

                      {inCart && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-30 flex items-center justify-center">
                           <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg">
                             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Already in Cart</span>
                           </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className={`text-2xl font-serif mb-2 transition-colors ${inCart ? 'text-gray-400' : 'text-[#2D2D2D] group-hover:text-[#BFA06D]'}`}>
                          {room.name}
                        </h3>
                        <div className={`flex items-center text-xs font-medium tracking-wide ${inCart ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {room.capacity} Guests
                          </span>
                          <span className="mx-2 text-gray-300">|</span>
                          <span>{room.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${inCart ? 'text-gray-400' : 'text-[#2D2D2D]'}`}>
                          IDR {(room.price).toLocaleString('id-ID')}
                        </p>
                        <p className="text--[10px] text-gray-400 uppercase tracking-wide">/ Malam</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-[#1a1a1a]/90 backdrop-blur-sm transition-opacity" 
              onClick={() => setSelectedRoom(null)} 
            />
            
            <motion.div
              layoutId={`room-${selectedRoom.id}`}
              className="relative bg-[#FDFCF8] w-full max-w-6xl max-h-[90vh] md:max-h-[85vh] shadow-2xl overflow-hidden flex flex-col md:flex-row"
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <button
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white md:text-[#2D2D2D] md:bg-gray-100 md:hover:bg-gray-200 transition-all border border-white/20 md:border-transparent"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="w-full md:w-[55%] h-[40vh] md:h-auto relative bg-gray-900 group">
                <AnimatePresence mode="wait">
                  {modalImages.length > 0 ? (
                    <motion.div 
                      key={currentSlide}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${getImageUrl(modalImages[currentSlide])}')` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                    </motion.div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-white/50">No Image</div>
                  )}
                </AnimatePresence>

                {modalImages.length > 1 && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button onClick={prevSlide} className="w-12 h-12 rounded-full border border-white/30 bg-black/20 backdrop-blur hover:bg-white hover:text-black text-white flex items-center justify-center transition-all">❮</button>
                      <button onClick={nextSlide} className="w-12 h-12 rounded-full border border-white/30 bg-black/20 backdrop-blur hover:bg-white hover:text-black text-white flex items-center justify-center transition-all">❯</button>
                    </div>
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3">
                      {modalImages.map((_, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-1 transition-all duration-300 rounded-full shadow-sm ${currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/80'}`} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="w-full md:w-[45%] flex flex-col bg-[#FDFCF8]">
                <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar flex-grow">
                  <div className="mb-8">
                    <span className="text-[#BFA06D] font-bold uppercase tracking-[0.2em] text-xs mb-2 block">
                      {selectedRoom.category} Collection
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif text-[#2D2D2D] leading-tight">
                      {selectedRoom.name}
                    </h2>
                  </div>

                  <div className="flex items-end gap-1 mb-8 pb-8 border-b border-gray-100">
                    <span className="text-3xl font-light text-[#2D2D2D]">
                      IDR {Number(selectedRoom.price).toLocaleString('id-ID')}
                    </span>
                    <span className="text-sm text-gray-400 mb-1.5 font-light">/ malam</span>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2D2D] mb-4 flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-[#BFA06D]"></span> About This Room
                      </h4>
                      <p className="text-gray-500 leading-7 font-light text-justify">
                        {selectedRoom.description || "Nikmati waktu istirahat yang berkualitas dengan suasana tenang dan fasilitas yang memadai. Ruangan ini dirancang untuk memberikan kenyamanan maksimal bagi Anda dan keluarga."}
                      </p>
                    </div>

                    {selectedRoom.facilities && selectedRoom.facilities.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2D2D] mb-4 flex items-center gap-2">
                          <span className="w-4 h-[1px] bg-[#BFA06D]"></span> Amenities
                        </h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                          {selectedRoom.facilities.map((facility) => (
                            <div key={facility.id} className="flex items-center gap-3 text-sm text-gray-600 font-light">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#FAF9F6] border border-[#BFA06D]/30 flex items-center justify-center text-[#BFA06D]">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                              {facility.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-[#FAF9F6] p-6 rounded-xl border border-gray-100/50">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2D2D] mb-4">Room Details</h4>
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded shadow-sm border border-gray-100">
                             <svg className="w-5 h-5 text-[#BFA06D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-[#2D2D2D]">{selectedRoom.capacity} Adults</span>
                             <span className="text-xs text-gray-400">Capacity</span>
                          </div>
                          
                          <div className="w-[1px] h-8 bg-gray-200 mx-2"></div>

                          <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded shadow-sm border border-gray-100">
                            <svg className="w-5 h-5 text-[#BFA06D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-[#2D2D2D]">
                               {selectedRoom.category === 'family' ? '2 Children' : '1 Child'}
                             </span>
                             <span className="text-xs text-gray-400">Included</span>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-white border-t border-gray-100 z-10 flex gap-4">
                  <button 
                    disabled={isRoomInCart(selectedRoom.id)}
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error("Silakan login terlebih dahulu untuk melakukan pemesanan.", {
                            style: {
                                background: '#2D2D2D',
                                color: '#fff',
                                border: '1px solid #BFA06D'
                            }
                        });
                        openAuthModal(); 
                        return;
                      }

                      if (isRoomInCart(selectedRoom.id)) return;

                      const today = new Date();
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 1);

                      const checkIn = searchParams.checkIn || today.toISOString().split('T')[0];
                      const checkOut = searchParams.checkOut || tomorrow.toISOString().split('T')[0];
                      const nights = calculateNights(checkIn, checkOut);
                      const guests = Number(searchParams.guests) || 2;

                      addToCart({
                        id: selectedRoom.id,
                        roomId: selectedRoom.id,
                        roomName: selectedRoom.name,
                        price: Number(selectedRoom.price),
                        checkIn,
                        checkOut,
                        guests,
                        nights,
                        image: selectedRoom.image ? getImageUrl(selectedRoom.image) : '',
                        category: selectedRoom.category,
                        location: selectedRoom.location
                      });

                      triggerToast(`${selectedRoom.name} added to booking!`);
                      setSelectedRoom(null);
                    }}
                    className={`w-full py-4 text-sm font-bold uppercase tracking-[0.15em] transition-all duration-300 shadow-xl ${
                        isRoomInCart(selectedRoom.id)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#2D2D2D] text-white hover:bg-[#BFA06D] hover:shadow-[#BFA06D]/20'
                    }`}
                  >
                    {isRoomInCart(selectedRoom.id) ? 'Already in Cart' : 'Add to Booking'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function HotelPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2D2D2D] font-sans selection:bg-[#BFA06D] selection:text-white">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </div>
  );
}