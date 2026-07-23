"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export default function PasswordInput({
  label,
  error,
  containerClassName = "",
  className = "",
  id,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={containerClassName}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-sage mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          id={id}
          type={showPassword ? "text" : "password"}
          className={`w-full rounded-2xl border border-sage-dim/20 bg-shelf/70 px-4 py-3 pr-12 text-paper outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sage-dim hover:text-paper focus:outline-none transition p-1.5 rounded-lg hover:bg-surface/50"
          aria-label={showPassword ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff size={18} className="text-gold" />
          ) : (
            <Eye size={18} className="text-sage-dim hover:text-paper" />
          )}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
