import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PageViewTracker } from "@/components/PageViewTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
  themeColor: "#047857",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-8">{children}</main>
        <Footer />
        <ServiceWorkerRegister />
        <PageViewTracker />
      </body>
    </html>
  );
}
