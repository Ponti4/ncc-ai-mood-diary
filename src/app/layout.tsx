import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
