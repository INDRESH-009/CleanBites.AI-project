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
      <body className="bg-gray-100 flex h-screen relative">
        {!shouldHideNavbar && <Sidebar />} {/* ✅ Sidebar stays fixed */}

        {/* ✅ Main Content Area - Adjusts for Sidebar */}
        <div className={`flex flex-col flex-grow h-full overflow-y-auto ${!shouldHideNavbar ? "md:ml-[280px]" : ""}`}>
          {!shouldHideNavbar && <Navbar />}

          {/* ✅ Content Scrolls Independently */}
          <main className="flex-grow bg-[#171818] text-white overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
