
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Registration, RegistrationStatus, Class, Course } from '@/types';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        totalCourses: 0,
        completedLessons: 0,
        certificates: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const registrations = await api.getMyRegistrations() as Registration[];

            // Count only approved registrations
            const approvedRegistrations = registrations.filter(
                (reg) => reg.status === RegistrationStatus.APPROVED
            );

            // Calculate total sessions from approved courses
            let totalSessions = 0;
            approvedRegistrations.forEach((reg) => {
                const classItem = reg.class as Class;
                const course = classItem.course as Course;
                if (course.totalSessions) {
                    totalSessions += course.totalSessions;
                }
            });

            setStats({
                totalCourses: approvedRegistrations.length,
                completedLessons: 0, // TODO: Implement lesson completion tracking
                certificates: 0, // TODO: Implement certificate system
            });
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Xin chào, {user?.fullName || 'Học viên'}! 👋</h1>
                <p className="text-muted-foreground mt-2">
                    Chào mừng bạn quay trở lại. Hôm nay bạn muốn học gì nào?
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                            📚
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Khóa học đang học</p>
                            <h3 className="text-2xl font-bold">
                                {loading ? '...' : stats.totalCourses}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl">
                            ✅
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
                            <h3 className="text-2xl font-bold">
                                {loading ? '...' : `${stats.completedLessons} bài`}
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center text-xl">
                            🏆
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Chứng chỉ</p>
                            <h3 className="text-2xl font-bold">
                                {loading ? '...' : stats.certificates}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Course Progress Placeholder */}
            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h3 className="font-bold text-lg">Tiến độ hằng ngày</h3>
                </div>
                <div className="p-6 text-center text-muted-foreground py-16">
                    <p>Biểu đồ hoạt động sẽ sớm được cập nhật...</p>
                </div>
            </div>
        </div>
    );
}
