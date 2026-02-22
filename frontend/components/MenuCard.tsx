"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./MenuCard.module.css";

interface MenuCardProps {
  name: string;
  price: number;
  onAdd: (name: string, quantity: number, price: number) => void;
}

export default function MenuCard({ name, price, onAdd }: MenuCardProps) {
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const imgSrc = `/images/${name.toLowerCase().replace(/\s+/g, "-")}.jpg`;

  const handleAdd = async () => {
    setAdding(true);
    await onAdd(name, qty, price);
    setAdding(false);
    setQty(1);
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={imgSrc}
          alt={name}
          width={400}
          height={260}
          className={styles.image}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/veg-biryani.jpg";
          }}
        />
        <div className={styles.priceTag}>₹{price}</div>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.desc}>
          Freshly prepared with the finest ingredients and authentic spices.
        </p>

        <div className={styles.actions}>
          <div className={styles.qtyControl}>
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className={styles.qtyBtn}
            >
              −
            </button>
            <span className={styles.qtyVal}>{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className={styles.qtyBtn}
            >
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding}
            className={styles.addBtn}
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
