"use client";
import { API_URL } from '@/lib/config';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useResto, RestoCartItem } from '@/context/RestoContext';
import { useAuth } from '@/context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

const WA_NUMBER = "6285801262682";

interface Menu {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string | null;
  is_package: boolean;
  package_content: string;
  min_order_qty: number;
  has_flavor_option: boolean;
}

interface Drink {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string | null;
  serving_type: 'both' | 'ice_only' | 'hot_only';
  has_sugar_option: boolean;
}

type SelectedItem = (Menu | Drink) & { type: 'food' | 'drink' };

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function RestaurantPage() {
  const router = useRouter();
  const { addToCart, cart } = useResto();
  const {isAuthenticated, openAuthModal} = useAuth();

  const [menus, setMenus] = useState<Menu[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  
  const [sugarLevel, setSugarLevel] = useState<string>('Normal');
  const [tempSelection, setTempSelection] = useState<'Ice' | 'Hot'>('Ice');
  const [flavorSelection, setFlavorSelection] = useState<string>('Sedang');

  useEffect(() => {
    async function fetchData() {
      try {
        const [resMenu, resDrink] = await Promise.all([
          fetch(`${API_URL}/api/menus/`),
          fetch(`${API_URL}/api/drinks/`)
        ]);

        if (!resMenu.ok || !resDrink.ok) throw new Error("Failed to fetch data");

        const menuData = await resMenu.json();
        const drinkData = await resDrink.json();

        setMenus(menuData);
        setDrinks(drinkData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setSugarLevel('Normal');
      setFlavorSelection('Sedang'); 
      
      if (selectedItem.type === 'drink') {
        const drink = selectedItem as Drink;
        if (drink.serving_type === 'hot_only') {
            setTempSelection('Hot');
        } else {
            setTempSelection('Ice');
        }
      }
    }
  }, [selectedItem]);

  const dailyMenus = menus.filter(m => !m.is_package);
  const packageMenus = menus.filter(m => m.is_package);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-food.jpg";
    return path.startsWith("http") ? path : `${API_URL}${path}`;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Silakan login terlebih dahulu untuk memesan.", {
          style: { 
            background: '#2D2D2D', 
            color: '#fff', 
            border: '1px solid #BFA06D' 
          }
      });
      openAuthModal();
      return;
    }
    if (!selectedItem) return;

    let noteParts: string[] = [];
    if (selectedItem.type === 'drink') {
      const drink = selectedItem as Drink;
      if (drink.serving_type === 'both') noteParts.push(tempSelection);
      else if (drink.serving_type === 'ice_only') noteParts.push('Ice');
      else if (drink.serving_type === 'hot_only') noteParts.push('Hot');
      
      if (drink.has_sugar_option && sugarLevel !== 'Normal') noteParts.push(sugarLevel);
    } else {
      const food = selectedItem as Menu;
      if (!food.is_package && food.has_flavor_option) noteParts.push(flavorSelection);
    }

    const finalNote = noteParts.join(', ');
    const uniqueId = `${selectedItem.type}-${selectedItem.id}-${finalNote.replace(/\s/g, '')}`;

    const cartItem: RestoCartItem = {
      uniqueId: uniqueId,
      menuId: selectedItem.id,
      name: selectedItem.name,
      price: Number(selectedItem.price),
      qty: 1,
      type: selectedItem.type,
      image: selectedItem.image ? getImageUrl(selectedItem.image) : "",
      note: finalNote
    };

    addToCart(cartItem);
    setSelectedItem(null);
    toast.success(`${selectedItem.name} added to cart`, {
        style: {
            background: '#2D2D2D',
            color: '#fff',
            border: '1px solid #BFA06D'
        }
    });
  };

  const handlePackageOrder = () => {
    if (!selectedItem) return;

    const message = `Halo Joglo Dhepis, saya tertarik untuk memesan Paket Acara:\n\n📦 *${selectedItem.name}*\n💰 Harga: IDR ${Number(selectedItem.price).toLocaleString('id-ID')}/pax\n\nMohon info ketersediaan dan prosedur pemesanannya. Terima kasih.`;
    
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D2D2D]">
      <Toaster position="top-center" />
      
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: "url('/heroResto.jpg')" }} />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center px-6">
           <motion.h1 
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
             className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight"
           >
             Joglo <span className="text-[#BFA06D] italic font-light">Dhepis</span> Resto
           </motion.h1>
           <motion.div 
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
             className="flex flex-col sm:flex-row gap-4 justify-center"
           >
              <button onClick={() => scrollToSection('daily-menu')} className="px-8 py-3 bg-[#BFA06D] text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#a38655] transition shadow-xl hover:shadow-[#BFA06D]/30">
                Menu Harian
              </button>
              <button onClick={() => scrollToSection('package-menu')} className="px-8 py-3 bg-white/10 backdrop-blur border border-white/30 text-white rounded-full font-bold uppercase tracking-wider text-xs hover:bg-white hover:text-[#2D2D2D] transition shadow-lg">
                Menu Paket
              </button>
           </motion.div>
        </div>
      </section>

      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <button 
            onClick={() => router.push('/restaurant/checkout')}
            className="bg-[#BFA06D] hover:bg-[#A88B5D] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105"
          >
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            </div>
            <span className="font-bold uppercase text-sm tracking-wide">Checkout</span>
          </button>
        </motion.div>
      )}

      <section id="daily-menu" className="py-24 px-6 scroll-mt-20"> 
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <span className="text-[#BFA06D] uppercase tracking-[0.2em] text-xs font-bold">Khusus Dine In (Makan di Tempat)</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#2D2D2D] mt-3">Menu Harian</h2>
            <div className="w-24 h-[1px] bg-[#BFA06D] mx-auto mt-6"></div>
          </motion.div>

          {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-2 border-[#BFA06D] rounded-full animate-spin border-t-transparent"></div>
             </div>
          ) : (
            <>
              <div className="mb-20">
                <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-2xl font-serif text-[#2D2D2D]">Main Course</h3>
                    <div className="h-[1px] bg-gray-200 flex-grow"></div>
                </div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
                  variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
                >
                  {dailyMenus.map((menu) => (
                    <motion.div
                      key={`food-${menu.id}`}
                      variants={scaleIn}
                      className="group cursor-pointer"
                      onClick={() => setSelectedItem({ ...menu, type: 'food' })}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 mb-4 shadow-sm">
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                        <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${getImageUrl(menu.image)}')` }} />
                        <div className="absolute bottom-3 right-3 z-20">
                            <button className="w-8 h-8 rounded-full bg-white text-[#2D2D2D] shadow-lg flex items-center justify-center hover:bg-[#BFA06D] hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-start mb-1">
                             <h3 className="text-lg font-serif font-bold text-[#2D2D2D] group-hover:text-[#BFA06D] transition-colors">{menu.name}</h3>
                             <span className="text-[#BFA06D] font-bold text-sm whitespace-nowrap">IDR {Number(menu.price).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-2 font-light leading-relaxed">{menu.description || "Sajian khas dengan bumbu pilihan."}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-8">
                    <h3 className="text-2xl font-serif text-[#2D2D2D]">Refreshments</h3>
                    <div className="h-[1px] bg-gray-200 flex-grow"></div>
                </div>

                {drinks.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-400 italic font-light">Menu minuman sedang dipersiapkan.</p>
                    </div>
                ) : (
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10"
                    variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
                  >
                    {drinks.map((drink) => (
                      <motion.div
                        key={`drink-${drink.id}`}
                        variants={scaleIn}
                        className="group cursor-pointer"
                        onClick={() => setSelectedItem({ ...drink, type: 'drink' })}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 mb-4 shadow-sm">
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                          <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${getImageUrl(drink.image)}')` }} />
                          <div className="absolute bottom-3 right-3 z-20">
                            <button className="w-8 h-8 rounded-full bg-white text-[#2D2D2D] shadow-lg flex items-center justify-center hover:bg-[#BFA06D] hover:text-white transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-start mb-1">
                             <h3 className="text-lg font-serif font-bold text-[#2D2D2D] group-hover:text-[#BFA06D] transition-colors">{drink.name}</h3>
                             <span className="text-[#BFA06D] font-bold text-sm whitespace-nowrap">IDR {Number(drink.price).toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                          </div>
                          <p className="text-gray-500 text-sm line-clamp-2 font-light leading-relaxed">{drink.description || "Kesegaran alami pelepas dahaga."}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section id="package-menu" className="py-24 px-6 bg-[#2D2D2D] text-white relative scroll-mt-0">
        <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            <span className="text-[#BFA06D] uppercase tracking-[0.2em] text-xs font-bold block mb-3">
              Special Events
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Menu Paket
            </h2>
            <div className="w-24 h-[1px] bg-[#BFA06D]/50 mx-auto mb-6"></div>
            <p className="text-white/70 font-light text-sm tracking-wider italic">
              *Minimum Order 15 Pax
            </p>
          </motion.div>

          {!loading && (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            >
               {packageMenus.map((pkg) => (
                  <motion.div 
                      key={`pkg-${pkg.id}`}
                      variants={scaleIn}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition duration-500 flex flex-col h-full group"
                      onClick={() => setSelectedItem({ ...pkg, type: 'food' })}
                  >
                      <div className="relative h-64 flex-shrink-0 overflow-hidden">
                           <div className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url('${getImageUrl(pkg.image)}')` }} />
                           <div className="absolute inset-0 bg-gradient-to-t from-[#2D2D2D] via-transparent to-transparent opacity-90"></div>
                           <div className="absolute bottom-6 left-6">
                               <h3 className="text-2xl font-serif font-bold text-white mb-1">{pkg.name}</h3>
                               <div className="text-[#BFA06D] font-medium tracking-wide text-sm">IDR {Number(pkg.price).toLocaleString('id-ID', { maximumFractionDigits: 0 })} <span className="text-white/60 text-xs">/ pax</span></div>
                           </div>
                      </div>
                      <div className="p-8 flex flex-col flex-grow">
                           <ul className="grid grid-cols-2 gap-x-4 gap-y-3 mb-8 flex-grow">
                               {pkg.package_content ? pkg.package_content.split(',').map((item, i) => (
                                 <li key={i} className="text-sm text-gray-300 flex items-start font-light">
                                   <span className="mr-2 text-[#BFA06D] text-xs mt-1">●</span>{item.trim()}
                                 </li>
                               )) : <li className="text-gray-500 italic">Tap for details</li>}
                           </ul>
                           <div className="mt-auto pt-6 border-t border-white/10">
                             <button className="text-white w-full py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 hover:bg-[#BFA06D] hover:border-[#BFA06D] transition-all">View & Order</button>
                           </div>
                      </div>
                  </motion.div>
               ))}
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-[#1a1a1a]/90 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)} />
            
            <motion.div
              className="relative bg-[#FDFCF8] rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh]"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
                <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white w-8 h-8 rounded-full z-10 transition backdrop-blur flex items-center justify-center">
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="h-64 bg-gray-200 flex-shrink-0 relative">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${getImageUrl(selectedItem.image)}')` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-8 right-8">
                       <span className={`text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded border ${
                           (selectedItem as Menu).is_package ? 'border-[#BFA06D] text-[#BFA06D]' : 'border-white text-white'
                       }`}>
                           {(selectedItem as Menu).is_package ? 'Package' : selectedItem.type === 'drink' ? 'Beverage' : 'A La Carte'}
                       </span>
                       <h2 className="text-3xl font-serif text-white mt-2 leading-tight">{selectedItem.name}</h2>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <div className="flex items-baseline justify-between mb-6 pb-6 border-b border-gray-100">
                        <div className="text-2xl font-light text-[#2D2D2D]">
                            IDR {selectedItem.price.toLocaleString('id-ID')}
                            {(selectedItem as Menu).is_package && <span className="text-sm text-gray-400 font-normal"> / pax</span>}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {(selectedItem as Menu).is_package ? (
                           <>
                               <div>
                                   <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2D2D] mb-3">Package Includes</h4>
                                   <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 bg-[#FAF9F6] p-4 rounded-lg">
                                        {(selectedItem as Menu).package_content?.split(',').map((item, idx) => (
                                            <li key={idx} className="text-gray-600 text-sm flex items-start font-light"><span className="mr-2 text-[#BFA06D] mt-1">●</span>{item.trim()}</li>
                                        ))}
                                   </ul>
                               </div>
                               <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded border border-amber-100">
                                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                   Minimum order {(selectedItem as Menu).min_order_qty} pax
                               </div>
                           </>
                        ) : (
                           <>
                               <div>
                                   <h4 className="text-xs font-bold uppercase tracking-widest text-[#2D2D2D] mb-3">Description</h4>
                                   <p className="text-gray-600 leading-7 font-light text-justify">
                                      {selectedItem.description || "Rasakan kenikmatan sajian autentik yang diolah dengan bahan-bahan segar berkualitas tinggi."}
                                   </p>
                               </div>
                               
                               {selectedItem.type === 'drink' && (
                                   <div className="bg-[#FAF9F6] p-5 rounded-lg border border-gray-100">
                                       {(selectedItem as Drink).serving_type === 'both' && (
                                           <div className="mb-4">
                                               <h4 className="text-xs font-bold text-[#2D2D2D] mb-3 uppercase tracking-wider">Sesuaikan :</h4>
                                               <div className="flex gap-2">
                                                   <button onClick={() => setTempSelection('Ice')} className={`px-4 py-2 rounded text-xs font-bold transition flex-1 border ${tempSelection === 'Ice' ? 'bg-[#BFA06D] text-white border-[#BFA06D]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#BFA06D]'}`}>ICE</button>
                                                   <button onClick={() => setTempSelection('Hot')} className={`px-4 py-2 rounded text-xs font-bold transition flex-1 border ${tempSelection === 'Hot' ? 'bg-[#BFA06D] text-white border-[#BFA06D]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#BFA06D]'}`}>HOT</button>
                                               </div>
                                           </div>
                                       )}

                                       {(selectedItem as Drink).has_sugar_option && (
                                           <div>
                                               <h4 className="text-xs font-bold text-[#2D2D2D] mb-3 uppercase tracking-wider">Sesuaikan :</h4>
                                               <div className="flex flex-wrap gap-2">
                                                   {['Normal', 'Less Sugar', 'No Sugar'].map((level) => (
                                                       <button key={level} onClick={() => setSugarLevel(level)} className={`px-4 py-2 rounded text-xs font-bold transition border ${sugarLevel === level ? 'bg-[#BFA06D] text-white border-[#BFA06D]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#BFA06D]'}`}>{level}</button>
                                                   ))}
                                               </div>
                                           </div>
                                       )}
                                   </div>
                               )}

                               {selectedItem.type === 'food' && (selectedItem as Menu).has_flavor_option && (
                                  <div className="bg-[#FAF9F6] p-5 rounded-lg border border-gray-100">
                                           <h4 className="text-xs font-bold text-[#2D2D2D] mb-3 uppercase tracking-wider">Level</h4>
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
                           </>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        {(selectedItem as Menu).is_package ? (
                            <button onClick={handlePackageOrder} className="w-full bg-[#25D366] text-white py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#20bd5a] transition-all duration-300 shadow-xl hover:shadow-[#25D366]/20 flex justify-center gap-3 items-center rounded-lg">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                Order via WhatsApp
                            </button>
                        ) : (
                            <button onClick={handleAddToCart} className="w-full bg-[#2D2D2D] text-white py-4 text-sm font-bold uppercase tracking-[0.15em] hover:bg-[#BFA06D] transition-all duration-300 shadow-xl hover:shadow-[#BFA06D]/20 flex justify-between px-8 items-center rounded-lg">
                                <span>Add to Order</span>
                                <div className="flex gap-2 text-[10px] font-normal tracking-normal opacity-80">
                                    {selectedItem.type === 'drink' && (
                                        <>
                                                <span className="bg-white/20 px-2 py-0.5 rounded">
                                                    {(selectedItem as Drink).serving_type === 'both' ? tempSelection : 
                                                    (selectedItem as Drink).serving_type === 'hot_only' ? 'HOT' : 'ICE'}
                                                </span>
                                                {(selectedItem as Drink).has_sugar_option && sugarLevel !== 'Normal' && (
                                                    <span className="bg-white/20 px-2 py-0.5 rounded">{sugarLevel}</span>
                                                )}
                                        </>
                                    )}
                                    {selectedItem.type === 'food' && !(selectedItem as Menu).is_package && (selectedItem as Menu).has_flavor_option && (
                                        <span className="bg-white/20 px-2 py-0.5 rounded">{flavorSelection}</span>
                                    )}
                                </div>
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}