"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import Image from "next/image";
import { useAuth } from '@/context/AuthContext';
import { useBooking } from '@/context/BookingContext';
import toast from 'react-hot-toast';

const API_URL = "http://127.0.0.1:8000";

export default function Navbar() {
  const { 
    login, 
    logout, 
    isAuthenticated, 
    user,
    isAuthModalOpen, 
    closeAuthModal,
    openAuthModal 
  } = useAuth();

  const { clearCart } = useBooking();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if(!formData.email || !formData.password) {
        toast.error("Mohon lengkapi data email dan password.");
        setLoading(false);
        return;
    }

    const endpoint = authMode === 'login' ? '/api/auth/login/' : '/api/auth/register/';
    const loadingToast = toast.loading('Processing...');

    let payload: any = {
        email: formData.email,
        password: formData.password
    };

    if (authMode === 'register') {
        const names = formData.fullName.split(' ');
        const firstName = names[0];
        const lastName = names.slice(1).join(' ') || '';
        
        payload = {
            ...payload,
            username: formData.email,
            first_name: firstName,
            last_name: lastName,
            phone_number: ''
        };
    }

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        toast.dismiss(loadingToast);

        if (res.ok) {
            if (authMode === 'login') {
                login(data.access, { name: formData.email.split('@')[0], email: formData.email });
                closeAuthModal();
                setFormData({ fullName: '', email: '', password: '' });
                
                toast.success(
                    <div className='flex flex-col'>
                        <span className='font-bold'>Login Berhasil!</span>
                        <span className='text-xs opacity-90'>Selamat datang kembali.</span>
                    </div>
                );
            } else {
                toast.success("Akun berhasil dibuat! Silakan Login.");
                setAuthMode('login');
            }
        } else {
            const firstError = Object.values(data)[0];
            const msg = Array.isArray(firstError) ? firstError[0] : "Terjadi kesalahan.";
            toast.error(msg as string);
        }
    } catch (err) {
        toast.dismiss(loadingToast);
        toast.error("Gagal terhubung ke server.");
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    clearCart(); // Reset cart saat logout
    setIsMobileMenuOpen(false);
    setShowProfileMenu(false);
    toast.success("Anda telah keluar.");
    router.push('/');
  };

  const getLinkClass = (path: string, isMobile = false) => {
    const baseStyle = isMobile 
      ? "block py-3 px-4 rounded-xl transition-all duration-300 font-medium text-lg" 
      : "transition-all duration-300 font-medium pb-1 border-b-2";
    
    if (pathname === path) {
      return isMobile 
        ? `${baseStyle} bg-[#BFA06D]/10 text-[#BFA06D]`
        : `${baseStyle} text-[#BFA06D] border-[#BFA06D]`;
    }
    
    return isMobile
      ? `${baseStyle} text-white/80 hover:bg-white/5 hover:text-white`
      : `${baseStyle} text-white/90 border-transparent hover:text-white hover:border-white/50`;
  };

  const smoothScrollTo = (targetId: string, duration: number) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition; 
    let startTime: number | null = null;

    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutQuad(t: number, b: number, c: number, d: number) {
      t /= d / 2;
      if (t < 1) return c / 2 * t * t + b;
      t--;
      return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  };

  const handleContactClick = () => {
    if (pathname === '/') {
      smoothScrollTo('contactUs', 900);
    } else {
      router.push('/#contactUs');
    }
    setIsMobileMenuOpen(false);
  };

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      smoothScrollTo('pakethemat', 900); 
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeAuthModal}
          ></div>

          <div className="relative bg-[#2D2D2D] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#2D2D2D] px-8 py-6 flex justify-between items-center">
              <div>
                <h3 className="text-white text-2xl font-serif font-bold">
                  {authMode === 'login' ? 'Welcome Back' : 'Join Us'}
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  {authMode === 'login' ? 'Please login to continue' : 'Create your account today'}
                </p>
              </div>
              <button 
                onClick={closeAuthModal}
                className="text-white/50 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 bg-white">
              <form className="space-y-5" onSubmit={handleAuth}>
                {authMode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 outline-none focus:border-[#BFA06D] focus:ring-1 focus:ring-[#BFA06D] transition text-[#2D2D2D]"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 outline-none focus:border-[#BFA06D] focus:ring-1 focus:ring-[#BFA06D] transition text-[#2D2D2D]"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full h-12 rounded-xl bg-gray-50 border border-gray-200 px-4 outline-none focus:border-[#BFA06D] focus:ring-1 focus:ring-[#BFA06D] transition text-[#2D2D2D]"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button 
                    disabled={loading}
                    className="w-full bg-[#BFA06D] hover:bg-[#A88B5D] text-white font-bold h-12 rounded-xl shadow-lg transition transform active:scale-95 mt-4 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Sign Up')}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-500">
                {authMode === 'login' ? (
                  <>
                    Don't have an account?{' '}
                    <button onClick={() => { setAuthMode('register'); }} className="text-[#BFA06D] font-bold hover:underline">
                      Register Now
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button onClick={() => { setAuthMode('login'); }} className="text-[#BFA06D] font-bold hover:underline">
                      Login Here
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 md:py-6 transition-all duration-300">
        <div className={`
          max-w-7xl mx-auto rounded-2xl md:rounded-full shadow-2xl px-6 py-3 md:px-8 md:py-4 flex items-center justify-between border border-white/10 transition-all duration-300
          ${isScrolled || isMobileMenuOpen
            ? 'bg-black/80 backdrop-blur-xl border-white/20' 
            : 'bg-black/40 backdrop-blur-md'
          }
        `}>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden shadow-lg border border-white/20 group-hover:border-[#BFA06D] transition-colors">
                  <Image
                      src="/logo.png"
                      alt="Joglo Dhepis Logo"
                      fill
                      className="object-cover object-center scale-150"
                      priority
                  />
              </div>
              <span className="text-white font-serif font-bold text-base md:text-lg tracking-wide group-hover:text-[#BFA06D] transition-colors">
                Joglo Dhepis
              </span>
            </Link>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-8 lg:gap-10 text-sm">
            <Link href="/" className={getLinkClass('/')}>Home</Link>
            <Link href="/hotel" className={getLinkClass('/hotel')}>Hotel</Link>
            <Link href="/restaurant" className={getLinkClass('/restaurant')}>Restaurant</Link>
            <Link href="/vw-tour" className={getLinkClass('/vw-tour')}>VW Touring</Link>
            <Link 
              href="/#pakethemat" 
              onClick={handleAboutClick}
              className="text-white/90 hover:text-white transition font-medium border-b-2 border-transparent hover:border-white/50 pb-1"
            >
              Paket Hemat
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={handleContactClick}
              className="bg-white/90 hover:bg-[#BFA06D] text-[#2D2D2D] px-5 py-2 rounded-full text-sm font-semibold transition shadow-lg flex items-center gap-2"
            >
              Contact Us
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-white/20 overflow-hidden border-2 border-white/30 flex items-center justify-center hover:border-white transition focus:outline-none"
              >
                {isAuthenticated && user?.name ? (
                    <div className="w-full h-full bg-[#BFA06D] flex items-center justify-center text-white font-bold text-sm">
                        {user.name.substring(0, 2).toUpperCase()}
                    </div>
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#BFA06D] to-[#8B7355] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl py-2 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-50 mb-1">
                    {isAuthenticated ? `Hi, ${user?.name || 'Guest'}` : 'Welcome Guest'}
                  </div>
                  
                  {isAuthenticated ? (
                    <>
                      <Link 
                        href="/orders"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-between"
                      >
                        My Booking
                      </Link>

                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 font-bold hover:bg-red-50 transition flex items-center justify-between"
                      >
                        Logout
                        <span className="text-xs">✕</span>
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={() => {
                        setAuthMode('login');
                        openAuthModal();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#BFA06D] font-bold hover:bg-[#BFA06D]/10 transition flex items-center justify-between"
                    >
                      Login / Register
                      <span className="text-xs">→</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-4 right-4 mt-2 bg-[#2D2D2D] rounded-2xl shadow-2xl border border-white/10 p-4 animate-in slide-in-from-top-5 duration-300">
            <div className="flex flex-col gap-2">
              <Link href="/" className={getLinkClass('/', true)}>Home</Link>
              <Link href="/hotel" className={getLinkClass('/hotel', true)}>Hotel</Link>
              <Link href="/restaurant" className={getLinkClass('/restaurant', true)}>Restaurant</Link>
              <Link href="/vw-tour" className={getLinkClass('/vw-tour', true)}>VW Touring</Link>
              <Link href="/#pakethemat" onClick={handleAboutClick} className="block py-3 px-4 rounded-xl text-white/80 hover:bg-white/5 hover:text-white transition font-medium text-lg">Paket Hemat</Link>
              
              <div className="h-px bg-white/10 my-2"></div>
              
              <button 
                onClick={handleContactClick}
                className="w-full bg-[#BFA06D] text-white py-3 rounded-xl font-bold mb-2"
              >
                Contact Us
              </button>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full block text-center border border-white/10 text-white/90 py-3 rounded-xl font-medium hover:bg-white/5 mb-2"
                  >
                    Riwayat Pesanan
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="w-full border border-red-500/50 text-red-400 py-3 rounded-xl font-medium hover:bg-red-500/10"
                  >
                    Logout ({user?.name})
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    setAuthMode('login');
                    openAuthModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full border border-white/20 text-white py-3 rounded-xl font-medium hover:bg-white/5"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}