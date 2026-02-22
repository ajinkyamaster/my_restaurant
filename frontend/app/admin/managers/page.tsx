"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  fetchManagers,
  createManager,
  vacateManager,
  createAdmin,
} from "@/utils/adminApi";
import styles from "../admin.module.css";

interface Manager {
  _id: string;
  username: string;
}

export default function AdminManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  // Create manager
  const [showCreateMgr, setShowCreateMgr] = useState(false);
  const [mgrUsername, setMgrUsername] = useState("");
  const [mgrPassword, setMgrPassword] = useState("");

  // Create admin
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [admUsername, setAdmUsername] = useState("");
  const [admPassword, setAdmPassword] = useState("");

  // Vacate manager
  const [showVacate, setShowVacate] = useState(false);
  const [vacUsername, setVacUsername] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetchManagers()
      .then((data) => setManagers(data.managers))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const flash = (message: string, type: "success" | "error" = "success") => {
    setMsg(message);
    setMsgType(type);
    setTimeout(() => setMsg(""), 4000);
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createManager(mgrUsername, mgrPassword);
      setMgrUsername("");
      setMgrPassword("");
      setShowCreateMgr(false);
      flash("Manager created successfully.");
      load();
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAdmin(admUsername, admPassword);
      setAdmUsername("");
      setAdmPassword("");
      setShowCreateAdmin(false);
      flash("Admin created successfully.");
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const handleVacate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vacateManager(vacUsername);
      setVacUsername("");
      setShowVacate(false);
      flash("Manager vacated successfully.");
      load();
    } catch (err: unknown) {
      flash(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  return (
    <AdminLayout>
      {msg && (
        <div className={msgType === "success" ? styles.successMsg : styles.errorMsg}>
          {msg}
        </div>
      )}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* Action buttons */}
      <div className={styles.btnRow} style={{ marginBottom: "1.5rem" }}>
        <button
          className={`${styles.btnSmall} ${styles.btnPrimary}`}
          onClick={() => setShowCreateMgr(true)}
        >
          + Create Manager
        </button>
        <button
          className={`${styles.btnSmall} ${styles.btnEdit}`}
          onClick={() => setShowCreateAdmin(true)}
        >
          + Create Admin
        </button>
        <button
          className={`${styles.btnSmall} ${styles.btnDelete}`}
          onClick={() => setShowVacate(true)}
        >
          Vacate Manager
        </button>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Managers ({managers.length})</h2>
        </div>

        {loading ? (
          <div className={styles.empty}><p>Loading managers…</p></div>
        ) : managers.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>👥</div>
            <p>No managers registered yet.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m, i) => (
                <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>{m.username}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {m._id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Manager Modal */}
      {showCreateMgr && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateMgr(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Create Manager</h3>
            <form onSubmit={handleCreateManager}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Username</label>
                  <input
                    className={styles.formInput}
                    value={mgrUsername}
                    onChange={(e) => setMgrUsername(e.target.value)}
                    placeholder="Manager username"
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Password</label>
                  <input
                    className={styles.formInput}
                    type="password"
                    value={mgrPassword}
                    onChange={(e) => setMgrPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowCreateMgr(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btnSmall} ${styles.btnPrimary}`}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateAdmin(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Create Admin</h3>
            <form onSubmit={handleCreateAdmin}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Username</label>
                  <input
                    className={styles.formInput}
                    value={admUsername}
                    onChange={(e) => setAdmUsername(e.target.value)}
                    placeholder="Admin username"
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Password</label>
                  <input
                    className={styles.formInput}
                    type="password"
                    value={admPassword}
                    onChange={(e) => setAdmPassword(e.target.value)}
                    placeholder="Password"
                    required
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowCreateAdmin(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btnSmall} ${styles.btnPrimary}`}>
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vacate Manager Modal */}
      {showVacate && (
        <div className={styles.modalOverlay} onClick={() => setShowVacate(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Vacate Manager</h3>
            <form onSubmit={handleVacate}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Manager Username</label>
                <input
                  className={styles.formInput}
                  value={vacUsername}
                  onChange={(e) => setVacUsername(e.target.value)}
                  placeholder="Enter username to remove"
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowVacate(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btnSmall} ${styles.btnDelete}`}>
                  Vacate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
