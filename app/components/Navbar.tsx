"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import ThemeToggle from "./ThemeToggle";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Prevent body scroll when mobile nav is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

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
        <button
          className="navbar-menu-btn"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
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
          <SignedIn>
            <Link 
              href="/dashboard" 
              className={`navbar-link ${pathname === "/dashboard" ? "active" : ""}`}
            >
              Dashboard
            </Link>
          </SignedIn>
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
          </Link>
          
          <SignedOut>
            <SignInButton mode="redirect">
              <button className="navbar-login-btn">Login</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>
          
          <ThemeToggle />
        </div>
        {open && (
          <div className="mobile-nav-overlay" onClick={() => setOpen(false)}>
            <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
              <nav>
                <Link href="/" className="navbar-link">Home</Link>
                <Link href="/modes" className="navbar-link">Modes</Link>
                <Link href="/dashboard" className="navbar-link">Dashboard</Link>
                <Link href="/feedback" className="navbar-link">Feedback</Link>
                <Link href="/contact" className="navbar-link">Contact</Link>
                <SignedOut>
                  <SignInButton mode="redirect"><button className="navbar-login-btn">Login</button></SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </nav>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
