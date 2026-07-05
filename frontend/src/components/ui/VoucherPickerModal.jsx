import React, { useState, useEffect, useMemo } from 'react';
import { voucherAPI } from '../../services/api';
import { Gift, Check, X, Tag, AlertCircle, Loader2, Truck, Percent, DollarSign, Flame, ShieldCheck, Crown, Wallet, Store, Sparkles, CheckCircle2, Info, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const getDiscountTypeIcon = (type, scope) => {
  if (type === 'freeship' || scope === 'platform_freeship') return <Truck className="w-5 h-5" />;
  if (scope === 'shop_discount') return <Store className="w-5 h-5" />;
  if (type === 'percentage') return <Percent className="w-5 h-5" />;
  return <DollarSign className="w-5 h-5" />;
};

const getDiscountLabel = (v, orderTotal) => {
  if (v.discountType === 'freeship' || v.scope === 'platform_freeship') {
    return `Giảm ship ${formatPrice(v.discountValue || 30000)}`;
  }
  if (v.discountType === 'percentage') {
    const amt = Math.round((orderTotal * v.discountValue) / 100);
    const capped = v.maxDiscountAmount > 0 ? Math.min(amt, v.maxDiscountAmount) : amt;
    return `Giảm ${v.discountValue}% (Tối đa ${formatPrice(capped)})`;
  }
  return `Giảm ngay ${formatPrice(v.discountValue)}`;
};

const VoucherPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  onSelectStack,
  appliedVouchers = { freeship: null, platform: null, shop: {} },
  orderTotal = 0,
  cartBrands = [],
  paymentMethod = 'cod'
}) => {
  const [vouchers, setVouchers] = useState([]);
  const [walletVouchers, setWalletVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'freeship', 'platform', 'shop', 'wallet'

  // Temporary stacking state inside modal before clicking "Đồng ý"
  const [tempStack, setTempStack] = useState({
    freeship: null,
    platform: null,
    shop: {},
  });

  useEffect(() => {
    if (isOpen) {
      // Sync tempStack with props when opening
      setTempStack({
        freeship: appliedVouchers?.freeship || null,
        platform: appliedVouchers?.platform || null,
        shop: appliedVouchers?.shop ? { ...appliedVouchers.shop } : {},
      });

      setLoading(true);
      Promise.all([
        voucherAPI.getAvailable(orderTotal).catch(() => voucherAPI.getAll()),
        voucherAPI.getMyWallet().catch(() => ({ data: [] })),
      ])
        .then(([availRes, walletRes]) => {
          const availList = availRes?.data || [];
          const walletList = walletRes?.data || [];
          setVouchers(availList);
          setWalletVouchers(walletList);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderTotal]);

  // Combine & deduplicate available and wallet vouchers
  const allVouchers = useMemo(() => {
    const map = new Map();
    vouchers.forEach(v => map.set(v.code, { ...v, inWallet: false }));
    walletVouchers.forEach(v => {
      if (map.has(v.code)) {
        map.set(v.code, { ...map.get(v.code), inWallet: true });
      } else {
        map.set(v.code, { ...v, inWallet: true });
      }
    });
    return Array.from(map.values());
  }, [vouchers, walletVouchers]);

  // Categorize
  const { freeshipList, platformList, shopList, walletList } = useMemo(() => {
    const freeship = [];
    const platform = [];
    const shop = [];
    const wallet = [];

    allVouchers.forEach(v => {
      if (v.inWallet) wallet.push(v);
      if (v.discountType === 'freeship' || v.scope === 'platform_freeship' || v.tag === 'shipping') {
        freeship.push(v);
      } else if (v.scope === 'shop_discount' || v.applicableTo === 'brand' || v.tag === 'brand') {
        shop.push(v);
      } else {
        platform.push(v);
      }
    });

    return { freeshipList: freeship, platformList: platform, shopList: shop, walletList: wallet };
  }, [allVouchers]);

  const displayedVouchers = useMemo(() => {
    if (activeTab === 'freeship') return freeshipList;
    if (activeTab === 'platform') return platformList;
    if (activeTab === 'shop') return shopList;
    if (activeTab === 'wallet') return walletList;
    return allVouchers;
  }, [activeTab, freeshipList, platformList, shopList, walletList, allVouchers]);

  if (!isOpen) return null;

  // Helper check eligibility
  const checkEligibility = (v) => {
    if (orderTotal < (v.minOrderValue || 0)) {
      return { eligible: false, reason: `Đơn tối thiểu ${formatPrice(v.minOrderValue)}` };
    }
    if (v.paymentMethodRestriction && v.paymentMethodRestriction !== 'all') {
      if (paymentMethod && v.paymentMethodRestriction !== paymentMethod) {
        const names = { cod: 'COD', momo: 'MoMo', vnpay: 'VNPay QR', bank_transfer: 'Chuyển khoản' };
        return { eligible: false, reason: `Chỉ áp dụng thanh toán qua ${names[v.paymentMethodRestriction] || v.paymentMethodRestriction}` };
      }
    }
    if (v.applicableTo === 'brand' && v.applicableBrands?.length > 0) {
      const hasBrand = v.applicableBrands.some(b =>
        cartBrands.some(cb => cb?.toLowerCase() === b?.toLowerCase())
      );
      if (!hasBrand && cartBrands.length > 0) {
        return { eligible: false, reason: `Chỉ áp dụng cho thương hiệu ${v.applicableBrands.join(', ')}` };
      }
    }
    return { eligible: true, reason: '' };
  };

  // Handle toggling voucher in stack
  const handleToggleVoucher = (v) => {
    const { eligible, reason } = checkEligibility(v);
    if (!eligible) {
      toast.error(reason || 'Voucher không đủ điều kiện áp dụng cho đơn này');
      return;
    }

    const isFreeship = v.discountType === 'freeship' || v.scope === 'platform_freeship' || v.tag === 'shipping';
    const isShop = v.scope === 'shop_discount' || v.applicableTo === 'brand' || v.tag === 'brand';

    setTempStack(prev => {
      if (isFreeship) {
        // Toggle freeship
        return { ...prev, freeship: prev.freeship?.code === v.code ? null : v };
      }
      if (isShop) {
        // Toggle shop brand
        const brand = v.applicableBrands?.[0] || 'Default';
        const isSelected = prev.shop[brand]?.code === v.code;
        const nextShop = { ...prev.shop };
        if (isSelected) {
          delete nextShop[brand];
        } else {
          nextShop[brand] = v;
        }
        return { ...prev, shop: nextShop };
      }
      // Toggle platform
      return { ...prev, platform: prev.platform?.code === v.code ? null : v };
    });
  };

  // Check if a voucher is currently selected in tempStack
  const isVoucherSelected = (v) => {
    if (!v) return false;
    if (tempStack.freeship?.code === v.code) return true;
    if (tempStack.platform?.code === v.code) return true;
    for (const shopV of Object.values(tempStack.shop)) {
      if (shopV?.code === v.code) return true;
    }
    return false;
  };

  // Calculate estimated total saving
  const calculateSaving = (v) => {
    if (!v) return 0;
    if (v.discountType === 'freeship' || v.scope === 'platform_freeship') return v.discountValue || 30000;
    if (v.discountType === 'percentage') {
      const amt = Math.round((orderTotal * v.discountValue) / 100);
      return v.maxDiscountAmount > 0 ? Math.min(amt, v.maxDiscountAmount) : amt;
    }
    return Math.min(v.discountValue || 0, orderTotal);
  };

  const totalEstimatedSaving =
    calculateSaving(tempStack.freeship) +
    calculateSaving(tempStack.platform) +
    Object.values(tempStack.shop).reduce((sum, v) => sum + calculateSaving(v), 0);

  const selectedCount =
    (tempStack.freeship ? 1 : 0) +
    (tempStack.platform ? 1 : 0) +
    Object.keys(tempStack.shop).length;

  // Manual input apply
  const handleApplyInput = async (e) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    // Check in existing list
    const found = allVouchers.find(v => v.code === code);
    if (found) {
      handleToggleVoucher(found);
      setInputCode('');
      return;
    }

    setValidating(true);
    try {
      const res = await voucherAPI.validate(code, orderTotal, cartBrands);
      if (res.success && res.data) {
        const v = res.data;
        handleToggleVoucher(v);
        setInputCode('');
        toast.success(`Đã thêm & áp dụng mã ${v.code}!`);
      }
    } catch (err) {
      toast.error(err.message || 'Mã giảm giá không hợp lệ hoặc không đủ điều kiện');
    } finally {
      setValidating(false);
    }
  };

  const handleConfirm = () => {
    if (onSelectStack) {
      onSelectStack(tempStack);
    } else if (onSelect) {
      // Legacy fallback
      const singleV = tempStack.platform || tempStack.freeship || Object.values(tempStack.shop)[0];
      if (singleV) {
        onSelect({
          code: singleV.code,
          discount: calculateSaving(singleV),
          desc: singleV.title || `Giảm ${formatPrice(calculateSaving(singleV))}`,
          voucherData: singleV
        });
      } else {
        onSelect(null);
      }
    }
    toast.success('Đã áp dụng combo mã giảm giá TechPhone Store!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-primary/10 via-teal-500/10 to-accent/10 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-gray-900 dark:text-white">TechPhone Voucher Combo</h3>
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-primary-600 to-teal-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  3 Tầng
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Có thể chọn cùng lúc: 1 Freeship + 1 Mã Hệ Thống + 1 Mã Đặc Quyền Hãng
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Manual Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <form onSubmit={handleApplyInput} className="flex gap-2.5">
            <div className="relative flex-1">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nhập mã ưu đãi TechPhone / Hãng..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 uppercase font-mono font-bold text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-gray-900 dark:text-white transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={validating || !inputCode.trim()}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Áp Dụng
            </button>
          </form>
        </div>

        {/* Tabs Filter */}
        <div className="flex items-center gap-1.5 px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar bg-white dark:bg-gray-900">
          {[
            { id: 'all', label: 'Tất Cả', count: allVouchers.length, icon: <Sparkles className="w-3.5 h-3.5" /> },
            { id: 'freeship', label: '🚚 Freeship', count: freeshipList.length },
            { id: 'platform', label: '🎁 Hệ Thống TechPhone', count: platformList.length },
            { id: 'shop', label: '🏷️ Đặc Quyền Hãng', count: shopList.length },
            { id: 'wallet', label: '💼 Ví của tôi', count: walletList.length, badge: 'Đã lưu' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs shrink-0 transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white shadow-md shadow-primary/20'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Vouchers List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 bg-gray-50/50 dark:bg-gray-950/30">
          {loading ? (
            <div className="space-y-3 py-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 dark:bg-gray-800 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : displayedVouchers.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <AlertCircle className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto animate-pulse" />
              <p className="font-extrabold text-gray-600 dark:text-gray-400 text-sm">Chưa có mã giảm giá nào trong mục này</p>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">Bạn có thể chọn mục Tất Cả hoặc nhập mã voucher thủ công ở trên để kiểm tra ưu đãi</p>
            </div>
          ) : (
            displayedVouchers.map((v) => {
              const { eligible, reason } = checkEligibility(v);
              const isSelected = isVoucherSelected(v);
              const isFreeship = v.discountType === 'freeship' || v.scope === 'platform_freeship' || v.tag === 'shipping';
              const isShop = v.scope === 'shop_discount' || v.applicableTo === 'brand' || v.tag === 'brand';

              return (
                <div
                  key={v._id || v.code}
                  onClick={() => eligible && handleToggleVoucher(v)}
                  className={`relative rounded-3xl border-2 transition-all overflow-hidden flex items-stretch ${
                    isSelected
                      ? 'bg-primary-50/80 dark:bg-primary-950/20 border-primary-600 shadow-md shadow-primary/10'
                      : eligible
                      ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/80 hover:border-primary-400/60 hover:shadow-md cursor-pointer'
                      : 'bg-gray-100/70 dark:bg-gray-900/60 border-gray-200/50 dark:border-gray-800 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {/* Left Ticket Stub */}
                  <div className={`w-24 sm:w-28 p-3 flex flex-col items-center justify-center text-center shrink-0 font-black text-white relative ${
                    isFreeship
                      ? 'bg-gradient-to-br from-teal-500 to-emerald-600'
                      : isShop
                      ? 'bg-gradient-to-br from-accent-600 to-amber-600'
                      : 'bg-gradient-to-br from-primary-600 to-teal-700'
                  }`}>
                    {/* Dashed edge separator */}
                    <div className="absolute right-0 top-0 bottom-0 w-0 border-r-2 border-dashed border-white/40 z-10" />
                    
                    <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-1.5 shadow-inner">
                      {getDiscountTypeIcon(v.discountType, v.scope)}
                    </div>
                    <span className="text-xs tracking-tight font-extrabold line-clamp-1">
                      {isFreeship ? 'FREESHIP' : isShop ? 'MÃ HÃNG' : 'TECHPHONE SÀN'}
                    </span>
                    <span className="text-[10px] mt-0.5 bg-black/20 px-2 py-0.5 rounded-full font-bold">
                      {v.badgeText || (isFreeship ? 'TechPhone' : 'Ưu Đãi')}
                    </span>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="font-mono font-black text-xs text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 rounded-md">
                          {v.code}
                        </span>
                        {v.inWallet && (
                          <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Wallet className="w-2.5 h-2.5" /> Trong Ví
                          </span>
                        )}
                        {v.paymentMethodRestriction && v.paymentMethodRestriction !== 'all' && (
                          <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CreditCard className="w-2.5 h-2.5" /> {v.paymentMethodRestriction.toUpperCase()}
                          </span>
                        )}
                        {!eligible && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded-md">
                            {reason}
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1">
                        {v.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {v.description || `Đơn tối thiểu ${formatPrice(v.minOrderValue)}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                        {getDiscountLabel(v, orderTotal)}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        HSD: {v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}
                      </span>
                    </div>
                  </div>

                  {/* Right Radio/Check Control */}
                  <div className="p-4 flex items-center justify-center shrink-0">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary/30 scale-110'
                        : eligible
                        ? 'border-gray-300 dark:border-gray-600 group-hover:border-primary-400'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Bar - TechPhone Sticky Confirm */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between shadow-2xl">
          <div className="space-y-0.5">
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-bold">
              <span>Đã chọn <strong className="text-primary-600 dark:text-primary-400 font-black">{selectedCount}</strong> mã ưu đãi</span>
              {selectedCount > 0 && (
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded font-extrabold">
                  Stacking Active
                </span>
              )}
            </div>
            <div className="text-base font-black text-red-600 dark:text-red-400 flex items-baseline gap-1">
              <span>Tiết kiệm ≈</span>
              <span className="text-lg">{formatPrice(totalEstimatedSaving)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => setTempStack({ freeship: null, platform: null, shop: {} })}
                className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs transition-all"
              >
                Bỏ chọn
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-700 hover:to-teal-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Đồng Ý</span>
              {selectedCount > 0 && <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{selectedCount}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoucherPickerModal;
