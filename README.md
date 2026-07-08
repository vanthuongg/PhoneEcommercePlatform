# 📱 TechPhone Store — Full-Stack E-Commerce Platform

Nền tảng thương mại điện tử chuyên kinh doanh thiết bị di động và sản phẩm công nghệ. Dự án xây dựng theo kiến trúc **Feature-Based** dễ mở rộng, tích hợp Google OAuth 2.0 và đóng gói hoàn chỉnh bằng **Docker & Docker Compose**.

---

## 🌟 Tính Năng Nổi Bật

- **Google OAuth 2.0 & JWT**: Đăng nhập nhanh qua Google hoặc tài khoản email/mật khẩu với cơ chế phân quyền RBAC (Admin, Manager, Staff, Customer).
- **Voucher Stacking**: Áp dụng đồng thời nhiều loại mã giảm giá (Miễn phí vận chuyển, Ưu đãi hệ thống, Mã giảm giá theo thương hiệu).
- **Ví Voucher & Chatbot AI**: Quản lý kho voucher cá nhân và hỗ trợ giải đáp thắc mắc tự động.
- **Quản lý & Thống kê**: Trang quản trị trực quan hỗ trợ theo dõi đơn hàng, quản lý kho (Inventory Logs), phân quyền người dùng và biểu đồ doanh thu.
- **Dockerized Platform**: Đóng gói sẵn sàng triển khai với Docker (MongoDB, Node.js API server, React SPA với Nginx reverse proxy).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons, Recharts, Google OAuth (`@react-oauth/google`).
- **Backend**: Node.js 20, Express.js, Mongoose ODM, JWT, Multer.
- **Database & DevOps**: MongoDB 6.0, Docker, Docker Compose, Nginx.

---

## 🚀 Hướng Dẫn Khởi Chạy

### Cách 1: Chạy bằng Docker (Khuyên dùng)

1. Khởi chạy toàn bộ hệ thống:
   ```bash
   docker compose up --build -d
   ```
2. Truy cập ứng dụng:
   - **Frontend**: [http://localhost](http://localhost)
   - **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

3. Dừng ứng dụng:
   ```bash
   docker compose down
   ```

---

### Cách 2: Chạy trực tiếp (Local Development)

1. **Backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env # Cập nhật thông tin DB & OAuth
   npm run dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   cp .env.example .env # Thêm VITE_GOOGLE_CLIENT_ID
   npm run dev
   ```
   *(Truy cập `http://localhost:5173`)*

---

## 🌱 Khởi Tạo Dữ Liệu Mẫu (Seeder)

Để khởi tạo dữ liệu mẫu (sản phẩm, tài khoản, voucher):

```bash
cd backend
npm run seed
```

### 🔑 Tài khoản mẫu:

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@shop.com` | `admin123` |
| **Manager** | `manager@shop.com` | `manager123` |
| **Staff** | `staff@shop.com` | `staff123` |
| **Customer** | `customer@shop.com` | `customer123` |

---

## 📝 License

Dự án phục vụ cho mục đích học tập và làm việc.
