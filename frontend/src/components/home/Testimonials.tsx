
export function Testimonials() {
    const testimonials = [
        {
            name: "Chị Mai Anh",
            role: "Phụ huynh bé Nam (8 tuổi)",
            content: "Con tôi tự tin hơn hẳn sau khóa AI Kid. Bé không chỉ biết dùng máy tính mà còn tư duy logic tốt hơn.",
            rating: 5,
        },
        {
            name: "Hải Đăng",
            role: "Học viên lớp AI Teen (11 tuổi)",
            content: "Khóa học rất cuốn! Em thích nhất là lúc tự tay huấn luyện cho máy tính nhận diện hình ảnh.",
            rating: 5,
        },
        {
            name: "Anh Thịnh",
            role: "Phụ huynh em Linh (14 tuổi)",
            content: "Lộ trình rõ ràng, mentor nhiệt tình. Tôi yên tâm khi gửi gắm con theo học tại đây.",
            rating: 4,
        },
    ];

    return (
        <section id="testimonials" className="py-10 md:py-16 bg-background">
            <div className="container mx-auto px-4">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                        CẢM NHẬN TỪ HỌC VIÊN & PHỤ HUYNH
                    </h2>
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className="text-yellow-500 text-2xl">★</span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((item, index) => (
                        <div key={index} className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                            <div className="flex gap-1 mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className={`text-lg ${i < item.rating ? 'text-yellow-500' : 'text-gray-300'}`}>
                                        ★
                                    </span>
                                ))}
                            </div>
                            <p className="mb-6 text-muted-foreground italic">"{item.content}"</p>
                            <div>
                                <h4 className="font-bold">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">{item.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
