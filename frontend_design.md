# TÀI LIỆU THIẾT KẾ GIAO DIỆN (FRONTEND DESIGN SPECS)
**Dự án:** Hệ thống Quản lý Lớp học AI

Để đảm bảo code ra đúng giao diện bạn mong muốn, chúng ta cần thống nhất các thông số thiết kế sau đây.

## 1. Phong cách Chủ đạo (Visual Code)
- **Màu sắc chính (Primary Color)**: (Ví dụ: Xanh dương #007bff, Cam #ff6b6b...)
- **Màu nền (Background)**: (Sáng/Trắng hay Tối/Dark Mode?)
- **Font chữ**: (Ví dụ: Inter, Roboto, hay font vui nhộn cho trẻ em?)
- **Cảm giác (Mood)**: (Ví dụ: Hiện đại, Công nghệ, Vui tươi, Nghiêm túc?)

## 2. Bố cục Trang (Page Layouts)
Mô tả chi tiết các màn hình chính.

### 2.1. Trang Chủ (Landing Page)
- **Header**: Logo nằm đâu? Menu gồm những mục nào? (Trang chủ, Khóa học, Liên hệ, Đăng ký/Đăng nhập).
- **Hero Section**: Ảnh banner lớn? Câu slogan là gì? Nút CTA (Call-to-Action) màu gì?
- **Danh sách Khóa học**: Hiển thị dạng lưới (Grid) hay danh sách (List)? Thẻ khóa học gồm ảnh, tên, mô tả ngắn?
- **Feedback**: Slider chạy ngang hay danh sách tĩnh?

### 2.2. Trang Chi tiết Khóa học
- Bố cục 2 cột (Trái: Nội dung, Phải: Đăng ký) hay 1 cột?
- Có hiện danh sách bài học (Curriculum) luôn không?

### 2.3. Dashboard Học viên
- Sidebar menu bên trái hay Menu ngang bên trên?
- Màn hình chính hiển thị: Lớp đang học, Bài tập...?

## 3. Cách cung cấp Design
Bạn hoàn toàn có thể sử dụng **ASCII Art** để mô tả bố cục (Layout). Đây là cách rất trực quan và hiệu quả.

**Ví dụ mô tả ASCII:**
================================================================================
[AI] ACADEMY                      Khóa học   Mentor   Cảm nhận    [ GHI DANH ]  <-- (Navbar Cố định)
================================================================================

          🚀 Tuyển sinh khóa học mới 2024
          
      ĐÁNH THỨC TIỀM NĂNG AI                                                    <-- (Hero Section)
       DÀNH CHO THẾ HỆ TRẺ
       
      Chúng tôi đồng hành cùng các em từ những bước chân đầu tiên...
      
      [ Khám phá khóa học ]    [ Xem video demo ]

--------------------------------------------------------------------------------
          +-----------------------------------------------------------+
          | 🤖 Trợ Lý AI Thông Minh                [Powered by Gemini]|         <-- (AI Advisor)
          +-----------------------------------------------------------+
          | Hãy cho tôi biết độ tuổi và sở thích của bạn...           |
          | [ VD: Con tôi 8 tuổi, thích chơi game...     ] [Tư Vấn AI]|
          +-----------------------------------------------------------+

--------------------------------------------------------------------------------
                         LỘ TRÌNH ĐƯỢC THIẾT KẾ RIÊNG                           <-- (Course Tabs)
          
                 ( [ AI KID (7-12) ] )   [ AI TEEN (13-18) ]

    +-------------------------------------+   +--------------------------------+
    | 7-12 TUỔI  (AI KID)                 |   | 🤝 GẶP GỠ MENTOR               |
    | "Nhà Sáng Tạo Nhí"                  |   |                                |
    | 🧠 Tư duy Logic                     |   | [ Ảnh Mentor 1 ] Thầy Quân     |
    | 🎨 Sáng tạo                         |   | [ Ảnh Mentor 2 ] Cô Chi        |
    |                                     |   |                                |
    | 📚 NỘI DUNG                         |   | +----------------------------+ |
    | Phase 1: Làm quen                   |   | | SẴN SÀNG BẮT ĐẦU?          | |
    | Phase 2: Sáng tạo                   |   | | [ Đăng ký ngay ]           | |
    | Phase 3: Dự án cuối khóa            |   | +----------------------------+ |
    +-------------------------------------+   +--------------------------------+

--------------------------------------------------------------------------------
                         ĐỘI NGŨ MENTOR XUẤT SẮC                                <-- (Mentor Grid)
           Học tập từ những chuyên gia hàng đầu trong lĩnh vực AI.

    [ Ảnh Mentor 1 ]      [ Ảnh Mentor 2 ]      [ Ảnh Mentor 3 ]      [ Ảnh Mentor 4 ]
     Thầy Minh Quân        Cô Linh Chi           TS. Hoàng Long        Anh Tuấn Anh
     Chuyên gia STEM       Thạc sĩ AI            Senior Researcher     Lead Engineer

--------------------------------------------------------------------------------
                      CẢM NHẬN TỪ HỌC VIÊN & PHỤ HUYNH                          <-- (Testimonials)

    +-------------------+    +-------------------+    +-------------------+
    | ⭐⭐⭐⭐⭐           |    | ⭐⭐⭐⭐⭐           |    | ⭐⭐⭐⭐            |
    | "Con tôi tự tin"  |    | "Khóa học rất cuốn"|    | "Lộ trình rõ ràng" |
    | -- Chị Mai Anh    |    | -- Hải Đăng (11)  |    | -- Anh Thịnh       |
    +-------------------+    +-------------------+    +-------------------+

================================================================================
 [AI] ACADEMY  |  Khóa học: Kid, Teen  |  Liên hệ: 1900 123...                  <-- (Footer)
================================================================================
```

---
*Vui lòng vẽ hoặc mô tả bố cục mong muốn của bạn bằng ASCII hoặc lời văn vào dưới đây:*
> [Nhập mô tả ASCII của bạn...]
