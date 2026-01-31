'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Class } from '@/types';

interface RegistrationModalProps {
    classItem: Class;
    onClose: () => void;
    onSuccess: () => void;
}

export function RegistrationModal({ classItem, onClose, onSuccess }: RegistrationModalProps) {
    const [formData, setFormData] = useState({
        studentName: '',
        studentPhone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingProfile, setLoadingProfile] = useState(true);

    // Fetch user profile to auto-fill form
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await api.getProfile() as any;
                console.log('📋 Profile data received:', profile);
                setFormData({
                    studentName: profile.fullName || '',
                    studentPhone: profile.phone || '',
                });
                console.log('✅ Form data set:', { studentName: profile.fullName, studentPhone: profile.phone });
            } catch (err) {
                console.error('❌ Failed to load profile:', err);
                // Continue with empty form if profile fetch fails
            } finally {
                setLoadingProfile(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.createRegistration({
                classId: classItem._id,
                studentName: formData.studentName,
                studentPhone: formData.studentPhone,
                parentName: formData.studentName, // Use student name as parent name
                parentPhone: formData.studentPhone, // Use student phone as parent phone
            });
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Không thể gửi đăng ký. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-2xl border border-border max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold">Đăng ký lớp học</h2>
                        <button
                            onClick={onClose}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{classItem.name}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
                            {error}
                        </div>
                    )}

                    {loadingProfile ? (
                        <div className="text-center py-8">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Đang tải thông tin...</p>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="studentName" className="block text-sm font-medium mb-2">
                                    Họ tên <span className="text-destructive">*</span>
                                </label>
                                <input
                                    id="studentName"
                                    name="studentName"
                                    type="text"
                                    required
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label htmlFor="studentPhone" className="block text-sm font-medium mb-2">
                                    Số điện thoại <span className="text-destructive">*</span>
                                </label>
                                <input
                                    id="studentPhone"
                                    name="studentPhone"
                                    type="tel"
                                    required
                                    value={formData.studentPhone}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="0912345678"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">Lưu ý:</span> Thông tin được lấy từ hồ sơ của bạn. Sau khi gửi đăng ký, bạn sẽ nhận được thông báo qua email khi đơn đăng ký được duyệt.
                                </p>
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-muted transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Đang gửi...
                                </span>
                            ) : (
                                'Gửi đăng ký'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
