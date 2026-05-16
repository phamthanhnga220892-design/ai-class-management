# Design: Admin Products Management & Public Showcase

**Date:** 2026-05-16  
**Status:** Approved

---

## Overview

Hai tính năng mới:
1. **Admin tạo sản phẩm thay học viên** — Admin có thể tạo sản phẩm gán cho bất kỳ học viên nào. Học viên đó sẽ thấy sản phẩm như họ tự tạo và có quyền sửa/xóa bình thường.
2. **Trang Showcase công khai** — Tab "Sản phẩm" trên header homepage, hiển thị tất cả sản phẩm của học viên. Sản phẩm nổi bật (do admin đánh dấu) hiển thị nổi bật ở trên, phần còn lại dạng grid có filter theo học viên.

---

## 1. Schema Changes

### Product Schema — thêm 3 field

```
thumbnail: {
  publicId: string (optional)
  url: string (optional)
}
createdBy: ObjectId (ref: User, optional) — admin đã tạo thay học viên; null nếu học viên tự tạo
isFeatured: boolean (default: false) — chỉ admin set được
```

**Không thay đổi** field `user` (vẫn là owner/học viên được gán).

---

## 2. Backend

### 2.1 Endpoint mới — Admin Products

| Method | Route | Guard | Mô tả |
|--------|-------|-------|-------|
| `GET` | `/admin/products` | JWT + ADMIN | Lấy tất cả sản phẩm của mọi học viên, hỗ trợ filter `?userId=xxx` |
| `POST` | `/admin/products` | JWT + ADMIN | Tạo sản phẩm thay học viên (FormData, thêm field `targetUserId`) |
| `PATCH` | `/admin/products/:id/featured` | JWT + ADMIN | Toggle `isFeatured` true/false |

**Logic `POST /admin/products`:**
- Nhận `targetUserId` (required) từ FormData
- Tạo product với `user = targetUserId`, `createdBy = req.user.userId`
- Upload thumbnail (nếu có) và files lên Cloudinary
- Trả về product đã tạo

**Logic `GET /admin/products`:**
- Populate field `user` (fullName, email) trên mỗi sản phẩm
- Filter by `userId` nếu có query param
- Sort by `createdAt desc`

### 2.2 Endpoint mới — Public Showcase

| Method | Route | Guard | Mô tả |
|--------|-------|-------|-------|
| `GET` | `/products/showcase` | Không cần auth | Lấy sản phẩm nổi bật + tất cả sản phẩm còn lại; filter `?userId=xxx` |

**Response:**
```json
{
  "featured": [ /* products với isFeatured=true */ ],
  "others": [ /* còn lại, sau khi filter */ ],
  "students": [ /* danh sách học viên có ít nhất 1 sản phẩm, dùng cho dropdown filter */ ]
}
```

### 2.3 Endpoint bổ sung — Lấy danh sách học viên (cho admin dropdown)

| Method | Route | Guard | Mô tả |
|--------|-------|-------|-------|
| `GET` | `/admin/users` | JWT + ADMIN | Lấy danh sách user có role STUDENT và isActive=true |

*(Nếu endpoint này chưa tồn tại thì tạo mới)*

### 2.4 Thay đổi phân quyền hiện tại

**`PUT /products/:id`** và **`DELETE /products/:id`**: sửa điều kiện authorization:
- Trước: chỉ cho phép nếu `product.user === req.user.userId`
- Sau: cho phép nếu `product.user === req.user.userId` **HOẶC** `req.user.role === ADMIN`

### 2.5 Thumbnail upload

- Thêm field `thumbnail` vào `POST /products` (student tạo) và `POST /admin/products`
- Thêm field `thumbnail` vào `PUT /products/:id` — hỗ trợ thay/xóa ảnh đại diện
- Upload thumbnail lên Cloudinary folder riêng (e.g. `products/thumbnails`)
- Khi xóa sản phẩm: xóa cả thumbnail khỏi Cloudinary

---

## 3. Frontend

### 3.1 Header Homepage — thêm tab

File: `frontend/src/app/page.tsx` (hoặc component Header chung)

Thêm link **"Sản phẩm"** vào navigation header:
```
[Logo]  Trang chủ   Khóa học   Sản phẩm   [Đăng nhập]
```
Link trỏ đến `/showcase`.

### 3.2 Trang Public Showcase `/showcase`

