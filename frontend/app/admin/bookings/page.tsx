"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchAdminBookings } from "@/utils/adminApi";
import styles from "../admin.module.css";

interface Booking {
  _id: string;
  customerName: string;
  tableNumber: number;
  createdAt: string;
  status: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminBookings()
      .then((data) => setBookings(data.bookings))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const active = bookings.filter((b) => b.status === "Booking Active").length;

  return (
    <AdminLayout>
      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statValue}>{bookings.length}</div>
          <div className={styles.statLabel}>Total Bookings</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🟢</div>
          <div className={styles.statValue}>{active}</div>
          <div className={styles.statLabel}>Active</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏰</div>
          <div className={styles.statValue}>{bookings.length - active}</div>
          <div className={styles.statLabel}>Expired</div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Bookings</h2>
        </div>

        {loading ? (
          <div className={styles.empty}><p>Loading bookings…</p></div>
        ) : bookings.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📅</div>
            <p>No bookings found.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Table</th>
                <th>Booked At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b._id}>
                  <td>{i + 1}</td>
                  <td>{b.customerName}</td>
                  <td>Table {b.tableNumber}</td>
                  <td>{new Date(b.createdAt).toLocaleString()}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        b.status === "Booking Active"
                          ? styles.badgeGreen
                          : styles.badgeYellow
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
