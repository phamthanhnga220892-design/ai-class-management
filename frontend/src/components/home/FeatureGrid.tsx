
'use client';

import { useState } from 'react';

const ROADMAPS = [
    {
        id: 'explorer',
        title: "HỆ SƠ CẤP: AI EXPLORER",
        subtitle: "NHÀ KHAI PHÁ NHÍ (10-11 TUỔI)",
        description: "Khơi nguồn đam mê thông qua thế giới hình ảnh và âm thanh sống động.",
        icon: "🚀",
        color: "from-blue-500 to-cyan-400",
        destination: "Giúp các em tự tin làm chủ công cụ, biến trí tưởng tượng phong phú thành những sản phẩm thực tế đầy tự hào.",
        phases: [
            {
                title: "Chặng 1: Phù Thủy Hình Ảnh",
                desc: "Làm chủ sức mạnh AI để biến những dòng chữ thành tác phẩm nghệ thuật và những khung hình chuyển động kỳ diệu."
            },
            {
                title: "Chặng 2: Xưởng Phim Hoạt Hình",
                desc: "Tự tay viết kịch bản, đạo diễn video hoạt hình và sáng tác những bản nhạc độc bản bằng trí tuệ nhân tạo."
            },
            {
                title: "Chặng 3: Nhà Phát Triển Game",
                desc: "Bước đầu làm quen với tư duy lập trình thông qua việc nâng cấp và sáng tạo các trò chơi 2D mang đậm dấu ấn cá nhân."
            }
        ]
    },
    {
        id: 'creator',
        title: "HỆ CHUYÊN SÂU: PHÁT TRIỂN SẢN PHẨM SỐ",
        subtitle: "NHÀ KIẾN TẠO TƯƠNG LAI (12-13 TUỔI)",
        description: "Tập trung vào quy trình xây dựng phần mềm thực tế và ứng dụng AI chuyên sâu.",
        icon: "🧠",
        color: "from-purple-500 to-pink-500",
        destination: "Biến AI thành 'cộng sự' đắc lực để xây dựng và công bố các sản phẩm AI có khả năng ứng dụng thực tiễn, tạo bước đệm vững chắc cho sự nghiệp tương lai.",
        phases: [
            {
                title: "Chặng 1: Phân Tích & Giải Pháp",
                desc: "Khởi đầu hành trình bằng việc quan sát thực tế để lên ý tưởng. Học cách phân tích nhu cầu người dùng và thiết kế giải pháp đột phá thông qua các bản vẽ kỹ thuật."
            },
            {
                title: "Chặng 2: Lập Trình Cùng AI",
                desc: "Học cách sử dụng AI như một trợ lý lập trình chuyên nghiệp. Ứng dụng các mô hình ngôn ngữ lớn để viết code, tối ưu hóa quy trình và biến ý tưởng trên giấy thành tính năng thực tế."
            },
            {
                title: "Chặng 3: Hoàn Thiện & Công Bố",
                desc: "Chinh phục quy trình đưa sản phẩm ra thị trường. Từ việc đóng gói mã nguồn đến việc công bố Website/App cá nhân, giúp sản phẩm sẵn sàng phục vụ cộng đồng."
            }
        ]
    }
];

export function FeatureGrid() {
    const [activeTab, setActiveTab] = useState<'explorer' | 'creator'>('explorer');

    return (
        <section id="courses" className="py-10 bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-foreground">
                        LỘ TRÌNH ĐÀO TẠO CHUYÊN BIỆT
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Thiết kế độc quyền giúp học viên phát triển toàn diện từ tư duy đến kỹ năng thực chiến.
                    </p>
                </div>

                {/* Mobile/Desktop Tabs */}
                <div className="flex justify-center gap-4 mb-12">
                    {ROADMAPS.map((roadmap) => (
                        <button
                            key={roadmap.id}
                            onClick={() => setActiveTab(roadmap.id as any)}
                            className={`px-6 py-3 rounded-full font-bold text-sm sm:text-base transition-all shadow-sm flex items-center gap-2 ${activeTab === roadmap.id
                                ? `bg-gradient-to-r ${roadmap.color} text-white shadow-lg scale-105`
                                : "bg-background text-muted-foreground hover:bg-muted border border-border"
                                }`}
                        >
                            <span>{roadmap.icon}</span>
                            {roadmap.subtitle}
                        </button>
                    ))}
                </div>

                {/* Content Display */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Detailed Info */}
                    <div className="lg:col-span-8 space-y-6">
                        {ROADMAPS.map((roadmap) => (
                            activeTab === roadmap.id && (
                                <div key={roadmap.id} className="animate-in fade-in zoom-in-95 duration-500">
                                    <div className={`rounded-3xl p-1 bg-gradient-to-r ${roadmap.color}`}>
                                        <div className="rounded-[22px] bg-card p-6 sm:p-10 h-full">
                                            <h3 className={`text-xl sm:text-2xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r ${roadmap.color}`}>
                                                {roadmap.title}
                                            </h3>
                                            <p className="text-lg text-foreground font-medium mb-8">
                                                {roadmap.description}
                                            </p>

                                            <div className="grid gap-6">
                                                {roadmap.phases.map((phase, idx) => (
                                                    <div key={idx} className="group flex gap-4 md:gap-6 items-start p-4 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 bg-gradient-to-br ${roadmap.color} text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{phase.title}</h4>
                                                            <p className="text-muted-foreground leading-relaxed">
                                                                {phase.desc}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-border">
                                                <div className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                                                    <span className="text-2xl">🎯</span>
                                                    <div>
                                                        <span className="font-bold text-foreground block mb-1">Đích đến hành trình:</span>
                                                        <span className="text-muted-foreground">{roadmap.destination}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Right: Core Values (Sticky) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <span className="text-yellow-500">🎯</span>
                                Giá Trị Cốt Lõi Của Khóa Học
                            </h3>

                            <p className="text-sm text-muted-foreground mb-6">
                                Chúng tôi tin rằng mỗi học sinh đều có tiềm năng vô hạn. Khóa học giúp các em:
                            </p>

                            <div className="space-y-5">
                                <div>
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xl mb-3">
                                        💪
                                    </div>
                                    <h4 className="font-bold text-base mb-2">Tự tin làm chủ</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Tự tay tạo ra các sản phẩm công nghệ của riêng mình.
                                    </p>
                                </div>
                                <div className="h-px bg-border/50" />
                                <div>
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xl mb-3">
                                        💡
                                    </div>
                                    <h4 className="font-bold text-base mb-2">Tư duy đột phá</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Phát triển tư duy sáng tạo và kỹ năng giải quyết vấn đề.
                                    </p>
                                </div>
                                <div className="h-px bg-border/50" />
                                <div>
                                    <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-xl mb-3">
                                        🚀
                                    </div>
                                    <h4 className="font-bold text-base mb-2">Ứng dụng thực tế</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Biến AI thành cộng sự đắc lực trong học tập và giải trí.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                <p className="text-sm font-medium text-center text-primary">
                                    "Học AI không chỉ để dùng công cụ, mà để làm chủ tương lai."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
