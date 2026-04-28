import { useState, useEffect } from 'react';
import { collection, getDoc, getDocs, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Filter, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const categories = ['All', 'Baskets', 'Accessories', 'Storage', 'Appliances'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isHardcodedAdmin = user.email === 'gsrinivasarao9699@gmail.com';
        if (isHardcodedAdmin) {
          setIsAdmin(true);
        } else {
          try {
            const adminEmailRef = doc(db, 'admin_emails', user.email || 'none');
            const adminSnap = await getDoc(adminEmailRef);
            setIsAdmin(adminSnap.exists());
          } catch (e) {
            console.error("Admin check failed", e);
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Product));
      setProducts(productsList);
      setLoading(false);
    }, (error) => {
      console.error('Products listener failed:', error);
      handleFirestoreError(error, OperationType.LIST, 'products');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    console.log('Shop: Initiating delete for', id);
    try {
      await deleteDoc(doc(db, 'products', id));
      console.log('Shop: Delete successful for', id);
    } catch (error: any) {
      console.error('Shop: Delete failed:', error);
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
        <div>
          <span className="text-brand-orange text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">Premium Collection</span>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Kitchen <br/><span className="text-brand-orange">Equipment</span></h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-brand-orange transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search tools..."
              className="pl-12 pr-6 py-3 bg-white border-2 border-neutral-200 rounded-2xl outline-none focus:border-brand-orange transition-all w-full sm:w-64 font-bold text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 bg-neutral-100 p-1.5 rounded-2xl border-2 border-neutral-200 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-black text-white shadow-lg'
                    : 'text-neutral-500 hover:text-brand-orange'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
          <p className="text-gray-500">Wait a moment, we're getting our tools ready...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <h3 className="text-2xl font-bold mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
          <button
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
            className="text-brand-orange font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ProductCard 
                product={product} 
                onDelete={isAdmin ? handleDelete : undefined} 
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
