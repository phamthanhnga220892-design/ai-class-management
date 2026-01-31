
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// === HƯỚNG DẪN THAY ẢNH (GUIDE TO CHANGE IMAGES) ===
// Bạn hãy thay đổi các đường dẫn ảnh bên dưới đây.
// Có thể dùng ảnh từ internet (URL) hoặc ảnh trong thư mục public của dự án (ví dụ: '/images/banner-1.jpg')
const HERO_IMAGES = [
    {
        src: "/anh1.jpg",
        alt: "Lớp học AI tương tác",
    },
    {
        src: "/anh2.png",
        alt: "Phòng thí nghiệm Robotics",
    },
];

export function Hero() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Tự động chuyển ảnh sau mỗi 5 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        }, 5000); // 5000ms = 5 giây

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full overflow-hidden bg-background pt-10 pb-8 md:pt-16 md:pb-12">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] opacity-40" />

            <div className="container mx-auto px-4 flex flex-col items-center text-center">

                {/* Badge */}
                <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary animate-fade-in-up">
                    <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                    Đào tạo AI thế hệ mới
                </div>

                {/* Headlines */}
                <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl xl:text-7xl mb-6">
                    <span className="text-foreground">Kiến tạo tương lai với </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x">
                        Công nghệ AI
                    </span>
                </h1>

                <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl mb-10 leading-relaxed">
                    Nền tảng giáo dục lập trình và trí tuệ nhân tạo hàng đầu dành cho trẻ em và thanh thiếu niên.
                    Học trực quan - Thực hành thực tế - Tư duy sáng tạo.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16 w-full sm:w-auto">
                    <Link href="/courses" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-105 active:scale-95">
                        Khám phá lộ trình
                    </Link>

                </div>

                {/* Central Hero Slideshow */}
                <div className="relative w-full max-w-5xl aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-muted/50 group">

                    {/* Slideshow Images */}
                    {HERO_IMAGES.map((image, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <img
                                src={image.src}
                                alt={image.alt}
                                className="object-cover w-full h-full"
                            />
                            {/* Overlay gradient for text readability if needed */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                        </div>
                    ))}

                    {/* Slideshow Indicators (Dots) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {HERO_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentImageIndex
                                    ? 'bg-primary w-8'
                                    : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Abstract Decorative Blur (Foreground) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/30 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                {/* Trust/Stats footer */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm font-medium text-muted-foreground opacity-80">
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-foreground">500+</span>
                        <span>Học viên</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-foreground">20+</span>
                        <span>Mentor</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-foreground">50+</span>
                        <span>Dự án</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-foreground">4.9/5</span>
                        <span>Đánh giá</span>
                    </div>
                </div>

            </div>
        </section>
    );
}
