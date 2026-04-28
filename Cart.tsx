import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { settings } = useSettings();
  const [isCheckout, setIsCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: 'COD' as 'COD' | 'UPI'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customerName: formData.name,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        items: cart,
        totalAmount: totalPrice,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // WhatsApp Message Formatting
      const itemsList = cart.map(item => `${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}`).join('\n');
      const message = `*New Order from KPR Kitchen Store*\n\n*Order ID:* ${docRef.id}\n*Customer:* ${formData.name}\n*Phone:* ${formData.phone}\n*Address:* ${formData.address}\n\n*Items:*\n${itemsList}\n\n*Total:* ₹${totalPrice}\n*Payment:* ${formData.paymentMethod}\n\nThank you for shopping with us!`;
      
      const cleanPhone = settings.whatsapp.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(message)}`;
      
      clearCart();
      window.open(whatsappUrl, '_blank');
      navigate('/');
      console.log('Order placed successfully');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven't added anything to your kitchen collection yet.</p>
        <Link to="/shop" className="btn-primary inline-flex items-center">
          Start Shopping <ArrowRight size={20} className="ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-12">Your <span className="text-brand-orange">Cart</span></h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3 space-y-4">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bento-card flex items-center gap-6 p-4"
              >
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-2xl" />
                <div className="flex-grow">
                  <h3 className="font-black uppercase tracking-tight text-lg">{item.name}</h3>
                  <p className="text-brand-orange font-black text-xl">₹{item.price}</p>
                </div>
                <div className="flex items-center space-x-4 bg-neutral-100 p-2 rounded-xl border-2 border-neutral-200">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:text-brand-orange">
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-black">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:text-brand-orange">
                    <Plus size={16} />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-3 text-neutral-300 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary / Checkout */}
        <div className="lg:w-1/3">
          <div className="bento-card sticky top-24">
            {!isCheckout ? (
              <>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Order Summary</h3>
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-neutral-500 text-sm font-bold uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-sm font-bold uppercase tracking-widest">
                    <span>Delivery</span>
                    <span className="text-green-500">FREE</span>
                  </div>
                  <div className="border-t-2 border-neutral-100 pt-6 flex justify-between font-black text-2xl">
                    <span className="uppercase tracking-tight">Total</span>
                    <span className="text-brand-orange">₹{totalPrice}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckout(true)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Delivery Details</h3>
                <form onSubmit={placeOrder} className="space-y-6 text-brand-black">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                      placeholder="+91..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Address</label>
                    <textarea
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                      placeholder="Street, City..."
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment</label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      className="w-full p-4 bg-gray-50 border-2 border-neutral-100 rounded-2xl outline-none focus:border-brand-orange transition-colors font-bold"
                    >
                      <option value="COD">Cash on Delivery</option>
                      <option value="UPI">UPI Payment</option>
                    </select>
                  </div>
                  <div className="pt-4 space-y-4">
                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full btn-primary disabled:opacity-50 flex items-center justify-center gap-3 py-5"
                    >
                      {loading ? 'Processing...' : 'Place Order via WhatsApp'}
                      <MessageCircle size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCheckout(false)}
                      className="w-full text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-brand-orange transition-colors"
                    >
                      Back to Cart
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
