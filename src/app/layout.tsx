import type { Metadata, Viewport } from "next";
import { Sora, Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PageViewTracker } from "@/components/PageViewTracker";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BD Invest Hub — Compare FDR, DPS & Savings Rates in Bangladesh",
  description:
    "Compare fixed deposit (FDR), DPS, Sanchaypatro, treasury and investment organization rates across Bangladesh, and calculate your maturity amount.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a5a45",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NavBar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
        <ServiceWorkerRegister />
        <PageViewTracker />
      </body>
    </html>
  );
}
