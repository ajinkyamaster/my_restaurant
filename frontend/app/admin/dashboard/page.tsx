"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { fetchDashboard, endOfDayReset } from "@/utils/adminApi";
import styles from "../admin.module.css";

interface DashboardStats {
  totalTables: number;
  occupiedTables: number;
  totalMenuItems: number;
  totalBookings: number;
  totalOrders: number;
  totalManagers: number;
  totalRevenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    fetchDashboard()
      .then((data) => setStats(data.stats))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReset = async () => {
    if (!confirm("End of Day Reset will clear all bookings, orders, and mark all tables vacant. Proceed?")) return;
    setResetting(true);
    setMsg("");
    try {
      await endOfDayReset();
      setMsg("End of day reset completed successfully.");
      load();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminLayout>
      {loading ? (
        <div className={styles.empty}><p>Loading dashboard…</p></div>
      ) : error ? (
        <div className={styles.errorMsg}>{error}</div>
      ) : stats && (
        <>
          {/* ── Stat Cards ── */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🪑</div>
              <div className={styles.statValue}>{stats.totalTables}</div>
              <div className={styles.statLabel}>Total Tables</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🔴</div>
              <div className={styles.statValue}>{stats.occupiedTables}</div>
              <div className={styles.statLabel}>Occupied</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🍽️</div>
              <div className={styles.statValue}>{stats.totalMenuItems}</div>
              <div className={styles.statLabel}>Menu Items</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statValue}>{stats.totalBookings}</div>
              <div className={styles.statLabel}>Bookings</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statValue}>{stats.totalOrders}</div>
              <div className={styles.statLabel}>Orders</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statValue}>{stats.totalManagers}</div>
              <div className={styles.statLabel}>Managers</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statValue}>₹{stats.totalRevenue.toLocaleString()}</div>
              <div className={styles.statLabel}>Total Revenue</div>
            </div>
          </div>

          {msg && <div className={styles.successMsg}>{msg}</div>}

          {/* ── Quick Actions — Square Card Grid ── */}
          <div className={styles.actionGrid}>
            <Link href="/admin/bookings" className={styles.actionCard}>
              <span className={styles.actionEmoji}>📅</span>
              <h3>View All Bookings</h3>
              <p>See today&apos;s table bookings</p>
            </Link>

            <Link href="/admin/tables" className={styles.actionCard}>
              <span className={styles.actionEmoji}>🪑</span>
              <h3>Manage Tables</h3>
              <p>Add, remove and manage tables</p>
            </Link>

            <Link href="/admin/menu" className={styles.actionCard}>
              <span className={styles.actionEmoji}>🍽️</span>
              <h3>Manage Menu</h3>
              <p>Add or update menu items</p>
            </Link>

            <Link href="/admin/tables" className={styles.actionCard}>
              <span className={styles.actionEmoji}>📊</span>
              <h3>Live Table Status</h3>
              <p>View occupied &amp; vacant tables</p>
            </Link>

            <Link href="/admin/managers" className={styles.actionCard}>
              <span className={styles.actionEmoji}>👥</span>
              <h3>Manage Staff</h3>
              <p>View and manage managers</p>
            </Link>
          </div>

          {/* ── End of Day Reset — Centered ── */}
          <div className={styles.resetArea}>
            <button
              onClick={handleReset}
              disabled={resetting}
              className={styles.resetBtn}
            >
              {resetting ? "Resetting…" : "🔁 End of Day Reset"}
            </button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
