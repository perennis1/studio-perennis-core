//src/components/layout/Navbar.tsx
"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RegisterModal from "@/components/auth/RegisterModal";
import SigninModal from "@/components/auth/LoginModal";
import MobileMenu from "@/components/layout/MobileMenu";
import { useUser } from "@/context/UserContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const [cartClicked, setCartClicked] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/books", label: "Books" },
    { href: "/blogs", label: "Blogs" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight * 0.9;
      setVisible(window.scrollY < heroHeight);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("cartItems") || "[]");
        setCartCount(Array.isArray(cart) ? cart.length : 0);
      } catch {
        setCartCount(0);
      }
    };
    loadCart();
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, []);

  const handleCartClick = () => {
    setCartClicked(true);
    setTimeout(() => setCartClicked(false), 300);
    router.push("/cart");
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.nav
            key="navbar"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed top-0 left-0 w-full z-50 
                    bg-[#181d25]/70 backdrop-blur-lg border-b border-[#00ADB5]/40 shadow-lg 
                    text-white transition-all duration-500"
            style={{ WebkitBackdropFilter: "blur(14px)", backdropFilter: "blur(14px)" }}
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-3 py-5 w-full">
              {/* Logo */}
              <Link
                href="/"
                className="group flex items-center space-x-2 transform transition-transform duration-300 hover:scale-105"
              >
                <Image
                  src="/logo.png"
                  alt="Studio Perennis"
                  width={80}
                  height={80}
                  priority
                  className="h-auto w-auto transition-transform duration-300 group-hover:scale-110"
                />
                <span className="text-2xl md:text-3xl font-[ClashDisplay] font-semibold tracking-wide drop-shadow-[0_2px_10px_rgba(0,173,181,0.3)]">
                  STUDIO PERENNIS
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center space-x-8">
                {navLinks.map((link) =>
                  link.label === "Courses" ? (
                    <div
                      key={link.href}
                      className="relative"
                      onMouseEnter={() => setCoursesOpen(true)}
                      onMouseLeave={() => setCoursesOpen(false)}
                    >
                      <span
                        className={`
                          text-sm uppercase tracking-wider cursor-pointer px-1 py-0.5 transition-colors duration-150
                          ${pathname.startsWith("/courses") ? "text-[#00ADB5]" : "text-white"} 
                          hover:text-[#00ADB5]
                        `}
                      >
                        Courses
                      </span>
                      {coursesOpen && (
                        <>
                          <div
                            className="absolute left-0 top-full w-48 h-2 z-40"
                            style={{ pointerEvents: "none" }}
                          />
                          <div className="absolute left-0 top-full mt-0 flex flex-col bg-[#181d25] bg-opacity-95 border border-[#00ADB5]/20 rounded-lg shadow-xl z-50 min-w-[160px] w-48">
                            <Link
                              href="/courses"
                              className="px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-[#00ADB5]/10 rounded transition"
                            >
                              All Courses
                            </Link>
                            <Link
                              href="/courses"
                              className="px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-[#00ADB5]/10 rounded transition"
                            >
                              Code (coming soon)
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative group text-sm uppercase tracking-wider font-[Manrope] transform transition-transform duration-200 hover:text-[#00ADB5] hover:scale-105 ${
                        pathname === link.href ||
                        (link.href !== "/" && pathname?.startsWith(link.href))
                          ? "text-[#00ADB5]"
                          : "text-white"
                      }`}
                    >
                      {link.label}
                      <span
                        className={`absolute left-1/2 -bottom-1 h-[1px] transition-all duration-300 origin-center transform translate-x-[-50%] ${
                          pathname === link.href ||
                          (link.href !== "/" && pathname?.startsWith(link.href))
                            ? "w-full bg-[#00ADB5] opacity-100 left-0 translate-x-0"
                            : "w-0 bg-white opacity-0 group-hover:w-full group-hover:left-0 group-hover:opacity-100"
                        }`}
                      />
                    </Link>
                  )
                )}

                {/* User/Auth area */}
                {user ? (
                  <div className="flex items-center gap-3" ref={dropdownRef}>
                    <div className="relative">
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 cursor-pointer group"
                        title={user.name}
                      >
                        <img
                          src={user.avatar || "/default-avatar.png"}
                          alt="User Avatar"
                          className="w-8 h-8 rounded-full border border-[#00ADB5]/20 shadow-[0_4px_16px_-4px_#00adb540] group-hover:scale-105 transition-transform"
                        />
                        <span className="text-white font-medium group-hover:text-[#00ADB5] transition-colors">
  {user.name?.split(" ")[0] ?? user.name ?? "User"}
</span>

                      </button>
                      <AnimatePresence>
                        {showDropdown && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-40 bg-[#111] border border-[#00ADB5]/20 rounded-lg shadow-lg overflow-hidden z-50"
                          >
                            <button
                              onClick={() => {
                                setShowDropdown(false);
                                if (user.isAdmin) {
                                  router.push("/admin");
                                } else {
                                  router.push("/dashboard/overview");
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#00ADB5]/20 transition"
                            >
                              Dashboard
                            </button>
                            <button
                              onClick={() => {
                                setShowDropdown(false);
                                logout();
                                router.push("/");
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20 transition"
                            >
                              Logout
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      onClick={handleCartClick}
                      whileTap={{ scale: 0.9 }}
                      className="relative p-2 rounded-full hover:bg-white/10 transition"
                      aria-label="Cart"
                    >
                      {cartClicked && (
                        <span className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
                      )}
                      <ShoppingCart className="w-6 h-6 text-white" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowLogin(true)}
                      className="border border-white/30 px-4 py-1 rounded-lg hover:bg.white/10 transition text-white"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setShowRegister(true)}
                      className="border border-[#00ADB5] px-4 py-1 rounded-lg hover:bg-[#00ADB5]/20 text-[#00ADB5] transition"
                    >
                      Sign Up
                    </button>
                    <motion.button
                      onClick={handleCartClick}
                      whileTap={{ scale: 0.9 }}
                      className="relative p-2 rounded-full hover:bg-white/10 transition"
                      aria-label="Cart"
                    >
                      {cartClicked && (
                        <span className="absolute inset-0 bg.white/20 rounded-full animate-ping" />
                      )}
                      <ShoppingCart className="w-6 h-6 text-white" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </motion.button>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="md:hidden text-white"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* -- MOBILE MENU -- */}
      <MobileMenu
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        navLinks={navLinks}
        openLogin={() => {
          setShowLogin(true);
          setIsOpen(false);
        }}
        openRegister={() => {
          setShowRegister(true);
          setIsOpen(false);
        }}
      />

      {/* Modals */}
      {showRegister && <RegisterModal onClose={() => setShowRegister(false)} />}
      {showLogin && <SigninModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
