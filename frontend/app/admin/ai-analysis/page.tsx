"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fetchAiAnalysis } from "@/utils/adminApi";
import styles from "../admin.module.css";

interface HistoryWeek {
  week: string;
  revenue: number;
  total_expense: number;
}

interface AiData {
  history: HistoryWeek[];
  prediction: { revenue: number; profit: number };
  trend: string;
  insights: string[];
}

export default function AdminAiAnalysisPage() {
  const [data, setData] = useState<AiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAiAnalysis()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const trendColor = (t: string) => {
    if (t === "up") return styles.badgeGreen;
    if (t === "down") return styles.badgeRed;
    return styles.badgeYellow;
  };

  return (
    <AdminLayout>
      {error && <div className={styles.errorMsg}>{error}</div>}

      {loading ? (
        <div className={styles.empty}><p>Loading AI analysis…</p></div>
      ) : !data ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🤖</div>
          <p>No data available.</p>
        </div>
      ) : (
        <>
          {/* Prediction Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statValue}>
                ₹{data.prediction.revenue.toLocaleString()}
              </div>
              <div className={styles.statLabel}>Predicted Revenue</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statValue}>
                ₹{data.prediction.profit.toLocaleString()}
              </div>
              <div className={styles.statLabel}>Predicted Profit</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statValue} style={{ fontSize: "1.2rem" }}>
                <span className={`${styles.badge} ${trendColor(data.trend)}`}>
                  {data.trend.toUpperCase()}
                </span>
              </div>
              <div className={styles.statLabel}>Trend Direction</div>
            </div>
          </div>

          {/* History Table */}
          <div className={styles.sectionCard} style={{ marginBottom: "1.5rem" }}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Weekly History</h2>
            </div>
            {data.history.length === 0 ? (
              <div className={styles.empty}><p>No history data.</p></div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Revenue</th>
                    <th>Expenses</th>
                    <th>Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((w) => {
                    const profit = w.revenue - w.total_expense;
                    return (
                      <tr key={w.week}>
                        <td>{w.week}</td>
                        <td>₹{w.revenue.toLocaleString()}</td>
                        <td>₹{w.total_expense.toLocaleString()}</td>
                        <td style={{ color: profit >= 0 ? "#2ecc71" : "#e74c3c" }}>
                          ₹{profit.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* AI Insights */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>AI Insights</h2>
            </div>
            <div className={styles.sectionBody}>
              {data.insights.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No insights available.</p>
              ) : (
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {data.insights.map((insight, i) => (
                    <li
                      key={i}
                      style={{
                        padding: "0.75rem 1rem",
                        background: "var(--bg-tertiary)",
                        borderRadius: "var(--radius-md)",
                        borderLeft: "3px solid var(--gold)",
                        color: "var(--text-primary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {insight}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
