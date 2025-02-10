"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, History, Search, Scan, Utensils, Apple } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar - Always Visible on Desktop */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full min-h-screen flex-col bg-black w-[280px] overflow-y-auto">
        <div className="flex h-16 items-center gap-2 border-gray-700 px-6">
          <Apple className="h-6 w-6" />
          <span className="font-bold text-white">CleanBites AI</span>
        </div>

        {/* Search Bar */}
        <div className="relative px-4 py-4">
          <Input
            placeholder="Search Foods & Ingredients"
            className="bg-black text-gray-400 border-gray-600 pl-10"
          />
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-2 px-2 flex-grow">
          <Link href="/analysis">
            <Button
              variant={pathname === "/dashboard" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <Scan className="h-4 w-4" /> Scan Food
            </Button>
          </Link>

          <Link href="/foodscan-history">
            <Button
              variant={pathname === "/foodscan-history" ? "default" : "ghost"}
              className="w-full justify-start gap-2"
            >
              <History className="h-4 w-4" /> Food Scan History
            </Button>
          </Link>

          <Button variant="ghost" className="w-full justify-start gap-2">
            <Utensils className="h-4 w-4" /> Home
          </Button>
        </nav>
      </aside>

      {/* Mobile Bottom Navbar - Only Visible on Mobile */}
      <nav className="fixed bottom-0 left-0 w-full bg-black p-4 flex justify-around border-t border-gray-700 md:hidden">
        <Link href="/foodscan-history">
          <Button
            variant={pathname === "/foodscan-history" ? "default" : "ghost"}
            className="flex flex-col items-center gap-1"
          >
            <History className="w-6 h-6 text-white" />
          </Button>
        </Link>

        <Link href="/analysis">
          <Button
            variant={pathname === "/dashboard" ? "default" : "ghost"}
            className="bg-orange-500 p-3 rounded-full flex flex-col items-center gap-1"
          >
            <Scan className="w-6 h-6 text-white" />
          </Button>
        </Link>

        <Button variant="ghost" className="flex flex-col items-center gap-1">
          <Utensils className="w-6 h-6 text-white" />
        </Button>
      </nav>
    </>
  );
}
