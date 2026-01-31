'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Course } from '@/types';

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const data = await api.getCourses();
            setCourses(data as Course[]);
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách khóa học');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải khóa học...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-2">Có lỗi xảy ra</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button
                        onClick={fetchCourses}
                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px] opacity-40" />

            <div className="container mx-auto px-4 py-16">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
                        <span className="text-foreground">Khám phá </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                            Khóa học AI
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Chọn lộ trình phù hợp với độ tuổi và mục tiêu học tập của bạn
                    </p>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {courses.map((course) => (
                        <Link
                            key={course._id}
                            href={`/courses/${course._id}`}
                            className="group"
                        >
                            <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all duration-300 h-full">
                                {/* Thumbnail */}
                                <div className="relative h-64 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl">
                                            🎓
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                        {course.title}
                                    </h2>
                                    <p className="text-muted-foreground mb-6 line-clamp-3">
                                        {course.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-xl">📚</span>
                                            <div>
                                                <div className="font-medium">{course.totalSessions} buổi</div>
                                                <div className="text-xs text-muted-foreground">Tổng số buổi học</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-xl">⏱️</span>
                                            <div>
                                                <div className="font-medium">{course.totalDuration} phút</div>
                                                <div className="text-xs text-muted-foreground">Thời lượng</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA Button */}
                                    <div className="pt-6 border-t border-border">
                                        <div className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium group-hover:bg-primary/90 transition-colors text-center">
                                            Xem lớp học →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {courses.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-lg text-muted-foreground">
                            Chưa có khóa học nào
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
