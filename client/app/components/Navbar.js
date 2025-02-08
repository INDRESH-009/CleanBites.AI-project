"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
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
    localStorage.removeItem("token");  // Remove authentication token
    localStorage.removeItem("userId"); // Remove stored user ID
    localStorage.removeItem("profileImage"); // Remove profile image reference
    router.push("/"); // Redirect to home page
  };

  return (
    <nav className="p-4 bg-white shadow-md flex justify-between items-center">
      {/* ✅ Clicking logo navigates to "Scan Food" */}
      <Link href="/dashboard">
        <h1 className="text-2xl font-bold text-gray-900 cursor-pointer">CleanBites AI</h1>
      </Link>

      {/* ✅ Mobile Menu Button */}
      <button className="lg:hidden text-gray-700" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? "✖" : "☰"}
      </button>

      {/* ✅ Navigation Links */}
      <div className={`lg:flex items-center gap-6 ${menuOpen ? "block" : "hidden"} absolute lg:static top-16 left-0 w-full lg:w-auto bg-white shadow-md lg:shadow-none p-4 lg:p-0`}>
        <Link href="/dashboard">
          <span className="text-gray-700 cursor-pointer hover:text-blue-600 font-medium">Scan Food</span>
        </Link>
        <Link href="/profile">
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer border border-gray-300"
            onError={() => setProfileImage("/default-profile.png")} // ✅ Fallback if not found
          />
        </Link>
        {/* ✅ Logout Button */}
        <button 
          onClick={handleLogout} 
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
