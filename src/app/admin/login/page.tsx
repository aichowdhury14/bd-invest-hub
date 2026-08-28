"use client";

import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <Container className="py-16 sm:py-24">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="space-y-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl brand-gradient text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Admin Login</h1>
            <p className="text-sm text-muted mt-1">
              Manage institutions, rates, and view usage analytics.
            </p>
          </div>
        </div>
        <form action={formAction} className="rounded-2xl card-surface p-6 shadow-sm space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-semibold">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-end"
            />
          </div>
          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl brand-gradient px-4 py-2.5 text-white text-sm font-semibold shadow-sm hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </Container>
  );
}
