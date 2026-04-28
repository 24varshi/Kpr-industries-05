import React from 'react';
import { motion } from 'motion/react';
import { Heart, ShieldCheck, Star } from 'lucide-react';

export default function About() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Story Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="md:col-span-8 bento-card flex flex-col justify-center"
        >
          <span className="text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Our Legacy</span>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">The <span className="text-brand-orange">KPR Industries</span> Story</h1>
          <div className="space-y-6 text-neutral-600 font-bold leading-relaxed">
            <p>Founded in 2018 in the heart of Hyderabad, KPR Industries began with a simple mission: to manufacture high-grade kitchen baskets that combine durability with modern aesthetics.</p>
            <p>As a leading manufacturer (MFG) of kitchen baskets, we understand the importance of organization in the modern home. Our facility uses state-of-the-art processes to ensure every product meets global quality standards.</p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-4 bento-card-black flex flex-col justify-between"
        >
          <div className="space-y-8">
            <div>
              <h2 className="text-5xl font-black text-brand-orange leading-none">6+</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-2">Years of Service</p>
            </div>
            <div>
              <h2 className="text-5xl font-black text-white leading-none">1000+</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mt-2">Happy Customers</p>
            </div>
          </div>
          <div className="bg-brand-orange/20 p-4 rounded-2xl border border-brand-orange/30">
            <p className="text-xs italic font-bold">"Excellence is not an act, but a habit."</p>
          </div>
        </motion.div>

        {/* Values section */}
        {[
          { icon: <Star className="text-brand-orange" />, title: "Quality", desc: "We only sell what we would use in our own kitchens." },
          { icon: <Heart className="text-brand-orange" />, title: "Trust", desc: "Built through honest pricing and support." },
          { icon: <ShieldCheck className="text-brand-orange" />, title: "Secure", desc: "Always ensuring safe and reliable transactions." }
        ].map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="md:col-span-4 bento-card flex items-center space-x-6"
          >
            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center shrink-0 border-2 border-neutral-200">
              {v.icon}
            </div>
            <div>
              <h3 className="font-black uppercase tracking-tight">{v.title}</h3>
              <p className="text-xs text-neutral-500 font-bold mt-1">{v.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) {
  return (
    <div className="p-10 border border-gray-100 rounded-3xl text-center hover:bg-white hover:shadow-xl transition-all group">
      <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
    </div>
  );
}
