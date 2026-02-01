# 🔧 Production Troubleshooting Guide

## 🚨 Vấn đề hiện tại

**Triệu chứng:** Backend không phản hồi
- Frontend: `https://ai-class-management-psi.vercel.app/`
- Backend: `https://ai-class-management.onrender.com/`
- Lỗi: Timeout khi gọi `/courses`

---

## 📋 Checklist Kiểm tra

### 1️⃣ Kiểm tra Backend Render Dashboard

1. **Truy cập:** https://dashboard.render.com
2. **Vào Web Service:** `ai-class-management`
3. **Kiểm tra Status:**
   - ✅ **Live** = Backend đang chạy
   - ⏸️ **Suspended** = Free tier đã sleep (cần wake up)
   - ❌ **Build Failed** = Có lỗi build
   - ❌ **Deploy Failed** = Có lỗi deploy

---

### 2️⃣ Kiểm tra Logs

**Trong Render Dashboard:**
1. Click vào service `ai-class-management`
2. Click tab **"Logs"**
3. Tìm các lỗi phổ biến:

#### ❌ Lỗi 1: Build Failed
```
Error: Cannot find module 'xyz'
npm ERR! code ELIFECYCLE
```

**Nguyên nhân:** Thiếu dependencies hoặc build command sai

**Giải pháp:**
```bash
# Kiểm tra package.json
# Build Command phải là: npm install && npm run build
# Start Command phải là: npm run start:prod
```

#### ❌ Lỗi 2: MongoDB Connection Failed
```
MongooseServerSelectionError: Could not connect to any servers
```

**Nguyên nhân:** `MONGODB_URI` sai hoặc MongoDB không accessible

**Giải pháp:**
1. Vào **Environment** tab
2. Kiểm tra `MONGODB_URI`:
```
mongodb+srv://phamthanhnga220892_db_user:admin123@cluster0.lhm1rqc.mongodb.net/ai-class-system?appName=Cluster0&w=majority
```
3. Test connection từ MongoDB Atlas:
   - Vào MongoDB Atlas Dashboard
   - Network Access → Cho phép `0.0.0.0/0` (allow all)

#### ❌ Lỗi 3: Port Binding Error
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Nguyên nhân:** Render tự động set PORT, không nên hardcode

**Giải pháp:** Đảm bảo code sử dụng `process.env.PORT`
```typescript
const port = process.env.PORT || 3001;
```

#### ❌ Lỗi 4: Application Crashed
```
Application error
Service Unavailable
```

**Nguyên nhân:** App crash ngay sau khi start

**Giải pháp:** Xem logs chi tiết để tìm lỗi runtime

---

### 3️⃣ Kiểm tra Environment Variables

**Vào Render Dashboard → Environment:**

Đảm bảo có đủ các biến sau:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://phamthanhnga220892_db_user:admin123@cluster0.lhm1rqc.mongodb.net/ai-class-system?appName=Cluster0&w=majority
JWT_SECRET=super-secret-key-change-me-in-production-2026
FRONTEND_URL=https://ai-class-management-psi.vercel.app
```

⚠️ **Lưu ý:**
- `PORT` - Render tự động set, không cần thêm thủ công
- `FRONTEND_URL` - Phải khớp chính xác với Vercel URL (không có trailing slash)

---

### 4️⃣ Kiểm tra Build Settings

**Vào Render Dashboard → Settings:**

```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm run start:prod
```

⚠️ **Quan trọng:**
- Phải có `npm run build` trước khi start
- `start:prod` chạy `node dist/main` (không phải `nest start`)

---

### 5️⃣ Kiểm tra Free Tier Sleep

**Render Free Tier:**
- Tự động sleep sau 15 phút không hoạt động
- Wake up khi có request đầu tiên (~30-60 giây)

**Cách test:**
1. Đợi 1-2 phút
2. Refresh lại trang
3. Nếu vẫn không hoạt động → có lỗi khác

---

## 🔍 Debug Steps

### Bước 1: Kiểm tra Backend có Live không

```bash
# Mở Render Dashboard
# Xem status của service
# Nếu "Suspended" → Click "Resume"
```

### Bước 2: Xem Logs chi tiết

```bash
# Trong Render Dashboard → Logs
# Tìm dòng cuối cùng:
# ✅ "Application is running on: http://localhost:10000" = OK
# ❌ Error messages = Có lỗi
```

### Bước 3: Test API trực tiếp

```bash
# Sau khi backend Live, test:
curl https://ai-class-management.onrender.com/courses

