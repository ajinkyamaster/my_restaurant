"use client";

import Link from "next/link";
import styles from "./CartPreview.module.css";

interface CartItem { menuItemId: string; item: string; quantity: number; price: number; totalPrice: number; }

interface CartPreviewProps {
  items: CartItem[];
  grandTotal: number;
  visible: boolean;
  onClose: () => void;
}

export default function CartPreview({
  items,
  grandTotal,
  visible,
  onClose,
}: CartPreviewProps) {
  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <aside className={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>🛒 Cart Preview</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <ul className={styles.items}>
              {items.map((ci) => (
                <li key={ci.menuItemId} className={styles.item}>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{ci.item}</span>
                    <span className={styles.itemQty}>×{ci.quantity}</span>
                  </div>
                  <span className={styles.itemPrice}>₹{ci.totalPrice}</span>
                </li>
              ))}
            </ul>

            <div className={styles.footer}>
              <div className={styles.total}>
                <span>Total</span>
                <span className={styles.totalAmount}>₹{grandTotal}</span>
              </div>
              <Link href="/cart" className={styles.viewCartBtn} onClick={onClose}>
                View Full Cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
