"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [error, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mt-1">
          Manage institutions, rates, and view usage analytics.
        </p>
      </div>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-emerald-700 px-4 py-2 text-white text-sm font-medium hover:bg-emerald-800 disabled:opacity-60 transition-colors"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
