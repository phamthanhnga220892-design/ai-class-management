'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user_info');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse user info", e);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        // Check immediately on mount
        checkUser();

        // Listen for custom auth-change event (from Login/Register pages)
        window.addEventListener('auth-change', checkUser);

        // Listen for storage events (cross-tab sync)
        window.addEventListener('storage', checkUser);

        return () => {
            window.removeEventListener('auth-change', checkUser);
            window.removeEventListener('storage', checkUser);
        };
    }, []);

    // Hide header on portfolio pages (public sharing)
    if (pathname?.startsWith('/portfolio/')) {
        return null;
    }

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_info');
        // Dispatch event for other listeners
        window.dispatchEvent(new Event('auth-change'));

        setUser(null);
        setIsMenuOpen(false);
        router.push('/');
        router.refresh();
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* LOGO */}
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                            AI
                        </div>
                        <span className="hidden text-xl font-bold sm:inline-block">
                            AI Academy
                        </span>
                    </Link>
                </div>

                {/* NAVIGATION */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/courses" className="hover:text-primary transition-colors">
                        Khóa học
                    </Link>
                    <Link href="/#mentors" className="hover:text-primary transition-colors">
                        Mentor
                    </Link>
                    <Link href="/#testimonials" className="hover:text-primary transition-colors">
                        Cảm nhận
                    </Link>
                </nav>

                {/* ACTIONS */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 hover:bg-muted p-2 rounded-lg transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{user.fullName}</span>
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 py-1 focus:outline-none border border-border">

                                    {user.role === 'ADMIN' ? (
                                        <Link
                                            href="/admin/classes"
                                            className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Quản trị
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/dashboard"
                                            className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Khóa học của tôi
                                        </Link>
                                    )}
                                    <Link
                                        href="/dashboard/profile"
                                        className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Hồ sơ cá nhân
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium hover:text-primary hidden sm:block">
                                Đăng nhập
                            </Link>
                            <Link href="/register">
                                <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors">
                                    Ghi danh
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
