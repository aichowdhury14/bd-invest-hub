import { Disclaimer } from "./Disclaimer";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 space-y-3">
        <Disclaimer />
        <p className="text-xs text-black/40 dark:text-white/40">
          BD Invest Hub — an independent comparison tool, not affiliated with any bank, Bangladesh
          Bank, or investment organization listed.
        </p>
      </div>
    </footer>
  );
}
