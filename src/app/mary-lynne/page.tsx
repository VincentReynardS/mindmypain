"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useUserStore } from "@/lib/stores/user-store";
import { verifyMaryLynnePassword } from "./actions";

export default function MaryLynneLoginPage() {
  const router = useRouter();
  const selectPersona = useUserStore((s) => s.selectPersona);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const valid = await verifyMaryLynnePassword(password);
      if (valid) {
        selectPersona("mary-lynne");
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
          Mary-Lynne&apos;s Account
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
            className="min-h-[44px] rounded-xl border border-border bg-background px-4 py-2 text-calm-text placeholder:text-calm-text-muted focus:outline-none focus:ring-2 focus:ring-calm-rose"
          />

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-calm-rose px-6 py-2 font-semibold text-white transition-colors duration-300 hover:bg-calm-rose/90 disabled:opacity-50"
          >
            <LogIn className="size-4" />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
