import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";
import { auth, signIn, signOut } from "@/auth";

export const metadata: Metadata = {
  title: "나의 일기",
  description: "나만의 온라인 일기장",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col font-sans">
        <header className="px-4 py-2 bg-white border-b border-gray-100 flex items-center justify-between">
          <Image
            src="/암뮤니티 로고.png"
            alt="암뮤니티 로고"
            width={120}
            height={48}
            style={{ objectFit: "contain", height: "auto" }}
            priority
          />
          <div className="flex items-center gap-3">
            {session?.user ? (
              <>
                <span className="text-sm text-gray-600">{session.user.name}</span>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  로그인
                </button>
              </form>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
