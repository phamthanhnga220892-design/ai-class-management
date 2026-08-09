'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User, UserRole } from '@/types';

function getCurrentUserId(): string {
    if (typeof window === 'undefined') return '';
    try {
        const info = localStorage.getItem('user_info');
        if (!info) return '';
        const parsed = JSON.parse(info);
        return parsed.userId || parsed._id || parsed.sub || '';
    } catch {
        return '';
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentUserId, setCurrentUserId] = useState('');

    // Reset password modal state
    const [resetTarget, setResetTarget] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        setCurrentUserId(getCurrentUserId());
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.adminGetUsers();
            setUsers(data as User[]);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const handleDelete = async (user: User) => {
        const productWarning = user.productCount
            ? `\n\n⚠️ Học viên này còn ${user.productCount} sản phẩm. Xóa xong các sản phẩm đó sẽ không có chủ — vào trang Sản phẩm để gán lại cho học viên khác.`
            : '';
        if (!confirm(`Bạn có chắc muốn xóa user "${user.fullName}"?${productWarning}`)) return;
        try {
            await api.adminDeleteUser(user._id);
            setUsers((prev) => prev.filter((u) => u._id !== user._id));
            showSuccess('Đã xóa user thành công!');
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        }
    };

    const openResetModal = (user: User) => {
        setResetTarget(user);
        setNewPassword('');
        setShowPassword(false);
        setPasswordError('');
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        setSubmitting(true);
        try {
            await api.adminResetPassword(resetTarget!._id, newPassword);
            setResetTarget(null);
            showSuccess(`Đã đặt lại mật khẩu cho ${resetTarget!.fullName}!`);
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const q = search.toLowerCase();
        return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold">👥 Quản lý User</h1>
                    <p className="text-muted-foreground mt-1">{users.length} tài khoản</p>
                </div>
                <input
                    type="text"
                    placeholder="🔍 Tìm theo tên, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 border border-border rounded-lg bg-background text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </div>

            {/* Success toast */}
            {successMsg && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg">
                    ✅ {successMsg}
                </div>
            )}

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Người dùng</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vai trò</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ngày đăng ký</th>
                                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                                        Không tìm thấy user nào
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const isAdmin = user.role === UserRole.ADMIN;
                                    const isSelf = user._id === currentUserId;
                                    return (
                                        <tr key={user._id} className="hover:bg-muted/30 transition-colors">
                                            {/* Avatar + name */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                                        isAdmin
                                                            ? 'bg-primary/20 text-primary'
                                                            : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{user.fullName}</span>
                                                    {isSelf && (
                                                        <span className="text-xs text-muted-foreground">(bạn)</span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Email */}
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            {/* Role badge */}
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    isAdmin
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {isAdmin ? '🔵 Admin' : '👤 Student'}
                                                </span>
                                            </td>
                                            {/* Date */}
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            {/* Actions */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openResetModal(user)}
                                                        className="px-3 py-1.5 text-xs rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium transition-colors"
                                                    >
                                                        🔑 Reset MK
                                                    </button>
                                                    {!isSelf && (
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
                                                        >
                                                            🗑️ Xóa
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetTarget && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setResetTarget(null)}
                >
                    <div
                        className="bg-card rounded-xl max-w-sm w-full p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-1">🔑 Đặt lại mật khẩu</h2>
                        <p className="text-sm text-muted-foreground mb-5">{resetTarget.fullName}</p>

                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mật khẩu mới <span className="text-destructive">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => {
                                            setNewPassword(e.target.value);
                                            setPasswordError('');
                                        }}
                                        placeholder="Tối thiểu 6 ký tự"
                                        className="w-full px-4 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? '🙈' : '👁'}
                                    </button>
                                </div>
                                {passwordError && (
                                    <p className="text-destructive text-xs mt-1">{passwordError}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setResetTarget(null)}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted text-sm"
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium disabled:opacity-50"
                                >
                                    {submitting ? 'Đang lưu...' : 'Lưu mật khẩu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
