# 📱 PhoneEcommercePlatform

> **PhoneEcommercePlatform** — Nền tảng thương mại điện tử Full-Stack chuyên kinh doanh điện thoại thông minh, thiết bị di động và sản phẩm công nghệ cao cấp. Dự án được thiết kế theo kiến trúc **Feature-Based Modular Architecture** hiện đại, tích hợp xác thực **Google OAuth 2.0 & JWT**, hệ thống **Voucher Stacking 3 lớp**, **Trợ lý AI CSKH**, và đóng gói hoàn chỉnh bằng **Docker & Docker Compose**.

---

## 🌟 Tính Năng Nổi Bật

- 🔐 **Xác Thực & Phân Quyền (RBAC)**:
  - Đăng nhập tức thì với **Google OAuth 2.0** hoặc tài khoản email/mật khẩu được mã hóa an toàn bằng **Bcrypt**.
  - Cơ chế phân quyền chi tiết 4 cấp độ: `Admin`, `Manager`, `Staff`, `Customer`.
- 🎟️ **Hệ Thống Voucher Stacking Độc Quyền (3 Lớp)**:
  - Cho phép áp dụng đồng thời **Voucher Miễn Phí Vận Chuyển**, **Voucher Sàn (Ưu Đãi Hệ Thống)** và **Voucher Thương Hiệu**.
  - Tính năng ví voucher, tự động gợi ý mã giảm giá tối ưu nhất cho giỏ hàng.
- 🤖 **Trợ Lý AI CSKH & Hệ Thống Support Ticket**:
  - Trợ lý chatbot AI giải đáp 24/7 về sản phẩm, chính sách giao hàng, bảo hành và khuyến mãi.
  - Kênh trao đổi trực tiếp giữa khách hàng và nhân viên hỗ trợ thông qua hệ thống Ticket.
- 📊 **Quản Trị Hệ Thống & Báo Cáo Doanh Thu (Admin Portal)**:
  - Dashboard trực quan với biểu đồ doanh thu, thống kê đơn hàng, sản phẩm bán chạy theo thời gian thực (Recharts).
  - Quản lý kho hàng thông minh kèm lịch sử biến động kho (Inventory Logs & Audit Trail).
  - Quản lý người dùng, thay đổi vai trò và trạng thái tài khoản linh hoạt.
- 🐳 **Đóng Gói & Triển Khai Docker**:
  - Hoàn chỉnh với Dockerfile và docker-compose: MongoDB, Node.js REST API Server, React SPA phục vụ qua Nginx Reverse Proxy.

---

## 🛠️ Công Nghệ Sử Dụng

| Tầng | Công nghệ |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS, Lucide React, Recharts, React Router v6, React Hot Toast, `@react-oauth/google` |
| **Backend** | Node.js 20, Express.js, Mongoose ODM, JWT, BcryptJS, Express Rate Limit, Helmet, Multer |
| **Database** | MongoDB 6.0 / MongoDB Atlas |
| **DevOps & Deploy** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## 🔑 Phân Quyền Hệ Thống & Tài Khoản Mẫu (RBAC)

Hệ thống cung cấp cơ chế phân quyền chặt chẽ thông qua middleware xác thực. Khi khởi chạy dữ liệu mẫu (`npm run seed`), tài khoản **Admin** được cấu hình mặc định đầu tiên để quản trị toàn bộ hệ thống:

### 👤 Danh Sách Tài Khoản Mặc Định

| Vai trò (Role) | Email | Mật khẩu | Mục đích sử dụng / Quyền hạn |
| :--- | :--- | :--- | :--- |
| 👑 **Admin** *(Mặc định)* | `admin@shop.com` | `admin123` | **Toàn quyền hệ thống**: Quản trị tài khoản, phân quyền Role, quản lý danh mục/sản phẩm/voucher, xem toàn bộ thống kê doanh thu và cấu hình hệ thống. |
| 🛍️ **Customer** | `customer@shop.com` | `customer123` | **Khách hàng**: Trải nghiệm mua sắm, tìm kiếm sản phẩm, áp dụng combo voucher stacking, tạo đơn hàng, đánh giá sản phẩm và chat CSKH. *(Khách hàng cũng có thể tự đăng ký tài khoản mới hoặc đăng nhập trực tiếp qua Google)* |
| 💼 **Staff** | `staff@shop.com` | `staff123` | **Nhân viên CSKH & Đơn hàng**: Tiếp nhận và phản hồi Ticket hỗ trợ khách hàng, kiểm tra và cập nhật trạng thái đơn hàng. |
| 📊 **Manager** | `manager@shop.com` | `manager123` | **Quản lý cửa hàng**: Quản lý danh mục, cập nhật thông tin sản phẩm, quản lý kho hàng và chiến dịch khuyến mãi voucher. |

### 📋 Ma Trận Phân Quyền (RBAC Matrix)

