"use client";

import Link from "next/link";
import { Wheat, ArrowUp, Heart, Leaf, ShieldCheck, Mail } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full border-t border-sage-dim/20 bg-shelf/90 text-sage mt-auto">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
          {/* Brand & Description Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <Wheat className="text-gold" size={24} strokeWidth={1.75} />
              <span className="font-display text-xl tracking-tight text-paper font-bold">
                FOODWISE
              </span>
            </div>
            <p className="text-sm text-sage leading-relaxed">
              Smart food & pantry management for modern households. Keep track of ingredients, eliminate food waste, and cook fresher meals every day.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold bg-surface/60 border border-sage-dim/20 rounded-full px-3 py-1.5 w-fit">
              <Leaf size={14} className="text-gold" />
              <span>For households, not warehouses</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-mono text-xs text-paper uppercase tracking-wider mb-4 font-semibold">
              Navigation
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="hover:text-gold transition-colors duration-150 inline-flex items-center gap-1.5"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-gold transition-colors duration-150 inline-flex items-center gap-1.5"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-gold transition-colors duration-150 inline-flex items-center gap-1.5"
                >
                  Register Account
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-gold transition-colors duration-150 inline-flex items-center gap-1.5"
                >
                  Pantry Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Key Features */}
          <div>
            <h3 className="font-mono text-xs text-paper uppercase tracking-wider mb-4 font-semibold">
              Features
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>
                <span>Pantry Inventory</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>
                <span>Freshness & Expiry Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>
                <span>Household Sharing</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>
                <span>Waste Reduction Insights</span>
              </li>
            </ul>
          </div>

          {/* Security & Contact */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs text-paper uppercase tracking-wider mb-4 font-semibold">
              Kitchen Promise
            </h3>
            <div className="space-y-3 text-xs text-sage">
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-gold shrink-0 mt-0.5" />
                <span>Private & local household data storage. Your pantry stays yours.</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-gold shrink-0 mt-0.5" />
                <span>Need support? Contact your household admin or system manager.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-sage-dim/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-sage-dim flex items-center gap-1">
            © {new Date().getFullYear()} FOODWISE. Crafted with{" "}
            <Heart size={12} className="text-paprika fill-paprika inline mx-0.5" /> for sustainable kitchens.
          </p>
          <div className="flex items-center gap-6">
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-sage hover:text-gold transition-colors duration-150"
              aria-label="Scroll to top"
            >
              <span>Back to top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
