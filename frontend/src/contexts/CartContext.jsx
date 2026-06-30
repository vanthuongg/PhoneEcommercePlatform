import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [shippingFee, setShippingFee] = useState(30000); // Mặc định 30k

  const fetchCart = useCallback(async () => {
    if (!user) return;
    try {
      const res = await cartAPI.get();
      setCart(res.data || { items: [], totalPrice: 0 });
    } catch {
      setCart({ items: [], totalPrice: 0 });
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1, size = 'M', color = 'Default') => {
    setLoading(true);
    try {
      const res = await cartAPI.add(productId, quantity, size, color);
      setCart(res.data);
      toast.success('Đã thêm vào giỏ hàng!');
      return { success: true };
    } catch (err) {
      const msg = err.message || 'Không thể thêm vào giỏ hàng';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(async (productId, quantity, size, color) => {
    setLoading(true);
    try {
      const res = await cartAPI.update(productId, quantity, size, color);
      setCart(res.data);
    } catch (err) {
      toast.error(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (productId, size, color) => {
    setLoading(true);
    try {
      const res = await cartAPI.remove(productId, size, color);
      setCart(res.data);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err) {
      toast.error(err.message || 'Xóa thất bại');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartAPI.clear();
      setCart({ items: [], totalPrice: 0 });
      setAppliedVoucher(null);
    } catch {}
  }, []);

  const applyVoucher = useCallback((voucher) => {
    setAppliedVoucher(voucher);
    if (voucher?.discountType === 'freeship') {
      setShippingFee(0);
    }
    toast.success(`Áp dụng voucher ${voucher.code} thành công!`);
  }, []);

  const removeVoucher = useCallback(() => {
    setAppliedVoucher(null);
    setShippingFee(30000);
    toast.success('Đã hủy áp dụng voucher');
  }, []);

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // Tính subtotal
  const subtotal = cart.items?.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) || 0;
  
  // Tính số tiền giảm
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percentage') {
      discountAmount = (subtotal * appliedVoucher.discountValue) / 100;
      if (appliedVoucher.maxDiscountAmount && discountAmount > appliedVoucher.maxDiscountAmount) {
        discountAmount = appliedVoucher.maxDiscountAmount;
      }
    } else if (appliedVoucher.discountType === 'fixed') {
      discountAmount = appliedVoucher.discountValue;
    }
  }
  
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartCount,
      subtotal,
      discountAmount,
      shippingFee,
      finalTotal,
      appliedVoucher,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      fetchCart,
      applyVoucher,
      removeVoucher
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
