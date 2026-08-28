import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

const links = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/institutions", label: "Institutions" },
  { href: "/admin/scrape-logs", label: "Scrape Logs" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 dark:border-white/10 pb-4">
        <nav className="flex gap-1 sm:gap-2 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm text-black/60 dark:text-white/60">
          <span>{session?.user?.email}</span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button className="underline hover:text-emerald-700 dark:hover:text-emerald-400">
              Sign out
            </button>
          </form>
        </div>
      </div>
      {children}
    </div>
  );
}
