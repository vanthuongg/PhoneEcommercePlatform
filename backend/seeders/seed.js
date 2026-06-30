require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Voucher = require('../models/Voucher');

const connectDB = require('../config/db');

const categories = [
  { name: 'Điện thoại iPhone', description: 'Các dòng iPhone chính hãng VN/A cao cấp', image: '' },
  { name: 'Điện thoại Samsung', description: 'Galaxy S, Galaxy Z Fold, Z Flip chính hãng', image: '' },
  { name: 'Điện thoại Xiaomi', description: 'Xiaomi series, Redmi Note cấu hình mạnh mẽ', image: '' },
  { name: 'Điện thoại Oppo', description: 'Oppo Reno, Find X chụp ảnh chân dung chuyên nghiệp', image: '' },
  { name: 'Điện thoại Vivo & Realme', description: 'Thiết kế thời trang, sạc nhanh vượt trội', image: '' },
  { name: 'Google Pixel & Khác', description: 'Google Pixel, Honor, Nokia và các dòng cao cấp khác', image: '' },
];

const brandsData = [
  {
    name: 'Apple',
    description: 'Thương hiệu điện thoại cao cấp hàng đầu thế giới từ Mỹ. iPhone mang lại hệ sinh thái iOS hoàn hảo.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    isActive: true,
  },
  {
    name: 'Samsung',
    description: 'Gã khổng lồ công nghệ đến từ Hàn Quốc với các dòng flagship đỉnh cao Galaxy S và màn hình gập Z.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
    isActive: true,
  },
  {
    name: 'Xiaomi',
    description: 'Thương hiệu điện thoại cấu hình mạnh mẽ với mức giá vô cùng hợp lý. Đối tác camera Leica.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg',
    isActive: true,
  },
  {
    name: 'Oppo',
    description: 'Chuyên gia camera selfie, thiết kế trẻ trung và sạc nhanh SuperVOOC hàng đầu thị trường.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Oppo_logo.svg',
    isActive: true,
  },
  {
    name: 'Vivo',
    description: 'Thương hiệu điện thoại chú trọng trải nghiệm âm thanh, hình ảnh chuyên nghiệp và sạc nhanh.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Vivo_logo_2019.svg',
    isActive: true,
  },
  {
    name: 'Realme',
    description: 'Điện thoại dành cho giới trẻ với hiệu năng vượt trội trong tầm giá. Sạc nhanh kỷ lục 240W.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Realme_logo.svg',
    isActive: true,
  },
  {
    name: 'Google Pixel',
    description: 'Điện thoại thuần Android của Google với AI photography hàng đầu và trải nghiệm phần mềm tuyệt vời.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    isActive: true,
  },
  {
    name: 'Honor',
    description: 'Thương hiệu tách ra từ Huawei, mang đến thiết kế cao cấp với giá cả cạnh tranh tại thị trường châu Á.',
    logo: '🏅',
    isActive: true,
  },
  {
    name: 'Nokia',
    description: 'Thương hiệu điện thoại huyền thoại từ Phần Lan, nổi tiếng với độ bền và trải nghiệm Android thuần túy.',
    logo: '📱',
    isActive: true,
  },
  {
    name: 'Asus ROG',
    description: 'Dòng điện thoại gaming cao cấp với hiệu năng vượt trội, màn hình 165Hz và hệ thống tản nhiệt chuyên dụng.',
    logo: '🎮',
    isActive: true,
  },
];

