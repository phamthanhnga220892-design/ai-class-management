
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUserInfo } from '@/lib/api';
import { UserRole } from '@/types';

export function DashboardSidebar() {
    const pathname = usePathname();
    const [userRole, setUserRole] = useState<UserRole | null>(null);

    useEffect(() => {
        const user = getUserInfo();
        if (user) {
            setUserRole(user.role);
        }
    }, []);

    const menuItems = [
        { href: '/dashboard', label: 'Tổng quan', icon: '📊' },
        { href: '/dashboard/courses', label: 'Khóa học của tôi', icon: '📚' },
        { href: '/dashboard/products', label: 'Sản phẩm của tôi', icon: '🎨' },
        { href: '/dashboard/profile', label: 'Hồ sơ cá nhân', icon: '👤' },
    ];

    const adminLinks = [
        { href: '/admin/registrations', label: 'Quản lý Đăng ký', icon: '📝' },
        { href: '/admin/classes', label: 'Quản lý Lớp học', icon: '🏫' },
        { href: '/admin/sessions', label: 'Quản lý Bài học', icon: '📖' },
    ];

    return (
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl hidden md:block h-screen sticky top-0">
            <nav className="p-4 pt-6 space-y-1">
                {menuItems.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                        >
                            <span className="text-lg">{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}

                {/* Admin Section */}
                {userRole === UserRole.ADMIN && (
                    <>
                        <div className="pt-4 pb-2">
                            <div className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Quản trị
                            </div>
                        </div>
                        {adminLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <span className="text-lg">{link.icon}</span>
                                    {link.label}
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>
            <div className="absolute bottom-4 left-0 w-full px-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10">
                    <h4 className="font-bold text-primary mb-1">Cần hỗ trợ?</h4>
                    <p className="text-xs text-muted-foreground mb-3">Liên hệ ngay với đội ngũ Mentor.</p>
                    <button className="w-full py-2 bg-background border border-border rounded-lg text-xs font-medium hover:bg-muted transition-colors">
                        Liên hệ
                    </button>
                </div>
            </div>
        </aside>
    );
}
