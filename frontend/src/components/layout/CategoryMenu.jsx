import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Smartphone, Headphones, ShieldCheck, Truck, Gift, ChevronRight } from 'lucide-react';
import { productAPI } from '../../services/api';

const CategoryMenu = () => {
  const navigate = useNavigate();
  const [hoveredBrand, setHoveredBrand] = useState(null);
  const [suggestedProducts, setSuggestedProducts] = useState({});

  const brandLinks = [
    { name: 'iPhone', brand: 'Apple', path: '/shop?brand=Apple', icon: Smartphone, color: 'text-slate-900 dark:text-slate-100' },
    { name: 'Samsung', brand: 'Samsung', path: '/shop?brand=Samsung', icon: Smartphone, color: 'text-blue-600' },
    { name: 'Xiaomi', brand: 'Xiaomi', path: '/shop?brand=Xiaomi', icon: Smartphone, color: 'text-orange-500' },
    { name: 'Oppo', brand: 'Oppo', path: '/shop?brand=Oppo', icon: Smartphone, color: 'text-emerald-600' },
    { name: 'Vivo', brand: 'Vivo', path: '/shop?brand=Vivo', icon: Smartphone, color: 'text-sky-500' },
    { name: 'Phụ kiện', brand: 'Phụ kiện', path: '/shop?search=Phụ+kiện', icon: Headphones, color: 'text-purple-600' },
  ];

  const handleMouseEnter = async (brand) => {
    setHoveredBrand(brand);
    if (!suggestedProducts[brand]) {
      try {
        const query = brand === 'Phụ kiện' ? { search: 'Phụ kiện', limit: 4 } : { brand, limit: 4 };
        const res = await productAPI.getAll(query);
        setSuggestedProducts(prev => ({ ...prev, [brand]: res.data || [] }));
      } catch (err) {
        console.error('Failed to fetch suggested products:', err);
      }
    }
  };

  const handleMouseLeave = () => {
    setHoveredBrand(null);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/50 shadow-sm transition-colors relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-sm font-medium py-1">
        {/* Danh mục Brands và Phụ kiện */}
        {/* Đổi sang lg:overflow-visible để dropdown absolute không bị cắt khúc */}
        <div className="flex items-center space-x-6 overflow-x-auto lg:overflow-visible no-scrollbar">
          <Link
            to="/shop"
            className="text-primary font-bold flex items-center gap-1.5 hover:opacity-80 transition-opacity whitespace-nowrap bg-primary/10 px-3 py-2 rounded-full text-xs"
          >
            <Zap size={14} className="text-amber-500 fill-amber-500" /> Tất cả sản phẩm
          </Link>

          {brandLinks.map((item, index) => {
            const Icon = item.icon;
            const isHovered = hoveredBrand === item.brand;
            
            return (
              <div 
                key={index} 
                onMouseEnter={() => handleMouseEnter(item.brand)}
                onMouseLeave={handleMouseLeave}
                className="py-3 relative group"
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-500 transition-colors whitespace-nowrap font-semibold text-xs sm:text-sm"
                >
                  <Icon size={16} className={`${item.color} group-hover:scale-110 transition-transform`} />
                  <span>{item.name}</span>
                </Link>

                {/* Dropdown Gợi ý sản phẩm dạng List Siêu Nhỏ (ẩn trên mobile, chỉ hiện Desktop) */}
                {isHovered && (
                  <div className="hidden lg:block absolute top-[100%] left-1/2 -translate-x-1/2 w-[280px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-glass dark:shadow-glass-dark animate-in fade-in zoom-in-95 duration-150 py-2">
                    {/* Mũi tên nhỏ chỉ lên trên */}
                    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white dark:bg-slate-900 border-l border-t border-slate-100 dark:border-slate-800 rotate-45"></div>
                    
                    <div className="relative px-3 pb-2 pt-1 border-b border-slate-50 dark:border-slate-800/50 mb-1 flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                         Gợi ý {item.brand}
                       </span>
                       <Link 
                         to={item.path} 
                         onClick={handleMouseLeave}
                         className="text-[10px] text-primary-600 hover:underline font-bold"
                       >
                         Xem thêm
                       </Link>
                    </div>

                    <div className="px-2 flex flex-col gap-0.5">
                      {suggestedProducts[item.brand] ? (
                        suggestedProducts[item.brand].length > 0 ? (
                          suggestedProducts[item.brand].map(prod => (
                            <div 
                              key={prod._id || prod.id}
                              onClick={() => { setHoveredBrand(null); navigate(`/product/${prod._id || prod.id}`); }}
                              className="flex items-center gap-2.5 p-2 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group/item"
                            >
                              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-100 dark:border-slate-700 shrink-0">
                                <img 
                                  src={prod.images?.[0] || prod.image || 'https://via.placeholder.com/100'} 
                                  alt={prod.name} 
                                  className="w-full h-full object-contain group-hover/item:scale-110 transition-transform" 
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover/item:text-primary-600 transition-colors">
                                  {prod.name}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[11px] font-black text-red-500">
                                    {formatPrice(prod.salePrice > 0 ? prod.salePrice : prod.price)}
                                  </span>
                                  {prod.salePrice > 0 && prod.salePrice < prod.price && (
                                    <span className="text-[9px] text-slate-400 line-through">
                                      {formatPrice(prod.price)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                           <div className="py-4 text-center text-[10px] text-slate-400">
                             Chưa có sản phẩm nào
                           </div>
                        )
                      ) : (
                        <div className="py-4 flex justify-center">
                          <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tiện ích Sàn TMĐT */}
        <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 font-medium"><Truck size={15} className="text-emerald-500" /> Miễn phí vận chuyển</span>
          <span className="flex items-center gap-1.5 font-medium"><ShieldCheck size={15} className="text-blue-500" /> Bảo hành 12 tháng</span>
          <span className="flex items-center gap-1.5 font-medium"><Gift size={15} className="text-purple-500" /> Voucher giảm giá</span>
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;
