import Link from "next/link";
import { Landmark, Calculator, GitCompareArrows, BrainCircuit } from "lucide-react";
import { Container } from "./Container";

const links = [
  { href: "/", label: "Home", icon: Landmark },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/insights", label: "Insights", icon: BrainCircuit },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur-md">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-xl brand-gradient text-white font-display font-bold text-lg shadow-sm shadow-emerald-900/20 transition-transform group-hover:scale-105">
            ৳
          </span>
          <span className="font-display font-bold tracking-tight text-lg">BD Invest Hub</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </Container>
    </header>
  );
}
