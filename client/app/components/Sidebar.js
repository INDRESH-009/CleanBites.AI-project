"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, History, Scan, Utensils } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed border-r border-gray-700 top-0 left-0 h-full min-h-screen flex-col bg-black w-[280px] overflow-y-auto">
      {/* Header stays at the top with the logo image */}
      <div className="flex h-16 items-center px-6 border-gray-700">
        <Image 
          src="/cleanbites-trans.svg" 
          alt="CleanBites AI Logo" 
          width={200} 
          height={200} 
          className="object-contain mt-6" 
        />
      </div>

      {/* Wrapper that centers nav items vertically */}
      <div className="flex flex-col flex-grow justify-center">
        <nav className="flex flex-col space-y-2 px-2">
          <Link href="/analysis">
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              className="w-full justify-start gap-2 px-4"
            >
              <div className="w-8 flex items-center justify-center">
                <Scan className="h-4 w-4" />
              </div>
              <span>Scan Food</span>
            </Button>
          </Link>

          <Link href="/foodscan-history">
            <Button
              variant={pathname === "/foodscan-history" ? "default" : "ghost"}
              className="w-full justify-start gap-2 px-4"
            >
              <div className="w-8 flex items-center justify-center">
                <History className="h-4 w-4" />
              </div>
              <span>Food Scan History</span>
            </Button>
          </Link>

          <Link href="/dashboard">
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              className="w-full justify-start gap-2 px-4"
            >
              <div className="w-8 flex items-center justify-center">
                <Home className="h-4 w-4" />
              </div>
              <span>Home</span>
            </Button>
          </Link>
        </nav>
      </div>

      {/* Mobile Bottom Navbar remains unchanged */}
      <nav className="fixed bottom-0 left-0 w-full bg-black p-4 flex justify-around border-t border-gray-700 md:hidden">
        <Link href="/foodscan-history">
          <Button
            variant={pathname === "/foodscan-history" ? "default" : "ghost"}
            className="flex flex-col items-center gap-1"
          >
            <History className="w-10 h-10 text-white" />
          </Button>
        </Link>

        <Link href="/analysis">
          <Button
            variant={pathname === "/dashboard" ? "default" : "ghost"}
            className="bg-orange-500 p-4 rounded-full flex flex-col items-center gap-1"
          >
            <Scan className="w-10 h-10 text-white" />
          </Button>
        </Link>

        <Button variant="ghost" className="flex flex-col items-center gap-1">
          <Utensils className="w-10 h-10 text-white" />
        </Button>
      </nav>
    </aside>
  );
}
