'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Registration, RegistrationStatus, Class, Course } from '@/types';

export default function AdminRegistrationsPage() {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<RegistrationStatus | ''>('');
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        loadRegistrations();
    }, [filter]);

    const loadRegistrations = async () => {
        try {
            setLoading(true);
            const params = filter ? { status: filter } : {};
            const data = await api.getAllRegistrations(params);
            setRegistrations(data as Registration[]);
        } catch (error) {
            console.error('Failed to load registrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Bạn có chắc muốn duyệt đơn đăng ký này?')) return;

        try {
            setActionLoading(true);
            await api.approveRegistration(id);
            await loadRegistrations();
        } catch (error) {
            console.error('Failed to approve registration:', error);
            alert('Có lỗi xảy ra khi duyệt đơn đăng ký');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRegistration) return;

        try {
            setActionLoading(true);
            await api.rejectRegistration(selectedRegistration._id, adminNote);
            setRejectModalOpen(false);
            setAdminNote('');
            setSelectedRegistration(null);
            await loadRegistrations();
        } catch (error) {
            console.error('Failed to reject registration:', error);
            alert('Có lỗi xảy ra khi từ chối đơn đăng ký');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: RegistrationStatus) => {
        const styles = {
            PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
            APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
            REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
        };
        const labels = {
            PENDING: 'Chờ duyệt',
            APPROVED: 'Đã duyệt',
            REJECTED: 'Từ chối',
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
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý Đăng ký</h1>
                <p className="text-muted-foreground">Duyệt và quản lý đơn đăng ký của học viên</p>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as RegistrationStatus | '')}
                    className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Học viên
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Khóa học
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Lớp học
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Trạng thái
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Ngày đăng ký
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Hành động
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {registrations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                        Không có đơn đăng ký nào
                                    </td>
                                </tr>
                            ) : (
                                registrations.map((reg) => {
                                    const classData = reg.class as Class;
                                    if (!classData || !classData.course) return null;
                                    const courseData = classData.course as Course;
                                    return (
                                        <tr key={reg._id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-foreground">{reg.studentName}</div>
                                                    <div className="text-sm text-muted-foreground">{reg.studentPhone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {courseData.title}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">
                                                {classData.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(reg.status)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {new Date(reg.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {reg.status === RegistrationStatus.PENDING && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleApprove(reg._id)}
                                                            disabled={actionLoading}
                                                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                                                        >
                                                            Duyệt
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRegistration(reg);
                                                                setRejectModalOpen(true);
                                                            }}
                                                            disabled={actionLoading}
                                                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                                                        >
                                                            Từ chối
                                                        </button>
                                                    </div>
                                                )}
                                                {reg.status !== RegistrationStatus.PENDING && (
                                                    <span className="text-sm text-muted-foreground">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reject Modal */}
            {rejectModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-foreground mb-4">Từ chối đơn đăng ký</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Vui lòng nhập lý do từ chối (tùy chọn)
                        </p>
                        <textarea
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            placeholder="Lý do từ chối..."
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={4}
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setRejectModalOpen(false);
                                    setAdminNote('');
                                    setSelectedRegistration(null);
                                }}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {actionLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
