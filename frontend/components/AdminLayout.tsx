"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchAdminSession, adminLogout } from "@/utils/adminApi";
import styles from "./AdminLayout.module.css";

const SIDEBAR_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/menu", label: "Manage Menu", icon: "🍽️" },
  { href: "/admin/tables", label: "Manage Tables", icon: "🪑" },
  { href: "/admin/bookings", label: "Bookings", icon: "📅" },
  { href: "/admin/managers", label: "Managers", icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAdminSession()
      .then((data) => {
        if (!data.authenticated) {
          router.replace("/admin/login");
        } else {
          setAdminUser(data.admin?.username || "Admin");
        }
      })
      .catch(() => router.replace("/admin/login"))
      .finally(() => setChecking(false));
  }, [router]);

  const handleLogout = async () => {
    try {
      await adminLogout();
    } catch { /* ignore */ }
    router.replace("/admin/login");
  };

  if (checking) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Verifying session…</p>
      </div>
    );
  }

  if (!adminUser) return null;

  return (
    <div className={styles.wrapper}>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarIcon}>✦</span>
          <div>
            <h2 className={styles.sidebarBrand}>Kitu&apos;s Kitchen</h2>
            <p className={styles.sidebarRole}>Admin Panel</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {SIDEBAR_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${
                pathname === link.href ? styles.navActive : ""
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={styles.navIcon}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <span className={styles.adminDot} />
            <span className={styles.adminName}>{adminUser}</span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <span />
            <span />
            <span />
          </button>
          <h1 className={styles.pageTitle}>
            {SIDEBAR_LINKS.find((l) => l.href === pathname)?.label || "Admin"}
          </h1>
          <div className={styles.topbarRight}>
            <Link href="/" className={styles.homeLink}>
              View Site →
            </Link>
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
