'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getUserInfo } from '@/lib/api';
import { UserRole } from '@/types';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check authentication and admin role
        const token = localStorage.getItem('access_token');
        const user = getUserInfo();

        if (!token || !user) {
            router.push('/login');
            return;
        }

        if (user.role !== UserRole.ADMIN) {
            router.push('/dashboard');
            return;
        }

        setIsAdmin(true);
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    const navLinks = [
        { href: '/admin/users', label: 'Quản lý User', icon: '👥' },
        { href: '/admin/registrations', label: 'Quản lý Đăng ký', icon: '📝' },
        { href: '/admin/classes', label: 'Quản lý Lớp học', icon: '🏫' },
        { href: '/admin/sessions', label: 'Quản lý Bài học', icon: '📚' },
        { href: '/admin/products', label: 'Sản phẩm học viên', icon: '🎨' },
    ];

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl hidden md:block h-screen sticky top-0">
                <div className="p-6 border-b border-border">
                    <h2 className="text-xl font-bold text-primary">Admin Portal</h2>
                    <p className="text-xs text-muted-foreground mt-1">Quản trị hệ thống</p>
                </div>
                <nav className="p-4 space-y-1">
                    {navLinks.map((link) => {
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
                </nav>
                <div className="absolute bottom-4 left-0 w-full px-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <span>←</span>
                        Về Dashboard
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
