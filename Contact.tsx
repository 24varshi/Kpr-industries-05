import React from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, MessageSquare, Send, Clock, Globe } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Contact() {
  const { settings } = useSettings();

  const handleWhatsApp = () => {
    const cleanPhone = settings.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Greeting Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="md:col-span-7 bento-card flex flex-col justify-center"
        >
          <span className="text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] mb-4 block">Get In touch</span>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-tight">We Love to <br/><span className="text-brand-orange">Hear From You</span></h1>
          <p className="text-neutral-600 font-bold max-w-md">Whether you have a product question or just want to share a recipe, our team is ready to help.</p>
        </motion.div>

        {/* Contact info grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-5 bento-card-black flex flex-col space-y-8 p-10"
        >
          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-700">
              <Mail className="text-brand-orange" />
            </div>
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Email Support</h4>
               <p className="font-bold">{settings.email}</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-700">
              <Phone className="text-brand-orange" />
            </div>
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Phone / WhatsApp</h4>
               <p className="font-bold">{settings.phone}</p>
            </div>
          </div>
          <div className="flex items-start space-x-6">
            <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center shrink-0 border border-neutral-700">
              <MapPin className="text-brand-orange" />
            </div>
            <div>
               <h4 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">Business Hub</h4>
               <p className="font-bold">{settings.address}</p>
            </div>
          </div>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-12 bento-card p-12"
        >
          <form className="grid grid-cols-1 md:grid-cols-2 gap-8 text-brand-black">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Your Identity</label>
              <input type="text" placeholder="Full Name" className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
              <input type="email" placeholder="email@example.com" className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">How can we help?</label>
              <textarea rows={4} placeholder="Your message..." className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"></textarea>
            </div>
            <div className="md:col-span-2 flex flex-col md:flex-row gap-4">
              <button type="submit" className="flex-grow btn-primary py-5">
                Send Message
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                className="px-10 bg-[#25D366] text-white rounded-2xl flex items-center justify-center space-x-3 hover:scale-[1.02] transition-transform font-black uppercase tracking-widest text-sm"
              >
                <MessageSquare size={20} />
                <span>WhatsApp</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function ContactCard({ icon, title, value, sub }: { icon: React.ReactNode, title: string, value: string, sub: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start space-x-4">
      <div className="p-3 bg-brand-orange/10 rounded-2xl">{icon}</div>
      <div>
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-xl font-bold text-brand-black mb-1">{value}</p>
        <p className="text-sm text-gray-500">{sub}</p>
      </div>
    </div>
  );
}
