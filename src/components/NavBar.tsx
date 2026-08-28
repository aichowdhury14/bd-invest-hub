import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/calculator", label: "Calculator" },
  { href: "/compare", label: "Compare" },
];

export function NavBar() {
  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/40 backdrop-blur sticky top-0 z-20">
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-emerald-700 dark:text-emerald-400">
          BD Invest Hub
        </Link>
        <ul className="flex items-center gap-1 sm:gap-2 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
