
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Đăng ký thất bại');
            }

            setSuccess(true);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-xl text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4 animate-bounce">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Đăng ký thành công!
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                        Chào mừng bạn đến với AI Academy. <br />
                        Đang chuyển hướng đến trang đăng nhập...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[100px] opacity-30" />

            <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 shadow-xl">
                <div className="text-center">
                    <Link href="/" className="inline-block">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-2xl font-bold text-primary-foreground mb-4">
                            AI
                        </div>
                    </Link>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">
                        Tạo tài khoản mới
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Bắt đầu hành trình khám phá AI ngay hôm nay
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
                            <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                                Họ và tên
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                autoComplete="name"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
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
                                autoComplete="new-password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                placeholder="Tối thiểu 6 ký tự"
                            />
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
                                    Đang đăng ký...
                                </span>
                            ) : (
                                "Đăng ký tài khoản"
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm">
                    <p className="text-muted-foreground">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
