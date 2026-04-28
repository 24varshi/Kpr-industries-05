import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signInWithPopup, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { collection, addDoc, getDoc, getDocs, deleteDoc, doc, updateDoc, setDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Product, Order } from '../types';
import { Settings as SettingsIcon, Users, Plus, Trash2, LogOut, Package, ShoppingBag, LayoutDashboard, Loader2, Image as ImageIcon, ChevronRight, CheckCircle, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'settings' | 'admins'>('dashboard');
  const [adminEmails, setAdminEmails] = useState<{id: string, email: string}[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    address: 'Banjara Hills, Road No 12, Hyderabad, TS 500034',
    phone: '9848098718',
    whatsapp: '9848098718',
    email: 'hello@kprkitchen.com',
    announcement: 'New Arrivals: Professional Cookware Collection!'
  });

  // Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    category: 'Baskets',
    image: '',
    description: ''
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let authUnsubscribe: () => void;
    let dataUnsubscribes: (() => void)[] = [];

    const cleanupData = () => {
      dataUnsubscribes.forEach(unsub => unsub());
      dataUnsubscribes = [];
    };

    authUnsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      try {
        if (u) {
          const isHardcodedAdmin = u.email === 'gsrinivasarao9699@gmail.com';
          let isDbAdmin = false;

          // Admin check
          if (isHardcodedAdmin) {
            isDbAdmin = true;
          } else {
            try {
              // Instead of listing all (which might be blocked), just check if the user's specific email doc exists
              const emailDocRef = doc(db, 'admin_emails', u.email || 'none');
              const adminEmailsSnap = await getDoc(emailDocRef);
              isDbAdmin = adminEmailsSnap.exists();
            } catch (e) {
              console.log("Admin email check failed - user likely not admin", e);
            }
          }

          if (isHardcodedAdmin || isDbAdmin) {
            setIsAdmin(true);
            cleanupData();
            
            // Re-adding listeners without orderBy first to ensure they work without indexes
            dataUnsubscribes.push(onSnapshot(collection(db, 'products'), (snap) => {
              setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)).sort((a, b) => {
                const da = a.createdAt?.seconds || 0;
                const db = b.createdAt?.seconds || 0;
                return db - da;
              }));
            }, (err) => console.error("Products listener error:", err)));

            dataUnsubscribes.push(onSnapshot(collection(db, 'orders'), (snap) => {
              setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)).sort((a, b) => {
                const da = (a.createdAt as any)?.seconds || 0;
                const db = (b.createdAt as any)?.seconds || 0;
                return db - da;
              }));
            }, (err) => console.error("Orders listener error:", err)));

            dataUnsubscribes.push(onSnapshot(collection(db, 'settings'), (snap) => {
              if (!snap.empty) {
                const data = snap.docs[0].data();
                setSettings({
                  address: data.address || '',
                  phone: data.phone || '',
                  whatsapp: data.whatsapp || '',
                  email: data.email || '',
                  announcement: data.announcement || ''
                });
              }
            }, (err) => console.error("Settings listener error:", err)));

            dataUnsubscribes.push(onSnapshot(collection(db, 'admin_emails'), (snap) => {
              setAdminEmails(snap.docs.map(d => ({ id: d.id, email: d.data().email })));
            }, (err) => console.error("Admin emails listener error:", err)));
          } else {
            setIsAdmin(false);
            cleanupData();
          }
        } else {
          setIsAdmin(false);
          cleanupData();
        }
      } catch (e) {
        console.error("Auth state processing failed:", e);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      cleanupData();
    };
  }, []);

  const fetchData = async () => {
    // Legacy - mostly handled by snapshot now but kept for initial/re-sync if needed
    try {
      const aeSnap = await getDocs(collection(db, 'admin_emails'));
      setAdminEmails(aeSnap.docs.map(d => ({ id: d.id, email: d.data().email })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAdminEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    try {
      await setDoc(doc(db, 'admin_emails', newAdminEmail), { email: newAdminEmail });
      setNewAdminEmail('');
      console.log('Admin added');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'admin_emails');
    }
  };

  const handleRemoveAdminEmail = async (emailId: string) => {
    try {
      await deleteDoc(doc(db, 'admin_emails', emailId));
      console.log('Admin removed:', emailId);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'admin_emails');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sSnap = await getDocs(collection(db, 'settings'));
      if (sSnap.empty) {
        await addDoc(collection(db, 'settings'), settings);
      } else {
        await updateDoc(doc(db, 'settings', sSnap.docs[0].id), settings);
      }
      console.log('Settings updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings');
    }
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const { id, ...data } = editingProduct;
      await updateDoc(doc(db, 'products', id), {
        ...data,
        updatedAt: serverTimestamp()
      });
      setEditingProduct(null);
      console.log('Product updated');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${editingProduct?.id}`);
    }
  };

  const cleanupSeededProducts = async () => {
    const seededNames = [
      'Plain Basket (Stainless Steel)',
      'Cup & Saucer Basket',
      'Cutlery Basket',
      'Thali Basket',
      'Airtight Glass Container Set',
      'Stainless Steel Mixing Bowl',
      'Ergonomic Silicone Spatula',
      'Professional Non-Stick Pan'
    ];
    
    try {
      const toDelete = products.filter(p => seededNames.includes(p.name));
      for (const product of toDelete) {
        await deleteDoc(doc(db, 'products', product.id));
      }
      console.log(`Cleaned up ${toDelete.length} products`);
      navigate('/shop');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        createdAt: serverTimestamp()
      });
      setNewProduct({ name: '', price: 0, category: 'Cookware', image: '', description: '' });
      console.log('Product added');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  };

  const deleteProduct = async (id: string) => {
    console.log('Admin deleting product:', id);
    try {
      await deleteDoc(doc(db, 'products', id));
      console.log('Admin: Delete successful for', id);
    } catch (error: any) {
      console.error('Admin delete failed:', error);
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'orders');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchData();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'orders');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-brand-orange mb-4" size={48} />
        <p className="text-gray-500 font-medium font-display animate-pulse">Verifying privileges...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-gray-100 shadow-2xl text-center">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <LayoutDashboard className="text-brand-orange" size={40} />
          </div>
          <h1 className="text-3xl font-display font-bold mb-4">Admin Portal</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Exclusive access for KPR Kitchen store management. Please sign in with your authorized admin account.
          </p>
          <button
            onClick={handleLogin}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4"
          >
            Sign in with Google
          </button>
          {!user && <p className="mt-6 text-xs text-gray-400">Restricted Area. Authorized Personnel Only.</p>}
          {user && !isAdmin && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              Access Denied: {user.email} is not an authorized administrator.
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-brand-black text-white p-6 md:sticky md:top-16 md:h-[calc(100vh-64px)] overflow-y-auto">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center font-bold text-xl">K</div>
          <h2 className="font-display font-bold text-xl">KPR Admin</h2>
        </div>

        <nav className="space-y-4">
          <AdminNavLink
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
          />
          <AdminNavLink
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            icon={<Package size={20} />}
            label="Products"
          />
          <AdminNavLink
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            icon={<ShoppingBag size={20} />}
            label="Orders"
          />
          <AdminNavLink
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            icon={<SettingsIcon size={20} />}
            label="Settings"
          />
          <AdminNavLink
            active={activeTab === 'admins'}
            onClick={() => setActiveTab('admins')}
            icon={<Users size={20} />}
            label="Admins"
          />
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 text-gray-400 hover:text-red-400 transition-colors mt-auto pt-10"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout Admin</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-6 md:p-10">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-display font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 font-medium hidden sm:block">{user.email}</span>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
              <img src={user.photoURL || ''} alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatsCard title="Total Products" value={products.length} color="bg-blue-500" />
              <StatsCard title="Total Orders" value={orders.length} color="bg-green-500" />
              <StatsCard title="Recent Orders" value={orders.filter(o => o.status === 'pending').length} color="bg-brand-orange" />
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={80} className="text-brand-orange" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-2">Welcome Back, {user.displayName || 'Admin'}</h3>
                <p className="text-gray-500 max-w-xl">You have {orders.filter(o => o.status === 'pending').length} new orders waiting for confirmation. Your shop is performing great!</p>
                <div className="flex gap-4">
                  <button onClick={() => setActiveTab('orders')} className="mt-8 btn-primary inline-flex items-center">
                    Review Orders <ChevronRight className="ml-2" />
                  </button>
                  {products.some(p => [
                    'Plain Basket (Stainless Steel)', 
                    'Cup & Saucer Basket', 
                    'Cutlery Basket', 
                    'Thali Basket'
                  ].includes(p.name)) && (
                    <button 
                      onClick={cleanupSeededProducts} 
                      className="mt-8 px-6 py-3 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 border border-red-100 flex items-center gap-2"
                    >
                      <Trash2 size={18} /> Remove Sample Products
                    </button>
                  )}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-10">
            {/* Form Section (Add or Edit) */}
            <div className="bento-card">
              <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center">
                {editingProduct ? (
                   <><Plus className="mr-2 text-brand-orange rotate-45" /> Edit Product</>
                ) : (
                  <><Plus className="mr-2 text-brand-orange" /> Add New Product</>
                )}
              </h3>
              <form onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Name</label>
                  <input
                    required
                    placeholder="e.g. Forged Steel Knife"
                    className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                    value={editingProduct ? editingProduct.name : newProduct.name}
                    onChange={e => editingProduct 
                      ? setEditingProduct({ ...editingProduct, name: e.target.value })
                      : setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Price (₹)</label>
                  <input
                    required
                    type="number"
                    placeholder="2499"
                    className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                    value={editingProduct ? editingProduct.price : (newProduct.price || '')}
                    onChange={e => editingProduct
                      ? setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                      : setNewProduct({ ...newProduct, price: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2 text-brand-black">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-sans">Category</label>
                    <select
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold text-neutral-900"
                      value={editingProduct ? editingProduct.category : newProduct.category}
                      onChange={e => editingProduct
                        ? setEditingProduct({ ...editingProduct, category: e.target.value })
                        : setNewProduct({ ...newProduct, category: e.target.value })
                      }
                    >
                      <option value="Baskets">Baskets</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Storage">Storage</option>
                      <option value="Appliances">Appliances</option>
                    </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Image URL</label>
                  <input
                    required
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                    value={editingProduct ? editingProduct.image : newProduct.image}
                    onChange={e => editingProduct
                      ? setEditingProduct({ ...editingProduct, image: e.target.value })
                      : setNewProduct({ ...newProduct, image: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                  <textarea
                    placeholder="Describe the product features..."
                    className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                    rows={3}
                    value={editingProduct ? (editingProduct.description || '') : newProduct.description}
                    onChange={e => editingProduct
                      ? setEditingProduct({ ...editingProduct, description: e.target.value })
                      : setNewProduct({ ...newProduct, description: e.target.value })
                    }
                  ></textarea>
                </div>
                <div className="md:col-span-2 flex gap-4">
                  <button type="submit" className="flex-grow btn-primary py-4">
                    {editingProduct ? 'Save Changes' : 'Add Product to Store'}
                  </button>
                  {editingProduct && (
                    <button 
                      type="button" 
                      onClick={() => setEditingProduct(null)}
                      className="px-8 border-2 border-neutral-200 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-neutral-100 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Products List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bento-card flex flex-col group h-full">
                  <div className="h-48 bg-neutral-100 rounded-2xl mb-4 overflow-hidden relative">
                    {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={p.name} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-gray-300" /></div>
                    )}
                    <span className="absolute top-2 left-2 bg-brand-orange text-white text-[10px] px-2 py-1 rounded font-black uppercase tracking-widest">
                      {p.category}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black uppercase tracking-tight mb-1 truncate">{p.name}</h4>
                    <p className="text-brand-orange font-black text-xl mb-4">₹{p.price}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-neutral-100">
                    <button 
                      onClick={() => {
                        setEditingProduct(p);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex-grow py-2 bg-neutral-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange transition-colors"
                    >
                      Edit 
                    </button>
                    <button 
                      onClick={() => deleteProduct(p.id)} 
                      className="flex-grow py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <AnimatePresence>
              {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">No orders received yet.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-600' : 
                          order.status === 'pending' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                        <h4 className="font-bold text-lg">{order.customerName}</h4>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center sm:space-x-4 flex-wrap">
                        <span className="flex items-center space-x-1"><LogOut size={14} className="rotate-90" /> {order.customerPhone}</span>
                        <span className="flex items-center space-x-1"><Plus size={14} className="rotate-45" /> {order.items.length} items</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-2 truncate max-w-md">{order.customerAddress}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-xl font-bold text-brand-black">₹{order.totalAmount}</p>
                        <p className="text-[10px] text-gray-400 font-mono">ID: {order.id?.slice(-8)}</p>
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id!, e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange text-sm font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button onClick={() => deleteOrder(order.id!)} className="p-2 text-gray-300 hover:text-red-500">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl">
            <div className="bento-card">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8">Store Contact Details</h3>
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Business Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={e => setSettings({ ...settings, email: e.target.value })}
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                      placeholder="hello@store.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone Number</label>
                    <input
                      type="text"
                      value={settings.phone}
                      onChange={e => setSettings({ ...settings, phone: e.target.value })}
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                      placeholder="+91..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp Number</label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={e => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                      placeholder="+91..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Announcement</label>
                    <input
                      type="text"
                      value={settings.announcement}
                      onChange={e => setSettings({ ...settings, announcement: e.target.value })}
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                      placeholder="Free delivery on orders over ₹1000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Store Address</label>
                  <textarea
                    rows={4}
                    value={settings.address}
                    onChange={e => setSettings({ ...settings, address: e.target.value })}
                    className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                    placeholder="Physical address..."
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary w-full py-5">Update Settings</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="max-w-4xl space-y-8">
            <div className="bento-card">
              <h3 className="text-xl font-black uppercase tracking-tight mb-8">Whitelisted Administrators</h3>
              <form onSubmit={handleAddAdminEmail} className="flex gap-4 mb-8">
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={e => setNewAdminEmail(e.target.value)}
                  placeholder="Enter admin email address..."
                  className="flex-grow p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                  required
                />
                <button type="submit" className="btn-primary py-4 px-8">Add Admin</button>
              </form>

              <div className="space-y-3">
                {adminEmails.map(admin => (
                  <div key={admin.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                    <span className="font-bold">{admin.email}</span>
                    <button
                      onClick={() => handleRemoveAdminEmail(admin.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {adminEmails.length === 0 && (
                  <p className="text-center py-6 text-neutral-400 font-bold uppercase text-xs tracking-widest">No additional admins whitelisted</p>
                )}
              </div>
            </div>
            
            <div className="p-8 bg-brand-orange/10 border-2 border-brand-orange/20 rounded-3xl">
              <h4 className="font-black uppercase tracking-tight text-brand-orange mb-2">Important Note</h4>
              <p className="text-sm font-bold text-brand-orange/80 leading-relaxed">
                Whitelisted users will gain full access to the admin panel upon logging in with their Google account. 
                Ensure you only whitelist trusted email addresses.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminNavLink({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
        active 
          ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' 
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function StatsCard({ title, value, color }: { title: string, value: number, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
      <div className={`absolute bottom-0 right-0 w-16 h-16 ${color} opacity-0 group-hover:opacity-10 transition-opacity rounded-tl-full`}></div>
      <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">{title}</p>
      <p className="text-4xl font-display font-bold text-brand-black">{value}</p>
    </div>
  );
}
