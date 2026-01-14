"use client";

import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import Link from 'next/link';

import { API_URL } from '@/lib/config';

interface VWPackage {
  id: number;
  name: string;
  price: number;
  duration: string;
  image: string | null;
  description: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

export default function VWTourList() {
  const [packages, setPackages] = useState<VWPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch(`${API_URL}/api/packages/`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPackages(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-vw.jpg";
    return path.startsWith("http") ? path : `${API_URL}${path}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#2D2D2D]">
      
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: "url('/vw.png')" }} 
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
             className="mb-8"
           >
             <span className="text-[#BFA06D] uppercase tracking-[0.3em] text-xs font-bold border border-[#BFA06D]/50 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm">
               Joglo Dhepis Experience
             </span>
           </motion.div>

           <motion.h1 
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
             className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight"
           >
            <span className="text-[#BFA06D] italic font-light">VW Safari</span> Tour
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
             className="text-gray-200 text-lg max-w-2xl mx-auto font-light leading-relaxed"
           >
             Menjelajahi keindahan tersembunyi di sekitar Borobudur dengan sentuhan klasik yang tak terlupakan.
           </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-white/70">Choose Your Journey</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent opacity-50" />
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24">
        
        <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
        >
            <span className="text-[#BFA06D] uppercase tracking-[0.2em] text-xs font-bold">Curated Itineraries</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#2D2D2D] mt-3">Available Packages</h2>
            <div className="w-24 h-[1px] bg-[#BFA06D] mx-auto mt-6"></div>
        </motion.div>

        {loading ? (
           <div className="flex justify-center h-40 items-center">
              <div className="w-10 h-10 border-2 border-[#BFA06D] rounded-full animate-spin border-t-transparent"></div>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/vw-tour/${pkg.id}`} className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full">
                  <div className="h-72 overflow-hidden relative">
                    <div 
                      className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                      style={{ backgroundImage: `url('${getImageUrl(pkg.image)}')` }} 
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-sm text-[#2D2D2D] shadow-sm">
                      {pkg.duration}
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col text-center">
                    <h3 className="text-2xl font-serif text-[#2D2D2D] group-hover:text-[#BFA06D] transition-colors mb-2">
                      {pkg.name}
                    </h3>

                    <div className="text-[#BFA06D] font-bold text-lg mb-4">
                      IDR {Number(pkg.price).toLocaleString('id-ID')}
                    </div>

                    <div className="w-12 h-[1px] bg-gray-200 mx-auto mb-4"></div>
                    
                    <p className="text-gray-500 line-clamp-2 text-sm mb-6 flex-grow font-light leading-relaxed">
                      {pkg.description}
                    </p>
                    
                    <span className="inline-block text-xs uppercase tracking-[0.2em] border-b border-[#2D2D2D] pb-1 group-hover:border-[#BFA06D] group-hover:text-[#BFA06D] transition-all font-bold">
                      View Itinerary
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}