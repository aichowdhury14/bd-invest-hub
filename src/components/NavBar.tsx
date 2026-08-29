"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, Calculator, GitCompareArrows, BrainCircuit } from "lucide-react";
import { Container } from "./Container";

const links = [
  { href: "/", label: "Home", icon: Landmark },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/insights", label: "Insights", icon: BrainCircuit },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur-md">
      <Container className="h-16 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
          <span className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl brand-gradient text-white font-display font-bold text-base sm:text-lg shadow-sm shadow-emerald-900/20 transition-transform group-hover:scale-105">
            ৳
          </span>
          <span className="font-display font-bold tracking-tight text-base sm:text-lg whitespace-nowrap">
            BD Invest Hub
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/" ? pathname === "/" : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground bg-foreground/[0.06]"
                    : "text-muted hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="hidden sm:inline">{link.label}</span>
                {isActive && (
                  <span className="absolute inset-x-2 -bottom-[1px] h-0.5 rounded-full brand-gradient" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
