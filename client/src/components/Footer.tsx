/**
 * Red Dirt Blooms — Footer
 * Prairie Modern: Dark soil background, warm limestone text,
 * Oklahoma service area callout, wholesale link.
 */
import { Link } from "wouter";
import { Flower2, Instagram, Facebook, Youtube, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#2A1F1A] text-[#F5F0E8]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#B5451B] flex items-center justify-center">
                <Flower2 className="w-4 h-4 text-[#F5F0E8]" />
              </div>
              <div className="leading-none">
                <div className="font-heading text-[#F5F0E8] font-bold" style={{ fontSize: "1.1rem", lineHeight: 1 }}>
                  Red Dirt
                </div>
                <div className="font-heading text-[#E8A020] italic font-normal" style={{ fontSize: "0.9rem", lineHeight: 1 }}>
                  Blooms
                </div>
              </div>
            </div>
            <p className="font-body text-sm text-[#F5F0E8]/60 leading-relaxed mb-4">
              Grown from Oklahoma's red dirt. Cut with care. Delivered with love.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F5F0E8]/10 flex items-center justify-center hover:bg-[#B5451B] transition-colors">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F5F0E8]/10 flex items-center justify-center hover:bg-[#B5451B] transition-colors">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F5F0E8]/10 flex items-center justify-center hover:bg-[#B5451B] transition-colors">
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a href="mailto:hello@reddirtblooms.ai" className="w-8 h-8 rounded-full bg-[#F5F0E8]/10 flex items-center justify-center hover:bg-[#B5451B] transition-colors">
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-[#E8A020] font-semibold text-base mb-4">Explore</h4>
            <ul className="space-y-2">
              {[
                { label: "The Bloom Diary", href: "/bloom-diary" },
                { label: "What's in the Ground", href: "/whats-in-the-ground" },
                { label: "The Harvest Stand", href: "/harvest-stand" },
                { label: "Roots & Story", href: "/roots-and-story" },
                { label: "Come Find Us", href: "/come-find-us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="font-body text-sm text-[#F5F0E8]/60 hover:text-[#E8A020] transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-heading text-[#E8A020] font-semibold text-base mb-4">The Harvest Stand</h4>
            <ul className="space-y-2">
              {[
                { label: "Fresh Bouquets", href: "/harvest-stand" },
                { label: "Bloom Box Subscriptions", href: "/harvest-stand#subscriptions" },
                { label: "Bouquet Bar", href: "/bouquet-bar" },
                { label: "For Florists (Wholesale)", href: "/florist-portal" },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span className="font-body text-sm text-[#F5F0E8]/60 hover:text-[#E8A020] transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Area */}
          <div>
            <h4 className="font-heading text-[#E8A020] font-semibold text-base mb-4">Proudly Serving</h4>
            <p className="font-body text-sm text-[#F5F0E8]/60 leading-relaxed">
              Oklahoma City · Edmond · Norman · Yukon · Mustang · Choctaw · Moore · Midwest City & surrounding OKC metro communities
            </p>
            <div className="mt-4 pt-4 border-t border-[#F5F0E8]/10">
              <p className="font-accent text-[#E8A020] text-base">100% Organic</p>
              <p className="font-body text-xs text-[#F5F0E8]/40 mt-1">No chemicals. No shortcuts. Ever.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#F5F0E8]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body text-xs text-[#F5F0E8]/40">
            © {new Date().getFullYear()} Red Dirt Blooms · reddirtblooms.ai · Oklahoma Grown, Organically
          </p>
          <Link href="/florist-portal">
            <span className="font-body text-xs text-[#F5F0E8]/40 hover:text-[#E8A020] transition-colors">
              For Florists (Wholesale)
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
