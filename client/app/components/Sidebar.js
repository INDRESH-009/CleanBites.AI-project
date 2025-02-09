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
      {/* ✅ Sidebar for Desktop - Always Visible */}
      <aside className="h-full min-h-screen flex flex-col border-r border-gray-700 bg-black w-[280px] hidden md:flex">
        <div className="flex h-16 items-center gap-2 border-gray-700 px-6">
          <Apple className="h-6 w-6" />
          <span className="font-bold text-white">CleanBites AI</span>
        </div>

        {/* ✅ Search Bar */}
        <div className="relative px-4 py-4">
          <Input
            placeholder="Search Foods & Ingredients"
            className="bg-black text-gray-400 border-gray-600 pl-10"
          />
        </div>

        {/* ✅ Sidebar Navigation */}
        <nav className="space-y-2 px-2 flex-grow">
          <Link href="/dashboard">
            <Button variant={pathname === "/dashboard" ? "default" : "ghost"} className="w-full justify-start gap-2">
              <Scan className="h-4 w-4" /> Scan Food
            </Button>
          </Link>

          <Link href="/foodscan-history">
            <Button variant={pathname === "/foodscan-history" ? "default" : "ghost"} className="w-full justify-start gap-2">
              <History className="h-4 w-4" /> Food Scan History
            </Button>
          </Link>

          <Button variant="ghost" className="w-full justify-start gap-2">
            <Utensils className="h-4 w-4" /> Meal Recommendations
          </Button>
        </nav>
      </aside>
    </>
  );
}
