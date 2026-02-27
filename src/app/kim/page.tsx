"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/stores/user-store";
import { verifyKimPassword } from "./actions";

export default function KimLoginPage() {
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
      const valid = await verifyKimPassword(password);
      if (valid) {
        selectPersona("kim");
        router.push("/journal");
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
      <div className="w-full max-w-sm rounded-2xl border border-calm-border bg-calm-surface-raised p-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-calm-text">
          Kim&apos;s Account
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            className="min-h-[44px] rounded-xl border border-calm-border bg-background px-4 py-2 text-calm-text placeholder:text-calm-text-muted focus:outline-none focus:ring-2 focus:ring-calm-primary"
          />

          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="min-h-[44px] rounded-xl bg-calm-primary px-6 py-2 font-semibold text-white transition-colors duration-300 hover:bg-calm-primary/90 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter"}
          </button>
        </form>
      </div>
    </div>
  );
}
