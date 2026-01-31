'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, isAuthenticated } from '@/lib/api';
import { Course, Class, ClassStatus } from '@/types';
import { RegistrationModal } from '@/components/courses/RegistrationModal';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [myRegistrations, setMyRegistrations] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
        // Fetch user's registrations if authenticated
        if (isAuthenticated()) {
            fetchMyRegistrations();
        }
    }, [courseId]);

    const fetchMyRegistrations = async () => {
        try {
            const data = await api.getMyRegistrations();
            setMyRegistrations((data as any[]) || []);
        } catch (err) {
            // Silent fail - user might not be logged in or no registrations
            console.log('Could not fetch registrations:', err);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const [courseData, classesData] = await Promise.all([
                api.getCourse(courseId),
                api.getClasses(courseId),
            ]);
            setCourse(courseData as Course);
            setClasses(classesData as Class[]);
        } catch (err: any) {
            setError(err.message || 'Không thể tải thông tin khóa học');
        } finally {
            setLoading(false);
        }
    };

    const isUserRegistered = (classId: string): boolean => {
        return myRegistrations.some((reg: any) => {
            // Handle both populated and non-populated class field
            const regClassId = typeof reg.class === 'string' ? reg.class : reg.class?._id;
            return regClassId === classId;
        });
    };

    const handleRegisterClick = (classItem: Class) => {
        if (!isAuthenticated()) {
            router.push(`/login?redirect=/courses/${courseId}`);
            return;
        }
        setSelectedClass(classItem);
        setShowModal(true);
    };

    const handleRegistrationSuccess = () => {
        setShowModal(false);
        setSelectedClass(null);
        router.push('/dashboard/courses');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold mb-2">Có lỗi xảy ra</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <Link
                        href="/courses"
                        className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="container mx-auto px-4 py-12">
                {/* Breadcrumb */}
                <div className="mb-8">
                    <Link
                        href="/courses"
                        className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                    >
                        ← Quay lại danh sách khóa học
                    </Link>
                </div>

                {/* Course Header */}
                <div className="rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-8 md:p-12 mb-12">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                            <p className="text-lg text-muted-foreground mb-6">
                                {course.description}
                            </p>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">📚</span>
                                    <div>
                                        <div className="font-bold text-lg">{course.totalSessions}</div>
                                        <div className="text-sm text-muted-foreground">Buổi học</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">⏱️</span>
                                    <div>
                                        <div className="font-bold text-lg">{course.totalDuration} phút</div>
                                        <div className="text-sm text-muted-foreground">Thời lượng</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-80 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                            {course.thumbnail ? (
                                <img
                                    src={course.thumbnail}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-8xl">
                                    🎓
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Classes Section */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">Lớp học đang mở</h2>

                    {classes.length === 0 ? (
                        <div className="text-center py-16 rounded-2xl border border-border bg-card/50">
                            <div className="text-6xl mb-4">📅</div>
                            <p className="text-lg text-muted-foreground">
                                Hiện chưa có lớp học nào đang mở
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-6">
                            {classes.map((classItem) => {
                                const isFull = classItem.currentStudents >= classItem.maxStudents;
                                const isClosed = classItem.status === ClassStatus.CLOSED;
                                const isRegistered = isUserRegistered(classItem._id);
                                const canRegister = !isFull && !isClosed && !isRegistered;

                                return (
                                    <div
                                        key={classItem._id}
                                        className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-xl font-bold">{classItem.name}</h3>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${isRegistered
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : canRegister
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {isRegistered ? 'Đã đăng ký' : isClosed ? 'Đã đóng' : isFull ? 'Đã đủ' : 'Còn chỗ'}
                                            </span>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-lg">👨‍🏫</span>
                                                <span className="text-muted-foreground">Mentor:</span>
                                                <span className="font-medium">{classItem.mentorName}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-lg">📅</span>
                                                <span className="text-muted-foreground">Lịch học:</span>
                                                <span className="font-medium">{classItem.schedule}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-lg">🗓️</span>
                                                <span className="text-muted-foreground">Thời gian:</span>
                                                <span className="font-medium">
                                                    {new Date(classItem.startDate).toLocaleDateString('vi-VN')} -{' '}
                                                    {new Date(classItem.endDate).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-lg">👥</span>
                                                <span className="text-muted-foreground">Sĩ số:</span>
                                                <span className="font-medium">
                                                    {classItem.currentStudents}/{classItem.maxStudents} học viên
                                                </span>
                                            </div>
                                        </div>

                                        {isRegistered ? (
                                            <div className="w-full py-3 rounded-lg font-medium bg-blue-50 text-blue-700 text-center border border-blue-200">
                                                ✓ Bạn đã đăng ký lớp này
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleRegisterClick(classItem)}
                                                disabled={!canRegister}
                                                className={`w-full py-3 rounded-lg font-medium transition-colors ${canRegister
                                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                                                    }`}
                                            >
                                                {canRegister ? 'Đăng ký ngay' : 'Không thể đăng ký'}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Registration Modal */}
            {showModal && selectedClass && (
                <RegistrationModal
                    classItem={selectedClass}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedClass(null);
                    }}
                    onSuccess={handleRegistrationSuccess}
                />
            )}
        </div>
    );
}
