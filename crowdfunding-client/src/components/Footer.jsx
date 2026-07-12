"use client";

import Link from "next/link";
import { Mail, Heart, Rocket } from "lucide-react";

const SOCIAL_LINKS = {
  github: "https://github.com/YOUR_USERNAME",
  linkedin: "https://linkedin.com/in/YOUR_USERNAME",
  facebook: "https://facebook.com/YOUR_USERNAME",
  twitter: "https://twitter.com/YOUR_USERNAME",
  email: "mailto:youremail@example.com",
};

function GithubIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0z" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.68 0H1.32C.59 0 0 .59 0 1.32v21.36C0 23.41.59 24 1.32 24h11.5v-9.29H9.69v-3.62h3.13V8.41c0-3.1 1.89-4.79 4.66-4.79 1.32 0 2.46.1 2.79.14v3.24h-1.92c-1.5 0-1.8.72-1.8 1.76v2.31h3.59l-.47 3.62h-3.12V24h6.11c.73 0 1.32-.59 1.32-1.32V1.32C24 .59 23.41 0 22.68 0z" />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.95 4.57a10 10 0 0 1-2.82.77 4.9 4.9 0 0 0 2.16-2.72c-.95.56-2 .97-3.13 1.19a4.92 4.92 0 0 0-8.38 4.48A13.98 13.98 0 0 1 1.67 3.15a4.92 4.92 0 0 0 1.52 6.57 4.9 4.9 0 0 1-2.23-.62v.06a4.92 4.92 0 0 0 3.95 4.83 4.9 4.9 0 0 1-2.22.08 4.93 4.93 0 0 0 4.6 3.42A9.87 9.87 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.06 0 14.01-7.5 14.01-14.01 0-.21 0-.42-.02-.63a10.02 10.02 0 0 0 2.46-2.55z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#14171F] to-[#0B0D14] text-[#9AA1AE] border-t border-[#D8A13B]/20 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#D8A13B]/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#D8A13B]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] bg-gradient-to-r from-[#D8A13B]/0 via-[#D8A13B]/5 to-[#D8A13B]/0 blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-12 pb-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-start">
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link
              href="/"
              className="text-3xl text-[#F3EFE4] relative group"
              style={{ fontFamily: "'Fraunces', serif", fontWeight: 700 }}
            >
              CrowdFund
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#D8A13B] to-[#F3EFE4] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <p
              className="text-sm text-[#9AA1AE]/80 max-w-xs text-center md:text-left leading-relaxed"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Empowering ideas through community support.
            </p>
            <div className="flex items-center gap-1 text-xs text-[#9AA1AE]/50 mt-1">
              <Heart size={12} className="text-[#D8A13B]" />
              <span>Made with passion</span>
              <Rocket size={12} className="text-[#D8A13B]" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <h4 className="text-[#F3EFE4] text-sm font-semibold tracking-wider uppercase opacity-70" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Quick Links
            </h4>
            <div className="flex flex-col gap-1.5">
              <Link href="/about" className="text-sm hover:text-[#D8A13B] transition-colors duration-300 hover:translate-x-1 inline-block">
                About Us
              </Link>
              <Link href="/projects" className="text-sm hover:text-[#D8A13B] transition-colors duration-300 hover:translate-x-1 inline-block">
                Projects
              </Link>
              <Link href="/contact" className="text-sm hover:text-[#D8A13B] transition-colors duration-300 hover:translate-x-1 inline-block">
                Contact
              </Link>
            </div>
          </div>

          {/* Social & CTA */}
          <div className="flex flex-col items-center md:items-end gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider opacity-50" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Connect
              </span>
              <div className="h-px w-8 bg-gradient-to-r from-[#D8A13B]/0 via-[#D8A13B]/40 to-[#D8A13B]/0"></div>
            </div>
            <div className="flex items-center gap-3 text-[#9AA1AE]">
              <a
                href={SOCIAL_LINKS.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-[#D8A13B]/20 hover:text-[#D8A13B] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#D8A13B]/10 border border-white/5 hover:border-[#D8A13B]/30"
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-[#D8A13B]/20 hover:text-[#D8A13B] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#D8A13B]/10 border border-white/5 hover:border-[#D8A13B]/30"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-[#D8A13B]/20 hover:text-[#D8A13B] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#D8A13B]/10 border border-white/5 hover:border-[#D8A13B]/30"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/5 hover:bg-[#D8A13B]/20 hover:text-[#D8A13B] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#D8A13B]/10 border border-white/5 hover:border-[#D8A13B]/30"
                aria-label="Twitter"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href={SOCIAL_LINKS.email}
                className="p-2 rounded-full bg-white/5 hover:bg-[#D8A13B]/20 hover:text-[#D8A13B] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#D8A13B]/10 border border-white/5 hover:border-[#D8A13B]/30"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1 h-1 rounded-full bg-[#D8A13B] animate-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest opacity-40" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Let's collaborate
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative mt-10 pt-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p
              className="text-xs text-[#9AA1AE]/50"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              © {new Date().getFullYear()} CrowdFund. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-[10px] text-[#9AA1AE]/40 uppercase tracking-wider">
              <Link href="/privacy" className="hover:text-[#D8A13B] transition-colors">
                Privacy
              </Link>
              <span className="w-px h-3 bg-white/10"></span>
              <Link href="/terms" className="hover:text-[#D8A13B] transition-colors">
                Terms
              </Link>
              <span className="w-px h-3 bg-white/10"></span>
              <Link href="/cookies" className="hover:text-[#D8A13B] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}