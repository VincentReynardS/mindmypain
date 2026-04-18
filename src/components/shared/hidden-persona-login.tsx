"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useUserStore } from "@/lib/stores/user-store";
import { verifyPersonaPassword } from "@/app/actions/verify-persona-password";
import type { AccentColor } from "@/lib/persona-config";

const accentClasses = {
  blue: { ring: "focus:ring-calm-blue", bg: "bg-calm-blue", hover: "hover:bg-calm-blue/90" },
  green: { ring: "focus:ring-calm-green", bg: "bg-calm-green", hover: "hover:bg-calm-green/90" },
  teal: { ring: "focus:ring-calm-teal", bg: "bg-calm-teal", hover: "hover:bg-calm-teal/90" },
  purple: { ring: "focus:ring-calm-purple", bg: "bg-calm-purple", hover: "hover:bg-calm-purple/90" },
  rose: { ring: "focus:ring-calm-rose", bg: "bg-calm-rose", hover: "hover:bg-calm-rose/90" },
} as const;

interface HiddenPersonaLoginProps {
  personaId: string;
  displayName: string;
  accentColor: AccentColor;
}

export function HiddenPersonaLogin({ personaId, displayName, accentColor }: HiddenPersonaLoginProps) {
  const router = useRouter();
  const selectPersona = useUserStore((s) => s.selectPersona);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const accent = accentClasses[accentColor];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const valid = await verifyPersonaPassword(personaId, password);
      if (valid) {
        selectPersona(personaId);
        router.push("/home");
      } else {
        setError("Incorrect password");
        setPassword("");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-calm-surface px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-calm-surface-raised p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-calm-text">
          {displayName}&apos;s Account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className={`min-h-[44px] rounded-xl border border-border bg-background px-4 py-2 text-calm-text placeholder:text-calm-text-muted focus:outline-none focus:ring-2 ${accent.ring}`}
          />

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl ${accent.bg} px-6 py-2 font-semibold text-white transition-colors duration-300 ${accent.hover} disabled:opacity-50`}
          >
            <LogIn className="size-4" />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
