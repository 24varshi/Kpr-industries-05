import { ShoppingCart, Heart, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onDelete?: (id: string) => void;
}

export default function ProductCard({ product, onDelete }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bento-card flex flex-col h-full group"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-4">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1588636410403-91185590c883?auto=format&fit=crop&w=400&q=80'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-3 left-3 bg-brand-orange text-white text-[10px] px-2 py-1 rounded font-black uppercase tracking-widest">
          {product.category}
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full text-brand-black hover:text-brand-orange transition-colors">
            <Heart size={16} />
          </button>
          {onDelete && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(product.id);
              }}
              className="p-2 bg-red-100/80 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
              title="Delete Product"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 mb-1 line-clamp-1 group-hover:text-brand-orange transition-colors">
          {product.name}
        </h3>
        <p className="text-neutral-500 text-xs line-clamp-2 flex-grow mb-4">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
          <span className="text-2xl font-black text-neutral-900">₹{product.price}</span>
          <button
            onClick={() => addToCart(product)}
            className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center hover:bg-brand-black transition-colors active:scale-90"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {/* Mobile quick add */}
        <button
          onClick={() => addToCart(product)}
          className="md:hidden mt-4 w-full bg-brand-black text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
