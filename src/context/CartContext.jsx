import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { trackAddToCart } from '../lib/analytics';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const loadCart = async () => {
    if (!user) { setCartItems([]); return; }
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user.id);
    setCartItems(data || []);
  };

  useEffect(() => { loadCart(); }, [user]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) { toast.error('Please log in to add items to cart'); return; }
    const existing = cartItems.find(i => i.product_id === product.id);
    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        user_id: user.id,
        product_id: product.id,
        quantity,
      });
    }
    trackAddToCart(product, quantity);
    toast.success(`${product.name} added to cart!`);
    loadCart();
  };

  const removeFromCart = async (itemId) => {
    await supabase.from('cart_items').delete().eq('id', itemId);
    loadCart();
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) { removeFromCart(itemId); return; }
    await supabase.from('cart_items').update({ quantity }).eq('id', itemId);
    loadCart();
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from('cart_items').delete().eq('user_id', user.id);
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.products?.price || 0) * item.quantity, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartOpen, setCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
