import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "나의 일기",
  description: "나만의 온라인 일기장",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col font-sans">
        <header className="px-4 py-2 bg-white border-b border-gray-100">
          <Image
            src="/암뮤니티 로고.png"
            alt="암뮤니티 로고"
            width={120}
            height={48}
            style={{ objectFit: "contain" }}
            priority
          />
        </header>
        {children}
      </body>
    </html>
  );
}
