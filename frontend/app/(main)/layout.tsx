"use client";

import Navbar from "@/components/Navbar"; 
import { BookingProvider } from "@/context/BookingContext";
import { RestoProvider } from "@/context/RestoContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingProvider>
      <RestoProvider>
        {/* Navbar HANYA muncul untuk halaman User */}
        <Navbar />

        <main className="min-h-screen">
          {children}
        </main>

        {/* Footer User (Desain Lengkap) */}
        <footer id="contactUs" className="bg-[#2D2D2D] text-[#FAF9F6] pt-16 pb-8 border-t-4 border-[#BFA06D]">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            
            {/* Bagian Alamat */}
            <div className="text-center md:text-left">
              <h2 className="font-serif text-3xl mb-6 text-[#BFA06D] tracking-wider">JOGLO DHEPIS</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Tuksongo, <br />
                Kec. Borobudur, <br />
                Magelang, Jawa Tengah 56553 <br />
                Indonesia
              </p>
              <a 
                href="https://maps.google.com/?q=Joglo+Dhepis" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block border border-white/20 px-4 py-2 rounded-full text-xs hover:bg-white hover:text-[#2D2D2D] transition duration-300"
              >
                View on Google Maps →
              </a>
            </div>

            {/* Bagian Kontak */}
            <div className="text-center">
              <h3 className="font-serif text-xl mb-6 text-white">Contact Us</h3>
              <div className="space-y-4">
                <a href="https://wa.me/6285801262682" target="_blank" rel="noopener noreferrer" className="block text-gray-400 hover:text-[#BFA06D] transition group">
                  <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1 group-hover:text-white">WhatsApp</span>
                  0858 0126 2682
                </a>
                <a href="mailto:joglodhepis1@gmail.com" className="block text-gray-400 hover:text-[#BFA06D] transition group">
                  <span className="block text-xs text-gray-500 uppercase tracking-widest mb-1 group-hover:text-white">Email</span>
                  joglodhepis1@gmail.com
                </a>
              </div>
            </div>

            {/* Bagian Sosmed */}
            <div className="text-center md:text-right">
              <h3 className="font-serif text-xl mb-6 text-white">Follow Us</h3>
              <div className="flex flex-col gap-3 items-center md:items-end">
                <a href="https://www.instagram.com/joglodhepis_homestayandresto?igsh=eGhyMXBhdXBubGFw" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-[#E1306C] transition duration-300">
                  <span>Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@joglodhepis_resto?_r=1&_t=ZS-92UhrYlK4HN" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition duration-300">
                  <span>TikTok</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.35-1.17.82-1.6 1.4-.74 1.02-1 2.37-.58 3.54.2.57.57 1.07 1.05 1.43.96.74 2.3.74 3.32-.05 1.03-.79 1.63-2.06 1.61-3.38.06-3.87.04-7.74.04-11.61z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-gray-500 text-xs tracking-wide">
              © 2025 Joglo Dhepis. All Rights Reserved.
            </p>
          </div>
        </footer>
      </RestoProvider>
    </BookingProvider>
  );
}