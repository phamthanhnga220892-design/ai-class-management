import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "AI Academy - Đánh thức tiềm năng AI",
  description: "Hệ thống quản lý lớp học và đào tạo AI dành cho thế hệ trẻ.",
};

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

// ... existing code ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
