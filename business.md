# TÀI LIỆU YÊU CẦU NGHIỆP VỤ (BUSINESS REQUIREMENT DOCUMENT)
**Dự án:** Hệ thống Quản lý Lớp học AI
**Ngày tạo:** 26/12/2025

---

## 1. TỔNG QUAN (OVERVIEW)
Hệ thống cung cấp nền tảng trực tuyến giới thiệu và quản lý đăng ký cho các khóa học AI dành cho học sinh.
Hệ thống bao gồm:
- **Frontend (Web App)**: Nơi học sinh/phụ huynh tìm hiểu thông tin và đăng ký tham gia.
- **Backend (Admin Portal)**: Nơi quản trị viên quản lý danh sách và phê duyệt học viên.

## 2. PHẠM VI (SCOPE)
### 2.1. Đối tượng Khóa học
Hệ thống hiện tại tập trung vào 2 khóa học cố định:
1.  **Khóa AI Kid (7-10 tuổi)**:
    - Mục tiêu: Khám phá sáng tạo.
    - Nội dung: Tạo ảnh, truyện, làm video bằng AI.
2.  **Khóa AI Teen (>10 tuổi)**:
    - Mục tiêu: Học nghề, thực hành chuyên sâu.
    - Nội dung: Biến ý tưởng thành sản phẩm thực tế (Web/App)..

### 2.2. Giới hạn Phạm vi
- Không bao gồm thanh toán trực tuyến (chỉ ghi nhận yêu cầu đăng ký).
- Hệ thống có tính năng LMS cơ bản: Quản lý nội dung buổi học và tương tác comment.

---

## 3. TÁC NHÂN (ACTORS)
| Tác nhân | Mô tả vai trò |
| :--- | :--- |
| **1. Khách (Guest)** | Người dùng chưa đăng nhập. Chỉ có thể xem thông tin chung. |
| **2. Học viên (Student)** | Người dùng đã có tài khoản (Role: STUDENT). Có thể đăng ký tham gia khóa học. |
| **3. Quản trị viên (Admin)** | Người quản lý hệ thống (Role: ADMIN). Chịu trách nhiệm duyệt hồ sơ đăng ký. |

---

## 4. DANH SÁCH USE CASES

### UC1: Quản lý Tài khoản (Auth)
- **UC1.1 Đăng ký tài khoản (Register)**: Người dùng tạo tài khoản mới để tham gia hệ thống.
- **UC1.2 Đăng nhập (Login)**: Truy cập vào hệ thống với vai trò Học viên hoặc Admin.

### UC2: Khám phá & Đăng ký Khóa học (Student Flow)
- **UC2.1 Xem danh sách khóa học**: Xem thông tin giới thiệu 2 khóa AI Kid và AI Teen.
- **UC2.2 Xem chi tiết lớp học**: Xem lịch học, giảng viên (mentor) của từng lớp cụ thể.
- **UC2.3 Đăng ký lớp học**: Gửi yêu cầu tham gia vào một lớp học cụ thể.

### UC3: Quản lý Đăng ký (Admin Flow)
- **UC3.1 Xem danh sách đăng ký**: Hiển thị danh sách tất cả yêu cầu đăng ký từ học viên.
- **UC3.2 Duyệt đơn đăng ký (Approve)**: Chấp thuận học viên vào lớp.
- **UC3.3 Từ chối đơn đăng ký (Reject)**: Từ chối yêu cầu (kèm lý do nếu cần).

### UC4: Quản lý Nội dung & Tương tác (LMS)
- **UC4.1 Quản lý buổi học (Admin)**: Thêm/Sửa nội dung từng buổi học cho mỗi khóa.
- **UC4.2 Xem bài học (Student)**: Học viên (đã được duyệt) xem nội dung các buổi học trong khóa của mình.
- **UC4.3 Thảo luận (Student)**: Học viên comment vào từng buổi học để trao đổi.

---

## 5. USER STORIES CHI TIẾT

### 5.1. Phân hệ Người dùng (Frontend)

#### **US01: Đăng ký tài khoản**
*   **As a** Khách (Guest),
*   **I want to** tạo một tài khoản với các thông tin (Tên đăng nhập, Họ tên học viên, Mật khẩu),
*   **So that** tôi có thể sử dụng các chức năng dành cho thành viên.
*   **Acceptance Criteria:**
    - Form yêu cầu: Tên đăng nhập, Họ tên học viên, Mật khẩu, Xác nhận mật khẩu, Email, SĐT, Facebook (optional).
    - Validate email hợp lệ, mật khẩu đủ mạnh.

#### **US02: Xem thông tin khóa học**
*   **As a** Khách/Học viên,
*   **I want to** xem trang giới thiệu chi tiết về Khóa AI Kid và AI Teen (Mentor, Nội dung, Lợi ích),
*   **So that** tôi quyết định xem khóa học nào phù hợp.
*   **Acceptance Criteria:**
    - Hiển thị rõ ràng 2 khóa học riêng biệt.
    - Có thêm phần Feedback/Cảm nhận học viên để tăng sự hấp dẫn và tin cậy.
    - Giao diện đẹp, hấp dẫn, phù hợp lứa tuổi.

