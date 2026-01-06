//C:\Users\studi\my-next-app\src\app\page.tsx
"use client";

import { useState } from "react";
import HeroBanner from "@/components/HeroBanner";
import RecentYoutube from "@/components/RecentYoutube";
import RecentBlogs from "@/components/RecentBlogs";
import QuotesSection from "@/components/QuotesSection";
import RegisterModal from "@/components/auth/RegisterModal";
import SigninModal from "@/components/auth/LoginModal";
import CartButton from "../components/layout/CartButton"; // adjust the path if needed

export default function Home() {
  const [showRegister, setShowRegister] = useState(false);
  const [showSignin, setShowSignin] = useState(false);

  return (
    <div className="relative">
      {/* Blurred main content when modals open */}
      <div className={`${showRegister || showSignin ? "blur-sm" : ""}`}>
        {/* Pass handlers to HeroBanner (optional if buttons there) */}
       {/* @ts-expect-error HeroBanner props not defined */}
<HeroBanner onOpenSignin={() => setShowSignin(true)} onOpenRegister={() => setShowRegister(true)} />

        <RecentYoutube />
        <RecentBlogs />
        <QuotesSection />
      </div>


      {/* Modals */}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
      {showSignin && <SigninModal onClose={() => setShowSignin(false)} />}
    </div>
  );
}
