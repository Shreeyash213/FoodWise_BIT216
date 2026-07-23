"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-client";
import { Wheat } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      queueMicrotask(() => setAuthorized(true));
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#08120b] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-sage">
          <Wheat className="text-gold animate-pulse" size={32} />
          <p className="font-mono text-sm tracking-wide text-sage-dim">Checking authentication…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
