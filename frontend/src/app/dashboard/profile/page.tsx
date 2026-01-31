'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getUserInfo } from '@/lib/api';
import { User } from '@/types';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const userInfo = getUserInfo();
        if (userInfo) {
            setUser(userInfo);
            setFormData({
                fullName: userInfo.fullName || '',
                phone: userInfo.phone || '',
            });
        }
        setLoading(false);
    }, [router]);

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);
            await api.updateProfile(formData);

            // Update local user info
            const updatedUser = { ...user, ...formData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            setIsEditing(false);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phone: user.phone || '',
            });
        }
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground mb-2">Hồ sơ cá nhân</h1>
                <p className="text-muted-foreground">Quản lý thông tin tài khoản của bạn</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
                <div className="space-y-6">
                    {/* Full Name - Editable */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Họ và tên
                        </label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        ) : (
                            <p className="px-4 py-3 bg-muted rounded-lg text-foreground">{user.fullName}</p>
                        )}
                    </div>

                    {/* Email - Read Only */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Email
                        </label>
                        <p className="px-4 py-3 bg-muted/50 rounded-lg text-muted-foreground border border-border/50">
                            {user.email}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Email không thể thay đổi</p>
                    </div>

                    {/* Phone - Editable */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Số điện thoại
                        </label>
                        {isEditing ? (
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        ) : (
                            <p className="px-4 py-3 bg-muted rounded-lg text-foreground">{user.phone}</p>
                        )}
                    </div>

                    {/* Role - Read Only */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Vai trò
                        </label>
                        <p className="px-4 py-3 bg-muted/50 rounded-lg text-muted-foreground border border-border/50">
                            {user.role === 'ADMIN' ? 'Quản trị viên' : 'Học viên'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Vai trò không thể thay đổi</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={saving}
                                className="flex-1 px-4 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                Hủy
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Chỉnh sửa thông tin
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
