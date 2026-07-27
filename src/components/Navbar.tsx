"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/attendance", label: "Attendance", icon: "📋" },
  { href: "/races", label: "Event Practice", icon: "🏅" },
  { href: "/reports", label: "Reports", icon: "🖨️" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <nav className="bg-green-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="font-bold text-lg tracking-wide">
              Hornbills
            </Link>
            <div className="hidden sm:flex gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-green-600 text-white"
                      : "text-green-100 hover:bg-green-700"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg sm:hidden z-50">
        <div className="grid grid-cols-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                pathname === link.href
                  ? "text-green-700"
                  : "text-gray-500"
              }`}
            >
              <span className="text-xl mb-0.5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
