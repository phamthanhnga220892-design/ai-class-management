import Link from 'next/link';

export default function PortfolioLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            {/* Public Header - No user info */}
            <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-sm">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
                            AI
                        </div>
                        <span className="text-xl font-bold">AI Academy</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                            Đăng nhập
                        </Link>
                        <Link href="/register">
                            <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                                Đăng ký
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Page Content */}
            {children}
        </div>
    );
}
