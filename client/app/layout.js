"use client";

import "./globals.css";
import Navbar from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Hide Navbar & Sidebar on landing, login, signup, and health signup pages
  const noNavbarPages = ["/", "/auth/login", "/auth/signup", "/auth/signup/health"];
  const shouldHideNavbar = noNavbarPages.includes(pathname);

  return (
    <html lang="en">
      <body className="bg-gray-100 flex h-screen">
        {!shouldHideNavbar ? (
          <div className="flex w-full h-full">
            {/* ✅ Sidebar (Left Panel) */}
            <Sidebar />

            {/* ✅ Right Side (Navbar + Main Content) */}
            <div className="flex flex-col flex-grow h-full">
              {/* ✅ Navbar - Now extends fully to the Sidebar */}
              <Navbar />

              {/* ✅ Main Content */}
              <main className="flex-grow bg-gray-900 text-white">{children}</main>
            </div>
          </div>
        ) : (
          <main className="w-full">{children}</main>
        )}
      </body>
    </html>
  );
}
