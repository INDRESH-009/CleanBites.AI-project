"use client";

import "./globals.css";
import Navbar from "./components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname(); // Get the current route

  // Hide Navbar and padding on landing, login, signup, and health signup pages
  const noNavbarPages = ["/", "/auth/login", "/auth/signup", "/auth/signup/health"];
  const shouldHideNavbar = noNavbarPages.includes(pathname);

  return (
    <html lang="en">
      <body className="bg-gray-100">
        {!shouldHideNavbar && <Navbar />} {/* Hide Navbar if on specific pages */}
        <main className={shouldHideNavbar ? "" : "p-6"}>{children}</main> {/* Remove padding if on specific pages */}
      </body>
    </html>
  );
}
