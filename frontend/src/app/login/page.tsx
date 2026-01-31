
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Đăng nhập thất bại');
            }

            const data = await res.json();

            // Decode JWT to get user ID
            const token = data.access_token;
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Store token and user info with userId from JWT
            localStorage.setItem('access_token', token);
            localStorage.setItem('user_info', JSON.stringify({
                ...data.user,
                userId: payload.sub,  // Add userId from JWT payload
                sub: payload.sub,
                role: payload.role
            }));

            // Notify other components (Header) that auth state changed
            window.dispatchEvent(new Event('auth-change'));

            // Redirect to home or dashboard
            router.push('/');
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[100px] opacity-30" />

            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-xl">
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground mb-4">
                            AI
                        </div>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Chào mừng trở lại
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Đăng nhập để tiếp tục hành trình học tập
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium border border-destructive/20">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                placeholder="name@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                                Ghi nhớ đăng nhập
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-primary hover:text-primary/80">
                                Quên mật khẩu?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                "Đăng nhập"
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="font-medium text-primary hover:text-primary/80">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
