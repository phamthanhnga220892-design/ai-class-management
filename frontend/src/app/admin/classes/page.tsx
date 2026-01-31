'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Class, Course, ClassStatus } from '@/types';

export default function AdminClassesPage() {
    const router = useRouter();
    const [classes, setClasses] = useState<Class[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [formData, setFormData] = useState({
        courseId: '',
        name: '',
        mentorName: '',
        startDate: '',
        endDate: '',
        schedule: '',
        maxStudents: 15,
        status: ClassStatus.OPEN,
    });
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [classesData, coursesData] = await Promise.all([
                api.getClasses(),
                api.getCourses(),
            ]) as [Class[], Course[]];
            setClasses(classesData);
            setCourses(coursesData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditingClass(null);
        setFormData({
            courseId: courses[0]?._id || '',
            name: '',
            mentorName: '',
            startDate: '',
            endDate: '',
            schedule: '',
            maxStudents: 15,
            status: ClassStatus.OPEN,
        });
        setModalOpen(true);
    };

    const openEditModal = (classData: Class) => {
        setEditingClass(classData);
        const courseId = typeof classData.course === 'string' ? classData.course : classData.course._id;
        setFormData({
            courseId,
            name: classData.name,
            mentorName: classData.mentorName,
            startDate: classData.startDate.split('T')[0],
            endDate: classData.endDate?.split('T')[0] || '',
            schedule: classData.schedule || '',
            maxStudents: classData.maxStudents,
            status: classData.status,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            if (editingClass) {
                await api.updateClass(editingClass._id, formData);
            } else {
                await api.createClass(formData);
            }
            setModalOpen(false);
            await loadData();
        } catch (error) {
            console.error('Failed to save class:', error);
            alert('Có lỗi xảy ra khi lưu lớp học');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa lớp học này?')) return;

        try {
            setActionLoading(true);
            await api.deleteClass(id);
            await loadData();
        } catch (error) {
            console.error('Failed to delete class:', error);
            alert('Có lỗi xảy ra khi xóa lớp học');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: ClassStatus) => {
        const styles = {
            OPEN: 'bg-green-500/10 text-green-500 border-green-500/20',
            CLOSED: 'bg-red-500/10 text-red-500 border-red-500/20',
            ONGOING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            COMPLETED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
        };
        const labels = {
            OPEN: 'Đang mở',
            CLOSED: 'Đã đóng',
            ONGOING: 'Đang học',
            COMPLETED: 'Hoàn thành',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Lớp học</h1>
                    <p className="text-muted-foreground">Tạo và quản lý các lớp học</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    + Tạo lớp học mới
                </button>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Tên lớp
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Khóa học
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Mentor
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Ngày bắt đầu
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Học viên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {classes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                        Chưa có lớp học nào
                                    </td>
                                </tr>
                            ) : (
                                classes.map((classData) => {
                                    const courseData = classData.course as Course;
                                    return (
                                        <tr key={classData._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {classData.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {courseData.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {classData.mentorName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(classData.startDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {classData.currentStudents}/{classData.maxStudents}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(classData.status)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => router.push(`/admin/classes/${classData._id}`)}
                                                        className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                                                    >
                                                        Chi tiết
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(classData)}
                                                        disabled={actionLoading}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                                                    >
                                                        Sửa
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(classData._id)}
                                                        disabled={actionLoading}
                                                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-foreground mb-6">
                            {editingClass ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Khóa học *
                                </label>
                                <select
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    {courses.map((course) => (
                                        <option key={course._id} value={course._id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Tên lớp *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Ví dụ: Lớp AI Kid K01 - Tháng 1/2026"
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Mentor *
                                </label>
                                <input
                                    type="text"
                                    value={formData.mentorName}
                                    onChange={(e) => setFormData({ ...formData, mentorName: e.target.value })}
                                    required
                                    placeholder="Tên mentor"
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Ngày bắt đầu *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Ngày kết thúc
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Lịch học
                                </label>
                                <input
                                    type="text"
                                    value={formData.schedule}
                                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                    placeholder="Ví dụ: Thứ 7, 9:00-11:00"
                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Số học viên tối đa *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.maxStudents}
                                        onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
                                        required
                                        min="1"
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                        Trạng thái *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as ClassStatus })}
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value={ClassStatus.OPEN}>Đang mở</option>
                                        <option value={ClassStatus.ONGOING}>Đang học</option>
                                        <option value={ClassStatus.CLOSED}>Đã đóng</option>
                                        <option value={ClassStatus.COMPLETED}>Hoàn thành</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? 'Đang lưu...' : (editingClass ? 'Cập nhật' : 'Tạo lớp học')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
