# 🚀 Production Deployment Checklist

## ✅ Bước 1: Chuẩn bị

### 1.1 Đảm bảo code đã được push lên GitHub
- [x] Code đã commit
- [x] Code đã push lên GitHub
- [x] Repository: https://github.com/phamthanhnga220892-design/ai-class-management

---

## 🔧 Bước 2: Deploy Backend lên Render

### 2.1 Tạo Web Service trên Render

1. **Truy cập:** https://render.com
2. **Đăng nhập** với GitHub
3. **Click:** "New +" → "Web Service"
4. **Chọn repository:** `ai-class-management`
5. **Cấu hình:**

```
Name: ai-class-backend
Region: Singapore (hoặc gần nhất)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm run start:prod
Instance Type: Free
```

### 2.2 Set Environment Variables

Trong phần **Environment Variables**, thêm:

```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://phamthanhnga220892_db_user:admin123@cluster0.lhm1rqc.mongodb.net/ai-class-system?appName=Cluster0&w=majority
JWT_SECRET=super-secret-key-change-me-in-production-2026
FRONTEND_URL=https://ai-class-frontend.vercel.app
```

⚠️ **Lưu ý:** `FRONTEND_URL` sẽ được cập nhật sau khi deploy frontend

### 2.3 Deploy

1. Click **"Create Web Service"**
2. Đợi deploy hoàn tất (~5-10 phút)
3. **Lưu lại URL:** `https://ai-class-backend.onrender.com` (hoặc tên bạn đặt)

---

## 🌐 Bước 3: Deploy Frontend lên Vercel

### 3.1 Tạo Project trên Vercel

1. **Truy cập:** https://vercel.com
2. **Đăng nhập** với GitHub
3. **Click:** "Add New..." → "Project"
4. **Import repository:** `ai-class-management`
5. **Cấu hình:**

```
Project Name: ai-class-frontend
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build (auto-detect)
Output Directory: .next (auto-detect)
Install Command: npm install (auto-detect)
```

### 3.2 Set Environment Variables

Trong phần **Environment Variables**, thêm:

```bash
Name: NEXT_PUBLIC_API_URL
Value: https://ai-class-backend.onrender.com
Environment: Production
```

⚠️ **Thay thế URL** bằng URL backend thực tế từ Render

### 3.3 Deploy

1. Click **"Deploy"**
2. Đợi deploy hoàn tất (~2-3 phút)
3. **Lưu lại URL:** `https://ai-class-frontend.vercel.app` (hoặc domain của bạn)

---

## 🔄 Bước 4: Cập nhật Backend CORS

### 4.1 Quay lại Render Dashboard

1. Vào **Web Service** backend vừa tạo
2. Vào **Environment**
3. **Cập nhật** biến `FRONTEND_URL`:

```bash
FRONTEND_URL=https://ai-class-frontend.vercel.app
```

⚠️ **Thay thế** bằng URL frontend thực tế từ Vercel

### 4.2 Redeploy Backend

1. Click **"Manual Deploy"** → "Deploy latest commit"
2. Hoặc đợi auto-deploy

---

## ✅ Bước 5: Kiểm tra Production

### 5.1 Test Backend API

```bash
# Test health check
curl https://ai-class-backend.onrender.com/courses

# Kết quả mong đợi: JSON array của courses
```

### 5.2 Test Frontend

1. **Mở browser:** `https://ai-class-frontend.vercel.app`
2. **Kiểm tra:**
   - [ ] Trang chủ hiển thị đúng
   - [ ] Danh sách khóa học load được
   - [ ] Đăng ký tài khoản mới
   - [ ] Đăng nhập
   - [ ] Đăng ký khóa học

### 5.3 Test từ Mobile

1. **Mở mobile browser**
2. **Truy cập:** `https://ai-class-frontend.vercel.app`
3. **Test đăng nhập/đăng ký**
4. ✅ **Phải hoạt động!** (Không còn lỗi như local)

---

## 🎯 URLs Tóm tắt

Sau khi deploy xong, bạn sẽ có:

| Service | URL | Mục đích |
|---------|-----|----------|
| **Frontend (Production)** | `https://ai-class-frontend.vercel.app` | Người dùng truy cập |
| **Backend (Production)** | `https://ai-class-backend.onrender.com` | API server |
| **Frontend (Local)** | `http://localhost:3000` | Development |
| **Frontend (Mobile Test)** | `http://192.168.1.220:3000` | Mobile testing local |

---

## 🐛 Troubleshooting

### Lỗi: "Failed to fetch" trên production

**Nguyên nhân:** CORS chưa đúng

**Giải pháp:**
1. Kiểm tra `FRONTEND_URL` trên Render
2. Đảm bảo không có trailing slash: ❌ `https://app.com/` → ✅ `https://app.com`
3. Redeploy backend

### Lỗi: Backend không start

**Nguyên nhân:** Thiếu environment variables

**Giải pháp:**
1. Kiểm tra tất cả env vars trên Render
2. Xem logs: Dashboard → Logs
3. Đảm bảo `MONGODB_URI` đúng

### Lỗi: Frontend build failed

**Nguyên nhân:** Root directory sai

**Giải pháp:**
1. Vào Settings → General
2. Set Root Directory: `frontend`
3. Redeploy

---

## 📝 Checklist Cuối cùng

- [ ] Backend deployed trên Render
- [ ] Frontend deployed trên Vercel
- [ ] Environment variables đã set đúng
- [ ] CORS đã cấu hình đúng
- [ ] Test đăng nhập/đăng ký trên production
- [ ] Test từ mobile device
- [ ] Lưu lại URLs production

---

## 🎉 Hoàn tất!

Bây giờ bạn có thể:
- ✅ Truy cập từ bất kỳ đâu (không chỉ local network)
- ✅ Test trên mobile từ 4G/5G
- ✅ Chia sẻ link cho người khác test
- ✅ Sử dụng như production thật

**Next steps:**
- Thêm custom domain (optional)
- Setup monitoring
- Add analytics
- Optimize performance
