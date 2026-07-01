import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, X, Send, Star, ShoppingCart, Bot, User, Loader2 } from 'lucide-react';
import { chatbotAPI } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Mini product card inside chat
const ChatProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isCustomer = true;
  const displayPrice = product.salePrice > 0 ? product.salePrice : product.price;
  const hasDiscount = product.salePrice > 0 && product.salePrice < product.price;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative h-28 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <img
            src={product.image || product.images?.[0] || 'https://via.placeholder.com/200'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {hasDiscount && (
            <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -{Math.round((1 - product.salePrice / product.price) * 100)}%
            </span>
          )}
        </div>
      </Link>
      <div className="p-2.5">
        <Link to={`/product/${product._id}`}>
          <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug hover:text-primary-600 transition-colors mb-1">
            {product.name}
          </h4>
        </Link>
        {product.brand && <p className="text-[10px] text-gray-400 mb-1">{product.brand}</p>}
        <div className="flex items-center gap-1 mb-1.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-2.5 h-2.5 ${s <= Math.round(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-1">
          <div>
            <span className="text-xs font-bold text-primary-600">{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <span className="block text-[10px] text-gray-400 line-through">{formatPrice(product.price)}</span>
            )}
          </div>
          {isCustomer && product.stock > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); addToCart(product._id, 1, 'M', 'Default'); }}
              className="w-7 h-7 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center transition-colors shrink-0"
              title="Thêm vào giỏ"
            >
              <ShoppingCart className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Parse simple markdown bold (**text**) and strikethrough (~~text~~)
const parseMarkdown = (text) => {
  if (!text) return '';
  const parts = text.split(/(\*\*.*?\*\*|~~.*?~~)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <span key={i} className="line-through text-gray-400">{part.slice(2, -2)}</span>;
    }
    return part;
  });
};

// Render message text with line breaks and markdown
const MessageText = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => (
        <p key={i} className={`text-sm leading-relaxed ${line.startsWith('•') ? 'pl-1' : ''}`}>
          {parseMarkdown(line)}
        </p>
      ))}
    </div>
  );
};

// Typing indicator dots
const TypingIndicator = () => (
  <div className="flex items-start gap-2 animate-fade-in">
    <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shrink-0">
      <Bot className="w-3.5 h-3.5 text-white" />
    </div>
    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3">
      <div className="flex gap-1.5">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

const GREETING_MSG = {
  id: 'greeting',
  sender: 'bot',
  text: 'Xin chào! 👋 Tôi là trợ lý AI của **TechPhone**.\n\nTôi có thể giúp bạn tìm kiếm mẫu smartphone ưng ý, so sánh thông số kỹ thuật, tư vấn trả góp 0% hoặc kiểm tra ưu đãi mã giảm giá.\n\nHãy hỏi tôi bất cứ điều gì bạn cần nhé! 😊',
  products: [],
  time: new Date(),
};

const QUICK_ACTIONS = [
  { label: '🔥 iPhone 15 / 16 Series', msg: 'iPhone' },
  { label: '📱 Samsung Galaxy AI Ultra', msg: 'Samsung' },
  { label: '⚡ Hướng dẫn chọn mã Voucher', msg: 'voucher' },
  { label: '🚚 Chính sách giao siêu tốc 2H', msg: 'giao hàng' },
  { label: '💳 Hỗ trợ trả góp 0% qua thẻ', msg: 'thanh toán' },
];

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING_MSG]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMsg, setHasNewMsg] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      messagesEndRef.current.parentElement.scrollTo({
        top: messagesEndRef.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasNewMsg(false);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const typingDelay = Math.min(600 + text.length * 15, 1500);
      await new Promise((resolve) => setTimeout(resolve, typingDelay));

      const res = await chatbotAPI.sendMessage(text.trim());
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.data.text,
        products: res.data.products || [],
        time: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
      if (!isOpen) setHasNewMsg(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Xin lỗi, tôi đang gặp chút gián đoạn kết nối 😅. Bạn vui lòng thử lại sau nhé!',
          products: [],
          time: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (msg) => {
    sendMessage(msg);
  };

  return (
    <>
      {/* Chat Window */}
      <div
        className={`fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden" style={{ height: 'min(580px, calc(100vh - 8rem))' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-primary-600" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Trợ lý TechPhone AI</h3>
                <p className="text-primary-200 text-xs">Trực tuyến tư vấn 24/7</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-2 animate-fade-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.sender === 'bot' ? (
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shrink-0 shadow">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center shrink-0 shadow">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                )}

                <div className="max-w-[85%]">
                  <div
                    className={`px-4 py-2.5 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-primary-600 text-white rounded-2xl rounded-tr-md shadow-md'
                        : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-md shadow-sm'
                    }`}
                  >
                    {msg.sender === 'user' ? msg.text : <MessageText text={msg.text} />}
                  </div>

                  {msg.products?.length > 0 && (
                    <div className={`mt-2 grid gap-2 ${msg.products.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                      {msg.products.map((p) => (
                        <ChatProductCard key={p._id} product={p} />
                      ))}
                    </div>
                  )}

                  <p className={`text-[10px] text-gray-400 mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {new Date(msg.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length <= 1 && !isTyping && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.msg)}
                    className="text-xs font-medium px-3 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full hover:bg-primary-100 transition-colors whitespace-nowrap"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi trợ lý AI..."
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white transition-all placeholder-gray-400 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-200 disabled:cursor-not-allowed active:scale-95 shadow"
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 group ${
          isOpen
            ? 'bg-gray-800 hover:bg-gray-900 rotate-0'
            : 'bg-gradient-to-br from-primary-600 to-blue-600 hover:scale-110 animate-pulse'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7 text-white" />
            {hasNewMsg && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow">
                !
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
