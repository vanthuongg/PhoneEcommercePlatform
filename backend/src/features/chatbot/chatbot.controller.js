const Product = require('../products/product.model');
const Category = require('../categories/category.model');

// Normalize Vietnamese, remove diacritics and punctuation for exact matching
const cleanText = (str) => {
  if (!str) return '';
  let cleaned = str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
  // Replace punctuation with spaces
  cleaned = cleaned.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, ' ');
  // Remove extra spaces
  return cleaned.replace(/\s{2,}/g, ' ').trim();
};

// Check if message contains any of the keywords (exact word matching to avoid "gia" matching "giao")
const hasKeyword = (cleanedMsg, keywords) => {
  const paddedMsg = ` ${cleanedMsg} `;
  return keywords.some((k) => paddedMsg.includes(` ${k} `));
};

// FAQ responses with polite tone
const faqResponses = {
  shipping: {
    keywords: ['giao hang', 'van chuyen', 'ship', 'delivery', 'giao', 'phi van chuyen', 'phi ship', 'bao lau', 'ship khong'],
    response: '🚚 **Dạ, thông tin giao hàng của TechPhone Store đây ạ:**\n• Giao hàng toàn quốc tận nơi.\n• Phí vận chuyển đồng giá: 30.000₫/đơn.\n• Thời gian: 2-4 ngày (nội thành HCM/HN nhận ngay trong 2-4h).\n• Đặc biệt: Miễn phí ship cho đơn từ 500.000₫ nha bạn!',
  },
  payment: {
    keywords: ['thanh toan', 'tra tien', 'payment', 'chuyen khoan', 'cod', 'tra gop'],
    response: '💳 **Dạ, bên em hỗ trợ 2 hình thức thanh toán chính:**\n• 💵 Tiền mặt khi nhận hàng (COD).\n• 🏦 Chuyển khoản QR Bank 24/7 (VietQR tự động duyệt siêu tốc).\n\nAnh/chị chọn cách nào tiện nhất cho mình nhé!',
  },
  returns: {
    keywords: ['doi tra', 'tra hang', 'hoan tien', 'bao hanh', 'return', 'refund', 'warranty', 'loi', 'hu hong'],
    response: '🔄 **Dạ, chính sách bảo hành & đổi trả của shop rất rõ ràng ạ:**\n• 1 ĐỔI 1 miễn phí trong 30 ngày nếu có lỗi từ nhà sản xuất.\n• Hoàn tiền 100% trong 3-5 ngày làm việc.\n• Bảo hành chính hãng từ 12-24 tháng (tùy sản phẩm).\nAnh/chị yên tâm mua sắm nhé!',
  },
  contact: {
    keywords: ['lien he', 'hotline', 'contact', 'ho tro', 'so dien thoai', 'email', 'dia chi', 'cua hang', 'o dau'],
    response: '📞 **Dạ, anh/chị có thể liên hệ hoặc ghé shop tại:**\n• 🏠 Địa chỉ: 123 Nguyễn Văn Linh, Q.7, TP.HCM\n• ☎️ Hotline: 1900 1234 (miễn phí)\n• 📧 Email: support@techphone.vn\n• ⏰ Giờ mở cửa: 8h00 - 22h00 các ngày trong tuần ạ.',
  },
  promotions: {
    keywords: ['khuyen mai', 'giam gia', 'sale', 'voucher', 'ma giam', 'uu dai', 'promotion', 'chuong trinh'],
    response: '🎉 **Dạ, TechPhone Store đang có rất nhiều ưu đãi:**\n• Giảm giá siêu sâu cho Apple & Samsung.\n• Voucher giảm ngay 10% cho khách hàng mới (Đăng ký tài khoản).\n• Tích điểm thành viên đổi quà.\n\nAnh/chị dạo quanh trang Cửa hàng để săn deal nha!',
  },
  order: {
    keywords: ['don hang', 'trang thai', 'theo doi', 'order', 'tracking', 'da dat', 'huy don'],
    response: '📦 **Dạ, để kiểm tra đơn hàng:**\nAnh/chị vào mục **"Tài khoản"** -> **"Đơn hàng của tôi"** để xem tiến độ nhé.\n\nNếu đơn đang ở trạng thái "Chờ xác nhận", anh/chị có thể tự hủy đơn ạ. Nếu cần hỗ trợ khẩn cấp, hãy gọi 1900 1234 nhé.',
  },
};

