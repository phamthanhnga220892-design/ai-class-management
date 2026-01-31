
import Link from 'next/link';

// === HƯỚNG DẪN THAY ẢNH MENTOR ===
// 1. Copy file ảnh của bạn vào thư mục 'frontend/public' (ví dụ: 'avatar-nga.jpg', 'avatar-long.png').
// 2. Sửa đường dẫn 'image' bên dưới thành '/avatar-nga.jpg' v.v.
// 3. Khuyên dùng ảnh vuông hoặc chân dung rõ mặt để hiển thị đẹp nhất.

const MENTORS = [
    {
        name: "Ms. Nga",
        role: "Chuyên viên cao cấp - BA",
        company: "Chứng khoán Kỹ thương - TCBS",
        description: "Áp dụng trực tiếp AI vào giai đoạn phân tích phần mềm, lên ý tưởng sản phẩm, tối ưu quy trình nghiệp vụ.",
        // Thay đổi đường dẫn ảnh ở đây
        image: "/mentorNga.jpg",
    },
    {
        name: "Mr. Long",
        role: "Chuyên gia phát triển phần mềm - DEV",
        company: "Chứng khoán Kỹ thương - TCBS",
        description: "Am hiểu chuyên sâu về AI, ứng dụng thực tế các mô hình ngôn ngữ lớn (LLM) vào việc lập trình và tự động hóa.",
        // Thay đổi đường dẫn ảnh ở đây
        image: "https://placehold.co/400x400/e2e8f0/1e293b?text=Mr.+Long",
    },
];

export function MentorList() {
    return (
        <section id="mentors" className="py-10 bg-background">
            <div className="container mx-auto px-4">
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        ĐỘI NGŨ MENTOR DẪN DẮT
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Những chuyên gia thực chiến, sẵn sàng đồng hành và truyền lửa đam mê công nghệ.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {MENTORS.map((mentor, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow text-center sm:text-left">
                            {/* Ảnh Mentor - Kích thước nhỏ gọn hơn (150x150) */}
                            <div className="relative shrink-0">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary/10 shadow-inner">
                                    <img
                                        src={mentor.image}
                                        alt={mentor.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                {/* Decor dot */}
                                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white" title="Online" />
                            </div>

                            {/* Thông tin */}
                            <div className="space-y-2">
                                <div>
                                    <h3 className="text-xl font-bold text-foreground">{mentor.name}</h3>
                                    <p className="text-sm font-semibold text-primary">{mentor.role}</p>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{mentor.company}</p>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {mentor.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
