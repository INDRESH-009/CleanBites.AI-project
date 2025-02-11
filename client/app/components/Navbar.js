"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";

const Navbar = ({ isSidebarOpen, setSidebarOpen }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false); // (Unused in mobile now)
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(`/uploads/${storedImage}`);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("profileImage");
    router.push("/");
  };

  return (
    <>
      {/* Mobile Header - Only Visible on Small Screens */}
      <header className="md:hidden fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md p-4 flex items-center justify-between z-50 border-b border-gray-600">
        {/* CleanBites Logo on Left */}
        <div className="flex items-center">
          <Image
            src="/cleanbites-trans.svg"
            alt="CleanBites AI Logo"
            width={160}
            height={200}
            className="object-contain"
          />
        </div>
        {/* User Profile Avatar on Right */}
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center">
          <Avatar className="cursor-pointer bg-gray-200 border border-gray-500 p-1">
            <AvatarImage src={profileImage} alt="User" className="rounded-full" />
            <AvatarFallback className="text-black">U</AvatarFallback>
          </Avatar>
        </button>
      </header>

      {/* Desktop Header - Only Visible on Medium and Up */}
      <header className="hidden md:flex fixed top-0 left-[280px] right-0 h-20 bg-black px-6 items-center justify-end z-50">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2">
          <Avatar className="cursor-pointer bg-gray-200 border border-gray-500 p-1">
            <AvatarImage src={profileImage} alt="User" className="rounded-full" />
            <AvatarFallback className="text-black">U</AvatarFallback>
          </Avatar>
        </button>
      </header>

      {/* Common Dropdown Menu for both Mobile and Desktop */}
      {dropdownOpen && (
        <div
          ref={dropdownRef}
          className="fixed right-4 top-20 md:top-[70px] w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-2 z-[9999]"
        >
          <button
            onClick={() => {
              setDropdownOpen(false);
              router.push("/profile");
            }}
            className="flex items-center gap-2 p-2 text-white w-full hover:bg-gray-800 rounded"
          >
            <User className="w-5 h-5" />
            View Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 text-red-400 w-full hover:bg-gray-800 rounded"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      )}

      {/* Mobile Sidebar Drawer (if needed) */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/90 p-6 z-50 flex flex-col">
          <button onClick={() => setMenuOpen(false)} className="self-end p-2 text-white">
            ✕
          </button>
          {/* Additional mobile sidebar content can be added here */}
        </div>
      )}
    </>
  );
};

export default Navbar;
