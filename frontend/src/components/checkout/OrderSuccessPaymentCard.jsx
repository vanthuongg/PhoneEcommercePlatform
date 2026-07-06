import React, { useState } from 'react';
import { CreditCard, QrCode, Building2, Smartphone, ShieldCheck, Zap, Copy, Check, CheckCircle2, Clock, AlertCircle, RefreshCw, Lock, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

const OrderSuccessPaymentCard = ({ order }) => {
  const [copiedField, setCopiedField] = useState(null);
  const [isPaidConfirmed, setIsPaidConfirmed] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!order || order.paymentMethod === 'cod') return null;

  const orderCode = order.orderCode || order._id?.slice(-6).toUpperCase() || 'ORDER';
  const totalAmount = order.totalAmount || 0;
  const transferContent = `THANHTOAN ${orderCode}`;

  // Bank Info for VietQR
  const bankBin = '970422'; // MBBank
  const bankName = 'MBBank - Ngân hàng TMCP Quân Đội';
  const accountNumber = '999988886666';
  const accountName = 'CÔNG TY CP CÔNG NGHỆ TECHPHONE';

  const vietQrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;
  const momoQrUrl = `https://img.vietqr.io/image/970422-0909888999-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(`MOMO ${orderCode}`)}&accountName=CONG%20TY%20TECHPHONE`;

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`🎉 Đã sao chép ${label}!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleConfirmPaid = () => {
    setVerifying(true);
    toast.loading('⏳ Đang gửi tín hiệu đối soát lên hệ thống ngân hàng...', { duration: 1500 });
    setTimeout(() => {
      setVerifying(false);
      setIsPaidConfirmed(true);
      toast.success('🎉 Hệ thống đã nhận tín hiệu! Giao dịch đang được AI kiểm duyệt tự động trong 1-3 phút.');
    }, 1500);
  };

  const handleOpenVNPay = () => {
    toast.success('🌐 Đang kết nối an toàn đến cổng thanh toán VNPay...');
    // Simulate gateway redirect or alert
    setTimeout(() => {
      window.open('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', '_blank');
    }, 1000);
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-premium relative overflow-hidden animate-scale-in space-y-5">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-primary-600 animate-gradient" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
            {order.paymentMethod === 'bank_transfer' ? <QrCode size={20} /> :
             order.paymentMethod === 'momo' ? <Smartphone size={20} /> : <CreditCard size={20} />}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              {order.paymentMethod === 'bank_transfer' ? '🏦 Hướng Dẫn Hoàn Tất Chuyển Khoản QR Bank' :
               order.paymentMethod === 'momo' ? '📱 Hướng Dẫn Quét Mã Ví MoMo' : '🔐 Hoàn Tất Thanh Toán VNPay'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Đơn hàng <strong className="text-primary-600 font-mono">#{orderCode}</strong> đang chờ bạn thanh toán để ưu tiên xuất kho 2H
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-extrabold text-xs shrink-0 self-start sm:self-center">
          <Clock size={14} className="animate-spin-slow" />
          <span>Chờ thanh toán</span>
        </div>
      </div>

      {/* CONFIRMED STATE */}
      {isPaidConfirmed ? (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary-500/10 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <CheckCircle2 size={26} className="animate-bounce-subtle" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              🎉 Đã Gửi Tín Hiệu Xác Nhận Thanh Toán!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Hệ thống AI đối soát tự động của TechPhone đang kiểm tra giao dịch của bạn với ngân hàng. Đơn hàng sẽ tự động cập nhật trạng thái <strong className="text-emerald-600">"Đã thanh toán"</strong> trong 1-3 phút tới.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Bạn có thể yên tâm đóng trang hoặc theo dõi đơn trong mục Quản lý Đơn Hàng</span>
          </div>
        </div>
      ) : (
        <>
          {/* BANK TRANSFER (OPTION 2) CONTENT */}
          {order.paymentMethod === 'bank_transfer' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* QR Image */}
              <div className="md:col-span-5 flex flex-col items-center text-center bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <img src={vietQrUrl} alt="VietQR" className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto rounded-lg" />
                </div>
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 mt-2 flex items-center gap-1.5">
                  <QrCode size={14} className="text-primary-600" /> Quét mã VietQR NAPAS 247
                </span>
                <span className="text-[10px] text-slate-500">Tự động điền đúng số tiền & nội dung</span>
              </div>

              {/* Transfer Details */}
              <div className="md:col-span-7 space-y-3">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 font-bold">Ngân hàng:</span>
                    <span className="font-black text-slate-900 dark:text-white text-right">{bankName}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 font-bold">Số tài khoản:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-primary-600 dark:text-primary-400">{accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(accountNumber, 'Số tài khoản')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-primary-600 border border-slate-200 hover:bg-primary-50 font-bold text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                      >
                        {copiedField === 'Số tài khoản' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copiedField === 'Số tài khoản' ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 font-bold">Chủ tài khoản:</span>
                    <span className="font-black text-slate-900 dark:text-white uppercase text-right">{accountName}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-800/60">
                    <span className="text-slate-700 dark:text-slate-300 font-extrabold">Số tiền chuyển:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-red-600 dark:text-red-400">{formatPrice(totalAmount)}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(totalAmount?.toString(), 'Số tiền')}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-red-600 border border-red-200 hover:bg-red-50 font-bold text-[11px] flex items-center gap-1 shadow-2xs active:scale-95 transition-all"
                      >
                        {copiedField === 'Số tiền' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                        <span>{copiedField === 'Số tiền' ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700">
                    <div>
                      <span className="text-amber-900 dark:text-amber-200 font-extrabold block text-[10px] uppercase">Nội dung chuyển khoản (Bắt buộc):</span>
                      <span className="font-mono font-black text-sm text-amber-800 dark:text-amber-300">{transferContent}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(transferContent, 'Nội dung chuyển khoản')}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-white hover:bg-amber-600 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all shrink-0"
                    >
                      {copiedField === 'Nội dung chuyển khoản' ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedField === 'Nội dung chuyển khoản' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleConfirmPaid}
                    disabled={verifying}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
                  >
                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    <span>Tôi Đã Chuyển Khoản Thành Công</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MOMO CONTENT */}
          {order.paymentMethod === 'momo' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-5 flex flex-col items-center text-center bg-pink-50 dark:bg-pink-950/30 p-4 rounded-2xl border border-pink-200 dark:border-pink-800">
                <img src={momoQrUrl} alt="MoMo QR" className="w-48 h-48 object-contain mx-auto rounded-lg bg-white p-2 shadow-sm" />
                <span className="text-xs font-black text-pink-600 dark:text-pink-400 mt-2 flex items-center gap-1">
                  <Smartphone size={14} /> Quét bằng ứng dụng MoMo
                </span>
              </div>
              <div className="md:col-span-7 space-y-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">SĐT MoMo:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-pink-600">0909 888 999</span>
                      <button type="button" onClick={() => handleCopy('0909888999', 'SĐT MoMo')} className="px-2 py-1 bg-pink-100 text-pink-700 rounded font-bold text-[11px]">Copy</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">Số tiền:</span>
                    <span className="font-black text-base text-red-600">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-500">Lời nhắn:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">{`MOMO ${orderCode}`}</span>
                      <button type="button" onClick={() => handleCopy(`MOMO ${orderCode}`, 'Lời nhắn')} className="px-2 py-1 bg-amber-500 text-white rounded font-bold text-[11px]">Copy</button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmPaid}
                  disabled={verifying}
                  className="w-full py-3.5 px-4 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-black text-sm shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Tôi Đã Chuyển MoMo Thành Công</span>
                </button>
              </div>
            </div>
          )}

          {/* VNPAY CONTENT */}
          {order.paymentMethod === 'vnpay' && (
            <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-center space-y-4">
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  🌐 Kết Nối Cổng Thanh Toán VNPay
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Bấm nút bên dưới để mở cổng thanh toán an toàn VNPay. Bạn có thể thanh toán bằng Thẻ ATM, QR Pay hoặc Thẻ Visa/Master/JCB.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenVNPay}
                className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-blue-500/25 inline-flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <span>Mở Cổng Thanh Toán VNPay Ngay</span>
                <ExternalLink size={16} />
              </button>
              <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <Lock size={13} className="text-blue-600" />
                <span>Mã hóa bảo mật 256-bit • Hỗ trợ trả góp 0%</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderSuccessPaymentCard;
