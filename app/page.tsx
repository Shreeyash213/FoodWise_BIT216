"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Wheat } from "lucide-react";
import HeroShelf from "@/components/HeroShelf";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    try {
      const logged = localStorage.getItem("loggedIn");
      if (logged === "true") {
        router.push("/dashboard");
      }
    } catch {
      // ignore
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between">
      <div className="flex-1">
        <header className="flex items-center justify-between px-6 md:px-10 py-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <Wheat className="text-gold" size={22} strokeWidth={1.75} />
            <span className="font-display text-xl tracking-tight text-paper">FOODWISE</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-sage-dim bg-transparent px-4 py-2 text-sm font-medium text-paper transition hover:bg-surface-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-shelf transition hover:brightness-110"
            >
              Register
            </Link>
          </div>
        </header>

        <section className="px-6 md:px-10 max-w-6xl mx-auto pt-8 md:pt-14 pb-16 md:pb-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="label-stamp font-mono text-[11px] text-gold mb-4">
              For households, not warehouses
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.4rem] leading-[1.05] text-paper">
              Know what&apos;s in your kitchen <span className="italic text-gold">before</span> it goes off.
            </h1>
            <p className="text-sage text-base md:text-lg mt-6 max-w-md leading-relaxed">
              FOODWISE helps families keep track of food, reduce waste, and cook with the freshest ingredients first.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              <p className="rounded-full bg-shelf/70 py-3 px-4 text-sm text-sage">
                Discover smarter kitchen management, waste reduction, and meal planning.
              </p>
            </div>
          </div>
          <HeroShelf />
        </section>

        <section className="px-6 md:px-10 max-w-6xl mx-auto pb-14">
          <div className="rounded-3xl border border-sage-dim/20 bg-surface p-8 shadow-[0_24px_80px_-40px_rgba(16,24,19,0.45)]">
            <div className="grid gap-6 md:grid-cols-2 items-center">
              <div>
                <p className="text-paper font-semibold text-lg">Start your FOODWISE journey</p>
                <p className="mt-3 text-sm text-sage leading-relaxed max-w-md">
                  Sign in to manage your kitchen, or register a new household to get started.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="rounded-full border border-gold bg-gold px-5 py-3 text-sm font-medium text-shelf transition hover:brightness-110"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full border border-sage-dim bg-transparent px-5 py-3 text-sm font-medium text-paper transition hover:bg-surface-2"
                  >
                    Register
                  </Link>
                </div>
                <span className="font-mono text-xs text-sage-dim">Already have an account? Login now.</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
