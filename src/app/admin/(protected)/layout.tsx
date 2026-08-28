import Link from "next/link";
import { LayoutDashboard, Landmark, ScrollText } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Container } from "@/components/Container";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/institutions", label: "Institutions", icon: Landmark },
  { href: "/admin/scrape-logs", label: "Scrape Logs", icon: ScrollText },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <Container className="flex flex-wrap items-center justify-between gap-3 py-4">
          <nav className="flex gap-1 sm:gap-2 text-sm">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium text-muted hover:text-foreground hover:bg-foreground/5 transition-colors"
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span>{session?.user?.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button className="underline hover:text-foreground">Sign out</button>
            </form>
          </div>
        </Container>
      </div>
      <Container className="py-8">{children}</Container>
    </div>
  );
}
