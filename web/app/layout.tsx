import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Artinerary",
  description: "전시 큐레이션 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <SiteHeader/>
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-8">
          {children}
        </main>
        <Script id="theme-init" strategy="beforeInteractive">
  {`(function () {
  var key = 'artinary-theme-preference';
  var stored = localStorage.getItem(key);
  var preference = stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
  var isDark = preference === 'dark'
    || (preference === 'system'
      && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.dataset.theme = preference;
  root.style.colorScheme = isDark ? 'dark' : 'light';
})();`}
</Script>
      </body>
    </html>
  );
}
