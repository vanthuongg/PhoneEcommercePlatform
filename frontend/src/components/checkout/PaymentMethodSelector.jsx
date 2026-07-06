import React, { useState } from 'react';
import { CreditCard, QrCode, Building2, Smartphone, ShieldCheck, Zap, Copy, Check, Lock, Sparkles, DollarSign, Gift, CheckCircle2, AlertCircle, RefreshCw, ChevronRight, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const BANKS = [
  { code: 'MB', bin: '970422', name: 'MBBank', fullName: 'Ngân hàng TMCP Quân Đội', logoText: 'MB', color: 'from-blue-600 to-indigo-600', bgLight: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-500/30', badge: 'Khuyên dùng' },
  { code: 'VCB', bin: '970436', name: 'Vietcombank', fullName: 'Ngoại thương Việt Nam', logoText: 'VCB', color: 'from-emerald-600 to-teal-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-emerald-500/30' },
  { code: 'TCB', bin: '970407', name: 'Techcombank', fullName: 'Kỹ thương Việt Nam', logoText: 'TCB', color: 'from-red-600 to-rose-600', bgLight: 'bg-red-50 dark:bg-red-950/40', border: 'border-red-500/30' },
  { code: 'ACB', bin: '970416', name: 'ACB', fullName: 'Ngân hàng Á Châu', logoText: 'ACB', color: 'from-blue-500 to-cyan-600', bgLight: 'bg-cyan-50 dark:bg-cyan-950/40', border: 'border-cyan-500/30' },
  { code: 'TPB', bin: '970423', name: 'TPBank', fullName: 'Tiên Phong Bank', logoText: 'TPB', color: 'from-purple-600 to-violet-600', bgLight: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-500/30' },
  { code: 'BIDV', bin: '970418', name: 'BIDV', fullName: 'Đầu tư & Phát triển VN', logoText: 'BIDV', color: 'from-cyan-600 to-blue-700', bgLight: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-blue-500/30' },
  { code: 'ICB', bin: '970415', name: 'VietinBank', fullName: 'Công Thương Việt Nam', logoText: 'CTG', color: 'from-sky-600 to-blue-600', bgLight: 'bg-sky-50 dark:bg-sky-950/40', border: 'border-sky-500/30' },
  { code: 'VPB', bin: '970432', name: 'VPBank', fullName: 'Việt Nam Thịnh Vượng', logoText: 'VPB', color: 'from-green-600 to-emerald-600', bgLight: 'bg-green-50 dark:bg-green-950/40', border: 'border-green-500/30' },
];

const PAYMENT_METHODS = [
  {
    value: 'cod',
    label: 'Thanh toán khi nhận hàng (COD)',
    desc: 'Đồng kiểm tra máy nguyên seal cùng shipper trước khi thanh toán',
    emoji: '💵',
    badge: 'Phổ biến',
    badgeColor: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    discountNote: null,
  },
  {
    value: 'bank_transfer',
    label: 'Chuyển khoản QR Bank 24/7 (VietQR)',
    desc: 'Quét mã VietQR tự động duyệt đơn siêu tốc trong 60 giây',
    emoji: '🏦',
    badge: 'Lựa chọn 2 • Ưu đãi Hot',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold shadow-sm animate-pulse',
    discountNote: '🎁 Tự động duyệt đơn & Ưu đãi ưu tiên xuất kho hỏa tốc',
  },
  {
    value: 'momo',
    label: 'Ví điện tử MoMo',
    desc: 'Quét mã QR qua app MoMo siêu nhanh, bảo mật cao',
    emoji: '📱',
    badge: 'Quét mã 1 chạm',
    badgeColor: 'bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-800',
    discountNote: '🔥 Nhận thêm hoàn tiền lên đến 50K từ MoMo Rewards',
  },
  {
    value: 'vnpay',
    label: 'Cổng thanh toán VNPay / ATM / Visa',
    desc: 'Hỗ trợ thẻ ATM nội địa, Thẻ quốc tế Visa/Master & Trả góp 0%',
    emoji: '🔐',
    badge: 'Trả góp 0%',
    badgeColor: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800',
    discountNote: '💳 Hỗ trợ trả góp 0% qua thẻ tín dụng (3 - 6 - 9 - 12 tháng)',
  },
];

const PaymentMethodSelector = ({
  selectedMethod,
  onSelectMethod,
  totalAmount = 0,
  userPhone = '',
  userName = '',
}) => {
  const [selectedBankCode, setSelectedBankCode] = useState('MB');
  const [vnpayChannel, setVnpayChannel] = useState('qr');
  const [copiedField, setCopiedField] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  const selectedBank = BANKS.find((b) => b.code === selectedBankCode) || BANKS[0];
  const accountNumber = '999988886666';
  const accountName = 'CÔNG TY CP CÔNG NGHỆ TECHPHONE';
  const cleanPhone = userPhone?.replace(/\D/g, '') || '0901234567';
  const transferContent = `THANHTOAN TECHPHONE ${cleanPhone}`;

  // VietQR Live URL
  const vietQrUrl = `https://img.vietqr.io/image/${selectedBank.bin}-${accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;
  const momoQrUrl = `https://img.vietqr.io/image/970422-0909888999-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(`MOMO TECHPHONE ${cleanPhone}`)}&accountName=CONG%20TY%20TECHPHONE`;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`🎉 Đã sao chép ${label}!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-600/10 dark:bg-primary-500/15 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black text-sm shadow-2xs">
            2
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              💳 Phương Thức Thanh Toán
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Bảo mật 100%
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Chọn cách thức thanh toán phù hợp và tiện lợi nhất cho bạn
            </p>
          </div>
        </div>
        <ShieldCheck className="w-6 h-6 text-emerald-500 hidden sm:block shrink-0" />
      </div>

      {/* Top Reassurance Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-primary-500/10 dark:from-amber-500/15 dark:via-orange-500/15 dark:to-primary-500/15 p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 dark:border-amber-500/30 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/20">
          <Sparkles className="w-5 h-5 animate-spin-slow" />
        </div>
        <div className="text-xs">
          <span className="font-black text-amber-800 dark:text-amber-300 block sm:inline">
            💡 Ưu đãi đặc quyền thanh toán:
          </span>{' '}
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Thanh toán trực tuyến qua <strong className="text-primary-600 dark:text-primary-400">QR Bank 24/7 (Lựa chọn 2)</strong> hoặc Ví điện tử được tự động ưu tiên duyệt đơn và xuất kho giao siêu tốc trong 2H!
          </span>
        </div>
      </div>

      {/* Payment Methods Grid / List */}
      <div className="space-y-4">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.value;
          const isBankTransfer = method.value === 'bank_transfer';
          const isMoMo = method.value === 'momo';
          const isVNPay = method.value === 'vnpay';
          const isCOD = method.value === 'cod';

          return (
            <div
              key={method.value}
              className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
                isSelected
                  ? 'border-primary-600 dark:border-primary-500 bg-primary-50/20 dark:bg-primary-950/20 shadow-md ring-1 ring-primary-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20'
              }`}
            >
              {/* Radio Header Option */}
              <label className="flex items-start sm:items-center justify-between p-4 sm:p-5 cursor-pointer select-none gap-3">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative flex items-center justify-center mt-0.5 sm:mt-0">
                    <input
                      type="radio"
                      name="paymentMethodRadio"
                      value={method.value}
                      checked={isSelected}
                      onChange={() => onSelectMethod(method.value)}
                      className="w-5 h-5 text-primary-600 border-slate-300 dark:border-slate-700 focus:ring-primary-500 cursor-pointer"
                    />
                  </div>
                  <span className="text-3xl sm:text-4xl shrink-0 p-1.5 bg-white dark:bg-slate-800 rounded-2xl shadow-2xs border border-slate-100 dark:border-slate-700">
                    {method.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {method.label}
                      </span>
                      {method.badge && (
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${method.badgeColor}`}>
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                      {method.desc}
                    </p>
                    {method.discountNote && (
                      <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                        {method.discountNote}
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-slate-400 self-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}>
                    {isSelected && <Check size={14} className="stroke-[3]" />}
                  </div>
                </div>
              </label>

              {/* EXPANDED SECTION FOR OPTION 2: QR BANK TRANSFER */}
              {isSelected && isBankTransfer && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-primary-500/20 dark:border-primary-500/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md animate-fade-in space-y-5">
                  
                  {/* Bank Selector Pills */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Building2 size={15} className="text-primary-600" /> Chọn Ngân Hàng Nhận (VietQR NAPAS 247):
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Zap size={13} className="fill-emerald-500" /> Hỗ trợ mọi ngân hàng
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {BANKS.map((bank) => (
                        <button
                          key={bank.code}
                          type="button"
                          onClick={() => setSelectedBankCode(bank.code)}
                          className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                            selectedBankCode === bank.code
                              ? 'bg-gradient-to-r from-primary-600/10 to-indigo-600/10 border-primary-600 dark:border-primary-400 shadow-sm ring-1 ring-primary-500/30 font-bold'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${bank.color} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                            {bank.logoText}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {bank.name}
                            </div>
                            <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                              {bank.fullName}
                            </div>
                          </div>
                          {selectedBankCode === bank.code && (
                            <CheckCircle2 size={16} className="text-primary-600 dark:text-primary-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* QR & Transfer Details Card */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    
                    {/* Left: Live Scannable VietQR (5 cols) */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-2.5 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm relative group">
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider border border-emerald-500/20">
                        Live VietQR
                      </div>
                      <div className="relative p-2 bg-white rounded-2xl shadow-inner border border-slate-100">
                        <img
                          src={vietQrUrl}
                          alt="VietQR Scannable Code"
                          className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-xl transition-transform duration-300 group-hover:scale-105"
                          onLoad={() => setQrLoading(false)}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
                          <QrCode size={14} className="text-primary-600" /> Quét mã để thanh toán ngay
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Mở App Ngân hàng hoặc MoMo / VNPay để quét
                        </p>
                      </div>
                    </div>

                    {/* Right: Account Info & Copy Buttons (7 cols) */}
                    <div className="md:col-span-7 space-y-3 flex flex-col justify-center">
                      <div className="pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-xs font-black uppercase tracking-wider text-primary-600 dark:text-primary-400 block">
                          Thông tin tài khoản nhận chuyển khoản:
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Bạn có thể chuyển khoản chính xác theo các thông tin dưới đây:
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* Bank Name */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-500 font-bold">Ngân hàng:</span>
                          <span className="font-black text-slate-900 dark:text-white text-right">
                            {selectedBank.name} - {selectedBank.fullName}
                          </span>
                        </div>

                        {/* Account Number */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-500 font-bold">Số tài khoản:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-primary-600 dark:text-primary-400">
                              {accountNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(accountNumber, 'Số tài khoản')}
                              className="px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 hover:bg-primary-100 font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95"
                            >
                              {copiedField === 'Số tài khoản' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              <span>{copiedField === 'Số tài khoản' ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Account Holder */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                          <span className="text-slate-500 font-bold">Chủ tài khoản:</span>
                          <span className="font-black text-slate-900 dark:text-white uppercase text-right">
                            {accountName}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60">
                          <span className="text-slate-700 dark:text-slate-300 font-extrabold">Số tiền cần chuyển:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-base text-red-600 dark:text-red-400">
                              {formatPrice(totalAmount)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(totalAmount?.toString() || '0', 'Số tiền')}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-50 font-bold text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-2xs"
                            >
                              {copiedField === 'Số tiền' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              <span>{copiedField === 'Số tiền' ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Transfer Content */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60">
                          <span className="text-amber-900 dark:text-amber-200 font-extrabold">Nội dung chuyển:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-amber-800 dark:text-amber-300 px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-amber-200">
                              {transferContent}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(transferContent, 'Nội dung chuyển khoản')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 font-black text-[11px] flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                            >
                              {copiedField === 'Nội dung chuyển khoản' ? <Check size={13} /> : <Copy size={13} />}
                              <span>{copiedField === 'Nội dung chuyển khoản' ? 'Đã chép' : 'Sao chép'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Automatic Verification Reassurance Box */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary-500/10 border border-emerald-500/20 flex items-start sm:items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-black text-xs shadow-sm">
                      <Zap size={16} className="fill-white" />
                    </div>
                    <div className="text-xs space-y-0.5">
                      <p className="font-black text-slate-900 dark:text-white">
                        ⚡ Hệ Thống Đối Soát AI Tự Động 24/7 (Không cần chụp biên lai!)
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                        Sau khi bấm <strong className="text-primary-600 dark:text-primary-400">"Xác Nhận Hoàn Tất Đặt Hàng"</strong> bên dưới, bạn sẽ được hướng dẫn xác nhận thanh toán. Đơn hàng tự động chuyển sang trạng thái <strong className="text-emerald-600 font-bold">"Đã xác nhận & Đang đóng gói"</strong> ngay sau khi nhận được tiền.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPANDED SECTION FOR OPTION 3: MOMO */}
              {isSelected && isMoMo && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-pink-500/20 dark:border-pink-500/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md animate-fade-in space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800/60 items-center">
                    <div className="sm:col-span-4 flex flex-col items-center text-center bg-white dark:bg-slate-900 p-3 rounded-2xl border border-pink-200 dark:border-pink-800 shadow-2xs">
                      <img src={momoQrUrl} alt="MoMo QR" className="w-40 h-40 object-contain mx-auto rounded-lg" />
                      <span className="text-[11px] font-black text-pink-600 dark:text-pink-400 mt-1.5 flex items-center gap-1">
                        <Smartphone size={13} /> Quét mã bằng App MoMo
                      </span>
                    </div>

                    <div className="sm:col-span-8 space-y-3 text-xs">
                      <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" /> Hướng dẫn thanh toán Ví MoMo:
                      </h4>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-slate-300 font-medium pl-1">
                        <li>Mở ứng dụng <strong className="text-pink-600 font-bold">MoMo</strong> trên điện thoại.</li>
                        <li>Chọn tính năng <strong className="text-pink-600 font-bold">Quét Mã QR</strong> ở góc phải màn hình.</li>
                        <li>Quét mã QR bên cạnh hoặc chuyển đến SĐT MoMo: <strong className="font-mono font-black text-pink-600">0909 888 999</strong></li>
                        <li>Nhập chính xác số tiền <strong className="text-red-600 font-black">{formatPrice(totalAmount)}</strong> và nội dung: <strong className="font-mono bg-pink-100 dark:bg-pink-900/40 px-1.5 py-0.5 rounded text-pink-700 dark:text-pink-300">THANHTOAN {cleanPhone}</strong></li>
                      </ol>
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy('0909888999', 'SĐT MoMo')}
                          className="px-3 py-1.5 rounded-xl bg-pink-600 text-white font-extrabold text-xs shadow-md shadow-pink-500/20 hover:bg-pink-700 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Copy size={13} /> Copy SĐT MoMo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(`THANHTOAN ${cleanPhone}`, 'Nội dung MoMo')}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 border border-pink-300 dark:border-pink-800 font-extrabold text-xs hover:bg-pink-50 active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Copy size={13} /> Copy Nội Dung
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPANDED SECTION FOR OPTION 4: VNPAY */}
              {isSelected && isVNPay && (
                <div className="px-4 pb-5 sm:px-6 sm:pb-6 pt-2 border-t border-blue-500/20 dark:border-blue-500/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md animate-fade-in space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3">
                    <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
                      Chọn cổng thanh toán VNPay hỗ trợ:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { id: 'qr', label: 'Quét mã VNPAY-QR', desc: 'Giảm thêm 20K với mã VNPAYTECH', icon: QrCode },
                        { id: 'atm', label: 'Thẻ ATM / Tài khoản nội địa', desc: 'Hơn 40 ngân hàng liên kết NAPAS', icon: Building2 },
                        { id: 'visa', label: 'Thẻ Visa / Master / JCB / UnionPay', desc: 'Bảo mật 3D-Secure tuyệt đối', icon: CreditCard },
                        { id: 'installment', label: 'Trả góp 0% qua thẻ tín dụng', desc: 'Kỳ hạn linh hoạt 3 - 6 - 9 - 12 tháng', icon: Zap },
                      ].map((chan) => {
                        const Icon = chan.icon;
                        return (
                          <button
                            key={chan.id}
                            type="button"
                            onClick={() => setVnpayChannel(chan.id)}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                              vnpayChannel === chan.id
                                ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-400 shadow-sm ring-1 ring-blue-500/30 font-bold'
                                : 'bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:bg-white'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${vnpayChannel === chan.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}>
                              <Icon size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-slate-900 dark:text-white truncate">{chan.label}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{chan.desc}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-blue-200/50 dark:border-blue-800/50 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                        <Lock size={13} className="text-blue-600" /> Mã hóa SSL 256-bit & PCI-DSS
                      </span>
                      <span>Hỗ trợ mọi thẻ ATM/Visa tại VN</span>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPANDED SECTION FOR OPTION 1: COD */}
              {isSelected && isCOD && (
                <div className="px-4 pb-4 sm:px-6 sm:pb-5 pt-2 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 animate-fade-in">
                  <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                      🤝
                    </div>
                    <div className="text-xs space-y-1">
                      <h4 className="font-black text-slate-900 dark:text-white">
                        Chính Sách Thanh Toán Khi Nhận Hàng (COD TechPhone):
                      </h4>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 font-medium text-[11px]">
                        <li>Được mở hộp, kiểm tra ngoại hình máy, phụ kiện nguyên seal cùng shipper trước khi trả tiền.</li>
                        <li>Có thể thanh toán bằng <strong>Tiền mặt</strong> hoặc <strong>Chuyển khoản QR</strong> trực tiếp cho nhân viên giao hàng.</li>
                        <li>Hoàn trả miễn phí 0đ ngay lúc nhận nếu sản phẩm không đúng mô tả hoặc trầy xước.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
