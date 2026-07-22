"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to create account.");
        return;
      }

      router.push("/login");
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-sage-dim/20 bg-surface p-8 shadow-[0_24px_80px_-40px_rgba(16,24,19,0.45)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <UserPlus size={24} />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Get started</p>
          <h1 className="mt-4 text-3xl font-display text-paper">Register for FOODWISE</h1>
          <p className="mt-3 text-sage text-sm leading-relaxed">
            Create your account and invite your household to start reducing food waste together.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-sage">
            Full name
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="block text-sm font-medium text-sage">
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>
          <label className="block text-sm font-medium text-sage">
            Password
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gold px-4 py-3 text-sm font-semibold text-shelf transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-sage-dim">
          <Link href="/login" className="hover:text-paper transition">
            Already have an account?
          </Link>
          <Link href="/home" className="flex items-center gap-2 hover:text-paper transition">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
