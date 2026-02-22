"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PaymentCard from "@/components/PaymentCard";
import {
  fetchPaymentSummary,
  fetchMyPayments,
  processCheckout,
} from "@/utils/api";
import styles from "./page.module.css";

interface CartItem { item: string; quantity: number; price: number; totalPrice: number; }
interface OrderItem { item: string; quantity: number; price: number; totalPrice: number; }
interface Order { _id: string; tableNumber: number; customer: { name: string }; items: OrderItem[]; grandTotal: number; orderedAt: string; status: string; }

export default function PaymentsPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [pastOrders, setPastOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [noSession, setNoSession] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [payData, ordersData] = await Promise.all([
        fetchPaymentSummary().catch(() => null),
        fetchMyPayments().catch(() => ({ tableOrders: [] })),
      ]);

      if (payData) {
        setCart(payData.cart);
        setGrandTotal(payData.grandTotal);
        setTableNumber(payData.tableNumber);
      } else {
        setNoSession(true);
      }

      setPastOrders(ordersData.tableOrders);
    } catch {
      setNoSession(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await processCheckout();
      setPaid(true);
      setCart([]);
      setGrandTotal(0);
      // Refresh past orders
      const ordersData = await fetchMyPayments();
      setPastOrders(ordersData.tableOrders);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              <span className={styles.gold}>Payments</span>
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
                <p>Loading…</p>
              </div>
            ) : noSession ? (
              <div className="empty-state">
                <div className="icon">🪑</div>
                <h3>No Active Session</h3>
                <p>Please book a table to access payments.</p>
                <Link
                  href="/booking"
                  className="btn btn-primary"
                  style={{ marginTop: "1.5rem" }}
                >
                  Book a Table
                </Link>
              </div>
            ) : (
              <>
                {/* Payment Success Message */}
                {paid && (
                  <div className={styles.successBanner}>
                    <span className={styles.successIcon}>✓</span>
                    <div>
                      <h3>Payment Successful!</h3>
                      <p>Your order has been placed. Thank you!</p>
                    </div>
                    <button
                      onClick={() => router.push("/orders")}
                      className="btn btn-outline"
                    >
                      View Orders
                    </button>
                  </div>
                )}

                {/* Current Cart → Pay */}
                {cart.length > 0 && !paid && (
                  <div className={styles.checkoutCard}>
                    <h2 className={styles.sectionTitle}>
                      Complete Your Payment
                    </h2>

                    <div className={styles.checkoutItems}>
                      {cart.map((item) => (
                        <div key={item.item} className={styles.checkoutRow}>
                          <span>
                            {item.item}{" "}
                            <span className={styles.qty}>×{item.quantity}</span>
                          </span>
                          <span className={styles.rowPrice}>
                            ₹{item.totalPrice}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.checkoutTotal}>
                      <span>Total</span>
                      <span>₹{grandTotal}</span>
                    </div>

                    <button
                      onClick={handlePay}
                      disabled={paying}
                      className={styles.payBtn}
                    >
                      {paying ? "Processing…" : `Pay ₹${grandTotal}`}
                    </button>
                  </div>
                )}

                {/* Past Payments */}
                {pastOrders.length > 0 && (
                  <div className={styles.pastSection}>
                    <h2 className={styles.sectionTitle}>Payment History</h2>
                    <div className={styles.pastGrid}>
                      {pastOrders.map((order, i) => (
                        <PaymentCard
                          key={order._id}
                          order={order}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {cart.length === 0 && pastOrders.length === 0 && !paid && (
                  <div className="empty-state">
                    <div className="icon">💳</div>
                    <h3>No Payments</h3>
                    <p>Add items to your cart and checkout to see payments.</p>
                    <Link
                      href="/menu"
                      className="btn btn-primary"
                      style={{ marginTop: "1.5rem" }}
                    >
                      Browse Menu
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
