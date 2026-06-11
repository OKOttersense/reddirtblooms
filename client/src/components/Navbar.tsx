/**
 * Red Dirt Blooms — Navbar
 * Prairie Modern: Limestone White background, Red Dirt Rust accents,
 * Cormorant Garamond logo. Condensed nav links for desktop readability.
 * Includes Manus OAuth Log In / logged-in state with Admin link.
 */
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Flower2, KeyRound, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";

const topLevelLinks = [
  { label: "Bloom Diary", href: "/bloom-diary" },
  { label: "In the Ground", href: "/whats-in-the-ground" },
  { label: "Harvest Stand", href: "/harvest-stand" },
  { label: "Bouquet Bar", href: "/bouquet-bar" },
  { label: "Bloom Gallery", href: "/bloom-diary-gallery" },
];

const aboutUsLinks = [
  { label: "Our Story", href: "/roots-and-story" },
  { label: "Calendar", href: "/seasonal-calendar" },
  { label: "The Contestants", href: "/whats-in-ground-gallery" },
  { label: "Find Us", href: "/come-find-us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [aboutUsOpen, setAboutUsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { window.location.href = "/"; },
  });
  const userMenuRef = useRef<HTMLDivElement>(null);
  const aboutUsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (aboutUsRef.current && !aboutUsRef.current.contains(e.target as Node)) {
        setAboutUsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = user?.role === "admin";
  const displayName = user?.name || user?.email || "Account";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#F5F0E8]/95 backdrop-blur-sm shadow-sm border-b border-[#B5451B]/10"
          : "bg-[#F5F0E8]/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-[#B5451B] flex items-center justify-center flex-shrink-0">
                <Flower2 className="w-4 h-4 text-[#F5F0E8]" />
              </div>
              <div className="leading-none">
                <div
                  className="font-heading text-[#B5451B] font-bold tracking-tight"
                  style={{ fontSize: "1.25rem", lineHeight: 1 }}
                >
                  Red Dirt
                </div>
                <div
                  className="font-heading text-[#2A1F1A] italic font-normal"
                  style={{ fontSize: "1rem", lineHeight: 1 }}
                >
                  Blooms
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5">
            {/* Top-level links */}
            {topLevelLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`font-body text-sm font-medium transition-colors hover:text-[#B5451B] whitespace-nowrap ${
                    location === link.href
                      ? "text-[#B5451B]"
                      : "text-[#2A1F1A]/70"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            {/* About Us Dropdown */}
            <div className="relative" ref={aboutUsRef}>
              <button
                onClick={() => setAboutUsOpen(!aboutUsOpen)}
                className={`font-body text-sm font-medium transition-colors hover:text-[#B5451B] whitespace-nowrap flex items-center gap-1 ${
                  aboutUsLinks.some(link => location === link.href)
                    ? "text-[#B5451B]"
                    : "text-[#2A1F1A]/70"
                }`}
              >
                About Us
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aboutUsOpen ? "rotate-180" : ""}`} />
              </button>
              {aboutUsOpen && (
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[#B5451B]/10 rounded shadow-lg py-1 z-50">
                  {aboutUsLinks.map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div
                        className={`block font-body text-sm font-medium py-2.5 px-4 transition-colors ${
                          location === link.href
                            ? "bg-[#B5451B]/10 text-[#B5451B]"
                            : "text-[#2A1F1A]/70 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
                        }`}
                        onClick={() => setAboutUsOpen(false)}
                      >
                        {link.label}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Auth + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Auth: Log In or User Menu */}
            {!user ? (
              <a
                href={getLoginUrl()}
                className="hidden sm:inline-flex items-center gap-1.5 border border-[#B5451B] text-[#B5451B] hover:bg-[#B5451B] hover:text-white font-body font-semibold text-sm px-3 py-2 rounded transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Log In
              </a>
            ) : (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 border border-[#B5451B]/30 text-[#2A1F1A] hover:border-[#B5451B] font-body text-sm px-3 py-2 rounded transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#B5451B] flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="max-w-[100px] truncate">{displayName}</span>
                  <ChevronDown className="w-3 h-3 text-[#2A1F1A]/50" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#B5451B]/10 rounded shadow-lg py-1 z-50">
                    {isAdmin && (
                      <Link href="/admin">
                        <div
                          className="flex items-center gap-2 px-4 py-2 text-sm text-[#2A1F1A] hover:bg-[#B5451B]/5 hover:text-[#B5451B] cursor-pointer"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Dashboard
                        </div>
                      </Link>
                    )}
                    <button
                      onClick={() => { setUserMenuOpen(false); logoutMutation.mutate(); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#2A1F1A] hover:bg-[#B5451B]/5 hover:text-[#B5451B]"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button
              className="lg:hidden p-2 text-[#2A1F1A]"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden bg-[#F5F0E8] border-t border-[#B5451B]/10 px-4 py-4 space-y-1">
          {/* Top-level links */}
          {topLevelLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div
                className={`block font-body text-sm font-medium py-2.5 px-3 rounded transition-colors ${
                  location === link.href
                    ? "bg-[#B5451B]/10 text-[#B5451B]"
                    : "text-[#2A1F1A]/70 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
                }`}
              >
                {link.label}
              </div>
            </Link>
          ))}

          {/* About Us Section */}
          <div className="py-2">
            <button
              onClick={() => setAboutUsOpen(!aboutUsOpen)}
              className="w-full flex items-center justify-between font-body text-sm font-medium py-2.5 px-3 rounded text-[#2A1F1A]/70 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
            >
              About Us
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${aboutUsOpen ? "rotate-180" : ""}`} />
            </button>
            {aboutUsOpen && (
              <div className="pl-4 space-y-1">
                {aboutUsLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <div
                      className={`block font-body text-sm font-medium py-2.5 px-3 rounded transition-colors ${
                        location === link.href
                          ? "bg-[#B5451B]/10 text-[#B5451B]"
                          : "text-[#2A1F1A]/70 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
                      }`}
                    >
                      {link.label}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile auth */}
          <div className="pt-2 border-t border-[#B5451B]/10 mt-2">
            {!user ? (
              <a
                href={getLoginUrl()}
                className="flex items-center gap-2 font-body text-sm font-medium py-2.5 px-3 rounded text-[#B5451B] hover:bg-[#B5451B]/5"
              >
                <KeyRound className="w-4 h-4" />
                Log In
              </a>
            ) : (
              <>
                {isAdmin && (
                  <Link href="/admin">
                    <div className="flex items-center gap-2 font-body text-sm font-medium py-2.5 px-3 rounded text-[#2A1F1A]/70 hover:text-[#B5451B] hover:bg-[#B5451B]/5">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </div>
                  </Link>
                )}
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full flex items-center gap-2 font-body text-sm font-medium py-2.5 px-3 rounded text-[#2A1F1A]/70 hover:text-[#B5451B] hover:bg-[#B5451B]/5"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out ({displayName})
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
