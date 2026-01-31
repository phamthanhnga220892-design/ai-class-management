# KẾ HOẠCH TRIỂN KHAI PHÁT TRIỂN (DEVELOPMENT PLAN)
**Dự án:** Hệ thống Quản lý Lớp học AI
**Phương pháp:** Chia nhỏ thành các Unit (Đơn vị) để phát triển và nghiệm thu cuốn chiếu.

---

## 📅 Lộ trình Triển khai (Dev Roadmap)

### ⛳ Unit 1: Khởi tạo Dự án & Cơ sở dữ liệu (Foundation)
*Mục tiêu: Xây dựng khung sườn cho cả FE và BE, đảm bảo kết nối Database thành công.*
1.  **Backend**:
    -   Khởi tạo dự án Node.js (NestJS).
    -   Cấu hình kết nối MongoDB.
    -   Tạo Schema cơ bản: `User`, `Course`.
    -   Viết API Seeding dữ liệu mẫu (Tạo Admin mặc định, Tạo 2 khóa học mẫu).
2.  **Frontend**:
    -   Khởi tạo dự án Next.js.
    -   Cài đặt thư viện UI (TailwindCSS).
    -   Thiết lập biến màu sắc/font chữ theo file `frontend_design.md`.
    -   Tạo Layout chung (Header, Footer theo ASCII design).

### ⛳ Unit 2: Trang chủ & Xác thực (Auth & Landing)
*Mục tiêu: Hoàn thiện giao diện công khai và chức năng tài khoản.*
1.  **Backend**:
    -   API Auth: Register, Login (JWT), Get Profile.
2.  **Frontend**:
    -   **Landing Page**: Code giao diện trang chủ theo thiết kế ASCII (Hero section, AI Advisor, Mentor Grid, Testimonials).
    -   **Auth Pages**: Trang Đăng nhập, Đăng ký.
    -   Tích hợp API Đăng ký/Đăng nhập.

### ⛳ Unit 3: Luồng Đăng ký Khóa học (Core Business)
*Mục tiêu: Học viên có thể xem lớp và gửi yêu cầu đăng ký.*
1.  **Backend**:
    -   API Public: Lấy danh sách Lớp học (Classes).
    -   API Student: Gửi yêu cầu đăng ký (Registration), Xem lịch sử đăng ký.
    -   API Admin: Xem danh sách đăng ký, Duyệt/Từ chối.
2.  **Frontend**:
    -   Trang Chi tiết khóa học & Danh sách lớp.
    -   Nút "Đăng ký ngay" (Xử lý logic check đăng nhập).
    -   Trang "Khóa học của tôi" (My Dashboard): Hiển thị trạng thái Pending/Approved.

### ⛳ Unit 4: Admin Portal & Quản lý Lớp (Management)
*Mục tiêu: Admin có công cụ để quản lý dữ liệu.*
1.  **Backend**:
    -   API CRUD cho Class (Thêm/Sửa/Xóa lớp).
    -   API CRUD cho Session (Thêm bài học vào lớp).
2.  **Frontend**:
    -   Xây dựng Layout riêng cho Admin.
    -   Màn hình Quản lý Đăng ký (Table danh sách, nút Action Duyệt/Hủy).
    -   Màn hình Quản lý Lớp học (Form thêm lớp mới).

### ⛳ Unit 5: LMS - Học tập & Tương tác (Learning)
*Mục tiêu: Tính năng vào học và thảo luận.*
1.  **Backend**:
    -   API LMS: Lấy nội dung bài học, Gửi Comment.
2.  **Frontend**:
    -   Giao diện Bài học (Video/Slide bên trái, Menu bài học bên phải).
    -   Khu vực Thảo luận (Comment section) dưới bài học.
    -   Chặn truy cập: Chỉ user có trạng thái `APPROVED` mới vào được link bài học.

---

## 📝 Quy tắc làm việc
1.  Tôi sẽ thực hiện lần lượt từng Unit.
2.  Sau khi code xong Unit X, tôi sẽ báo cáo và đợi bạn **Xác nhận (Confirm)**.
3.  Khi bạn OK, tôi mới chuyển sang Unit tiếp theo.
