"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MenuCard from "@/components/MenuCard";
import CartPreview from "@/components/CartPreview";
import ScrollReveal from "@/components/ScrollReveal";
import { fetchMenu, addToCart, fetchCart } from "@/utils/api";
import styles from "./page.module.css";

interface MenuItem { _id: string; name: string; price: number; }
interface CartItem { item: string; quantity: number; price: number; totalPrice: number; }

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadMenu();
    loadCart();
  }, []);

  const loadMenu = async () => {
    try {
      const items = await fetchMenu();
      setMenuItems(items);
    } catch {
      setError("Failed to load menu. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const data = await fetchCart();
      setCartItems(data.cart);
      setCartTotal(data.grandTotal);
    } catch {
      // No session — cart empty
    }
  };

  const handleAddToCart = async (name: string, quantity: number, price: number) => {
    try {
      const data = await addToCart(name, quantity, price);
      setCartItems(data.cart);
      setCartTotal(data.grandTotal);
      showToast(`${name} added to cart!`);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("book a table")) {
        showToast("Please book a table first!");
      } else {
        showToast("Failed to add item. Book a table first.");
      }
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <Navbar />

      <div className="page-wrapper">
        {/* Header */}
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              Our <span className={styles.gold}>Menu</span>
            </h1>
            <p className={styles.subtitle}>
              Explore our carefully curated selection of dishes, each prepared
              with the finest ingredients.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            {loading ? (
              <div className="loading-container">
                <div className="spinner" />
                <p>Loading menu…</p>
              </div>
            ) : error ? (
              <div className="empty-state">
                <div className="icon">⚠️</div>
                <h3>{error}</h3>
                <button onClick={loadMenu} className="btn btn-outline" style={{ marginTop: "1rem" }}>
                  Retry
                </button>
              </div>
            ) : (
              <div className={styles.grid}>
                {menuItems.map((item, i) => (
                  <ScrollReveal key={item._id} delay={i * 60}>
                    <MenuCard
                      name={item.name}
                      price={item.price}
                      onAdd={handleAddToCart}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Floating Cart Button */}
        {cartItems.length > 0 && (
          <button
            className={styles.cartFab}
            onClick={() => setCartOpen(true)}
          >
            🛒
            <span className={styles.cartCount}>{cartItems.length}</span>
            <span className={styles.cartFabTotal}>₹{cartTotal}</span>
          </button>
        )}

        {/* Cart Preview Sidebar */}
        <CartPreview
          items={cartItems}
          grandTotal={cartTotal}
          visible={cartOpen}
          onClose={() => setCartOpen(false)}
        />

        {/* Toast */}
        {toast && <div className="toast toast-success">{toast}</div>}
      </div>

      <Footer />
    </>
  );
}
