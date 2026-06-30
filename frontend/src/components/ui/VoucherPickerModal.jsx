import React, { useState, useEffect } from 'react';
import { voucherAPI } from '../../services/api';
import { Gift, Check, X, Tag, AlertCircle, Loader2, Truck, Percent, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const getDiscountTypeIcon = (type) => {
  if (type === 'freeship') return <Truck className="w-4 h-4" />;
  if (type === 'percentage') return <Percent className="w-4 h-4" />;
  return <DollarSign className="w-4 h-4" />;
};

const getDiscountLabel = (v, orderTotal) => {
  if (v.discountType === 'freeship') return 'Miễn phí ship';
  if (v.discountType === 'percentage') {
    const amt = Math.round((orderTotal * v.discountValue) / 100);
    const capped = v.maxDiscountAmount > 0 ? Math.min(amt, v.maxDiscountAmount) : amt;
    return `-${v.discountValue}% (≈ ${formatPrice(capped)})`;
  }
  return `-${formatPrice(v.discountValue)}`;
};

const VoucherPickerModal = ({ isOpen, onClose, onSelect, currentVoucherCode, orderTotal = 0, cartBrands = [] }) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      voucherAPI.getAvailable(orderTotal)
        .then((res) => setVouchers(res.data || []))
        .catch(() => {
          // fallback to getAll if getAvailable fails
          voucherAPI.getAll().then((res) => setVouchers(res.data || [])).catch(() => {});
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, orderTotal]);

  if (!isOpen) return null;

  const calculateDiscount = (v) => {
    if (v.discountType === 'freeship') return v.discountValue || 50000;
    if (v.discountType === 'percentage') {
      const amt = Math.round((orderTotal * v.discountValue) / 100);
      return v.maxDiscountAmount > 0 ? Math.min(amt, v.maxDiscountAmount) : amt;
    }
    return Math.min(v.discountValue || 0, orderTotal);
  };

  const checkBrandEligible = (v) => {
    if (v.applicableTo !== 'brand' || !v.applicableBrands?.length) return true;
    return v.applicableBrands.some(b =>
      cartBrands.some(cb => cb.toLowerCase() === b.toLowerCase())
    );
  };

  const handleSelectVoucher = (v) => {
    if (orderTotal < (v.minOrderValue || 0)) {
      toast.error(`Đơn hàng tối thiểu ${formatPrice(v.minOrderValue)} để áp dụng mã này`);
      return;
    }
    if (!checkBrandEligible(v)) {
      toast.error(`Mã này chỉ áp dụng cho: ${v.applicableBrands?.join(', ')}`);
      return;
    }
    const discount = calculateDiscount(v);
    onSelect({ code: v.code, discount, desc: v.title || v.description || `Giảm ${formatPrice(discount)}`, voucherData: v });
    onClose();
  };

  const handleApplyInput = async (e) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    // Check in loaded vouchers first
    const found = vouchers.find((v) => v.code === code);
    if (found) { handleSelectVoucher(found); return; }

    // Validate against API
    setValidating(true);
    try {
      const res = await voucherAPI.validate(code, orderTotal, cartBrands);
      if (res.success && res.data) {
        const v = res.data;
        const discount = res.discountAmount || calculateDiscount(v);
        onSelect({ code: v.code, discount, desc: v.title || `Giảm ${formatPrice(discount)}`, voucherData: v });
        toast.success('Áp dụng mã thành công!');
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Mã giảm giá không hợp lệ');
    } finally {
      setValidating(false);
    }
  };

  // Sort: eligible first
  const sortedVouchers = [...vouchers].sort((a, b) => {
    const aOk = orderTotal >= (a.minOrderValue || 0) && checkBrandEligible(a);
    const bOk = orderTotal >= (b.minOrderValue || 0) && checkBrandEligible(b);
    if (aOk && !bOk) return -1;
    if (!aOk && bOk) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-gray-900 dark:text-white">Mã Khuyến Mãi</h3>
              <p className="text-xs text-gray-500">Chọn hoặc nhập mã để tiết kiệm hơn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Manual Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form onSubmit={handleApplyInput} className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nhập mã voucher..."
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 uppercase font-mono font-bold text-xs focus:outline-none focus:border-primary text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={validating || !inputCode.trim()}
              className="px-5 py-3 bg-primary hover:bg-blue-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            >
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Áp Dụng
            </button>
          </form>
        </div>

        {/* Vouchers List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-gray-50/30 dark:bg-gray-950/20">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Mã giảm giá có sẵn</p>
          {loading ? (
            <div className="space-y-3 py-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : sortedVouchers.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto" />
              <p className="font-bold text-gray-500 text-sm">Chưa có mã giảm giá nào khả dụng</p>
              <p className="text-xs text-gray-400">Nhập mã thủ công ở trên nếu bạn có mã riêng</p>
            </div>
          ) : (
            sortedVouchers.map((v) => {
              const eligible = orderTotal >= (v.minOrderValue || 0);
              const brandOk = checkBrandEligible(v);
              const canUse = eligible && brandOk;
              const isSelected = currentVoucherCode === v.code;
              const discount = calculateDiscount(v);

              return (
                <div
                  key={v._id || v.code}
                  onClick={() => canUse && handleSelectVoucher(v)}
                  className={`relative p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-primary shadow-sm shadow-blue-500/10'
                      : canUse
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/60 hover:shadow-md cursor-pointer'
                      : 'bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {/* Left icon */}
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-black text-xs ${
                    v.discountType === 'freeship'
                      ? 'bg-gradient-to-br from-teal-400 to-emerald-500'
                      : v.discountType === 'percentage'
                      ? 'bg-gradient-to-br from-orange-400 to-amber-500'
                      : 'bg-gradient-to-br from-primary to-indigo-600'
                  } text-white shadow-md`}>
                    {getDiscountTypeIcon(v.discountType)}
                    <span className="text-[9px] mt-0.5 font-black">
                      {v.discountType === 'freeship' ? 'SHIP' : v.discountType === 'percentage' ? `${v.discountValue}%` : 'FIXED'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                      <span className="font-mono font-black text-xs text-primary">{v.code}</span>
                      {v.applicableTo === 'brand' && v.applicableBrands?.length > 0 && (
                        <span className="text-[10px] font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
                          {v.applicableBrands.join(', ')}
                        </span>
                      )}
                      {!eligible && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md">
                          Cần thêm {formatPrice((v.minOrderValue || 0) - orderTotal)}
                        </span>
                      )}
                      {eligible && !brandOk && (
                        <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 px-1.5 py-0.5 rounded-md">
                          Không áp dụng cho sản phẩm này
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-sm text-gray-900 dark:text-white truncate">{v.title}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-bold text-green-600 dark:text-green-400">{getDiscountLabel(v, orderTotal)}</span>
                      {v.minOrderValue > 0 && (
                        <span className="text-[10px] text-gray-400">Từ {formatPrice(v.minOrderValue)}</span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                        <Check size={16} />
                      </div>
                    ) : canUse ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleSelectVoucher(v); }}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white font-black text-xs transition-all"
                      >
                        Dùng ngay
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {currentVoucherCode && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs text-center text-blue-700 dark:text-blue-300 font-semibold">
              ✅ Đang dùng mã: <span className="font-mono font-black">{currentVoucherCode}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherPickerModal;
