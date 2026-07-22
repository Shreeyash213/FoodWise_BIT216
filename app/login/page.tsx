"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Invalid email or password."
        );
        return;
      }

      // Save user data locally
      localStorage.setItem(
        "loggedIn",
        "true"
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      router.push("/home");

    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-sage-dim/20 bg-surface p-8 shadow-xl">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <ShieldCheck size={24} />
          </div>

          <p className="text-sm uppercase tracking-[0.3em] text-gold">
            Welcome Back
          </p>

          <h1 className="mt-4 text-3xl font-bold text-paper">
            Login to FOODWISE
          </h1>

          <p className="mt-3 text-sage text-sm">
            Sign in to manage your
            inventory and reduce food
            waste.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-medium text-sage">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="you@example.com"
              required
              className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-sage">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="••••••••"
              required
              className="mt-2 w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 text-paper outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gold px-4 py-3 text-sm font-semibold text-shelf hover:brightness-110 disabled:opacity-50"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-sage-dim">
          <Link
            href="/register"
            className="hover:text-paper"
          >
            Create an Account
          </Link>

          <Link
            href="/home"
            className="flex items-center gap-2 hover:text-paper"
          >
            <ArrowLeft size={16} />
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}