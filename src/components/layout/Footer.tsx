"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Send, Youtube, MessageCircle } from "lucide-react";


export default function Footer() {
  return (
    <footer
      className="relative bg-cover bg-center text-white py-5 px-5 md:px-20"
      style={{
        backgroundImage: "url('/myfooter.jpg')",
      }}
    >
      {/* Overlay for dark gradient */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
        {/* Logo Section */}
        <div className="space-y-3">
          <Image
  src="/logo.png"
  alt="Studio Perennis"
  width={80}
  height={80}
  priority
  className="h-auto w-auto transition-transform duration-300 group-hover:scale-110"
/>

          <h3 className="text-lg tracking-[0.3em] uppercase">Studio</h3>
          <h2 className="text-4xl font-semibold tracking-wider">PERENNIS</h2>
        </div>

        {/* Office Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3 tracking-wider uppercase">
            Office
          </h3>
          <p className="text-sm leading-6 text-gray-300">
            165A Yamaha Vihar <br />
            Sector 49 <br />
            Noida (201301) <br />
            GBN
          </p>
          <p className="mt-3 text-sm text-gray-300">
            studioperennis@gmail.com
          </p>
          <p className="text-sm text-gray-300 mt-1">+91 9319548708</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold mb-3 tracking-wider uppercase">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/" className="hover:text-white transition">Home</Link></li>
            <li><Link href="/services" className="hover:text-white transition">Services</Link></li>
            <li><Link href="/about" className="hover:text-white transition">About</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
          </ul>
        </div>

        {/* Legal & Criticise */}
        <div>
          <h3 className="text-sm font-semibold mb-3 tracking-wider uppercase">
            Legal & Press
          </h3>
          <ul className="space-y-2 text-sm text-gray-300 mb-4">
            <li>
              <Link href="/privacy" className="hover:text-white transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition">
                Terms & Conditions
              </Link>
            </li>
          </ul>

          {/* Criticise Form */}
          <h3 className="text-sm font-semibold mb-2 tracking-wider uppercase">
            Criticise Us
          </h3>
          <div className="flex items-center">
            <input
              type="text"
              placeholder=""
              className="w-full bg-transparent border border-white/50 px-3 py-2 text-sm outline-none focus:border-white"
            />
            <button className="ml-2 bg-white text-black text-xs font-semibold px-3 py-2 rounded-sm hover:bg-gray-200 transition">
              CRITICISE
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative z-10 border-t border-white/20 my-8"></div>

      {/* Bottom Row */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between text-sm text-gray-300">
        <p className="mb-3 md:mb-0"> © studioperennis. All Rights Reserved.</p>
        <div className="flex space-x-6">
          <Link href="#" aria-label="Instagram">
            <Instagram className="w-5 h-5 hover:text-white transition" />
          </Link>
          <Link href="#" aria-label="Telegram">
            <Send className="w-5 h-5 hover:text-white transition" />
          </Link>
          <Link href="#" aria-label="YouTube">
            <Youtube className="w-5 h-5 hover:text-white transition" />
          </Link>
          <Link href="#" aria-label="WhatsApp">
            <MessageCircle className="w-5 h-5 hover:text-white transition" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
