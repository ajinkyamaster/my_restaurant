"use client";

import { useState, useEffect, type FormEvent } from "react";
import { fetchTables, bookTable } from "@/utils/api";
import styles from "./BookingForm.module.css";

interface Table { _id: string; tableNumber: number; capacity: number; isVacant: boolean; }

interface BookingFormProps {
  prefilledTable?: number;
}

export default function BookingForm({ prefilledTable }: BookingFormProps) {
  const [name, setName] = useState("");
  const [tableNumber, setTableNumber] = useState<number | "">(
    prefilledTable || ""
  );
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables()
      .then(setTables)
      .catch(() => {});
  }, []);

  const vacantTables = tables.filter((t) => t.isVacant);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !tableNumber) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await bookTable(name.trim(), Number(tableNumber));
      setSuccess(
        `Table ${result.booking.tableNumber} booked for ${result.booking.customerName}!`
      );
      setName("");
      setTableNumber("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.group}>
        <label htmlFor="name" className={styles.label}>
          Your Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.group}>
        <label htmlFor="tableNumber" className={styles.label}>
          Select Table
        </label>
        <select
          id="tableNumber"
          value={tableNumber}
          onChange={(e) => setTableNumber(Number(e.target.value))}
          required
          className={styles.input}
        >
          <option value="">Choose a table…</option>
          {vacantTables.map((t) => (
            <option key={t._id} value={t.tableNumber}>
              Table {t.tableNumber} — Seats {t.capacity}
            </option>
          ))}
        </select>
        {vacantTables.length === 0 && tables.length > 0 && (
          <p className={styles.noTables}>
            No tables available right now. Please try again later.
          </p>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <button
        type="submit"
        disabled={loading || !name.trim() || !tableNumber}
        className={styles.submitBtn}
      >
        {loading ? "Booking…" : "Reserve Table"}
      </button>
    </form>
  );
}
