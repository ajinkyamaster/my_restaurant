"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderCard from "@/components/OrderCard";
import { fetchOrders } from "@/utils/api";
import styles from "./page.module.css";

interface OrderItem { item: string; quantity: number; price: number; totalPrice: number; }
interface Order { _id: string; tableNumber: number; customer: { name: string }; items: OrderItem[]; grandTotal: number; orderedAt: string; status: string; }

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [noSession, setNoSession] = useState(false);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchOrders();
      setOrders(data.orders);
      setTableNumber(data.tableNumber);
    } catch {
      setNoSession(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              Your <span className={styles.gold}>Orders</span>
            </h1>
            {tableNumber && (
              <p className={styles.subtitle}>Table {tableNumber}</p>
            )}
          </div>
        </section>

        <section className="section">
          <div className="container">
            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <p>Loading orders…</p>
              </div>
            ) : noSession ? (
              <div className="empty-state">
                <div className="icon">🪑</div>
                <h3>No Active Session</h3>
                <p>Please book a table to view your orders.</p>
                <Link
                  href="/booking"
                  className="btn btn-primary"
                  style={{ marginTop: "1.5rem" }}
                >
                  Book a Table
                </Link>
              </div>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📋</div>
                <h3>No Orders Yet</h3>
                <p>
                  You haven&apos;t placed any orders yet. Browse our menu to get
                  started!
                </p>
                <Link
                  href="/menu"
                  className="btn btn-primary"
                  style={{ marginTop: "1.5rem" }}
                >
                  View Menu
                </Link>
              </div>
            ) : (
              <div className={styles.orderGrid}>
                {orders.map((order, i) => (
                  <OrderCard key={order._id} order={order} index={i} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
