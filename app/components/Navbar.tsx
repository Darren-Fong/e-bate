"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          <Image
            src="/e-bate-logo.png"
            alt="E-Bate Logo"
            width={100}
            height={33}
            priority
          />
        </Link>
        <div className="navbar-links">
          <Link 
            href="/" 
            className={`navbar-link ${pathname === "/" ? "active" : ""}`}
          >
            Home
          </Link>
          <Link 
            href="/modes" 
            className={`navbar-link ${pathname === "/modes" ? "active" : ""}`}
          >
            Modes
          </Link>
          <Link 
            href="/feedback" 
            className={`navbar-link ${pathname === "/feedback" ? "active" : ""}`}
          >
            Feedback
          </Link>
          <Link 
            href="/contact" 
            className={`navbar-link ${pathname === "/contact" ? "active" : ""}`}
          >
            Contact Us
          <ThemeToggle />
          </Link>
        </div>
      </div>
    </nav>
  );
}
