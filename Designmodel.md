# TÀI LIỆU THIẾT KẾ HỆ THỐNG (SYSTEM DESIGN MODEL)
**Dự án:** Hệ thống Quản lý Lớp học AI
**Tech Stack:** MongoDB, Node.js (NestJS), Next.js

---

## 1. KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống sử dụng kiến trúc **Client-Server** với **RESTful API**.

```mermaid
graph TD
    User[Client Browser] <-->|HTTPS / JSON| FE[Frontend (Next.js)]
    FE <-->|REST API| BE[Backend Container (Node.js/NestJS)]
    BE <-->|Read/Write| DB[(Database: MongoDB)]
```

-   **Frontend**: Next.js (React) đảm nhận hiển thị UI, Server Side Rendering (SSR) cho SEO tốt.
-   **Backend**: Node.js cung cấp API, xác thực (Auth), xử lý nghiệp vụ.
-   **Database**: MongoDB lưu trữ dữ liệu dạng JSON Document linh hoạt.

---

## 2. THIẾT KẾ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)
Dữ liệu lưu trữ trong MongoDB. Dưới đây là thiết kế các **Collections** (Bảng).

### 2.1. Collection `users`
Lưu trữ thông tin người dùng (Học viên & Admin).
```json
{
  "_id": "ObjectId",
  "username": "String (Unique, Index)", // Tên đăng nhập
  "password_hash": "String",            // Mật khẩu đã mã hóa
  "full_name": "String",                // Họ tên học viên
  "email": "String (Unique)",
  "phone": "String",
  "facebook_url": "String (Optional)",
  "role": "Enum ['STUDENT', 'ADMIN']",
  "created_at": "ISODate"
}
```

### 2.2. Collection `courses`
Thông tin danh mục khóa học (Static Data, ít thay đổi).
```json
{
  "_id": "ObjectId",
  "name": "String",               // Ví dụ: "AI Kid - Khám phá sáng tạo"
  "slug": "String (Unique)",      // URL friendly: "ai-kid"
  "description": "String",        // Mô tả html
  "target_age_group": "String",   // "7-10" hoặc ">10"
  "image_url": "String"
}
```

### 2.3. Collection `classes`
Các lớp học cụ thể được mở từ Khóa học.
```json
{
  "_id": "ObjectId",
  "course_id": "ObjectId (Ref: courses)",
  "name": "String",               // Ví dụ: "Lớp Kid K25 tháng 12"
  "mentor_name": "String",
  "start_date": "ISODate",
  "status": "Enum ['OPEN', 'CLOSED', 'ONGOING']"
}
```

