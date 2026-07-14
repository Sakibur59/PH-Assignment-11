"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";

const GITHUB_CLIENT_REPO = "https://github.com/Sakibur59/PH-Assignment-11";

function GithubIcon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function CreditPill({ credits }) {
  return (
    <div
      className="flex items-center gap-1.5 bg-white/5 border border-[#D8A13B]/30 px-3 py-1.5 rounded-full"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#4FAE7C]" />
      <span className="text-[#F3EFE4] text-sm">{credits ?? 0}</span>
      <span className="text-[#9AA1AE] text-xs">credits</span>
    </div>
  );
}

function Avatar({ user, size = 36 }) {
  if (user?.image) {
    return (
      <img
        src={user.image}
        alt={user.name || "Profile"}
        className="rounded-full object-cover border border-white/10"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";
  return (
    <div
      className="rounded-full bg-[#D8A13B] text-[#14171F] flex items-center justify-center font-semibold"
      style={{
        width: size,
        height: size,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {initial}
    </div>
  );
}

export default function Navbar() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    setDropdownOpen(false);
    router.push("/");
  };

  const user = session?.user;

  return (
    <nav className="w-full bg-[#14171F]/95 backdrop-blur border-b border-white/5 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl text-[#F3EFE4]"
          style={{ fontFamily: "'Fraunces', serif", fontWeight: 600 }}
        >
          Crowd<span className="text-[#D8A13B]">Fund</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {!isPending && !user && (
            <>
              <Link
                href="/campaigns"
                className="text-[#9AA1AE] hover:text-[#F3EFE4] text-sm transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Explore Campaigns
              </Link>
              <Link
                href="/login"
                className="text-[#9AA1AE] hover:text-[#F3EFE4] text-sm transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#D8A13B] text-[#14171F] px-4 py-2 rounded-sm text-sm font-medium hover:bg-[#c99530] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Register
              </Link>
              <a
                href={GITHUB_CLIENT_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-white/15 text-[#F3EFE4] px-4 py-2 rounded-sm text-sm hover:border-[#D8A13B]/50 hover:text-[#D8A13B] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <GithubIcon />
                Join as Developer
              </a>
            </>
          )}

          {!isPending && user && (
            <>
              <Link
                href="/dashboard"
                className="text-[#9AA1AE] hover:text-[#F3EFE4] text-sm transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Dashboard
              </Link>

              <CreditPill credits={user.credits} />

              <a
                href={GITHUB_CLIENT_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 border border-white/15 text-[#F3EFE4] px-4 py-2 rounded-sm text-sm hover:border-[#D8A13B]/50 hover:text-[#D8A13B] transition-colors"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                <GithubIcon />
                Join as Developer
              </a>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2"
                >
                  <Avatar user={user} size={36} />
                  <ChevronDown
                    size={16}
                    className={`text-[#9AA1AE] transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-[#1B1F2A] border border-white/10 rounded-md shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                      <Avatar user={user} size={44} />
                      <div className="min-w-0">
                        <p
                          className="text-[#F3EFE4] text-sm truncate"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 500,
                          }}
                        >
                          {user.name}
                        </p>
                        <p
                          className="text-[#9AA1AE] text-xs truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <span
                        className="text-[#9AA1AE] text-xs uppercase tracking-wider"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        Available credits
                      </span>
                      <span
                        className="text-[#D8A13B] text-sm"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {user.credits ?? 0}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/${user?.role || "supporter"}/profile`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-[#F3EFE4] hover:bg-white/5 transition-colors"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <LayoutDashboard size={16} className="text-[#9AA1AE]" />
                      My Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#E88A7E] hover:bg-white/5 transition-colors text-left"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-[#F3EFE4]"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden border-t border-white/5 px-6 py-4 flex flex-col gap-4 bg-[#14171F]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {!isPending && !user && (
            <>
              <Link
                href="/campaigns"
                className="text-[#F3EFE4] text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Explore Campaigns
              </Link>
              <Link
                href="/login"
                className="text-[#F3EFE4] text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-[#D8A13B] text-[#14171F] px-4 py-2 rounded-sm text-sm font-medium text-center"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
              <a
                href={GITHUB_CLIENT_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#F3EFE4] text-sm"
              >
                <GithubIcon />
                Join as Developer
              </a>
            </>
          )}

          {!isPending && user && (
            <>
              <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                <Avatar user={user} size={40} />
                <div className="min-w-0">
                  <p className="text-[#F3EFE4] text-sm truncate">{user.name}</p>
                  <p className="text-[#9AA1AE] text-xs truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#9AA1AE]">Available credits</span>
                <span
                  className="text-[#D8A13B]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {user.credits ?? 0}
                </span>
              </div>
              <Link
                href="/dashboard"
                className="text-[#F3EFE4] text-sm"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <a
                href={GITHUB_CLIENT_REPO}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#F3EFE4] text-sm"
              >
                <GithubIcon />
                Join as Developer
              </a>
              <button
                onClick={handleLogout}
                className="text-left text-[#E88A7E] text-sm flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