const greetingKeywords = ['xin chao', 'hello', 'hi', 'hey', 'chao', 'alo', 'helu', 'chao ban', 'chao shop', 'co ai khong', 'shop oi'];
const thankKeywords = ['cam on', 'thanks', 'thank', 'cam ơn', 'ok', 'duoc roi', 'bye', 'tam biet', 'dza', 'vang', 'da cam on'];
const priceKeywords = ['gia', 'bao nhieu', 'price', 'cost', 'tien', 'gia ca', 'gia the nao', 'ban bao nhieu'];
const stockKeywords = ['con hang', 'het hang', 'ton kho', 'stock', 'co hang', 'con khong', 'co khong', 'con ko', 'ban khong', 'co ban'];
const cheapKeywords = ['re', 'gia re', 're nhat', 'binh dan', 'tiet kiem', 'cheap', 'duoi', 'khoang'];
const expensiveKeywords = ['dat', 'cao cap', 'premium', 'flagship', 'tot nhat', 'xin nhat', 'mac', 'vip'];
const recommendKeywords = ['goi y', 'tu van', 'recommend', 'de xuat', 'nen mua', 'mua gi', 'suggest', 'noi bat', 'ban chay', 'hot'];

// Format price in VND
const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

// Detect intent from cleaned message
const detectIntent = (cleanedMsg) => {
  if (hasKeyword(cleanedMsg, greetingKeywords)) return 'greeting';
  if (hasKeyword(cleanedMsg, thankKeywords)) return 'thanks';
  for (const [key, faq] of Object.entries(faqResponses)) {
    if (hasKeyword(cleanedMsg, faq.keywords)) return `faq_${key}`;
  }
  if (hasKeyword(cleanedMsg, stockKeywords)) return 'stock_check';
  if (hasKeyword(cleanedMsg, priceKeywords)) return 'price_check';
  if (hasKeyword(cleanedMsg, cheapKeywords)) return 'cheap';
  if (hasKeyword(cleanedMsg, expensiveKeywords)) return 'expensive';
  if (hasKeyword(cleanedMsg, recommendKeywords)) return 'recommend';
  return 'search';
};

// Words to ignore when searching the DB
const stopWords = ['toi', 'muon', 'mua', 'can', 'tim', 'kiem', 'xem', 'cho', 'cai', 'mot', 'co', 'khong', 'la', 'va', 'cua', 'nay', 'do', 'duoc', 'gi', 'nhu', 'the', 'nao', 'bao', 'nhieu', 'gia', 'san', 'pham', 'hang', 'shop', 'ban', 'oi', 'voi', 'nhe', 'hay', 'di', 'dau', 'tot', 'nhat', 'dat', 're', 'con', 'het', 'da', 'roi', 'ah', 'a', 'em', 'anh', 'chi', 'minh', 'ma', 'thi', 'se', 'de', 'den', 'tien', 'hieu', 'loai', 'dong'];

const extractSearchKeywords = (cleanedMsg) => {
  return cleanedMsg
    .split(' ')
    .filter((word) => word.length > 1 && !stopWords.includes(word))
    .join(' ')
    .trim();
};

// Advanced product search
const searchProducts = async (keywords, options = {}) => {
  const { limit = 4, sort = '-sold', minPrice, maxPrice } = options;
  const query = { isActive: true };

  if (keywords) {
    const searchTerms = keywords.split(' ').filter(Boolean);
    if (searchTerms.length > 0) {
      const allTermsQuery = searchTerms.map(term => ({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { brand: { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } }
        ]
      }));

      query.$or = [
        { name: { $regex: keywords, $options: 'i' } },
        { brand: { $regex: keywords, $options: 'i' } },
        { $and: allTermsQuery }
      ];
    }
  }

  if (minPrice) query.price = { ...query.price, $gte: minPrice };
  if (maxPrice) query.price = { ...query.price, $lte: maxPrice };

  return Product.find(query).populate('category', 'name').sort(sort).limit(limit);
};

