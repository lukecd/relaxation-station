import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Dela_Gothic_One } from 'next/font/google';

const delaGothic = Dela_Gothic_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "To Pause In Preignac",
  description: "A meditative audio experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={delaGothic.className}>{children}</body>
    </html>
  );
}
