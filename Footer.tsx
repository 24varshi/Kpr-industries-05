import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Camera, Globe, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="bg-brand-black text-white py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <img 
              src="https://res.cloudinary.com/dol9am1ym/image/upload/v1777359093/IMG-20260427-WA0012_zzvynv.jpg" 
              alt="KPR Logo" 
              className="w-12 h-12 object-contain rounded-md"
            />
            <h3 className="text-2xl font-black uppercase tracking-tight text-brand-orange">KPR Industries</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Leading Manufacturer of Premium Kitchen Baskets and Stainless Steel Storage Solutions. Delivering precision-engineered durability for your home.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-display font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/" className="hover:text-brand-orange transition-colors">Home</Link></li>
            <li><Link to="/shop" className="hover:text-brand-orange transition-colors">Shop</Link></li>
            <li><Link to="/about" className="hover:text-brand-orange transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-brand-orange transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-display font-semibold mb-4">Contact Info</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex items-center space-x-3">
              <Phone size={16} className="text-brand-orange" />
              <span>{settings.phone}</span>
            </li>
            <li className="flex items-center space-x-3">
              <Mail size={16} className="text-brand-orange" />
              <span>{settings.email}</span>
            </li>
            <li className="flex items-start space-x-3">
              <MapPin size={16} className="text-brand-orange mt-1" />
              <span>{settings.address}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-display font-semibold mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-orange transition-colors">
              <Camera size={20} />
            </a>
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-orange transition-colors">
              <Globe size={20} />
            </a>
            <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-brand-orange transition-colors">
              <MessageCircle size={20} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} KPR Industries - MFG of Kitchen Baskets. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
