# Kế hoạch Thiết kế Hệ thống (System Design Plan)

**Dự án:** Hệ thống Quản lý Lớp học AI
**Thư mục làm việc:** `Thông tin lớp học AI`

---

## 1. Mục tiêu và Phạm vi
Dựa trên tài liệu nghiệp vụ `business.md` đã chốt, giai đoạn này sẽ tập trung chuyển đổi các yêu cầu chức năng thành mô hình kỹ thuật.
Mục tiêu cuối cùng là tạo file **`Designmodel.md`** làm bản thiết kế (blueprint) để lập trình viên bắt tay vào code.

## 2. Các nội dung cần Thiết kế

### 2.1. Thiết kế Cơ sở dữ liệu (Database Design)
Xây dựng mô hình ERD (Entity Relationship Diagram) để quản lý các thực thể:
- **Users**: Quản lý Account (Admin, Student, Guest) và Profile.
- **Courses**: Thông tin 2 khóa học (AI Kid, AI Teen).
- **Classes**: Các lớp học cụ thể (Thời gian, Mentor).
- **Sessions**: Nội dung bài học (LMS).
- **Registrations**: Đơn đăng ký học.
- **Comments**: Thảo luận trong bài học.

### 2.2. Thiết kế API (API Specification)
Định nghĩa danh sách API cho Client (Frontend) gọi xuống Server (Backend):
- **Auth Group**: Login, Register.
- **Public Group**: Get Course Info, Get Classes.
- **Student Group**: Subscribe Class, Get My Courses, Get Session Content, Post Comment.
- **Admin Group**: Manage Classes, Manage Sessions, Approve/Reject Registrations.

### 2.3. Kiến trúc Hệ thống (System Architecture)
- Phân chia Frontend (Giao diện) và Backend (Xử lý logic & DB).
- Quy định về bảo mật (JWT Token) và phân quyền (RBAC).

---

## 3. Câu hỏi Xác nhận (Tech Stack)
Trước khi đi vào chi tiết `Designmodel.md`, tôi cần bạn xác nhận bộ công nghệ (Tech Stack) mong muốn để thiết kế Datatypes cho chính xác:

**Câu hỏi 1: Hệ quản trị Cơ sở dữ liệu (DBMS)?**
*   **A. Relational (SQL)**: MySQL / PostgreSQL / SQL Server. (Phù hợp logic chặt chẽ, quan hệ ràng buộc).
*   **B. NoSQL**: MongoDB. (Phù hợp hệ thống LMS, content linh hoạt, phát triển nhanh).

**Câu hỏi 2: Ngôn ngữ Backend?**
*   **A. Node.js (Express/NestJS)**: Phổ biến, dùng chung ngôn ngữ JS với Frontend.
*   **B. Python (Django/FastAPI)**: Mạnh về xử lý AI/Data sau này (nếu cần), code ngắn gọn.
*   **C. Java / C#**: Ổn định, Enterprise.

**Câu hỏi 3: Frontend Framework?**
*   **A. ReactJS / Next.js**: Phổ biến nhất hiện nay.
*   **B. VueJS**: Dễ học, nhẹ.
*   **C. Angular**: Cấu trúc chặt chẽ.

*(Đề xuất của tôi với vai trò Senior Dev: **MongoDB + Node.js (NestJS) + Next.js** để tối ưu tốc độ phát triển và tính linh hoạt cho hệ thống giáo dục)*

---

## 4. Kế hoạch thực hiện tiếp theo
1.  Người dùng chốt Tech Stack.
2.  Tôi sẽ tạo file `Designmodel.md` chứa:
    -   Sơ đồ ERD chi tiết (các bảng, trường, kiểu dữ liệu).
    -   Danh sách Endpoint API.
3.  Người dùng review và duyệt thiết kế.