File mới: `frontend/src/app/showcase/page.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│           Sản phẩm của học viên                             │
│    Khám phá các dự án được tạo ra trong khóa học            │
│                                                             │
│  ⭐ NỔI BẬT                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [thumbnail]  Tên sản phẩm                           │   │
│  │              👤 Tên học viên                        │   │
│  │              Mô tả sản phẩm...                      │   │
│  │              📎 file1  🖼 file2   [🔗 Xem dự án]   │   │
│  └─────────────────────────────────────────────────────┘   │
│  (lặp lại cho các sản phẩm nổi bật khác)                   │
│                                                             │
│  ────────────────────────────────────────────────────────   │
│  Tất cả sản phẩm    Lọc theo học viên: [Tất cả ▾]          │
│  ────────────────────────────────────────────────────────   │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ [thumbnail] │  │ [thumbnail] │  │ [thumbnail] │        │
│  │ Tên SP      │  │ Tên SP      │  │ Tên SP      │        │
│  │ 👤 Học viên │  │ 👤 Học viên │  │ 👤 Học viên │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Section "Nổi bật" luôn hiển thị cố định, không bị filter ảnh hưởng
- Dropdown filter chỉ liệt kê học viên có ít nhất 1 sản phẩm
- Filter chỉ áp dụng cho section "Tất cả sản phẩm"
- Nếu không có sản phẩm nổi bật: ẩn section "Nổi bật"
- Nếu không có sản phẩm sau filter: hiện empty state

### 3.3 Admin Sidebar — thêm mục

File: `frontend/src/components/dashboard/Sidebar.tsx`

Thêm mục **"Sản phẩm"** vào menu ADMIN:
```
ADMIN menu:
  - Registrations (📝)
  - Classes (🏫)
  - Sessions (📖)
  - Sản phẩm (🎨)   ← thêm mới
```

### 3.4 Trang Admin Products `/admin/products`

File mới: `frontend/src/app/admin/products/page.tsx`

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Sản phẩm học viên                  [+ Tạo sản phẩm]    │
│  ──────────────────────────────────────────────────────  │
│  Lọc theo học viên: [Tất cả học viên ▾]                  │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌───────────┐  │
│  │ [thumbnail]    │  │ [thumbnail]    │  │[thumbnail]│  │
│  │ Tên sản phẩm  │  │ Tên sản phẩm  │  │Tên sản    │  │
│  │ 👤 Anh Thư    │  │ 👤 Tuệ Minh   │  │phẩm       │  │
│  │ ⭐ Nổi bật    │  │               │  │👤 Quang   │  │
│  │               │  │               │  │[Admin tạo]│  │
│  │[⭐][✏️][🗑]  │  │[☆][✏️][🗑]  │  │[☆][✏️][🗑]│  │
│  └────────────────┘  └────────────────┘  └───────────┘  │
└──────────────────────────────────────────────────────────┘
```

**Badge:**
- `⭐ Nổi bật` — `isFeatured = true`
- `[Admin tạo]` — `createdBy` có giá trị

**Actions trên card:**
- `⭐/☆` — toggle featured (gọi `PATCH /admin/products/:id/featured`), không cần reload trang
- `✏️` — mở modal sửa
- `🗑` — xóa với confirm dialog

### 3.5 Modal tạo/sửa sản phẩm

**Student form** (`frontend/src/app/dashboard/products/page.tsx`) — bổ sung:
- Field upload **ảnh đại diện** (1 ảnh, preview inline)

**Admin form** (modal trong `/admin/products`) — gồm:
- Dropdown **"Chọn học viên"** (required, disabled khi sửa)
- Field upload **ảnh đại diện** (1 ảnh)
- Title, Description, Link, Files (giống student form)
- Checkbox **"Đánh dấu nổi bật"**

### 3.6 API Client — bổ sung

File: `frontend/src/lib/api.ts`

```typescript
// Admin products
api.adminGetProducts(userId?: string)          // GET /admin/products?userId=xxx
api.adminCreateProduct(data: FormData)         // POST /admin/products
api.adminUpdateProduct(id, data: FormData)     // PUT /products/:id (dùng endpoint hiện tại)
api.adminDeleteProduct(id)                     // DELETE /products/:id (dùng endpoint hiện tại)
api.adminToggleFeatured(id)                    // PATCH /admin/products/:id/featured
api.adminGetStudents()                         // GET /admin/users

// Public showcase
api.getShowcase(userId?: string)               // GET /products/showcase?userId=xxx
```

---

## 4. Data Flow

### Admin tạo sản phẩm thay học viên

```
Admin chọn học viên → điền form → submit
  → POST /admin/products (FormData: targetUserId, title, desc, link, thumbnail, files[])
  → Backend: upload thumbnail + files lên Cloudinary
  → Tạo Product { user: targetUserId, createdBy: adminId, isFeatured: false, ... }
  → Học viên thấy sản phẩm trong /dashboard/products
  → Sản phẩm hiển thị trên /portfolio/:userId
```

### Học viên xem/sửa sản phẩm do admin tạo

```
GET /products/my → trả về tất cả products có user = học viên (kể cả admin tạo)
PUT /products/:id → backend cho phép nếu product.user === req.user.userId
DELETE /products/:id → backend cho phép nếu product.user === req.user.userId
```

### Public showcase

```
GET /products/showcase → { featured: [...], others: [...], students: [...] }
  → Section nổi bật: render featured[]
  → Section tất cả: render others[] (filter client-side theo dropdown)
  → Dropdown: populate từ students[]
```

---

## 5. Out of Scope

- Phân trang (pagination) cho showcase — có thể thêm sau nếu số lượng sản phẩm lớn
- Học viên tự đánh dấu sản phẩm nổi bật
- Admin đổi owner sản phẩm sau khi đã tạo
- Thông báo cho học viên khi admin tạo sản phẩm thay họ