| Chức năng | Admin | Manager | Staff | Customer |
| :--- | :---: | :---: | :---: | :---: |
| Xem & Mua hàng, Áp Voucher, Đánh giá | ✅ | ✅ | ✅ | ✅ |
| Quản lý thông tin cá nhân & Đơn mua cá nhân | ✅ | ✅ | ✅ | ✅ |
| Trò chuyện Trợ lý AI & Gửi Ticket hỗ trợ | ✅ | ✅ | ✅ | ✅ |
| Trả lời & Xử lý Ticket hỗ trợ khách hàng | ✅ | ✅ | ✅ | ❌ |
| Cập nhật trạng thái đơn hàng | ✅ | ✅ | ✅ | ❌ |
| Quản lý Kho hàng, Danh mục, Sản phẩm, Voucher | ✅ | ✅ | ❌ | ❌ |
| Xem biểu đồ & Thống kê doanh thu chi tiết | ✅ | ✅ | ❌ | ❌ |
| Quản lý Tài khoản người dùng, Phân quyền Role | ✅ | ❌ | ❌ | ❌ |
| Xem Nhật ký kiểm toán hệ thống (Audit Logs) | ✅ | ❌ | ❌ | ❌ |

---

## 🚀 Hướng Dẫn Khởi Chạy

### Cách 1: Chạy bằng Docker Compose (Khuyên dùng)

1. **Khởi động toàn bộ dịch vụ (MongoDB, Backend, Frontend qua Nginx)**:
   ```bash
   docker compose up --build -d
   ```

2. **Truy cập ứng dụng**:
   - **Frontend**: [http://localhost](http://localhost)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

3. **Dừng hệ thống**:
   ```bash
   docker compose down
   ```

---

### Cách 2: Chạy trực tiếp trên máy cục bộ (Local Development)

#### 1. Khởi chạy Backend:
```bash
cd backend
npm install

# Sao chép và cấu hình biến môi trường
cp .env.example .env

# Khởi tạo dữ liệu mẫu (Sản phẩm, Danh mục, Tài khoản Admin & Test, Voucher)
npm run seed

# Khởi chạy server phát triển
npm run dev
```
> Backend API chạy tại: `http://localhost:5000`

#### 2. Khởi chạy Frontend:
```bash
cd frontend
npm install

# Sao chép và cấu hình biến môi trường
cp .env.example .env

# Khởi chạy Vite dev server
npm run dev
```
> Frontend ứng dụng mở tại: `http://localhost:5173`

---

## 🌱 Khởi Tạo Dữ Liệu Mẫu (Database Seeder)

Để khởi tạo lại dữ liệu mẫu (sản phẩm, thương hiệu, danh mục, voucher, tài khoản người dùng):

```bash
cd backend
npm run seed
```

---

## 📁 Cấu Trúc Dự Án (Feature-Based Structure)

```text
PhoneEcommercePlatform/
├── backend/
│   ├── seeders/                  # Script khởi tạo dữ liệu mẫu
│   ├── src/
│   │   ├── config/               # Cấu hình DB, Cloudinary, v.v.
│   │   ├── middleware/           # Auth, RBAC, Error handler, Rate limit
│   │   ├── features/             # Module hóa theo tính năng
│   │   │   ├── auth/             # Đăng ký, đăng nhập, Google OAuth
│   │   │   ├── users/            # Quản lý người dùng, phân quyền
│   │   │   ├── products/         # Quản lý sản phẩm & tồn kho
│   │   │   ├── categories/       # Quản lý danh mục
│   │   │   ├── brands/           # Quản lý thương hiệu
│   │   │   ├── vouchers/         # Hệ thống Voucher Stacking
│   │   │   ├── cart/             # Giỏ hàng
│   │   │   ├── orders/           # Quản lý đặt hàng & thanh toán
│   │   │   ├── reviews/          # Đánh giá sản phẩm
│   │   │   ├── wishlist/         # Danh sách yêu thích
│   │   │   ├── tickets/          # CSKH & Support Ticket
│   │   │   ├── chatbot/          # Trợ lý AI CSKH
│   │   │   ├── stats/            # Thống kê doanh thu & báo cáo
│   │   │   └── audit/            # Nhật ký kiểm toán hệ thống
│   │   ├── routes/               # API Routing tập trung
│   │   └── server.js             # Entrypoint Backend Express
│   └── package.json
│
├── frontend/
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── components/           # UI Components dùng chung (Header, Footer, Modals)
│   │   ├── context/              # AuthContext, CartContext, ThemeContext
│   │   ├── pages/                # Các trang (User, Shop, Checkout, Admin Portal)
│   │   ├── services/             # Axios API Client
│   │   ├── App.jsx               # App routing
│   │   └── main.jsx              # Entrypoint React
│   ├── nginx.conf                # Cấu hình Nginx cho Docker container
│   ├── vite.config.js
│   └── package.json
│
├── docker-compose.yml            # Docker Compose orchestration
└── README.md                     # Tài liệu hướng dẫn dự án
```

---

## 📝 License

Dự án phát triển phục vụ mục đích học tập, nghiên cứu và phát triển sản phẩm thương mại điện tử chuyên nghiệp.
