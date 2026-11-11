import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Engineering Blog | Technical Writing & Systems Publishing",
  description: "A production-grade, high-performance technical publishing platform built for engineering teams.",
  openGraph: {
    title: "Engineering Blog | Technical Writing & Systems Publishing",
    description: "A production-grade, high-performance technical publishing platform built for engineering teams.",
    type: "website",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Blog | Technical Writing & Systems Publishing",
    description: "A production-grade, high-performance technical publishing platform built for engineering teams."
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-sm text-slate-500">
          <p>© {new Date().getFullYear()} Engineering Blog. Production-ready Next.js 14+ platform.</p>
        </footer>
      </body>
    </html>
  );
}