// Search by category name
const searchByCategory = async (keywords, limit = 4) => {
  const categories = await Category.find({ isActive: true });
  const matched = categories.find((cat) => {
    const catNorm = cleanText(cat.name);
    return keywords.includes(catNorm) || catNorm.includes(keywords);
  });

  if (matched) {
    const products = await Product.find({ category: matched._id, isActive: true })
      .populate('category', 'name')
      .sort('-sold')
      .limit(limit);
    return { category: matched, products };
  }
  return null;
};

// Format response for frontend
const formatProductResponse = (products) => {
  if (!products || products.length === 0) return null;
  return products.map((p) => ({
    _id: p._id,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice,
    image: p.images?.[0] || '',
    brand: p.brand,
    rating: p.rating,
    stock: p.stock,
    category: p.category?.name || '',
  }));
};

const processMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.json({ success: true, data: { text: 'Dạ anh/chị cần hỗ trợ gì ạ? Cứ nhắn cho em nha! 😊', products: [] } });
    }

    const cleanedMsg = cleanText(message);
    const intent = detectIntent(cleanedMsg);
    let responseText = '';
    let products = [];

    switch (intent) {
      case 'greeting': {
        responseText = 'Dạ xin chào! 👋 Em là trợ lý mua sắm của **TechPhone Store**.\n\nEm có thể giúp anh/chị:\n• 🔍 Tìm sản phẩm ưng ý\n• 💰 Báo giá và ưu đãi\n• 📦 Check tồn kho\n• 🚚 Trả lời câu hỏi về giao hàng, bảo hành...\n\nHôm nay mình muốn tìm mua gì ạ?';
        break;
      }

      case 'thanks': {
        responseText = 'Dạ không có chi ạ! 🥰 Cần gì anh/chị cứ gọi em nha. Chúc anh/chị một ngày thật vui vẻ và săn được nhiều deal ngon! 🛍️';
        break;
      }

      case 'recommend': {
        const topProducts = await Product.find({ isActive: true }).populate('category', 'name').sort('-sold -rating').limit(4);
        products = formatProductResponse(topProducts);
        responseText = products?.length ? '🌟 Dạ đây là các sản phẩm **HOT và Bán chạy nhất** bên em hiện tại ạ:' : 'Dạ tạm thời chưa có danh sách nổi bật. Anh/chị tìm trực tiếp tên sản phẩm giúp em nha!';
        break;
      }

      case 'cheap': {
        const keywords = extractSearchKeywords(cleanedMsg);
        const cheapProducts = await searchProducts(keywords, { sort: 'salePrice', limit: 4 });
        products = formatProductResponse(cheapProducts);
        responseText = products?.length ? '💰 Dạ em tìm được các sản phẩm **giá siêu tốt** cho mình đây ạ:' : 'Dạ em chưa tìm thấy sản phẩm giá rẻ nào phù hợp. Mình thử đổi từ khóa giúp em nha!';
        break;
      }

      case 'expensive': {
        const keywords = extractSearchKeywords(cleanedMsg);
        const premiumProducts = await searchProducts(keywords, { sort: '-price', limit: 4 });
        products = formatProductResponse(premiumProducts);
        responseText = products?.length ? '✨ Dạ đây là dòng sản phẩm **cao cấp (Premium)** bên em:' : 'Dạ em không tìm thấy dòng cao cấp cho từ khóa này. Mình thử gõ tên cụ thể hơn nha!';
        break;
      }

      case 'price_check': {
        const keywords = extractSearchKeywords(cleanedMsg);
        if (keywords) {
          const found = await searchProducts(keywords, { limit: 3 });
          if (found.length > 0) {
            products = formatProductResponse(found);
            const priceInfo = found.map((p) => {
              const price = p.salePrice > 0 ? `~~${formatPrice(p.price)}~~ **${formatPrice(p.salePrice)}**` : `**${formatPrice(p.price)}**`;
              return `• ${p.name}: ${price}`;
            }).join('\n');
            responseText = `💰 **Dạ báo giá chi tiết cho mình đây ạ:**\n${priceInfo}\n\nAnh/chị xem thêm bên dưới nhé 👇`;
          } else {
            responseText = `Dạ em không tìm thấy giá cho "${keywords}". Anh/chị thử ghi rõ tên dòng máy giúp em nha (VD: "giá iPhone 15")!`;
          }
        } else {
          responseText = 'Dạ anh/chị muốn hỏi giá của sản phẩm nào ạ? Cho em xin tên sản phẩm nha! 😊';
        }
        break;
      }

      case 'stock_check': {
        const keywords = extractSearchKeywords(cleanedMsg);
        if (keywords) {
          const found = await searchProducts(keywords, { limit: 3 });
          if (found.length > 0) {
            products = formatProductResponse(found);
            const stockInfo = found.map((p) => {
              const status = p.stock > 0 ? `✅ Sẵn hàng (${p.stock} chiếc)` : '❌ Đang tạm hết';
              return `• ${p.name}: ${status}`;
            }).join('\n');
            responseText = `📦 **Dạ tình trạng kho hàng hiện tại:**\n${stockInfo}\n\nAnh/chị có thể bấm Thêm vào giỏ hàng ngay bên dưới nhé 👇`;
          } else {
            responseText = `Dạ bên em đang không có sản phẩm "${keywords}" rồi ạ. Mình tham khảo mẫu khác giúp em nhé!`;
          }
        } else {
          responseText = 'Dạ mình muốn kiểm tra tồn kho của sản phẩm nào ạ? Nhắn tên sản phẩm cho em nhé!';
        }
        break;
      }

      default: {
        if (intent.startsWith('faq_')) {
          const faqKey = intent.replace('faq_', '');
          responseText = faqResponses[faqKey].response;
          break;
        }

        const keywords = extractSearchKeywords(cleanedMsg);

        if (!keywords) {
          responseText = 'Dạ em chưa hiểu rõ ý mình 🤔\n\nAnh/chị có thể:\n• Nhập tên cụ thể (VD: "iPhone 15 Pro", "MacBook M3")\n• Tìm theo loại (VD: "laptop", "tai nghe")\n• Hỏi chính sách (VD: "phí giao hàng", "bảo hành sao")';
          break;
        }

        const catResult = await searchByCategory(keywords);
        if (catResult && catResult.products.length > 0) {
          products = formatProductResponse(catResult.products);
          responseText = `📂 Dạ em gửi các mẫu trong danh mục **${catResult.category.name}** ạ:`;
          break;
        }

        const found = await searchProducts(keywords, { limit: 4 });
        if (found.length > 0) {
          products = formatProductResponse(found);
          responseText = `🔍 Dạ em tìm thấy **${found.length} mẫu** phù hợp với yêu cầu của mình:`;
        } else {
          const words = keywords.split(' ');
          let partialResults = [];
          for (const word of words) {
            if (word.length > 3) {
              const partial = await searchProducts(word, { limit: 2 });
              partialResults.push(...partial);
            }
          }
          const unique = [...new Map(partialResults.map((p) => [p._id.toString(), p])).values()].slice(0, 4);

          if (unique.length > 0) {
            products = formatProductResponse(unique);
            responseText = `Dạ em không tìm thấy chính xác món anh/chị tìm, nhưng có các mẫu này khá tương tự ạ:`;
          } else {
            responseText = `Dạ xin lỗi anh/chị, em tìm mãi mà không thấy sản phẩm nào liên quan đến từ khóa này 😅\n\nMình thử kiểm tra lại chính tả hoặc dùng tên ngắn gọn hơn nha (VD: "Airpods" thay vì "Tai nghe ko day cua Apple")`;
          }
        }
        break;
      }
    }

    res.json({
      success: true,
      data: {
        text: responseText,
        products: products || [],
      },
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      data: { text: 'Dạ hệ thống đang hơi quá tải một chút 😅. Anh/chị thông cảm thử lại sau vài giây nha!', products: [] },
    });
  }
};

module.exports = { processMessage };
