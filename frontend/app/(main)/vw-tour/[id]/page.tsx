"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

import { API_URL } from '@/lib/config';

interface VWEdukasi {
  id: number;
  title: string;
  image: string | null;
  description: string;
}

interface VWDestination {
  id: number;
  name: string;
  image: string;
  description: string;
}

interface VWPackageDetail {
  id: number;
  name: string;
  price: number;
  duration: string;
  image: string | null;
  description: string;
  destinations: VWDestination[];
  educations: VWEdukasi[];
}

export default function VWPackageDetail() {
  const params = useParams();
  const [pkg, setPkg] = useState<VWPackageDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`${API_URL}/api/packages/${params.id}/`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPkg(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchDetail();
  }, [params.id]);

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-vw.jpg";
    return path.startsWith("http") ? path : `${API_URL}${path}`;
  };

  const handleBookWA = () => {
    if (!pkg) return;
    const message = `Halo Admin Joglo Dhepis, saya tertarik memesan VW Tour paket: ${pkg.name}. Mohon info ketersediaannya. Terima kasih.`;
    window.open(`https://wa.me/6285801262682?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#BFA06D] rounded-full animate-spin border-t-transparent"/></div>;
  if (!pkg) return <div className="min-h-screen flex items-center justify-center text-gray-500">Paket tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2D2D] pb-24">
      <div className="relative h-[60vh] lg:h-[70vh]">
      <Image
        src={getImageUrl(pkg.image)}
        alt={pkg.name}
        fill
        priority
        className="object-cover object-center fixed-bg"
        sizes="100vw"
      />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 text-center">
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
              {pkg.name}
            </motion.h1>
            
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-6 text-sm font-medium tracking-wider">
               <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                 <svg className="w-5 h-5 text-[#BFA06D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 {pkg.duration}
               </span>
               <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                 <svg className="w-5 h-5 text-[#BFA06D]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                 IDR {Number(pkg.price).toLocaleString('id-ID')}
               </span>
            </motion.div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.4 }} 
              className="mt-8"
            >
               <button 
                 onClick={handleBookWA}
                 className="bg-[#BFA06D] hover:bg-white text-white hover:text-[#2D2D2D] px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-2xl flex items-center gap-2 transform hover:scale-105"
               >
                 <span>Book Now</span>
                 <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
               </button>
            </motion.div>

        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white p-8 md:p-12 rounded-t-3xl shadow-2xl">
            
            <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-serif mb-6 text-[#2D2D2D]">About The Trip</h2>
                <div className="w-16 h-[2px] bg-[#BFA06D] mx-auto mb-8"></div>
                <p className="text-gray-600 leading-8 font-light text-lg">
                   {pkg.description}
                </p>
            </div>

            <div className="mb-16">
                <div className="flex items-center gap-4 mb-10">
                    <span className="h-[1px] flex-grow bg-gray-200"></span>
                    <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-[#2D2D2D]">Destinations Highlights</h3>
                    <span className="h-[1px] flex-grow bg-gray-200"></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {pkg.destinations.map((dest) => (
                        <div key={dest.id} className="flex gap-6 items-start group">
                             <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200 shadow-md">
                                <img 
                                  src={getImageUrl(dest.image)} 
                                  alt={dest.name} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                             </div>
                             <div>
                                <h4 className="text-lg font-serif font-bold mb-2 text-[#2D2D2D] group-hover:text-[#BFA06D] transition-colors">{dest.name}</h4>
                                <p className="text-sm text-gray-500 leading-relaxed font-light">{dest.description}</p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>

            {pkg.educations && pkg.educations.length > 0 && (
              <div className="mb-16">
                  <div className="flex items-center gap-4 mb-10">
                      <span className="h-[1px] flex-grow bg-gray-200"></span>
                      <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-[#2D2D2D]">Education & Insight</h3>
                      <span className="h-[1px] flex-grow bg-gray-200"></span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {pkg.educations.map((edu) => (
                          <div key={edu.id} className="bg-[#FAF9F6] rounded-2xl p-6 border border-gray-100 hover:border-[#BFA06D]/30 transition-all hover:shadow-lg group">
                              {edu.image && (
                                <div className="w-full h-40 mb-4 rounded-xl overflow-hidden">
                                  <img 
                                    src={getImageUrl(edu.image)} 
                                    alt={edu.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                </div>
                              )}
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-white rounded-full shadow-sm text-[#BFA06D]">
                                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                   </svg>
                                </div>
                                <h4 className="text-lg font-serif font-bold text-[#2D2D2D] leading-tight">{edu.title}</h4>
                              </div>
                              <p className="text-sm text-gray-500 leading-relaxed font-light pl-1">
                                {edu.description}
                              </p>
                          </div>
                      ))}
                  </div>
              </div>
            )}

            <div className="bg-[#FAF9F6] rounded-2xl p-10 border border-[#BFA06D]/20 text-center shadow-inner">
                <h3 className="text-2xl font-serif mb-3 text-[#2D2D2D]">Ready for an Adventure?</h3>
                <p className="text-gray-500 mb-8 font-light max-w-xl mx-auto">
                    Reservasi sekarang untuk mengamankan jadwal perjalanan Anda dan rasakan pengalaman tak terlupakan bersama Joglo Dhepis.
                </p>
                
                <button 
                    onClick={handleBookWA}
                    className="inline-flex items-center gap-3 bg-[#2D2D2D] text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-[#BFA06D] transition-all shadow-lg hover:shadow-[#BFA06D]/30 transform hover:-translate-y-1"
                >
                    <span>Book via WhatsApp</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </button>
            </div>

            <div className="mt-10 text-center">
                 <Link href="/vw-tour" className="text-gray-400 text-xs uppercase tracking-widest hover:text-[#2D2D2D] transition border-b border-transparent hover:border-gray-400 pb-1">
                   ← Back to Packages
                 </Link>
            </div>
        </div>
      </div>
    </div>
  );
}