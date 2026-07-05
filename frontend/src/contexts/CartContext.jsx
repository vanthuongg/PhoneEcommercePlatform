import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const formatCurrency = (val) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [appliedVouchers, setAppliedVouchers] = useState({
    freeship: null,
    platform: null,
    shop: {},
  });
  const [shippingFee, setShippingFee] = useState(30000); // Mặc định 30k
  const [flyingItem, setFlyingItem] = useState(null);
  const [floatingToast, setFloatingToast] = useState(null);

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

  const triggerFlyingEffect = useCallback((image, startX, startY) => {
    if (!startX || !startY) return;
    setFlyingItem({
      id: Date.now(),
      image: image || 'https://via.placeholder.com/60',
      startX,
      startY
    });
    setTimeout(() => {
      setFlyingItem(null);
    }, 1450);
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1, size = 'M', color = 'Default', productInfo = null) => {
    setLoading(true);
    try {
      if (productInfo?.startX && productInfo?.startY && !productInfo.skipEffect) {
        triggerFlyingEffect(productInfo.image, productInfo.startX, productInfo.startY);
      }

      const res = await cartAPI.add(productId, quantity, size, color);
      setCart(res.data);

      if (!productInfo?.skipToast) {
        if (productInfo?.startX && productInfo?.startY) {
          setFloatingToast({
            id: Date.now(),
            startX: productInfo.startX,
            startY: productInfo.startY,
            message: 'Đã thêm sản phẩm vào giỏ hàng!'
          });
          setTimeout(() => {
            setFloatingToast(null);
          }, 2300);
        } else {
          toast.success('Đã thêm sản phẩm vào giỏ hàng!', { duration: 3000, id: 'cart-toast' });
        }
      }

      return { success: true };
    } catch (err) {
      const msg = err.message || 'Không thể thêm vào giỏ hàng';
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  }, [triggerFlyingEffect]);

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
      setAppliedVouchers({ freeship: null, platform: null, shop: {} });
    } catch {}
  }, []);

  // Áp dụng 1 voucher vào đúng tầng
  const applyVoucher = useCallback((voucher, layer = '', brand = '') => {
    setAppliedVouchers((prev) => {
      const targetLayer = layer || (voucher?.discountType === 'freeship' || voucher?.scope === 'platform_freeship' ? 'freeship' : voucher?.scope === 'shop_discount' || voucher?.applicableTo === 'brand' ? 'shop' : 'platform');
      if (targetLayer === 'freeship') {
        return { ...prev, freeship: voucher };
      }
      if (targetLayer === 'shop') {
        const targetBrand = brand || voucher?.applicableBrands?.[0] || 'Default';
        return { ...prev, shop: { ...prev.shop, [targetBrand]: voucher } };
      }
      return { ...prev, platform: voucher };
    });
  }, []);

  // Áp dụng combo nhiều tầng cùng lúc (từ TechPhone Voucher Picker Modal)
  const applyVoucherStack = useCallback((stackObj) => {
    setAppliedVouchers({
      freeship: stackObj.freeship || null,
      platform: stackObj.platform || null,
      shop: stackObj.shop || {},
    });
  }, []);

  const removeVoucher = useCallback((layer = 'all', brand = '') => {
    setAppliedVouchers((prev) => {
      if (layer === 'freeship') return { ...prev, freeship: null };
      if (layer === 'platform') return { ...prev, platform: null };
      if (layer === 'shop') {
        if (brand) {
          const nextShop = { ...prev.shop };
          delete nextShop[brand];
          return { ...prev, shop: nextShop };
        }
        return { ...prev, shop: {} };
      }
      return { freeship: null, platform: null, shop: {} };
    });
  }, []);

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // Tính subtotal
  const subtotal = cart.items?.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) || 0;
  
  // 1. Tính phí vận chuyển & giảm ship
  const rawShippingFee = subtotal >= 300000 ? 0 : 30000;
  let freeshipDiscount = 0;
  if (appliedVouchers.freeship) {
    freeshipDiscount = appliedVouchers.freeship.discountValue || 30000;
  }
  const calcShippingFee = Math.max(0, rawShippingFee - freeshipDiscount);

  // 2. Tính giảm giá hệ thống (TechPhone Sàn Voucher)
  let platformDiscount = 0;
  if (appliedVouchers.platform) {
    const v = appliedVouchers.platform;
    if (v.discountType === 'percentage') {
      platformDiscount = Math.round((subtotal * v.discountValue) / 100);
      if (v.maxDiscountAmount && platformDiscount > v.maxDiscountAmount) {
        platformDiscount = v.maxDiscountAmount;
      }
    } else if (v.discountType === 'fixed') {
      platformDiscount = Math.min(v.discountValue || 0, subtotal);
    }
  }

  // 3. Tính giảm giá Shop / Brand
  let shopDiscount = 0;
  if (appliedVouchers.shop && Object.keys(appliedVouchers.shop).length > 0) {
    for (const [brandName, v] of Object.entries(appliedVouchers.shop)) {
      if (!v) continue;
      const brandItems = (cart.items || []).filter(item => item.product?.brand?.toLowerCase() === brandName.toLowerCase() || item.brand?.toLowerCase() === brandName.toLowerCase());
      const brandSubtotal = brandItems.length > 0
        ? brandItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)
        : subtotal;
      
      let disc = 0;
      if (v.discountType === 'percentage') {
        disc = Math.round((brandSubtotal * v.discountValue) / 100);
        if (v.maxDiscountAmount && disc > v.maxDiscountAmount) disc = v.maxDiscountAmount;
      } else {
        disc = Math.min(v.discountValue || 0, brandSubtotal);
      }
      shopDiscount += disc;
    }
  }
  
  const discountAmount = platformDiscount + shopDiscount;
  const totalDiscountAll = freeshipDiscount + discountAmount;
  const finalTotal = Math.max(0, subtotal - discountAmount + calcShippingFee);

  // Backward compatibility: appliedVoucher đơn lẻ
  const appliedVoucher = appliedVouchers.platform || appliedVouchers.freeship || Object.values(appliedVouchers.shop)[0] || null;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      cartCount,
      subtotal,
      discountAmount,
      freeshipDiscount,
      platformDiscount,
      shopDiscount,
      totalDiscountAll,
      shippingFee: calcShippingFee,
      finalTotal,
      appliedVouchers,
      appliedVoucher,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      fetchCart,
      applyVoucher,
      applyVoucherStack,
      removeVoucher,
      triggerFlyingEffect
    }}>
      {children}
      {/* Flying Cart Item Animation Overlay (Di chuyển từ từ vào giỏ) */}
      {flyingItem && (
        <div
          key={flyingItem.id}
          style={{
            position: 'fixed',
            left: `${flyingItem.startX}px`,
            top: `${flyingItem.startY}px`,
            zIndex: 999999,
            pointerEvents: 'none',
            transition: 'all 1.35s cubic-bezier(0.2, 0.8, 0.25, 1)',
            transform: 'translate(-50%, -50%) scale(1.15)',
            opacity: 1,
          }}
          ref={(el) => {
            if (el) {
              requestAnimationFrame(() => {
                setTimeout(() => {
                  const cartBtn = document.querySelector('#cart-nav-btn') || { left: window.innerWidth - 80, top: 25 };
                  const targetX = cartBtn.left || cartBtn.getBoundingClientRect?.()?.left || (window.innerWidth - 80);
                  const targetY = cartBtn.top || cartBtn.getBoundingClientRect?.()?.top || 25;
                  el.style.left = `${targetX + 20}px`;
                  el.style.top = `${targetY + 20}px`;
                  el.style.transform = 'translate(-50%, -50%) scale(0.18) rotate(360deg)';
                  el.style.opacity = '0.2';
                }, 40);
              });
            }
          }}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/95 dark:bg-slate-900/95 rounded-3xl p-3 shadow-2xl border-2 border-primary-500 overflow-hidden flex items-center justify-center ring-4 ring-primary-500/30 animate-pulse-glow">
            <img src={flyingItem.image} alt="Flying item" className="w-full h-full object-contain drop-shadow-lg" />
          </div>
        </div>
      )}
      {floatingToast && (
        <div
          key={floatingToast.id}
          style={{
            position: 'fixed',
            left: `${Math.min(window.innerWidth - 220, Math.max(20, floatingToast.startX - 110))}px`,
            top: `${Math.max(70, floatingToast.startY - 55)}px`,
            zIndex: 9999999,
            pointerEvents: 'none',
          }}
          className="animate-fade-in-up bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-2 border border-slate-700/80 dark:border-slate-200/80 backdrop-blur-xl text-xs font-bold ring-2 ring-emerald-500/30"
        >
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-sm">✓</span>
          <span>{floatingToast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
