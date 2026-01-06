//C:\Users\studi\my-next-app\src\app\layout.tsx


"use client";

import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { UserProvider } from "@/context/UserContext";
import Head from "next/head";
import { usePathname } from "next/navigation";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/dashboard"); // adjust to your dashboard route

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
    >
      <Head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" />
      </Head>
      <body suppressHydrationWarning>
        <UserProvider>
          {!hideChrome && <Navbar />}
          <main className="bg-[#0A0E12] text-foreground">{children}</main>
          {!hideChrome && <Footer />}
        </UserProvider>
      </body>
    </html>
  );
}