const users = [
  {
    name: 'Admin System',
    email: 'admin@shop.com',
    password: 'admin123',
    role: 'admin',
    phone: '0900000001',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
    addresses: [
      { name: 'Admin System', phone: '0900000001', street: '1 Tôn Đức Thắng', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true }
    ]
  },
  {
    name: 'Nguyễn Quản Lý',
    email: 'manager@shop.com',
    password: 'manager123',
    role: 'manager',
    phone: '0900000002',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
    addresses: [
      { name: 'Nguyễn Quản Lý', phone: '0900000002', street: '15 Duy Tân', ward: 'Phường Dịch Vọng Hậu', district: 'Quận Cầu Giấy', city: 'Hà Nội', isDefault: true }
    ]
  },
  {
    name: 'Trần Nhân Viên',
    email: 'staff@shop.com',
    password: 'staff123',
    role: 'staff',
    phone: '0900000003',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop',
    addresses: []
  },
  {
    name: 'Lê Khách Hàng',
    email: 'customer@shop.com',
    password: 'customer123',
    role: 'customer',
    phone: '0901234567',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop',
    addresses: [
      { name: 'Lê Khách Hàng', phone: '0901234567', street: '123 Nguyễn Huệ', ward: 'Phường Bến Nghé', district: 'Quận 1', city: 'TP. Hồ Chí Minh', isDefault: true }
    ]
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing
    await User.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    await Voucher.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed users
    const createdUsers = await User.create(users);
    console.log(`✅ Seeded ${createdUsers.length} users`);

    // Seed categories
    const createdCategories = await Category.create(categories);
    console.log(`✅ Seeded ${createdCategories.length} categories`);

    // Seed brands
    const createdBrands = await Brand.create(brandsData);
    console.log(`✅ Seeded ${createdBrands.length} brands`);

    // Seed products
    const products = [
      // ==================== APPLE ====================
      {
        name: 'iPhone 16 Pro Max 256GB',
        description: 'iPhone 16 Pro Max - Đỉnh cao sáng tạo với chip A18 Pro thế hệ mới, hệ thống camera Fusion 48MP cùng màn hình siêu Retina XDR ProMotion 6.9 inch mới nhất. Titanium Desert sang trọng.',
        price: 34990000,
        oldPrice: 36990000,
        salePrice: 34990000,
        category: createdCategories[0]._id,
        stock: 80,
        sold: 1520,
        rating: 4.9,
        numReviews: 245,
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['iphone', 'apple', 'flagship', 'titan', 'iphone 16'],
        specs: {
          cpu: 'Apple A18 Pro 6 nhân',
          ram: '8GB',
          storage: '256GB',
          camera: 'Camera Fusion 48MP + Ultra Wide 48MP + Telephoto 12MP',
          battery: '4685 mAh, Sạc nhanh 30W',
          screen: '6.9 inch Super Retina XDR OLED ProMotion 120Hz',
        },
        variants: [
          { ram: '8GB', storage: '256GB', price: 34990000, stock: 40 },
          { ram: '8GB', storage: '512GB', price: 39990000, stock: 25 },
          { ram: '8GB', storage: '1TB', price: 44990000, stock: 15 },
        ],
        colors: [
          { name: 'Titan Sa Mạc', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop'], stock: 25 },
          { name: 'Titan Đen', images: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=800&auto=format&fit=crop'], stock: 20 },
          { name: 'Titan Trắng', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 20 },
          { name: 'Titan Tự Nhiên', images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?q=80&w=800&auto=format&fit=crop'], stock: 15 },
        ],
      },
      {
        name: 'iPhone 16 Pro 128GB',
        description: 'iPhone 16 Pro - Chip A18 Pro siêu mạnh, màn hình 6.3 inch ProMotion, camera Fusion 48MP và nút Camera Control đột phá hoàn toàn mới trên iPhone.',
        price: 28990000,
        oldPrice: 30990000,
        salePrice: 28990000,
        category: createdCategories[0]._id,
        stock: 65,
        sold: 980,
        rating: 4.9,
        numReviews: 178,
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1530319067432-f2a729c03db5?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['iphone', 'apple', 'flagship', 'titan', 'iphone 16 pro'],
        specs: {
          cpu: 'Apple A18 Pro 6 nhân',
          ram: '8GB',
          storage: '128GB',
          camera: 'Camera Fusion 48MP + Ultra Wide 48MP + Telephoto 12MP',
          battery: '3582 mAh, Sạc nhanh 30W',
          screen: '6.3 inch Super Retina XDR OLED ProMotion 120Hz',
        },
        variants: [
          { ram: '8GB', storage: '128GB', price: 28990000, stock: 30 },
          { ram: '8GB', storage: '256GB', price: 31990000, stock: 20 },
          { ram: '8GB', storage: '512GB', price: 37990000, stock: 10 },
          { ram: '8GB', storage: '1TB', price: 43990000, stock: 5 },
        ],
        colors: [
          { name: 'Titan Sa Mạc', images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?q=80&w=800&auto=format&fit=crop'], stock: 20 },
          { name: 'Titan Đen', images: ['https://images.unsplash.com/photo-1530319067432-f2a729c03db5?q=80&w=800&auto=format&fit=crop'], stock: 15 },
          { name: 'Titan Trắng', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop'], stock: 15 },
          { name: 'Titan Tự Nhiên', images: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=800&auto=format&fit=crop'], stock: 15 },
        ],
      },
      {
        name: 'iPhone 16 Plus 256GB',
        description: 'iPhone 16 Plus - Màn hình 6.7 inch lớn rộng với pin khủng lên đến 4674mAh, chip A18 mạnh mẽ và hệ thống camera 48MP cùng tính năng Camera Control mới.',
        price: 26490000,
        oldPrice: 28490000,
        salePrice: 26490000,
        category: createdCategories[0]._id,
        stock: 70,
        sold: 760,
        rating: 4.8,
        numReviews: 134,
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1595941069915-4ebc5197e348?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: false,
        tags: ['iphone', 'apple', 'iphone 16 plus', 'pin lớn'],
        specs: {
          cpu: 'Apple A18 6 nhân',
          ram: '8GB',
          storage: '256GB',
          camera: 'Camera Fusion 48MP + Ultra Wide 12MP',
          battery: '4674 mAh, Sạc nhanh 25W',
          screen: '6.7 inch Super Retina XDR OLED 60Hz',
        },
        variants: [
          { ram: '8GB', storage: '128GB', price: 23990000, stock: 35 },
          { ram: '8GB', storage: '256GB', price: 26490000, stock: 25 },
          { ram: '8GB', storage: '512GB', price: 31490000, stock: 10 },
        ],
        colors: [
          { name: 'Đen Đêm', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 25 },
          { name: 'Xanh Teal', images: ['https://images.unsplash.com/photo-1595941069915-4ebc5197e348?q=80&w=800&auto=format&fit=crop'], stock: 20 },
          { name: 'Hồng', images: ['https://images.unsplash.com/photo-1597424216810-86d1e79b36e6?q=80&w=800&auto=format&fit=crop'], stock: 15 },
          { name: 'Trắng', images: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=800&auto=format&fit=crop'], stock: 10 },
        ],
      },
      {
        name: 'iPhone 16 128GB',
        description: 'iPhone 16 - Mẫu iPhone tiêu chuẩn mạnh mẽ nhất với chip A18, camera Fusion 48MP, Dynamic Island và nút Camera Control hoàn toàn mới. Lựa chọn hoàn hảo cho người dùng muốn trải nghiệm Apple đỉnh cao.',
        price: 22490000,
        oldPrice: 24490000,
        salePrice: 22490000,
        category: createdCategories[0]._id,
        stock: 120,
        sold: 2100,
        rating: 4.8,
        numReviews: 312,
        brand: 'Apple',
        images: [
          'https://images.unsplash.com/photo-1607936854279-55e8a4c64888?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['iphone', 'apple', 'iphone 16', 'a18'],
        specs: {
          cpu: 'Apple A18 6 nhân',
          ram: '8GB',
          storage: '128GB',
          camera: 'Camera Fusion 48MP + Ultra Wide 12MP',
          battery: '3561 mAh, Sạc nhanh 25W',
          screen: '6.1 inch Super Retina XDR OLED 60Hz',
        },
        variants: [
          { ram: '8GB', storage: '128GB', price: 22490000, stock: 60 },
          { ram: '8GB', storage: '256GB', price: 24990000, stock: 40 },
          { ram: '8GB', storage: '512GB', price: 29990000, stock: 20 },
        ],
        colors: [
          { name: 'Đen Đêm', images: ['https://images.unsplash.com/photo-1607936854279-55e8a4c64888?q=80&w=800&auto=format&fit=crop'], stock: 35 },
          { name: 'Trắng', images: ['https://images.unsplash.com/photo-1591337676887-a217a6970a8a?q=80&w=800&auto=format&fit=crop'], stock: 30 },
          { name: 'Hồng', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 25 },
          { name: 'Xanh Teal', images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?q=80&w=800&auto=format&fit=crop'], stock: 30 },
        ],
      },

      // ==================== SAMSUNG ====================
      {
        name: 'Samsung Galaxy S26 Ultra 5G',
        description: 'Galaxy S26 Ultra - Đỉnh cao flagship với Snapdragon 8 Elite for Galaxy, AI Galaxy thế hệ mới, bút S-Pen tích hợp và camera 200MP mắt thần bóng đêm. Khung titanium thượng hạng sang trọng.',
        price: 31990000,
        oldPrice: 34990000,
        salePrice: 31990000,
        category: createdCategories[1]._id,
        stock: 90,
        sold: 1280,
        rating: 4.9,
        numReviews: 198,
        brand: 'Samsung',
        images: [
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['samsung', 'galaxy s26', 's26 ultra', 'ai', 'flagship'],
        specs: {
          cpu: 'Snapdragon 8 Elite for Galaxy',
          ram: '12GB',
          storage: '256GB',
          camera: 'Camera chính 200MP + Telephoto 50MP + Telephoto 10MP + Ultra Wide 12MP',
          battery: '5000 mAh, Sạc siêu nhanh 45W',
          screen: '6.9 inch Dynamic AMOLED 2X 120Hz',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 31990000, stock: 50 },
          { ram: '12GB', storage: '512GB', price: 35990000, stock: 30 },
          { ram: '12GB', storage: '1TB', price: 41990000, stock: 10 },
        ],
        colors: [
          { name: 'Đen Titan', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop'], stock: 40 },
          { name: 'Xám Titan', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'], stock: 30 },
          { name: 'Bạc Titan', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 20 },
        ],
      },
      {
        name: 'Samsung Galaxy S26 Plus 5G',
        description: 'Galaxy S26+ - Màn hình 6.7 inch Dynamic AMOLED 2X 120Hz rộng lớn, Snapdragon 8 Elite và camera 50MP chuyên nghiệp. Lựa chọn tuyệt vời giữa hiệu năng đỉnh và thiết kế đẹp.',
        price: 25990000,
        oldPrice: 27990000,
        salePrice: 25990000,
        category: createdCategories[1]._id,
        stock: 75,
        sold: 890,
        rating: 4.8,
        numReviews: 145,
        brand: 'Samsung',
        images: [
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['samsung', 'galaxy s26', 's26 plus', 'flagship'],
        specs: {
          cpu: 'Snapdragon 8 Elite for Galaxy',
          ram: '12GB',
          storage: '256GB',
          camera: 'Camera chính 50MP + Telephoto 10MP + Ultra Wide 12MP',
          battery: '4900 mAh, Sạc nhanh 45W',
          screen: '6.7 inch Dynamic AMOLED 2X 120Hz',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 25990000, stock: 45 },
          { ram: '12GB', storage: '512GB', price: 29990000, stock: 30 },
        ],
        colors: [
          { name: 'Đen', images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop'], stock: 40 },
          { name: 'Xanh Navy', images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=800&auto=format&fit=crop'], stock: 35 },
        ],
      },
      {
        name: 'Samsung Galaxy Z Fold 6 5G',
        description: 'Galaxy Z Fold 6 - Kiệt tác màn hình gập siêu mỏng mới nhất, bản lề Flex thế hệ thứ 6 bền bỉ, màn hình trong 7.6 inch Dynamic AMOLED 2X và chip Snapdragon 8 Gen 3 for Galaxy đỉnh cao.',
        price: 37990000,
        oldPrice: 42990000,
        salePrice: 37990000,
        category: createdCategories[1]._id,
        stock: 35,
        sold: 560,
        rating: 4.8,
        numReviews: 89,
        brand: 'Samsung',
        images: [
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: false,
        tags: ['samsung', 'galaxy z fold', 'fold 6', 'gap man hinh'],
        specs: {
          cpu: 'Snapdragon 8 Gen 3 for Galaxy',
          ram: '12GB',
          storage: '256GB',
          camera: 'Chính 50MP + Telephoto 10MP + Ultra Wide 12MP',
          battery: '4400 mAh, Sạc nhanh 25W',
          screen: '7.6 inch Dynamic AMOLED 2X gập mở + Cover 6.3 inch',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 37990000, stock: 20 },
          { ram: '12GB', storage: '512GB', price: 41990000, stock: 15 },
        ],
        colors: [
          { name: 'Xanh Navy', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 20 },
          { name: 'Đen Phantom', images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop'], stock: 15 },
        ],
      },
      {
        name: 'Samsung Galaxy Z Flip 6 5G',
        description: 'Galaxy Z Flip 6 - Điện thoại gập dọc thời trang nhất 2025, FlexWindow 3.4 inch khổng lồ trên nắp gập, chip Snapdragon 8 Gen 3 và camera AI chụp tự sướng tuyệt đẹp.',
        price: 22990000,
        oldPrice: 25990000,
        salePrice: 22990000,
        category: createdCategories[1]._id,
        stock: 50,
        sold: 780,
        rating: 4.7,
        numReviews: 112,
        brand: 'Samsung',
        images: [
          'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: false,
        tags: ['samsung', 'galaxy z flip', 'flip 6', 'gap doc', 'thoi trang'],
        specs: {
          cpu: 'Snapdragon 8 Gen 3 for Galaxy',
          ram: '12GB',
          storage: '256GB',
          camera: 'Chính 50MP + Ultra Wide 12MP',
          battery: '4000 mAh, Sạc nhanh 25W',
          screen: '6.7 inch Dynamic AMOLED 2X 120Hz gập dọc',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 22990000, stock: 30 },
          { ram: '12GB', storage: '512GB', price: 25990000, stock: 20 },
        ],
        colors: [
          { name: 'Vàng', images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop'], stock: 25 },
          { name: 'Xanh Mint', images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=800&auto=format&fit=crop'], stock: 25 },
        ],
      },

      // ==================== XIAOMI ====================
      {
        name: 'Xiaomi 16 Pro 5G',
        description: 'Xiaomi 16 Pro - Đỉnh cao nhiếp ảnh di động hợp tác Leica thế hệ mới, màn hình 2K+ LTPO AMOLED 144Hz, chip Snapdragon 8 Elite và sạc siêu nhanh 90W. Mẫu flagship hoàn hảo nhất của Xiaomi.',
        price: 29990000,
        oldPrice: 31990000,
        salePrice: 29990000,
        category: createdCategories[2]._id,
        stock: 45,
        sold: 720,
        rating: 4.9,
        numReviews: 145,
        brand: 'Xiaomi',
        images: [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['xiaomi', 'xiaomi 16 pro', 'leica', 'flagship'],
        specs: {
          cpu: 'Snapdragon 8 Elite 8 nhân',
          ram: '16GB',
          storage: '512GB',
          camera: '4 camera Leica: Chính 50MP Light Fusion 1", Tele 50MP, Ultra Wide 50MP, Macro',
          battery: '6000 mAh, Sạc siêu nhanh 90W HyperCharge + 50W sạc không dây',
          screen: '6.73 inch LTPO AMOLED 2K+ 144Hz',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 25990000, stock: 20 },
          { ram: '16GB', storage: '512GB', price: 29990000, stock: 15 },
          { ram: '16GB', storage: '1TB', price: 33990000, stock: 10 },
        ],
        colors: [
          { name: 'Đen Huyền Bí', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'], stock: 25 },
          { name: 'Trắng Tinh Khôi', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 20 },
        ],
      },
      {
        name: 'Xiaomi 16 5G',
        description: 'Xiaomi 16 - Flagship tầm trung với chip Snapdragon 8 Elite, màn hình AMOLED 2K 120Hz, camera Leica 50MP và sạc nhanh 90W. Hiệu năng mạnh mẽ, giá thành cạnh tranh.',
        price: 18990000,
        oldPrice: 20990000,
        salePrice: 18990000,
        category: createdCategories[2]._id,
        stock: 60,
        sold: 980,
        rating: 4.8,
        numReviews: 178,
        brand: 'Xiaomi',
        images: [
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: false,
        tags: ['xiaomi', 'xiaomi 16', 'flagship', 'leica'],
        specs: {
          cpu: 'Snapdragon 8 Elite 8 nhân',
          ram: '12GB',
          storage: '256GB',
          camera: 'Camera Leica 50MP + Ultra Wide 50MP + Telephoto 50MP',
          battery: '5500 mAh, Sạc nhanh 90W',
          screen: '6.36 inch LTPO AMOLED 2K 120Hz',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 18990000, stock: 35 },
          { ram: '16GB', storage: '512GB', price: 22990000, stock: 25 },
        ],
        colors: [
          { name: 'Đen', images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop'], stock: 30 },
          { name: 'Trắng', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'], stock: 30 },
        ],
      },
      {
        name: 'Xiaomi Redmi Note 14 Pro 5G',
        description: 'Redmi Note 14 Pro 5G - Vua tầm trung với camera 200MP OIS, màn hình AMOLED 2.8K cực sắc nét, chip Snapdragon 7s Gen 3 và sạc siêu nhanh 90W. Trải nghiệm cao cấp với giá phải chăng.',
        price: 8490000,
        oldPrice: 9490000,
        salePrice: 8490000,
        category: createdCategories[2]._id,
        stock: 200,
        sold: 3200,
        rating: 4.9,
        numReviews: 456,
        brand: 'Xiaomi',
        images: [
          'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['xiaomi', 'redmi note 14', 'tam trung', '200mp'],
        specs: {
          cpu: 'Snapdragon 7s Gen 3 8 nhân',
          ram: '8GB',
          storage: '128GB',
          camera: 'Chính 200MP OIS + Ultra Wide 8MP + Macro 2MP',
          battery: '5110 mAh, Sạc nhanh 90W',
          screen: '6.67 inch AMOLED 2.8K 120Hz',
        },
        variants: [
          { ram: '8GB', storage: '128GB', price: 7990000, stock: 80 },
          { ram: '8GB', storage: '256GB', price: 8990000, stock: 70 },
          { ram: '12GB', storage: '256GB', price: 9990000, stock: 50 },
        ],
        colors: [
          { name: 'Đen Bán Dạ', images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop'], stock: 100 },
          { name: 'Xanh Đại Dương', images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop'], stock: 100 },
        ],
      },

      // ==================== OPPO ====================
      {
        name: 'Oppo Find X8 Pro 5G',
        description: 'Oppo Find X8 Pro - Flagship đỉnh cao với camera Hasselblad thế hệ mới, chip Dimensity 9400 siêu mạnh, màn hình micro-curved AMOLED 2K và sạc nhanh SUPERVOOC 100W. Mặt lưng ceramic sang trọng.',
        price: 24990000,
        oldPrice: 27990000,
        salePrice: 24990000,
        category: createdCategories[3]._id,
        stock: 40,
        sold: 560,
        rating: 4.8,
        numReviews: 89,
        brand: 'Oppo',
        images: [
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['oppo', 'find x8 pro', 'hasselblad', 'flagship'],
        specs: {
          cpu: 'MediaTek Dimensity 9400 8 nhân',
          ram: '12GB',
          storage: '256GB',
          camera: 'Hasselblad 3 camera: Chính 50MP + Tele 50mm 50MP + Tele 135mm 50MP',
          battery: '5910 mAh, SUPERVOOC 100W + AirVOOC 50W',
          screen: '6.78 inch AMOLED Micro-curved 2K+ 120Hz',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 24990000, stock: 25 },
          { ram: '16GB', storage: '512GB', price: 28990000, stock: 15 },
        ],
        colors: [
          { name: 'Xanh Không Gian', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 20 },
          { name: 'Đen Vũ Trụ', images: ['https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=800&auto=format&fit=crop'], stock: 20 },
        ],
      },
      {
        name: 'Oppo Reno 13 Pro 5G',
        description: 'Oppo Reno 13 Pro - Chuyên gia chân dung siêu mỏng nhẹ, hệ thống camera AI Portrait đỉnh cao cùng sạc siêu nhanh SUPERVOOC 80W. Thiết kế thời thượng, màu sắc phong phú.',
        price: 13990000,
        oldPrice: 15490000,
        salePrice: 13990000,
        category: createdCategories[3]._id,
        stock: 80,
        sold: 1200,
        rating: 4.7,
        numReviews: 156,
        brand: 'Oppo',
        images: [
          'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: false,
        tags: ['oppo', 'reno 13 pro', 'camera chan dung'],
        specs: {
          cpu: 'MediaTek Dimensity 8350 8 nhân',
          ram: '12GB',
          storage: '256GB',
          camera: 'Chính 50MP Sony LYT-600 + Tele 50MP + Ultra Wide 8MP',
          battery: '5800 mAh, SUPERVOOC 80W',
          screen: '6.83 inch AMOLED 2K 120Hz',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 13990000, stock: 50 },
          { ram: '12GB', storage: '512GB', price: 15990000, stock: 30 },
        ],
        colors: [
          { name: 'Trắng Ngọc Trai', images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop'], stock: 40 },
          { name: 'Xanh Luminos', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 40 },
        ],
      },

      // ==================== VIVO ====================
      {
        name: 'Vivo X200 Pro 5G',
        description: 'Vivo X200 Pro - Bậc thầy nhiếp ảnh di động với cảm biến 1 inch hợp tác ZEISS, chip Dimensity 9400 siêu mạnh, pin BlueVolt dung lượng khủng 6000mAh và sạc nhanh 90W.',
        price: 25990000,
        oldPrice: 27990000,
        salePrice: 25990000,
        category: createdCategories[4]._id,
        stock: 35,
        sold: 670,
        rating: 4.9,
        numReviews: 98,
        brand: 'Vivo',
        images: [
          'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['vivo', 'x200 pro', 'zeiss', '1 inch sensor'],
        specs: {
          cpu: 'MediaTek Dimensity 9400 8 nhân',
          ram: '16GB',
          storage: '512GB',
          camera: 'ZEISS: Chính 50MP 1" + Tele 50mm 50MP + Tele 200mm 200MP',
          battery: '6000 mAh, FlashCharge 90W + Wireless 30W',
          screen: '6.78 inch LTPO AMOLED 2K 120Hz',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 22990000, stock: 15 },
          { ram: '16GB', storage: '512GB', price: 25990000, stock: 20 },
        ],
        colors: [
          { name: 'Đen Vũ Trụ', images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop'], stock: 20 },
          { name: 'Xanh Đại Dương', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 15 },
        ],
      },
      {
        name: 'Realme GT 7 Pro 5G',
        description: 'Realme GT 7 Pro - Máy gaming mạnh mẽ với Snapdragon 8 Elite, màn hình BOE 2160Hz touch sampling, sạc nhanh kỷ lục 120W và tản nhiệt AI Cooling 3.0 đỉnh cao.',
        price: 15990000,
        oldPrice: 17990000,
        salePrice: 15990000,
        category: createdCategories[4]._id,
        stock: 60,
        sold: 890,
        rating: 4.8,
        numReviews: 134,
        brand: 'Realme',
        images: [
          'https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: false,
        tags: ['realme', 'gt 7 pro', '120w', 'gaming', 'snapdragon 8 elite'],
        specs: {
          cpu: 'Snapdragon 8 Elite 8 nhân',
          ram: '12GB',
          storage: '256GB',
          camera: 'Chính 50MP Sony LYT-808 + Ultra Wide 8MP',
          battery: '6500 mAh, Sạc thần tốc 120W',
          screen: '6.78 inch LTPS AMOLED 144Hz 2K+',
        },
        variants: [
          { ram: '12GB', storage: '256GB', price: 14990000, stock: 30 },
          { ram: '16GB', storage: '512GB', price: 17990000, stock: 20 },
          { ram: '16GB', storage: '1TB', price: 19990000, stock: 10 },
        ],
        colors: [
          { name: 'Titan Xám', images: ['https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=800&auto=format&fit=crop'], stock: 30 },
          { name: 'Xanh Titan', images: ['https://images.unsplash.com/photo-1567581935884-3349723552ca?q=80&w=800&auto=format&fit=crop'], stock: 30 },
        ],
      },

      // ==================== GOOGLE PIXEL ====================
      {
        name: 'Google Pixel 9 Pro 5G',
        description: 'Google Pixel 9 Pro - Nhiếp ảnh AI đỉnh cao với chip Tensor G4 của Google, camera chính 50MP, tele 48MP và siêu zoom 30x. Trải nghiệm Android thuần túy cùng 7 năm cập nhật phần mềm.',
        price: 22990000,
        oldPrice: 25990000,
        salePrice: 22990000,
        category: createdCategories[5]._id,
        stock: 30,
        sold: 420,
        rating: 4.8,
        numReviews: 67,
        brand: 'Google Pixel',
        images: [
          'https://images.unsplash.com/photo-1607936854279-55e8a4c64888?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1595941069915-4ebc5197e348?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: true,
        tags: ['google', 'pixel 9 pro', 'ai camera', 'android'],
        specs: {
          cpu: 'Google Tensor G4',
          ram: '16GB',
          storage: '128GB',
          camera: 'Chính 50MP + Tele 48MP + Ultra Wide 48MP',
          battery: '4700 mAh, Sạc nhanh 30W',
          screen: '6.3 inch LTPO OLED 2K 120Hz',
        },
        variants: [
          { ram: '16GB', storage: '128GB', price: 22990000, stock: 15 },
          { ram: '16GB', storage: '256GB', price: 25990000, stock: 15 },
        ],
        colors: [
          { name: 'Obsidian (Đen)', images: ['https://images.unsplash.com/photo-1607936854279-55e8a4c64888?q=80&w=800&auto=format&fit=crop'], stock: 15 },
          { name: 'Porcelain (Trắng)', images: ['https://images.unsplash.com/photo-1595941069915-4ebc5197e348?q=80&w=800&auto=format&fit=crop'], stock: 15 },
        ],
      },
      {
        name: 'Google Pixel 9 5G',
        description: 'Google Pixel 9 - Smartphone thông minh nhất với AI Google Gemini, camera 50MP chụp ảnh đêm hoàn hảo và chip Tensor G4. Đơn giản, thông minh và bền bỉ với 7 năm cập nhật.',
        price: 17990000,
        oldPrice: 19990000,
        salePrice: 17990000,
        category: createdCategories[5]._id,
        stock: 40,
        sold: 580,
        rating: 4.7,
        numReviews: 89,
        brand: 'Google Pixel',
        images: [
          'https://images.unsplash.com/photo-1607936854279-55e8a4c64888?q=80&w=800&auto=format&fit=crop',
        ],
        isFeatured: false,
        tags: ['google', 'pixel 9', 'ai', 'android pure'],
        specs: {
          cpu: 'Google Tensor G4',
          ram: '12GB',
          storage: '128GB',
          camera: 'Chính 50MP + Ultra Wide 48MP',
          battery: '4700 mAh, Sạc nhanh 27W',
          screen: '6.3 inch OLED FHD+ 120Hz',
        },
        variants: [
          { ram: '12GB', storage: '128GB', price: 17990000, stock: 25 },
          { ram: '12GB', storage: '256GB', price: 19990000, stock: 15 },
        ],
        colors: [
          { name: 'Obsidian (Đen)', images: ['https://images.unsplash.com/photo-1607936854279-55e8a4c64888?q=80&w=800&auto=format&fit=crop'], stock: 20 },
          { name: 'Wintergreen (Xanh Lá)', images: ['https://images.unsplash.com/photo-1595941069915-4ebc5197e348?q=80&w=800&auto=format&fit=crop'], stock: 20 },
        ],
      },
    ];

    const createdProducts = await Product.create(products);
    console.log(`✅ Seeded ${createdProducts.length} products`);

    // Seed vouchers
    const vouchersData = [
      {
        code: 'GIAM10',
        title: 'Giảm 10% Toàn Bộ Đơn Hàng',
        description: 'Giảm 10% cho mọi đơn hàng, tối đa 500.000đ',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscountAmount: 500000,
        minOrderValue: 500000,
        usageLimit: 500,
        endDate: new Date('2028-12-31'),
        applicableTo: 'all',
        isActive: true,
      },
      {
        code: 'GIAM50K',
        title: 'Giảm Ngay 50.000đ',
        description: 'Giảm 50.000đ cho đơn hàng từ 500.000đ',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 500000,
        usageLimit: 1000,
        endDate: new Date('2028-12-31'),
        applicableTo: 'all',
        isActive: true,
      },
      {
        code: 'FREESHIP',
        title: 'Miễn Phí Vận Chuyển',
        description: 'Miễn phí vận chuyển cho mọi đơn hàng từ 200.000đ',
        discountType: 'freeship',
        discountValue: 50000,
        minOrderValue: 200000,
        usageLimit: 2000,
        endDate: new Date('2028-12-31'),
        applicableTo: 'all',
        isActive: true,
      },
      {
        code: 'IPHONE500K',
        title: 'Giảm 500K Cho iPhone',
        description: 'Giảm ngay 500.000đ cho đơn hàng mua iPhone từ 15 triệu đồng',
        discountType: 'fixed',
        discountValue: 500000,
        minOrderValue: 15000000,
        usageLimit: 200,
        endDate: new Date('2028-12-31'),
        applicableTo: 'brand',
        applicableBrands: ['Apple'],
        isActive: true,
      },
      {
        code: 'SAMSUNG300K',
        title: 'Giảm 300K Cho Samsung',
        description: 'Giảm ngay 300.000đ cho đơn hàng mua Samsung từ 10 triệu đồng',
        discountType: 'fixed',
        discountValue: 300000,
        minOrderValue: 10000000,
        usageLimit: 200,
        endDate: new Date('2028-12-31'),
        applicableTo: 'brand',
        applicableBrands: ['Samsung'],
        isActive: true,
      },
      {
        code: 'XIAOMI200K',
        title: 'Giảm 200K Cho Xiaomi',
        description: 'Giảm ngay 200.000đ cho đơn hàng mua Xiaomi từ 5 triệu đồng',
        discountType: 'fixed',
        discountValue: 200000,
        minOrderValue: 5000000,
        usageLimit: 300,
        endDate: new Date('2028-12-31'),
        applicableTo: 'brand',
        applicableBrands: ['Xiaomi'],
        isActive: true,
      },
      {
        code: 'VIPMEMBER500',
        title: 'VIP - Giảm 500k Đơn Flagship',
        description: 'Giảm ngay 500.000đ cho đơn mua sắm từ 15 triệu đồng',
        discountType: 'fixed',
        discountValue: 500000,
        minOrderValue: 15000000,
        usageLimit: 100,
        endDate: new Date('2028-12-31'),
        applicableTo: 'all',
        isActive: true,
      },
      {
        code: 'WELCOME100',
        title: 'Chào Mừng - Giảm 100k Đơn Đầu Tiên',
        description: 'Quà tặng chào mừng cho đơn mua sắm từ 1 triệu đồng',
        discountType: 'fixed',
        discountValue: 100000,
        minOrderValue: 1000000,
        usageLimit: 500,
        endDate: new Date('2028-12-31'),
        applicableTo: 'all',
        isActive: true,
      },
      {
        code: 'FLASHSALE20',
        title: 'Flash Sale - Giảm 20%',
        description: 'Flash Sale cuối tuần, giảm 20% tối đa 1.000.000đ',
        discountType: 'percentage',
        discountValue: 20,
        maxDiscountAmount: 1000000,
        minOrderValue: 3000000,
        usageLimit: 50,
        endDate: new Date('2028-12-31'),
        applicableTo: 'all',
        isActive: true,
      },
    ];

    const createdVouchers = await Voucher.create(vouchersData);
    console.log(`✅ Seeded ${createdVouchers.length} vouchers`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    users.forEach(u => console.log(`   ${u.role.toUpperCase()}: ${u.email} / ${u.password}`));
    console.log('\n🏷️ Voucher Codes:');
    vouchersData.forEach(v => console.log(`   ${v.code} - ${v.title}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDB();