### 2.4. Collection `registrations`
Lưu đơn đăng ký của học viên.
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId (Ref: users)",
  "class_id": "ObjectId (Ref: classes)", // Học viên chọn lớp cụ thể luôn
  "status": "Enum ['PENDING', 'APPROVED', 'REJECTED']",
  "admin_note": "String (Optional)",     // Lý do từ chối nếu có
  "registered_at": "ISODate",
  "updated_at": "ISODate"
}
```

### 2.5. Collection `sessions` (LMS)
Nội dung bài học của một lớp.
```json
{
  "_id": "ObjectId",
  "class_id": "ObjectId (Ref: classes)",
  "title": "String",               // Tên buổi học
  "content": "String (HTML)",      // Nội dung text
  "video_url": "String (Optional)",
  "order_index": "Number",         // Thứ tự bài học: 1, 2, 3...
  "created_at": "ISODate"
}
```

### 2.6. Collection `comments` (LMS)
Thảo luận trong bài học.
```json
{
  "_id": "ObjectId",
  "session_id": "ObjectId (Ref: sessions)",
  "user_id": "ObjectId (Ref: users)",
  "content": "String",
  "parent_id": "ObjectId (Optional)", // Để trả lời comment (Reply)
  "created_at": "ISODate"
}
```

---

## 3. THIẾT KẾ API (API SPECIFICATION)

### 3.1. Auth Group (Public)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Đăng ký tài khoản mới | `{username, fullName, password, email, ...}` |
| POST | `/api/auth/login` | Đăng nhập lấy Token | `{username, password}` |

### 3.2. Public Group (Guest/Public)
| Method | Endpoint | Description | Query Params |
| :--- | :--- | :--- | :--- |
| GET | `/api/courses` | Lấy danh sách khóa học | |
| GET | `/api/classes` | Lấy danh sách lớp đang mở | `?courseId=...` |

### 3.3. Student Group (Role: STUDENT)
| Method | Endpoint | Description | Note |
| :--- | :--- | :--- | :--- |
| POST | `/api/registrations` | Đăng ký vào lớp | `{classId}` |
| GET | `/api/registrations/me` | Xem lịch sử/trạng thái đăng ký | Lọc theo User đang login |
| GET | `/api/sessions` | Xem bài học | `?classId=...` (Chỉ xem được nếu đã Approved) |
| POST | `/api/comments` | Bình luận bài học | `{sessionId, content}` |

### 3.4. Admin Group (Role: ADMIN)
| Method | Endpoint | Description | Note |
| :--- | :--- | :--- | :--- |
| GET | `/api/admin/registrations` | Xem tất cả đơn đăng ký | `status=PENDING` |
| POST | `/api/admin/registrations/{id}/status` | Duyệt/Từ chối | `{status: 'APPROVED', note: ...}` |
| GET | `/api/admin/classes/{id}/details` | Xem chi tiết lớp học | Bao gồm thông tin lớp, danh sách học viên, và sessions |
| GET | `/api/admin/sessions/{id}/comments` | Xem comments của một bài học | Lấy tất cả comments theo sessionId |
| POST | `/api/admin/sessions` | Tạo bài học mới | `{classId, title, content...}` |
| PUT | `/api/admin/sessions/{id}` | Sửa bài học | |
| DELETE| `/api/admin/sessions/{id}` | Xóa bài học | |

---

## 5. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### REQ-005: Xem Chi Tiết Lớp Học (Admin)
**Mô tả**: Với vai trò Admin, cần có khả năng xem thông tin chi tiết của một lớp học cụ thể.

**Yêu cầu chi tiết**:

1. **Thông tin tổng quan lớp học**:
   - Tên lớp học
   - Khóa học thuộc về
   - Tên mentor
   - Ngày bắt đầu
   - Trạng thái lớp (OPEN/CLOSED/ONGOING)
   - Số lượng học viên đã đăng ký và được duyệt

2. **Danh sách học viên tham gia**:
   - Hiển thị tất cả học viên có trạng thái đăng ký = `APPROVED`
   - Thông tin hiển thị: Họ tên, Email, Số điện thoại, Ngày đăng ký
   - Có khả năng tìm kiếm và lọc học viên

3. **Danh sách bài học (Sessions)**:
   - Hiển thị tất cả các bài học thuộc lớp theo thứ tự `order_index`
   - Mỗi bài học hiển thị:
     - Tiêu đề bài học
     - Số lượng comments
     - Ngày tạo
   - Khi click vào một bài học, hiển thị chi tiết bài học và danh sách comments

4. **Xem Comments của từng bài học**:
   - Hiển thị tất cả comments theo thời gian (mới nhất trước)
   - Mỗi comment hiển thị:
     - Tên người comment (full_name từ users)
     - Nội dung comment
     - Thời gian comment
     - Nếu là reply (có parent_id), hiển thị dạng thread/nested
   - Admin có thể xem nhưng không nhất thiết phải có quyền xóa/sửa comment (tùy yêu cầu mở rộng)

**API cần thiết**:
- `GET /api/admin/classes/{id}/details` - Trả về thông tin lớp + danh sách học viên approved + danh sách sessions
- `GET /api/admin/sessions/{id}/comments` - Trả về tất cả comments của một session cụ thể

**Response Example cho `/api/admin/classes/{id}/details`**:
```json
{
  "class": {
    "_id": "...",
    "name": "Lớp Kid K25 tháng 12",
    "course": {
      "_id": "...",
      "name": "AI Kid - Khám phá sáng tạo"
    },
    "mentor_name": "Thầy Minh",
    "start_date": "2026-01-15T00:00:00.000Z",
    "status": "ONGOING"
  },
  "students": [
    {
      "_id": "...",
      "full_name": "Nguyễn Văn A",
      "email": "a@example.com",
      "phone": "0123456789",
      "registered_at": "2026-01-10T00:00:00.000Z"
    }
  ],
  "sessions": [
    {
      "_id": "...",
      "title": "Bài 1: Giới thiệu AI",
      "order_index": 1,
      "comment_count": 5,
      "created_at": "2026-01-15T00:00:00.000Z"
    }
  ],
  "total_students": 15
}
```

**Response Example cho `/api/admin/sessions/{id}/comments`**:
```json
{
  "session": {
    "_id": "...",
    "title": "Bài 1: Giới thiệu AI"
  },
  "comments": [
    {
      "_id": "...",
      "user": {
        "_id": "...",
        "full_name": "Nguyễn Văn A"
      },
      "content": "Bài học rất hay!",
      "parent_id": null,
      "created_at": "2026-01-20T10:30:00.000Z",
      "replies": [
        {
          "_id": "...",
          "user": {
            "_id": "...",
            "full_name": "Trần Thị B"
          },
          "content": "Mình cũng nghĩ vậy!",
          "parent_id": "...",
          "created_at": "2026-01-20T11:00:00.000Z"
        }
      ]
    }
  ],
  "total_comments": 5
}
```

---

## 4. CHÍNH SÁCH BẢO MẬT (SECURITY POLICY)
- **Authentication**: Sử dụng **JWT (JSON Web Token)**.
    - Token được cấp khi Login thành công.
    - Client gửi Token `Authorization: Bearer <token>` trong Header của các request bảo mật.
- **Authorization**:
    - Middleware kiểm tra `role` trong Token.
    - API `/api/admin/*` chỉ cho phép `role = ADMIN`.
- **Password**: Hash bằng `bcrypt` trước khi lưu DB.
