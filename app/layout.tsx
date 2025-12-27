import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Bate - AI-Powered Debate Platform",
  description: "Practice your debate skills with AI or compete in real-time debates with others",
  icons: {
    icon: [
      { url: '/public/e-bate-favicon.png' },
      { url: '/public/e-bate-favicon.png', sizes: 'any' }
    ],
    apple: '/public/e-bate-favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head> 
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/public/e-bate-favicon.png" />
          <link rel="apple-touch-icon" href="/public/e-bate-favicon.png" />
          <meta name="theme-color" content="#ffffff" />
          <title>E-Bate - AI Debate Platform</title>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <Navbar />
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
