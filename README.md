# AI Class Management System - README

## 📖 Giới thiệu

Hệ thống quản lý lớp học và đào tạo AI dành cho thế hệ trẻ. Dự án cung cấp nền tảng hoàn chỉnh cho việc đăng ký khóa học, quản lý lớp học, và học tập trực tuyến.

**Trạng thái:** ✅ Production Ready (100% Complete)  
**Phiên bản:** 1.0.0  
**Ngày hoàn thành:** 18/01/2026

---

## 🚀 Tính năng chính

### Cho Học viên
- 🎓 Xem danh sách khóa học
- 📝 Đăng ký lớp học
- 📚 Học bài với video & nội dung HTML
- 💬 Comment & thảo luận
- 👤 Quản lý hồ sơ cá nhân

### Cho Quản trị viên
- ✅ Duyệt/từ chối đăng ký
- 🏫 Quản lý lớp học (CRUD)
- 📖 Quản lý bài học (CRUD)
- 📊 Xem tất cả registrations

---

## 🛠️ Tech Stack

**Backend:**
- NestJS 10
- MongoDB + Mongoose
- JWT Authentication
- bcrypt

**Frontend:**
- Next.js 16
- React 19
- TailwindCSS
- TypeScript

---

## 📦 Cài đặt

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm hoặc yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Cập nhật MONGODB_URI và JWT_SECRET trong .env
npm run seed  # Tạo dữ liệu mẫu
npm run start:dev
```

### Frontend Setup
```bash
cd frontend
npm install
# Tạo file .env.local với NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

---

## 🔑 Tài khoản mặc định

**Admin:**
- Email: admin@example.com
- Password: 123456

---

## 📚 API Documentation

### Authentication
- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `GET /auth/profile` - Lấy thông tin user
- `PUT /auth/profile` - Cập nhật profile

### Courses (Public)
- `GET /courses` - Danh sách khóa học
- `GET /courses/:id` - Chi tiết khóa học

### Classes (Public)
- `GET /classes?courseId=xxx` - Danh sách lớp học
- `GET /classes/:id` - Chi tiết lớp học

### Registrations (Student)
- `POST /registrations` - Đăng ký lớp học
- `GET /registrations/my` - Danh sách đăng ký của tôi

### Admin APIs
- `GET /admin/registrations` - Tất cả registrations
- `PATCH /admin/registrations/:id/approve` - Duyệt đăng ký
- `PATCH /admin/registrations/:id/reject` - Từ chối đăng ký
- `POST /admin/classes` - Tạo lớp học
- `PUT /admin/classes/:id` - Cập nhật lớp học
- `DELETE /admin/classes/:id` - Xóa lớp học
- `POST /admin/sessions` - Tạo bài học
- `PUT /admin/sessions/:id` - Cập nhật bài học
- `DELETE /admin/sessions/:id` - Xóa bài học

### Sessions (Public)
- `GET /sessions?classId=xxx` - Danh sách bài học
- `GET /sessions/:id` - Chi tiết bài học

### Comments (Authenticated)
- `GET /comments?sessionId=xxx` - Danh sách comments
- `POST /comments` - Tạo comment
- `DELETE /comments/:id` - Xóa comment

---

## 📁 Cấu trúc dự án

```
ai-class-management/
├── backend/               # NestJS backend
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── users/        # User management
│   │   ├── courses/      # Course management
│   │   ├── classes/      # Class management
│   │   ├── sessions/     # Session/LMS content
│   │   ├── comments/     # Comment system
│   │   ├── registrations/# Registration workflow
│   │   └── seed.ts       # Database seeding
│   └── package.json
├── frontend/             # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities & API client
│   │   └── types/        # TypeScript types
│   └── package.json
├── PROGRESS.md           # Tiến độ dự án
└── README.md             # File này
```

---

## 🧪 Testing

### Manual Testing
1. Đăng ký tài khoản student
2. Đăng ký khóa học
3. Login admin → duyệt đăng ký
4. Login student → vào học bài
5. Post comment

### Test Accounts
- Admin: admin@example.com / 123456

---

## 🚀 Deployment

### Backend (Railway/Render)
1. Connect GitHub repository
2. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT`
3. Deploy

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variable:
   - `NEXT_PUBLIC_API_URL`
3. Deploy

---

## 📄 License

MIT License

---

## 👥 Contributors

- Development Team: AI Academy

---

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**🎉 Happy Coding! 🎉**
