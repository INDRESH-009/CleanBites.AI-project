"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const Navbar = ({ isSidebarOpen, setSidebarOpen }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState("/default-profile.png"); // Default image

  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(`/uploads/${storedImage}`);
    }
  }, []);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("profileImage");
    router.push("/");
  };

  return (
    <>
      {/* ✅ Mobile Header - Only Visible on Small Screens */}
      <header className="md:hidden fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md p-4 flex justify-between items-center z-50 border-b border-gray-600">
        <span className="text-xl font-bold text-white">CleanBites AI</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
          <Menu className="w-6 h-6 text-white" />
        </button>
      </header>

      {/* ✅ Desktop Header - Properly Fixed */}
      <header className="hidden md:flex fixed top-0 left-[280px] right-0 h-16 bg-black border-b border-gray-600 px-6 items-center justify-between">
        <span className="text-xl font-bold text-white">Today's Nutritional Breakdown</span>

        <div className="flex items-center gap-6">
          {/* ✅ Profile Icon - Now Always Visible */}
          <Link href="/profile">
            <Avatar className="cursor-pointer bg-gray-200 border border-gray-500 p-1">
              <AvatarImage src={profileImage} alt="User" className="rounded-full" />
              <AvatarFallback className="text-black">U</AvatarFallback>
            </Avatar>
          </Link>

          {/* ✅ Logout Button - Now Always Visible */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2 bg-gray-700 border-gray-500 hover:bg-gray-600 text-white px-4 py-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </header>

      {/* ✅ Mobile Sidebar Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/90 p-6 z-50 flex flex-col">
          <button onClick={() => setMenuOpen(false)} className="self-end p-2 text-white">
            ✕
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
