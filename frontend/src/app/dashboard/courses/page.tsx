
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Registration, RegistrationStatus, Class, Course } from '@/types';

export default function CoursesPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const data = await api.getMyRegistrations();
            setRegistrations(data as Registration[]);
        } catch (err: any) {
            // Check if it's an unauthorized error
            if (err.status === 401 || err.message?.toLowerCase().includes('unauthorized')) {
                setError('Bạn cần đăng nhập để xem khóa học của mình');
            } else {
                setError(err.message || 'Không thể tải danh sách đăng ký');
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: RegistrationStatus) => {
        switch (status) {
            case RegistrationStatus.APPROVED:
                return 'bg-green-100 text-green-700';
            case RegistrationStatus.REJECTED:
                return 'bg-red-100 text-red-700';
            case RegistrationStatus.PENDING:
            default:
                return 'bg-yellow-100 text-yellow-700';
        }
    };

    const getStatusText = (status: RegistrationStatus) => {
        switch (status) {
            case RegistrationStatus.APPROVED:
                return 'Đã duyệt';
            case RegistrationStatus.REJECTED:
                return 'Đã từ chối';
            case RegistrationStatus.PENDING:
            default:
                return 'Chờ duyệt';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error) {
        const isUnauthorized = error.includes('đăng nhập');

        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-4">{isUnauthorized ? '🔒' : '⚠️'}</div>
                <h2 className="text-2xl font-bold mb-2">
                    {isUnauthorized ? 'Chưa đăng nhập' : 'Có lỗi xảy ra'}
                </h2>
                <p className="text-muted-foreground mb-6">{error}</p>
                <div className="flex gap-3 justify-center">
                    {isUnauthorized ? (
                        <Link
                            href="/login"
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Đăng nhập
                        </Link>
                    ) : (
                        <button
                            onClick={fetchRegistrations}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Thử lại
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Khóa học của tôi</h1>
                <p className="text-muted-foreground mt-2">
                    Quản lý và theo dõi các đăng ký khóa học
                </p>
            </div>

            {/* Registrations List */}
            {registrations.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {registrations.map((registration) => {
                        const classItem = registration.class as Class;
                        const course = classItem.course as Course;

                        return (
                            <div
                                key={registration._id}
                                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                {/* Thumbnail */}
                                <div className="h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center overflow-hidden">
                                    {course.thumbnail ? (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-6xl">🎓</div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{course.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            {classItem.name}
                                        </p>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                                registration.status
                                            )}`}
                                        >
                                            {getStatusText(registration.status)}
                                        </span>
                                    </div>

                                    {/* Class Details */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">👨‍🏫</span>
                                            <span className="text-muted-foreground">Mentor:</span>
                                            <span className="font-medium">{classItem.mentorName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">📅</span>
                                            <span className="text-muted-foreground">Lịch:</span>
                                            <span className="font-medium">{classItem.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">📝</span>
                                            <span className="text-muted-foreground">Đăng ký:</span>
                                            <span className="font-medium">
                                                {new Date(registration.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Admin Note for Rejected */}
                                    {registration.status === RegistrationStatus.REJECTED &&
                                        registration.adminNote && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-sm text-red-700">
                                                    <span className="font-medium">Lý do từ chối:</span>{' '}
                                                    {registration.adminNote}
                                                </p>
                                            </div>
                                        )}

                                    {/* Action Button */}
                                    {registration.status === RegistrationStatus.APPROVED && (
                                        <Link
                                            href={`/learn/${classItem._id}`}
                                            className="block w-full py-2 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                                        >
                                            Vào học
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Empty State */
                <div className="text-center py-16 rounded-2xl border border-border bg-card/50">
                    <div className="text-6xl mb-4">📚</div>
                    <p className="text-lg text-muted-foreground mb-2">
                        Bạn chưa đăng ký khóa học nào
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                        Khám phá các khóa học và bắt đầu hành trình học tập của bạn
                    </p>
                    <Link
                        href="/courses"
                        className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Khám phá khóa học
                    </Link>
                </div>
            )}
        </div>
    );
}
