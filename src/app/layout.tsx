import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { HOUSE, HOUSE_FULL } from "@/lib/config";

export const metadata: Metadata = {
  title: `${HOUSE_FULL}`,
  description: `Athletics management for ${HOUSE} house`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 pb-24 sm:pb-6">
          {children}
        </main>
      </body>
    </html>
  );
}
