
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simple auth check
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
        } else {
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <DashboardSidebar />
            <main className="flex-1 overflow-y-auto h-screen">
                {/* Mobile Header Placeholder (could be added later) */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
