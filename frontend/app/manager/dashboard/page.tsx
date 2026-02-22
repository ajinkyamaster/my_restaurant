"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchManagerSession, fetchManagerOrders, acceptOrder, managerLogout } from "@/utils/managerApi";
import styles from "./page.module.css";

interface OrderItem {
  item: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  orderedAt: string;
}

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchManagerSession()
      .then((data) => {
        if (!data.authenticated) router.replace("/manager/login");
        else setChecking(false);
      })
      .catch(() => router.replace("/manager/login"));
  }, [router]);

  const load = useCallback(() => {
    setLoading(true);
    fetchManagerOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!checking) load();
  }, [checking, load]);

  const handleAccept = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  };

  const handleLogout = async () => {
    try { await managerLogout(); } catch { /* ignore */ }
    router.replace("/manager/login");
  };

  if (checking) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Verifying session…</p>
      </div>
    );
  }

  const pending = orders.filter((o) => o.status === "PLACED");
  const accepted = orders.filter((o) => o.status === "ACCEPTED");

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div>
            <h1 className={styles.title}>
              <span className={styles.icon}>✦</span> Manager Dashboard
            </h1>
            <p className={styles.subtitle}>Order management panel</p>
          </div>
          <div className={styles.headerRight}>
            <a href="/" className={styles.homeLink}>View Site</a>
            <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {error && <div className={styles.errorMsg}>{error}</div>}

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{orders.length}</span>
            <span className={styles.statLabel}>Total Orders</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{pending.length}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal}>{accepted.length}</span>
            <span className={styles.statLabel}>Accepted</span>
          </div>
        </div>

        {loading ? (
          <div className={styles.empty}><p>Loading orders…</p></div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <p>No orders yet.</p>
          </div>
        ) : (
          <div className={styles.orderGrid}>
            {orders.map((order) => (
              <div key={order._id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <span className={styles.orderTable}>Table {order.tableNumber}</span>
                  <span
                    className={`${styles.badge} ${
                      order.status === "PLACED" ? styles.badgeYellow : styles.badgeGreen
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className={styles.orderItems}>
                  {order.items?.map((item, i) => (
                    <div key={i} className={styles.orderItem}>
                      <span>{item.item} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.orderFooter}>
                  <span className={styles.orderTotal}>
                    Total: ₹{order.totalAmount || 0}
                  </span>
                  <span className={styles.orderTime}>
                    {new Date(order.orderedAt).toLocaleTimeString()}
                  </span>
                </div>
                {order.status === "PLACED" && (
                  <button
                    className={styles.acceptBtn}
                    onClick={() => handleAccept(order._id)}
                  >
                    Accept Order
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