#### **US03: Đăng ký tham gia lớp học**
*   **As a** Học viên (đã đăng nhập),
*   **I want to** chọn một trong hai khóa học (Kid hoặc Teen) và bấm "Đăng ký",
*   **So that** tôi được ghi danh vào lớp đó.
*   **Acceptance Criteria:**
    - Hệ thống ghi nhận yêu cầu đăng ký.
    - Trạng thái mặc định là "Chờ duyệt" (Pending).
    - Hiển thị thông báo thành công sau khi gửi.

#### **US04: Xem bài học & Thảo luận (LMS)**
*   **As a** Học viên (đã được duyệt vào lớp),
*   **I want to** xem nội dung bài học và viết bình luận,
*   **So that** tôi có thể học tập và trao đổi với giảng viên.
*   **Acceptance Criteria:**
    - Chỉ học viên thuộc lớp đó mới được xem.
    - Bài học hiển thị theo danh sách tuần tự.
    - Cho phép gửi comment và xem danh sách comment cũ.

### 5.2. Phân hệ Quản trị (Backend - Admin Portal)

#### **US05: Xem danh sách chờ duyệt**
*   **As an** Admin,
*   **I want to** xem danh sách các học viên vừa đăng ký,
*   **So that** tôi nắm được số lượng và thông tin người đăng ký mới.
*   **Acceptance Criteria:**
    - Danh sách hiển thị: Tên học viên, Tên lớp đăng ký, Ngày đăng ký, Trạng thái.
    - Có thể lọc theo trạng thái (Pending, Approved, Rejected).

#### **US06: Phê duyệt/Từ chối đăng ký**
*   **As an** Admin,
*   **I want to** thay đổi trạng thái đơn đăng ký thành "Đã duyệt" hoặc "Từ chối",
*   **So that** tôi kiểm soát chất lượng đầu vào và sĩ số lớp.
*   **Acceptance Criteria:**
    - Nút "Duyệt": Chuyển trạng thái sang Approved.
    - Nút "Từ chối": Chuyển trạng thái sang Rejected.
    - Hệ thống (Optional) gửi email thông báo kết quả cho học viên.

#### **US07: Quản lý nội dung buổi học (LMS)**
*   **As an** Admin/Giảng viên,
*   **I want to** thêm/sửa/xóa nội dung bài học (Tiêu đề, Video/Slide, Tài liệu) cho từng buổi,
*   **So that** học viên có tài liệu để theo dõi.
*   **Acceptance Criteria:**
    - Giao diện Admin cho phép CRUD bài học.
    - Cho phép upload tài liệu hoặc nhúng link video.

#### **US08: Xem chi tiết lớp học và tương tác học viên**
*   **As an** Admin,
*   **I want to** xem thông tin chi tiết một lớp học bao gồm danh sách học viên và các bài học với comments,
*   **So that** tôi có thể theo dõi tình hình học tập và tương tác của học viên trong lớp.
*   **Acceptance Criteria:**
    - **Thông tin tổng quan lớp học:**
        - Hiển thị tên lớp, khóa học, mentor, ngày bắt đầu, trạng thái
        - Hiển thị tổng số học viên đã được duyệt tham gia lớp
    - **Danh sách học viên:**
        - Hiển thị tất cả học viên có trạng thái đăng ký = "Đã duyệt" (APPROVED)
        - Thông tin mỗi học viên: Họ tên, Email, Số điện thoại, Ngày đăng ký
        - Có chức năng tìm kiếm và lọc học viên
    - **Danh sách bài học:**
        - Hiển thị tất cả bài học của lớp theo thứ tự
        - Mỗi bài học hiển thị: Tiêu đề, số lượng comments, ngày tạo
        - Có thể click vào bài học để xem chi tiết
    - **Xem comments của bài học:**
        - Khi click vào một bài học, hiển thị tất cả comments
        - Mỗi comment hiển thị: Tên người comment, nội dung, thời gian
        - Hỗ trợ hiển thị comment dạng thread/nested (replies)
        - Comments sắp xếp theo thời gian (mới nhất trước)
    - **Giao diện:**
        - Giao diện trực quan, dễ điều hướng giữa các phần
        - Responsive, hoạt động tốt trên nhiều thiết bị

---

## 6. YÊU CẦU PHI CHỨC NĂNG & HỆ THỐNG (SYSTEM REQUIREMENTS)

### 6.1. Xác thực & Phân quyền (Authentication & Authorization)
- Hệ thống phân biệt người dùng dựa trên trường **Role** trong cơ sở dữ liệu:
    - `ROLE_STUDENT`: Người dùng đăng ký qua trang chủ.
    - `ROLE_ADMIN`: Quản trị viên hệ thống.
- **Admin**: Tài khoản Admin sẽ được **tạo sẵn (Seeding)** trong Database khi triển khai hệ thống (không có trang đăng ký cho Admin).

### 6.2. Bảo mật (Security)
- Mật khẩu phải được mã hóa (Hashing) trước khi lưu vào database.
- API của Admin phải được bảo vệ bằng Token/Session, không cho phép User thường truy cập.
