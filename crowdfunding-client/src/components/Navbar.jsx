"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Menu, X, User, LogOut } from "lucide-react";

const GITHUB_CLIENT_REPO = "https://github.com/YOUR_USERNAME/YOUR_CLIENT_REPO";

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    setDropdownOpen(false);
  };

  return (
    <nav className="w-full border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-indigo-600">
          CrowdFund
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {!isPending && !session && (
            <>
              <Link href="/campaigns" className="hover:text-indigo-600">
                Explore Campaigns
              </Link>
              <Link href="/login" className="hover:text-indigo-600">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Register
              </Link>
              <a
                href={GITHUB_CLIENT_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Join as Developer
              </a>
            </>
          )}

          {!isPending && session && (
            <>
              <Link href="/dashboard" className="hover:text-indigo-600">
                Dashboard
              </Link>
              <div className="text-sm bg-gray-100 px-3 py-1.5 rounded-full">
                Credits: {session.user.credits ?? 0}
              </div>
              <a
                href={GITHUB_CLIENT_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="border px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Join as Developer
              </a>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                    <User size={18} />
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                    <div className="px-4 py-2 text-sm text-gray-600 border-b truncate">
                      {session.user.email}
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-100 text-sm"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2 text-red-600"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-3">
          {!isPending && !session && (
            <>
              <Link href="/campaigns" onClick={() => setMenuOpen(false)}>
                Explore Campaigns
              </Link>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
              <a href={GITHUB_CLIENT_REPO} target="_blank" rel="noopener noreferrer">
                Join as Developer
              </a>
            </>
          )}

          {!isPending && session && (
            <>
              <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <span>Credits: {session.user.credits ?? 0}</span>
              <Link href="/profile" onClick={() => setMenuOpen(false)}>
                My Profile
              </Link>
              <a href={GITHUB_CLIENT_REPO} target="_blank" rel="noopener noreferrer">
                Join as Developer
              </a>
              <button onClick={handleLogout} className="text-left text-red-600">
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}