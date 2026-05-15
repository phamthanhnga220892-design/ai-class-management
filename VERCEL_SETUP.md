# 🚀 Hướng dẫn cấu hình Vercel Environment Variables

## ❌ Vấn đề hiện tại

Frontend trên Vercel đang gọi API về `http://localhost:3001` thay vì Render backend, dẫn đến lỗi "load failed" trên mobile.

---

## ✅ Giải pháp: Set Environment Variable trên Vercel

### Bước 1: Truy cập Vercel Dashboard

1. Mở: https://vercel.com/dashboard
2. Đăng nhập với GitHub
3. Tìm project: **ai-class-management** hoặc **ai-class-management-psi**

### Bước 2: Vào Settings

1. Click vào project **ai-class-management-psi**
2. Click tab **"Settings"** (menu trên cùng)
3. Tìm **"Environment Variables"** trong menu bên trái

### Bước 3: Thêm Environment Variable

1. Trong phần **Environment Variables**, click **"Add New"**
2. Điền thông tin:

```
Name: NEXT_PUBLIC_API_URL
Value: https://ai-class-management.onrender.com
Environment: Production (✓)
```

3. Click **"Save"**

### Bước 4: Redeploy

**Quan trọng:** Environment variables chỉ áp dụng cho build mới!

**Cách 1: Redeploy từ Dashboard**
1. Vào tab **"Deployments"**
2. Click vào deployment mới nhất
3. Click nút **"⋯"** (3 chấm)
4. Click **"Redeploy"**
5. Chọn **"Use existing Build Cache"** = OFF (để build lại)
6. Click **"Redeploy"**

**Cách 2: Push commit mới**
```bash
# Tạo commit trống để trigger redeploy
git commit --allow-empty -m "chore: trigger Vercel redeploy with env vars"
git push origin main
```

### Bước 5: Đợi deploy hoàn tất

- Thời gian: ~1-2 phút
- Theo dõi tại tab **"Deployments"**
- Đợi status = **"Ready"**

---

## 🧪 Kiểm tra sau khi deploy

### Test 1: Kiểm tra API URL trong browser

1. Mở: https://ai-class-management-psi.vercel.app
2. Mở **DevTools** (F12)
3. Vào tab **"Console"**
4. Gõ:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```
5. Kết quả mong đợi: `https://ai-class-management.onrender.com`

### Test 2: Kiểm tra Network requests

1. Vẫn trong DevTools, vào tab **"Network"**
2. Thử đăng nhập
3. Xem request đi đến đâu:
   - ✅ Đúng: `https://ai-class-management.onrender.com/auth/login`
   - ❌ Sai: `http://localhost:3001/auth/login`

### Test 3: Test trên mobile

1. Mở mobile browser
2. Truy cập: https://ai-class-management-psi.vercel.app
3. Thử đăng nhập
4. ✅ Phải hoạt động!

---

## 📋 Checklist

- [ ] Vào Vercel Dashboard
- [ ] Tìm project ai-class-management-psi
- [ ] Settings → Environment Variables
- [ ] Add: NEXT_PUBLIC_API_URL = https://ai-class-management.onrender.com
- [ ] Environment = Production
- [ ] Save
- [ ] Redeploy (từ Deployments hoặc push commit)
- [ ] Đợi deploy xong (~2 phút)
- [ ] Test trên mobile

---

## 🎯 Kết quả mong đợi

Sau khi hoàn tất:
- ✅ Frontend gọi API đến Render backend
- ✅ Đăng nhập/đăng ký hoạt động trên mobile
- ✅ Không còn lỗi "load failed"
- ✅ CORS hoạt động đúng

---

## 🔍 Nếu vẫn lỗi

### Lỗi: "Failed to fetch"

**Nguyên nhân:** Backend Render đang sleep hoặc crashed

**Giải pháp:**
1. Vào Render Dashboard
2. Kiểm tra service status = "Live"
3. Xem Logs có lỗi không

### Lỗi: "CORS blocked"

**Nguyên nhân:** Backend chưa deploy code mới với CORS fix

**Giải pháp:**
1. Kiểm tra Render đã deploy code mới chưa
2. Xem Logs có dòng "Application is running" không
3. Đợi thêm vài phút để deploy hoàn tất

### Lỗi: "Network error"

**Nguyên nhân:** Mobile không có internet hoặc Render URL sai

**Giải pháp:**
1. Kiểm tra mobile có internet
2. Test URL trực tiếp: https://ai-class-management.onrender.com/courses
3. Phải trả về JSON data

---

## 💡 Tips

### Kiểm tra env var đã apply chưa

Sau khi set env var và redeploy, kiểm tra bằng cách:

1. Vào Vercel Deployment URL
2. View Source (Ctrl+U)
3. Tìm script có `NEXT_PUBLIC_API_URL`
4. Nếu thấy Render URL → Đã OK
5. Nếu vẫn thấy localhost → Chưa build lại

### Force rebuild

Nếu env var không apply:
1. Settings → General
2. Scroll xuống **"Build & Development Settings"**
3. Thay đổi gì đó (ví dụ thêm space vào Build Command)
4. Save → Trigger rebuild

---

**Chúc thành công!** 🚀
