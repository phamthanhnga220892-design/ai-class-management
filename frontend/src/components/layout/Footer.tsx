'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
    const pathname = usePathname();

    // Hide footer on portfolio pages (public sharing)
    if (pathname?.startsWith('/portfolio/')) {
        return null;
    }
    return (
        <footer className="w-full border-t border-border bg-muted/30 py-6 md:py-0">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    © 2024 <span className="font-bold">AI Academy</span>. All rights reserved.
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Link href="#courses" className="hover:text-primary transition-colors">
                        Khóa học: Kid, Teen
                    </Link>
                    <span className="hidden md:inline">|</span>
                    <a href="tel:0345119464" className="hover:text-primary transition-colors">
                        Hotline: 0345119464
                    </a>
                </div>
            </div>
        </footer>
    );
}
