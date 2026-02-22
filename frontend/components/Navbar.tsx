"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchSession, endSession } from "@/utils/api";
import styles from "./Navbar.module.css";

interface SessionInfo { active: boolean; tableNumber?: number; customerName?: string; }

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/booking", label: "Book Table" },
  { href: "/cart", label: "Cart" },
  { href: "/orders", label: "Orders" },
  { href: "/payments", label: "Payments" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [session, setSession] = useState<SessionInfo>({ active: false });

  useEffect(() => {
    fetchSession().then(setSession).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleEndSession = async () => {
    try {
      await endSession();
      setSession({ active: false });
      window.location.href = "/";
    } catch {
      /* ignore */
    }
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>Kitu&apos;s Kitchen</span>
        </Link>

        {/* Desktop links */}
        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.link} ${
                  pathname === link.href ? styles.active : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Session info + hamburger */}
        <div className={styles.right}>
          {session.active && (
            <div className={styles.session}>
              <span className={styles.sessionDot} />
              <span className={styles.sessionText}>
                Table {session.tableNumber}
              </span>
              <button
                onClick={handleEndSession}
                className={styles.endBtn}
                title="End Session"
              >
                ✕
              </button>
            </div>
          )}

          <button
            className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileOpen : ""}`}
      >
        <ul>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`${styles.mobileLink} ${
                  pathname === link.href ? styles.active : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          {session.active && (
            <li>
              <button onClick={handleEndSession} className={styles.mobilEnd}>
                End Session (Table {session.tableNumber})
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
