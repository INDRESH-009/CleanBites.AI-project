"use client";

import { Button } from "@/components/ui/button";
import { Home, History, Scan, Utensils } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed border-r border-gray-700 top-0 left-0 h-full min-h-screen flex-col bg-black w-[280px] overflow-y-auto">
      {/* Header with image logo */}
      <div className="flex h-18 items-center border-gray-700 px-6">
        <Image 
          src="/cleanbites-trans.svg" 
          alt="CleanBites AI Logo" 
          width={200} 
          height={200} 
          className="object-contain mt-4 mb-2" 
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
              <div style={{ width: "25px", height: "25px" }} className="flex items-center justify-center">
                <Scan style={{ width: "25px", height: "25px" }} className="text-white" />
              </div>
              <span className="text-lg text-white">Scan Food</span>
            </Button>
          </Link>

          <Link href="/foodscan-history">
            <Button
              variant={pathname === "/foodscan-history" ? "default" : "ghost"}
              className="w-full justify-start gap-2 px-4"
            >
              <div style={{ width: "25px", height: "25px" }} className="flex items-center justify-center">
                <History style={{ width: "25px", height: "25px" }} className="text-white" />
              </div>
              <span className="text-lg text-white">Food Scan History</span>
            </Button>
          </Link>

          <Button variant="ghost" className="w-full justify-start gap-2 px-4">
            <div style={{ width: "25px", height: "25px" }} className="flex items-center justify-center">
              <Home style={{ width: "25px", height: "25px" }} className="text-white" />
            </div>
            <span className="text-lg text-white">Home</span>
          </Button>
        </nav>
      </div>

      {/* Mobile Bottom Navbar */}
      <nav className="fixed bottom-0 left-0 w-full bg-black p-4 flex justify-around border-t border-gray-700 md:hidden">
        <Link href="/foodscan-history">
          <Button
            variant={pathname === "/foodscan-history" ? "default" : "ghost"}
            className="flex flex-col items-center gap-1"
          >
            <History style={{ width: "25px", height: "25px" }} className="text-white" />
          </Button>
        </Link>

        <Link href="/analysis">
          <Button
            variant={pathname === "/dashboard" ? "default" : "ghost"}
            className="bg-orange-500 p-3 rounded-full flex flex-col items-center gap-1"
          >
            <Scan style={{ width: "25px", height: "25px" }} className="text-white" />
          </Button>
        </Link>

        <Button variant="ghost" className="flex flex-col items-center gap-1">
          <Utensils style={{ width: "25px", height: "25px" }} className="text-white" />
        </Button>
      </nav>
    </aside>
  );
}
