import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="https://res.cloudinary.com/dol9am1ym/image/upload/v1777359093/IMG-20260427-WA0012_zzvynv.jpg" 
            alt="KPR Logo" 
            className="w-10 h-10 object-contain rounded-md"
          />
          <div className="flex flex-col -space-y-1">
            <span className="text-xl font-black tracking-tighter uppercase leading-none text-brand-black">KPR <span className="text-brand-orange">Industries</span></span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">MFG Kitchen Baskets</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {links.map((link) => (
            <Link key={link.path} to={link.path} className="nav-link">
              {link.name}
            </Link>
          ))}
          <div className="h-6 w-px bg-neutral-200 mx-2"></div>
          <Link to="/cart" className="relative p-2 bg-white border-2 border-brand-black rounded-full text-brand-black hover:text-brand-orange transition-colors">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {totalItems}
              </span>
            )}
          </Link>
          <Link to="/admin" className="p-2 border-2 border-neutral-200 rounded-full text-neutral-400 hover:text-brand-orange hover:border-brand-orange transition-colors">
            <User size={20} />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center space-x-4 md:hidden">
          <Link to="/cart" className="relative p-2">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-brand-orange text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-4 flex flex-col space-y-4 md:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium hover:text-brand-orange transition-colors"
                id={`mobile-nav-${link.name.toLowerCase()}`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium hover:text-brand-orange transition-colors"
              id="mobile-nav-admin"
            >
              Admin Panel
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
