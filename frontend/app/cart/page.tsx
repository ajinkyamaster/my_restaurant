"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  fetchCart,
  removeFromCart,
  updateCartItem,
} from "@/utils/api";
import styles from "./page.module.css";

interface CartItem { item: string; quantity: number; price: number; totalPrice: number; }

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [noSession, setNoSession] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCart(data.cart);
      setGrandTotal(data.grandTotal);
      setTableNumber(data.tableNumber ?? null);
    } catch {
      setNoSession(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemName: string) => {
    try {
      const data = await removeFromCart(itemName);
      setCart(data.cart);
      setGrandTotal(data.grandTotal ?? data.cart.reduce((s: number, i: CartItem) => s + i.totalPrice, 0));
    } catch {
      /* ignore */
    }
  };

  const handleQtyChange = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      handleRemove(item.item);
      return;
    }
    try {
      const data = await updateCartItem(item.item, newQty, item.price);
      setCart(data.cart);
      setGrandTotal(data.grandTotal);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              Your <span className={styles.gold}>Cart</span>
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
                <p>Loading cart…</p>
              </div>
            ) : noSession ? (
              <div className="empty-state">
                <div className="icon">🪑</div>
                <h3>No Active Session</h3>
                <p>Please book a table first to start ordering.</p>
                <Link href="/booking" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
                  Book a Table
                </Link>
              </div>
            ) : cart.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Browse our menu and add some delicious items!</p>
                <Link href="/menu" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
                  View Menu
                </Link>
              </div>
            ) : (
              <div className={styles.cartLayout}>
                {/* Cart Items */}
                <div className={styles.cartItems}>
                  {cart.map((item) => (
                    <div key={item.item} className={styles.cartCard}>
                      <div className={styles.itemInfo}>
                        <h3 className={styles.itemName}>{item.item}</h3>
                        <p className={styles.itemPrice}>₹{item.price} each</p>
                      </div>

                      <div className={styles.itemActions}>
                        <div className={styles.qtyControl}>
                          <button
                            onClick={() => handleQtyChange(item, -1)}
                            className={styles.qtyBtn}
                          >
                            −
                          </button>
                          <span className={styles.qtyVal}>{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item, 1)}
                            className={styles.qtyBtn}
                          >
                            +
                          </button>
                        </div>

                        <span className={styles.itemTotal}>
                          ₹{item.totalPrice}
                        </span>

                        <button
                          onClick={() => handleRemove(item.item)}
                          className={styles.removeBtn}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className={styles.summary}>
                  <div className={styles.summaryCard}>
                    <h3 className={styles.summaryTitle}>Order Summary</h3>

                    <div className={styles.summaryRows}>
                      {cart.map((item) => (
                        <div key={item.item} className={styles.summaryRow}>
                          <span>
                            {item.item} ×{item.quantity}
                          </span>
                          <span>₹{item.totalPrice}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.summaryTotal}>
                      <span>Grand Total</span>
                      <span>₹{grandTotal}</span>
                    </div>

                    <Link href="/payments" className={styles.checkoutBtn}>
                      Proceed to Payment
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
