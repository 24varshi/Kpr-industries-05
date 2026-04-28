import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, Truck, ShieldCheck, Heart, Phone, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Home() {
  const { settings } = useSettings();

  const handleWhatsApp = () => {
    const cleanPhone = settings.whatsapp ? settings.whatsapp.replace(/\D/g, '') : '';
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <main className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto">
        
        {/* Large Hero Banner (8x4 for desktop equivalent in grid) */}
        <motion.div
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5 }}
           className="md:col-span-8 md:row-span-2 bento-card-black flex flex-col justify-end min-h-[400px] md:min-h-[500px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
              alt="Kitchen Hero"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-4 md:p-10">
            <span className="bg-brand-orange text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded mb-6 inline-block">
              {settings.announcement ? 'Special Notice' : 'New Arrival'}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-8">
              KPR INDUSTRIES <br />
              <span className="text-brand-orange uppercase text-3xl md:text-4xl block mt-2">MFG. OF KITCHEN BASKETS</span>
            </h1>
            <Link to="/shop" className="bg-white text-brand-black font-black px-8 py-4 rounded-xl hover:bg-brand-orange hover:text-white transition-all flex items-center group w-fit">
              SHOP COLLECTION
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Women Owned Highlight (4x1) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-4 bento-card bg-orange-50 border-orange-200 flex flex-col justify-center items-center text-center p-8 transition-colors hover:bg-orange-100"
        >
          <div className="w-16 h-16 bg-white border-2 border-brand-orange rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Heart className="text-brand-orange" size={32} />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight mb-2">Proudly Women-Owned</h3>
          <p className="text-sm text-neutral-600">Supporting local entrepreneurship since 2018.</p>
        </motion.div>

        {/* Quick Contact & WhatsApp (4x1) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-4 bento-card flex flex-col justify-between p-8"
        >
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-black uppercase tracking-tight">Questions?</h4>
            <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">Active Now</div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-neutral-600">
              <Phone size={18} />
              <span className="text-sm font-bold tracking-tight">{settings.phone}</span>
            </div>
            <button
              onClick={handleWhatsApp}
              className="w-full bg-[#25D366] text-white font-black py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-green-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <MessageCircle size={20} />
              <span className="uppercase tracking-widest text-sm">Chat on WhatsApp</span>
            </button>
          </div>
        </motion.div>

      
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7 }}
           className="md:col-span-3 bento-card relative group flex flex-col justify-center items-center text-center overflow-hidden"
        >
            <div className="absolute inset-0 bg-neutral-100 group-hover:scale-110 transition-transform duration-700 opacity-20"></div>
            <Truck className="text-brand-orange mb-4" size={40} />
            <h4 className="font-black uppercase tracking-tight mb-2">Fast Delivery</h4>
            <p className="text-xs text-neutral-500">To your doorstep across the city.</p>
        </motion.div>

      </main>
    </div>
  );
}

function CategoryCard({ num, name, delay, black, orange }: { num: string, name: string, delay: number, black?: boolean, orange?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`md:col-span-3 bento-card p-6 flex flex-col justify-between overflow-hidden relative group ${
        black ? 'bg-brand-black text-white border-brand-black' : 
        orange ? 'bg-brand-orange text-white border-brand-orange' : 'hover:border-brand-orange'
      }`}
    >
      <div className="relative z-10">
        <span className={`text-[10px] font-black uppercase tracking-widest opacity-60`}>{num}</span>
        <h3 className="text-2xl font-black uppercase leading-tight mt-2">{name}</h3>
      </div>
      <Link to="/shop" className="relative z-10 mt-12 text-[10px] font-black uppercase tracking-widest hover:underline">
        Explore Category &rarr;
      </Link>
    </motion.div>
  );
}