# Kết quả mong đợi: JSON array
# Nếu timeout: Backend chưa start hoặc crashed
```

### Bước 4: Kiểm tra CORS

```bash
# Test với header Origin:
curl -H "Origin: https://ai-class-management-psi.vercel.app" \
     https://ai-class-management.onrender.com/courses

# Nếu có response: CORS OK
# Nếu blocked: Kiểm tra FRONTEND_URL
```

---

## 🛠️ Giải pháp phổ biến

### Vấn đề 1: Backend không start

**Triệu chứng:** Logs không có "Application is running"

**Giải pháp:**
1. Kiểm tra `package.json` có script `start:prod`
2. Kiểm tra `dist/` folder được tạo sau build
3. Xem logs có lỗi TypeScript compilation không

### Vấn đề 2: MongoDB connection failed

**Triệu chứng:** `MongooseServerSelectionError`

**Giải pháp:**
1. Vào MongoDB Atlas
2. Network Access → Add IP: `0.0.0.0/0`
3. Database Access → Kiểm tra username/password
4. Redeploy Render

### Vấn đề 3: CORS blocked

**Triệu chứng:** Frontend báo CORS error

**Giải pháp:**
1. Kiểm tra `FRONTEND_URL` trên Render
2. Đảm bảo khớp chính xác với Vercel URL
3. Không có trailing slash
4. Redeploy backend

### Vấn đề 4: Free tier sleep

**Triệu chứng:** Lần đầu load chậm, sau đó OK

**Giải pháp:**
- Đây là hành vi bình thường của Free tier
- Upgrade lên Paid plan để tránh sleep
- Hoặc dùng uptime monitoring service

---

## 📊 Các lệnh hữu ích

### Test Backend Health
```bash
# Windows PowerShell
Invoke-WebRequest -Uri "https://ai-class-management.onrender.com/courses"

# Linux/Mac
curl https://ai-class-management.onrender.com/courses
```

### Test với CORS Headers
```bash
curl -H "Origin: https://ai-class-management-psi.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://ai-class-management.onrender.com/courses
```

### Check DNS
```bash
nslookup ai-class-management.onrender.com
```

---

## 🎯 Checklist nhanh

Khi backend không hoạt động, kiểm tra theo thứ tự:

- [ ] 1. Render Dashboard → Service status = "Live"?
- [ ] 2. Logs → Có "Application is running"?
- [ ] 3. Environment Variables → Đầy đủ và đúng?
- [ ] 4. Build Settings → Root directory = "backend"?
- [ ] 5. MongoDB Atlas → Network Access cho phép Render?
- [ ] 6. Test API → `curl /courses` có response?
- [ ] 7. CORS → `FRONTEND_URL` khớp với Vercel?

---

## 📞 Nếu vẫn không hoạt động

Cung cấp thông tin sau để debug:

1. **Render Logs** (50 dòng cuối)
2. **Environment Variables** (ẩn sensitive data)
3. **Build Settings** screenshot
4. **Error message** từ frontend console
5. **Network tab** trong browser DevTools

---

## ✅ Khi mọi thứ hoạt động

Bạn sẽ thấy:
- ✅ Render Dashboard: Status = "Live"
- ✅ Logs: "Application is running on: http://localhost:10000"
- ✅ Logs: "Network access: http://192.168.1.220:10000"
- ✅ Logs: "Environment: production"
- ✅ API test: Trả về JSON data
- ✅ Frontend: Load được courses

**Chúc may mắn!** 🚀
