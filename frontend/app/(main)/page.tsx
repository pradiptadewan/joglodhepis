"use client";
import { API_URL } from '@/lib/config';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from "framer-motion";

const fadeInUp : Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const roomVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.9,
    zIndex: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 10,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
      scale: { duration: 0.4 }
    }
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.9,
    zIndex: 0,
    transition: {
      x: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 }
    }
  }),
};

export default function Home() {
  const router = useRouter();
  const [direction, setDirection] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [roomSlide, setRoomSlide] = useState(0);
  const [rooms, setRooms] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [isHoveringRooms, setIsHoveringRooms] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const packages = [
    {
      id: 1,
      title: "Hotel + Sarapan",
      tag: "Santai & Hemat",
      image: "/hoteljoglo.jpg",
      description: "Pilihan tepat untuk staycation santai tanpa ribet cari makan pagi.",
      details: [
        "Menginap 1 Malam",
        "Sarapan untuk 2/4 Orang",
        "Akses Free Wi-Fi",
        "Parkir Luas",
        "Air Mineral & Amenities"
      ],
      pricing: [
        { label: "Standard Room (2 Orang)", normal: "250K", promo: "235K", save: "15K" },
        { label: "Family Room (4 Orang)", normal: "500K", promo: "470K", save: "30K" }
      ],
      isBestSeller: false
    },
    {
      id: 2,
      title: "Hotel + VW Tour",
      tag: "Adventure",
      image: "/pvw1.png",
      description: "Paket ideal untuk eksplor Borobudur & desa wisata sekitar.",
      note: "* Termasuk Family Room (4 Orang)",
      details: [
        "Menginap 1 Malam di Family Room",
        "Kapasitas untuk 4 Orang",
        "Trip VW Safari Borobudur",
        "Edukasi di UMKM Lokal",
        "Dokumentasi Foto Seru",
      ],
      pricing: [
        { label: "Short Trip", normal: "800K", promo: "760K" },
        { label: "Medium Trip", normal: "950K", promo: "900K" },
        { label: "Long Trip", normal: "1.100K", promo: "1.040K" },
        { label: "Sunrise Trip", normal: "1.050K", promo: "990K" }
      ],
      isBestSeller: false
    },
    {
      id: 3,
      title: "The Full Experience",
      tag: "Paket Paling Hemat",
      image: "/vw.png",
      description: "Liburan anti pusing, fasilitas lengkap, dan paling terasa hematnya!",
      note: "* Termasuk Family Room (4 Orang)",
      details: [
        "Menginap 1 Malam di Family Room (4 Orang)",
        "Sarapan untuk 4 Orang",
        "Trip VW Safari Borobudur",
        "Edukasi di UMKM Lokal",
        "Dokumentasi Foto Seru",
      ],
      pricing: [
        { label: "Short Trip", normal: "900K", promo: "850K" },
        { label: "Medium Trip", normal: "1.050K", promo: "990K" },
        { label: "Long Trip", normal: "1.200K", promo: "1.130K" },
        { label: "Sunrise Trip", normal: "1.150K", promo: "1.080K" }
      ],
      isBestSeller: true
    }
  ];

  const handleReservation = (pkgTitle: string) => {
    const phoneNumber = "6285801262682";
    const message = `Halo Admin Joglo Dhepis, saya ingin reservasi untuk paket: ${pkgTitle}. Bisa dibantu ketersediaannya?`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const [searchParams, setSearchParams] = useState({
    checkIn: '',
    checkOut: '',
    guests: ''
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = () => {
    const query = new URLSearchParams({
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        guests: searchParams.guests
    }).toString();

    router.push(`/hotel?${query}`);
  };

  const reviews = [
    {
      id: 1,
      name: "Esther Hills",
      role: "Traveller",
      image: "/user1.jpg",
      rating: 5,
      text: "The villa we stayed in was straight out of a movie. Private beach access, gourmet meals, and a sunset massage — it was everything we hoped for."
    },
    {
      id: 2,
      name: "Gary L. Hopper",
      role: "Traveller",
      image: "/user2.jpg",
      rating: 5,
      text: "Our kids loved the play area and pool while we enjoyed the hot tub suite. Plus, the complimentary breakfast had amazing variety!"
    },
    {
      id: 3,
      name: "Julia S. Lackey",
      role: "Traveller",
      image: "/user3.jpg",
      rating: 4.5,
      text: "From booking to checkout, the process was seamless. The ocean-view room was breathtaking. It felt like having a personal paradise."
    },
    {
      id: 4,
      name: "Robert Fox",
      role: "Photographer",
      image: "/user4jpg",
      rating: 5,
      text: "As a photographer, the scenery around Joglo Dhepis is unmatched. The golden hour here is magical. Highly recommended for nature lovers."
    },
    {
      id: 5,
      name: "Wayazu",
      role: "Musisi",
      image: "/user5.jpg",
      rating: 5,
      text: "As a photographer, the scenery around Joglo Dhepis is unmatched. The golden hour here is magical. Highly recommended for nature lovers."
    },
    {
      id: 6,
      name: "Alexa",
      role: "Progammer",
      image: "/user6.jpg",
      rating: 5,
      text: "As a photographer, the scenery around Joglo Dhepis is unmatched. The golden hour here is magical. Highly recommended for nature lovers."
    }
  ];

  const nextReview = () => {
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };
  const prevReview = () => {
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const slides = [
    {
      image: '/minihero1.jpg',
      text: "Bangun pagi dengan pemandangan alam yang bikin fresh."
    },
    {
      image: '/minihero2.jpg',
      text: "Rasakan hangatnya suasana yang autentik."
    },
    {
      image: '/minihero3.jpg',
      text: "Ruangan nyaman untuk istirahat yang berkualitas."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${API_URL}/api/rooms`);
        const data = await response.json();
        setRooms(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rooms:', error);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const getPrevIndex = () => (roomSlide - 1 + rooms.length) % rooms.length;
  const getNextIndex = () => (roomSlide + 1) % rooms.length;

  const paginate = useCallback((newDirection: number) => {
    if (rooms.length === 0) return;
    setDirection(newDirection);
    setRoomSlide((prev) => {
        let nextIndex = prev + newDirection;
        if (nextIndex < 0) nextIndex = rooms.length - 1;
        if (nextIndex >= rooms.length) nextIndex = 0;
        return nextIndex;
    });
  }, [rooms.length]);

  useEffect(() => {
    if (rooms.length > 0 && !isHoveringRooms) {
      const interval = setInterval(() => {
        paginate(1);
      }, 3700);
      return () => clearInterval(interval);
    }
  }, [rooms.length, isHoveringRooms, paginate]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

  return (
    <div className="homepage-container w-full bg-[#FAF9F6] relative">

      {/* SECTION MAIN BANNER */}
      <section className="relative h-screen flex items-center overflow-hidden pt-0">
        <div className="absolute inset-0 top-0 z-0">
          <div className="w-full h-full bg-cover bg-center bg-[url('/hero-bg.jpg')] transform scale-105" /> 
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center mt-16">
          <div className="md:col-span-6">
            <h1 className="text-white text-6xl md:text-8xl font-serif font-bold leading-[1.1] mb-6 drop-shadow-2xl">
              Your<br />Perfect Escape.
            </h1>
            <p className="text-white/90 text-base mb-10 max-w-lg font-light leading-relaxed">
              Rasakan kenyamanan menginap dengan suasana perdesaan yang tenang dan homey. Istirahat sejenak, nikmati momennya.
            </p>
            <Link href="/hotel" className="inline-block bg-[#BFA06D] text-white px-10 py-4 rounded-full text-sm font-semibold hover:bg-[#A88B5D] transition duration-300 shadow-xl">
              Book Now
            </Link>
          </div>

          <div className="col-span-1 md:col-span-6 mt-10 md:mt-0 flex justify-center md:justify-end">
            <div className="relative w-full max-w-[350px] md:max-w-[420px]">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative h-[280px] md:h-[320px]">
                
                {slides.map((slide, index) => (
                  <div 
                    key={index}
                    className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                      index === activeSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backgroundImage: `url('${slide.image}')` }}
                  />
                ))}

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent z-10">
                  <p className="text-white text-xs md:text-sm font-light italic leading-relaxed transition-all duration-300">
                    {slides[activeSlide].text}
                  </p>
                </div>
              </div>
              
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlide === i ? 'w-6 md:w-8 bg-white' : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
              
              <button 
                onClick={() => setActiveSlide((activeSlide - 1 + slides.length) % slides.length)}
                className="absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition"
              >
                ‹
              </button>
              <button 
                onClick={() => setActiveSlide((activeSlide + 1) % slides.length)}
                className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-white/30 transition"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING FORM */}
      <motion.div 
        className="relative z-30 -mt-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="w-[95%] max-w-6xl mx-auto">
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

      <div className="h-20"></div>

      {/* ABOUT SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-5xl md:text-6xl font-serif text-[#2D2D2D] mb-6 leading-tight">
              About<br/>Joglo Dhepis
            </h2>
            <p className="text-[#BFA06D] font-semibold mb-6 text-sm tracking-wide">
              Kenyamanan Seperti di Rumah
            </p>
            <p className="text-gray-600 leading-relaxed font-light mb-10 text-base">
              Joglo Dhepis bukan sekadar penginapan. Ini adalah tempat di mana kamu bisa recharge energi, jauh dari hiruk-pikuk kota. Dengan sentuhan yang hangat dan pelayanan ramah, kami siap menyambutmu seperti keluarga sendiri.
            </p>
            
            <div className="relative inline-block">
              <Link href="/hotel" className="inline-flex items-center gap-2 bg-[#2D2D2D] text-white rounded-full px-8 py-3 hover:bg-[#BFA06D] transition duration-300 text-sm font-semibold">
                Documentation →
              </Link>
              
              <svg className="absolute -bottom-8 left-8 w-24 h-16 text-[#BFA06D]/30" viewBox="0 0 100 60">
                <path d="M 0 60 Q 50 0 100 40" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 4"/>
              </svg>
            </div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-4 h-[500px]"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="row-span-2 rounded-3xl overflow-hidden shadow-xl">
              <div className="w-full h-full bg-cover bg-center hover:scale-110 transition duration-700 bg-[url('/minihero1.jpg')]" />
            </div>
            
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <div className="w-full h-full bg-cover bg-center hover:scale-110 transition duration-700 bg-[url('/minihero2.jpg')]" />
            </div>
            
            <div className="rounded-3xl overflow-hidden shadow-xl">
              <div className="w-full h-full bg-cover bg-center hover:scale-110 transition duration-700 bg-[url('/minihero3.jpg')]" />
            </div>
          </motion.div>

        </div>
      </section>

      <div className="h-20"></div>

      {/* VIDEO SECTION */}
      <motion.section 
        className="relative w-full -mt-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      > 

        <div className="relative z-20 w-full bg-[#BFA06D] py-12 shadow-xl">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center text-center">
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <svg className="w-8 h-8 text-white group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white text-xs font-bold tracking-[0.2em]">BOOK NOW</span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <svg className="w-8 h-8 text-white group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                </svg>
                <span className="text-white text-xs font-bold tracking-[0.2em]">PLAN YOUR TRIP</span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <svg className="w-8 h-8 text-white group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6" />
                </svg>
                <span className="text-white text-xs font-bold tracking-[0.2em]">START EXPLORING</span>
              </div>
              <div className="flex flex-col items-center gap-3 group cursor-pointer">
                <svg className="w-8 h-8 text-white group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132z" />
                </svg>
                <span className="text-white text-xs font-bold tracking-[0.2em]">WATCH & BE INSPIRED</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Container Video */}
        <div className="relative w-full h-screen overflow-hidden group">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/videos/video.mp4" type="video/mp4" />
          </video>

          <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`} />
          
          <div className={`absolute inset-0 flex items-center justify-center z-10 transition-all duration-300 ${isPlaying ? 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100' : 'opacity-100 scale-100'}`}>
            <button 
              onClick={togglePlay}
              className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/50 flex items-center justify-center hover:scale-110 hover:bg-white/30 transition duration-300 shadow-2xl"
            >
              {isPlaying ? (
                <div className="flex gap-2">
                   <div className="w-2 h-8 bg-white rounded-full shadow-lg" />
                   <div className="w-2 h-8 bg-white rounded-full shadow-lg" />
                </div>
              ) : (
                <div className="w-0 h-0 border-l-[24px] border-l-white border-t-[16px] border-t-transparent border-b-[16px] border-b-transparent ml-2 shadow-lg" />
              )}
            </button>
          </div>

          <div className={`absolute bottom-20 w-full text-center pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
             <span className="text-white/80 text-sm tracking-widest uppercase font-semibold drop-shadow-md">
                {isPlaying ? "Playing Video" : "Paused"}
             </span>
          </div>
        </div>

      </motion.section>

      {/* FASILITAS SECTION */}
      <section className="py-20 px-6 bg-[#2D2D2D]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left: Image (Muncul dari kiri) */}
            <motion.div 
              className="relative rounded-3xl overflow-hidden shadow-2xl h-[600px]"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-cover bg-center bg-[url('/tes.png')]" />
              
              <div className="absolute top-8 left-8 bg-[#BFA06D] text-white px-6 py-3 rounded-xl shadow-lg">
                <div className="text-2xl font-bold font-serif">100%</div>
                <div className="text-base uppercase tracking-wider">Kenyamanan</div>
              </div>
            </motion.div>

            {/* Right: Content (Muncul dari bawah) */}
            <motion.div 
              className="text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
            >
              <motion.h2 variants={fadeInUp} className="text-5xl md:text-6xl font-serif mb-6 leading-tight">
                Our Facilities
              </motion.h2>
              
              <motion.p variants={fadeInUp} className="text-[#BFA06D] font-semibold mb-4 text-sm tracking-wide">
                Fasilitas lengkap untuk kenyamanan maksimal
              </motion.p>
              
              <motion.p variants={fadeInUp} className="text-white/80 leading-relaxed font-light mb-12 text-base">
                Kami memperhatikan setiap detail agar pengalaman menginapmu "seamless" dan menyenangkan. Semuanya sudah tersedia, kamu tinggal duduk santai dan menikmati suasana.
              </motion.p>

              <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                
                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#BFA06D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Air Conditioner</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Ruangan sejuk dan nyaman seharian, bebas atur suhu sesukamu.
                  </p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#BFA06D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Wi-Fi</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Tetap update dengan koneksi internet yang cepat dan stabil.
                  </p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#BFA06D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Private Bathroom</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Kamar mandi dalam yang bersih, luas, dan privat.
                  </p>
                </div>

                <div>
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-[#BFA06D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Water Heater</h3>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Nikmati mandi air hangat yang bikin rileks kapan saja.
                  </p>
                </div>

              </motion.div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ROOMS SECTION */}
      <section 
        className="relative py-24 overflow-hidden" 
        onMouseEnter={() => setIsHoveringRooms(true)}
        onMouseLeave={() => setIsHoveringRooms(false)}
      >
        <div className="absolute top-0 left-0 right-0 h-[60%] bg-[#BFA06D]"></div>

        <motion.div
          className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} className="text-center mb-12 relative z-10">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4 leading-tight">
              Choose Your Room
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
              Pilih tipe kamar yang paling pas buat gaya liburanmu. Mulai dari yang "cozy" buat sendirian, sampai yang luas buat rame-rame.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center text-white py-20">Loading...</div>
          ) : rooms.length > 0 ? (
            <motion.div variants={fadeInUp} className="relative w-full">

              <button
                onClick={() => paginate(-1)}
                className="absolute top-[40%] -translate-y-1/2 left-4 md:-left-10 z-30 w-12 h-12 bg-white/80 backdrop-blur-sm text-[#2D2D2D] rounded-full flex items-center justify-center hover:bg-[#BFA06D] hover:text-white transition-all duration-300 shadow-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => paginate(1)}
                className="absolute top-[40%] -translate-y-1/2 right-4 md:-right-10 z-30 w-12 h-12 bg-white/80 backdrop-blur-sm text-[#2D2D2D] rounded-full flex items-center justify-center hover:bg-[#BFA06D] hover:text-white transition-all duration-300 shadow-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div className="flex items-center justify-center gap-4 md:gap-8 w-full h-[320px] md:h-[450px] mt-14 md:mt-20">
                
                <motion.div 
                  className="hidden md:block relative w-[20%] h-[70%] rounded-2xl overflow-hidden shadow-xl z-10"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <img 
                    src={rooms[getPrevIndex()].image}
                    alt="Previous Room"
                    className="w-full h-full object-cover filter brightness-75 transition duration-500"
                  />
                </motion.div>

                <div className="relative w-full md:w-[50%] h-full z-20 overflow-hidden rounded-2xl shadow-2xl bg-gray-900">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.div
                      key={roomSlide}
                      custom={direction}
                      variants={roomVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = swipePower(offset.x, velocity.x);
                        if (swipe < -swipeConfidenceThreshold) paginate(1);
                        else if (swipe > swipeConfidenceThreshold) paginate(-1);
                      }}
                      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
                    >
                        <img 
                          src={rooms[roomSlide].image}
                          alt={rooms[roomSlide].name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                        <motion.div 
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute top-6 left-6 bg-[#2D2D2D]/80 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg"
                        >
                          <div className="text-xs md:text-sm font-semibold">
                            {formatRupiah(rooms[roomSlide].price_per_night)}
                          </div>
                        </motion.div>

                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="absolute bottom-0 left-0 right-0 p-8 text-center text-white"
                        >
                          <h3 className="text-2xl md:text-4xl font-serif mb-2 drop-shadow-lg">
                            {rooms[roomSlide].name}
                          </h3>
                          <div className="text-sm md:text-base text-white/90">
                            Kapasitas {rooms[roomSlide].capacity} orang
                          </div>
                        </motion.div>
                      </motion.div>
                    </AnimatePresence>
                </div>

                <motion.div 
                  className="hidden md:block relative w-[20%] h-[70%] rounded-2xl overflow-hidden shadow-xl z-10"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <img 
                    src={rooms[getNextIndex()].image}
                    alt={rooms[getNextIndex()].name}
                    className="w-full h-full object-cover filter brightness-75 transition duration-500"
                  />
                </motion.div>
              </div>

              <div className="flex justify-center gap-3 mt-8">
                {rooms.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                        setDirection(i > roomSlide ? 1 : -1);
                        setRoomSlide(i);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ease-out ${
                      roomSlide === i ? 'w-8 bg-[#BFA06D]' : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>

              <div className="text-center mt-10">
                <Link
                    href="/hotel"
                    className="inline-flex items-center gap-2 bg-[#2D2D2D] text-white rounded-full px-10 py-4 hover:bg-[#BFA06D] transition duration-300 text-sm font-semibold shadow-xl hover:shadow-2xl">
                    Lihat Semua Kamar →
                </Link>
              </div>

            </motion.div>
          ) : null}
        </motion.div>
      </section>

      {/* SECTION: PAKET MENU SPESIAL */}
      <section id="pakethemat" className="py-24 px-6 bg-[#2D2D2D] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">
              Special Bundles
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto text-base leading-relaxed font-light">
              Nikmati liburan lebih hemat dengan paket bundling spesial kami. 
              Kombinasi penginapan nyaman, kuliner lezat, dan petualangan seru.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <motion.div 
                key={pkg.id}
                className={`bg-white rounded-3xl shadow-xl overflow-hidden hover:scale-[1.02] transition duration-300 relative flex flex-col group z-10 ${pkg.isBestSeller ? 'border-2 border-[#BFA06D] shadow-2xl' : 'border border-gray-100'}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                {pkg.isBestSeller && (
                  <div className="absolute top-0 right-0 bg-[#BFA06D] text-white text-xs font-bold px-6 py-2 rounded-bl-2xl z-20 shadow-md">
                    BEST SELLER
                  </div>
                )}

                <div className="h-56 bg-gray-200 relative overflow-hidden">
                   <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                   {pkg.isBestSeller ? (
                     <>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 text-white z-10">
                          <p className="text-xs font-light tracking-wide uppercase opacity-90 mb-1">{pkg.tag}</p>
                          <p className="font-bold text-lg leading-tight">Hotel + VW + Sarapan</p>
                       </div>
                     </>
                   ) : (
                      <div className="absolute top-4 left-4 bg-[#2D2D2D] text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                        {pkg.tag}
                      </div>
                   )}
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-2xl font-serif text-[#2D2D2D] mb-2">{pkg.title}</h3>
                  <p className="text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                      {pkg.description}
                      {pkg.note && <><br/><span className="text-xs italic text-[#BFA06D] font-medium">{pkg.note}</span></>}
                  </p>
                  
                  <div className="space-y-4 mb-8">
                      {pkg.pricing.map((price, idx) => (
                          <div key={idx} className="flex justify-between items-center border-b border-dashed border-gray-200 pb-2 last:border-0 last:pb-0">
                              <div>
                                <span className={`block font-bold text-gray-700 ${price.label.length > 20 ? 'text-xs' : 'text-sm'}`}>{price.label}</span>
                              </div>
                              <div className="text-right flex flex-col items-end min-w-[80px]">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-red-400 line-through decoration-1">{price.normal}</span>
                                    <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded"></span>
                                  </div>
                                  <div className="text-base font-bold text-[#BFA06D]">{price.promo}</div>
                              </div>
                          </div>
                      ))}
                  </div>

                  <div className="mt-auto">
                       <button 
                          onClick={() => setSelectedPackage(pkg)}
                          className={`w-full py-3.5 rounded-xl font-semibold transition duration-300 shadow-lg hover:shadow-xl ${pkg.isBestSeller ? 'bg-[#BFA06D] text-white hover:bg-[#A88B5D]' : 'border border-[#2D2D2D] text-[#2D2D2D] hover:bg-[#2D2D2D] hover:text-white'}`}
                       >
                          {pkg.isBestSeller ? 'Book Best Seller' : 'Pilih Paket Ini'}
                       </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        <AnimatePresence>
          {selectedPackage && (
            <motion.div 
              className="fixed inset-0 z-[999] flex items-center justify-center px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div 
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={() => setSelectedPackage(null)}
              ></div>

              <motion.div 
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl flex flex-col"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <button 
                  onClick={() => setSelectedPackage(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition z-20"
                >
                  ✕
                </button>

                <div className="h-48 md:h-64 bg-gray-200 relative shrink-0">
                  <img src={selectedPackage.image} alt={selectedPackage.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 md:left-8 text-white">
                    <div className="bg-[#BFA06D] text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                      {selectedPackage.tag}
                    </div>
                    <h3 className="text-3xl md:text-4xl font-serif font-bold">{selectedPackage.title}</h3>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h4 className="text-lg font-bold text-[#2D2D2D] mb-4">Apa saja yang kamu dapatkan?</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                    {selectedPackage.details.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="text-[#BFA06D] mt-0.5">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-sm text-gray-700 font-medium leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#FAF9F6] border border-[#BFA06D]/20 rounded-xl p-5 mb-8">
                    <h4 className="text-sm font-bold text-[#BFA06D] uppercase tracking-wider mb-3">Pilihan Harga</h4>
                    <div className="space-y-3">
                       {selectedPackage.pricing.map((price: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                             <span className="text-sm font-semibold text-gray-700">{price.label}</span>
                             <div className="text-right">
                               <span className="text-xs text-red-400 line-through mr-2">{price.normal}</span>
                               <span className="text-lg font-bold text-[#2D2D2D]">{price.promo}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => handleReservation(selectedPackage.title)}
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    Reservasi Sekarang
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3">Link akan mengarahkan langsung ke WhatsApp Admin</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </section>

      {/* SECTION REVIEW */}
      <section className="relative py-24 px-6 bg-black">
        <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-[url('/review.jpg')] bg-cover bg-center opacity-60" />
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            className="lg:col-span-5 text-white relative z-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-5xl md:text-6xl font-serif leading-tight mb-6">
              Stories from <br />
              <span className="font-bold">Our Guests</span>
            </h2>

            <div className="flex items-center gap-2 text-[#F59E0B] mb-8">
               <div className="flex text-xl">★★★★★</div>
               <span className="text-white/60 text-sm ml-2">4.5/5 | 2k reviews</span>
            </div>

            <p className="text-white/70 text-base leading-relaxed mb-12 max-w-md">
              Jangan cuma percaya kata kami. Dengar langsung cerita seru dari mereka yang sudah menjadikan Joglo Dhepis tempat istirahat favoritnya.
            </p>

            <div>
              <p className="text-white font-semibold mb-4 tracking-wider uppercase text-sm">Client Testimonial</p>
              <div className="flex gap-4">
                <button 
                  onClick={prevReview}
                  className="w-12 h-12 bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center transition duration-300"
                >
                  ‹
                </button>
                <button 
                  onClick={nextReview}
                  className="w-12 h-12 bg-white/10 hover:bg-white hover:text-black border border-white/20 flex items-center justify-center transition duration-300"
                >
                  ›
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="lg:col-span-7 overflow-hidden relative cursor-grab active:cursor-grabbing z-10"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
          >
             <motion.div 
               className="flex gap-6"
               animate={{ x: `-${currentReview * 100}%` }} 
               drag="x" 
               dragConstraints={{ left: 0, right: 0 }} 
               dragElastic={0.2} 
               onDragEnd={(e, { offset, velocity }) => {
                 const swipe = swipePower(offset.x, velocity.x);
                 if (swipe < -swipeConfidenceThreshold) {
                   nextReview();
                 } else if (swipe > swipeConfidenceThreshold) {
                   prevReview();
                 }
               }}
               transition={{ type: "spring", stiffness: 300, damping: 30 }}
             >
                {reviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="min-w-[85vw] md:min-w-[400px] bg-white text-[#2D2D2D] p-8 rounded-2xl shadow-2xl relative select-none"
                  >
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4 items-center">
                           <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden relative">
                             <div className="absolute inset-0 bg-gray-400" /> 
                           </div>
                           <div>
                             <h4 className="font-bold text-lg">{review.name}</h4>
                             <p className="text-sm text-gray-500">{review.role}</p>
                           </div>
                        </div>
                        <div className="flex text-[#F59E0B]">
                           {[...Array(5)].map((_, i) => (
                             <span key={i} className={i < Math.floor(review.rating) ? "text-[#F59E0B]" : "text-gray-300"}>★</span>
                           ))}
                        </div>
                     </div>

                     <p className="text-gray-600 italic leading-relaxed text-sm md:text-base">
                       "{review.text}"
                     </p>
                  </div>
                ))}
             </motion.div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};
