"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  fetchAdminTables,
  addTable,
  updateTable,
  deleteTable,
} from "@/utils/adminApi";
import styles from "../admin.module.css";

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  isVacant: boolean;
}

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addNumber, setAddNumber] = useState("");
  const [addCapacity, setAddCapacity] = useState("");

  // Edit form
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [editNumber, setEditNumber] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editVacant, setEditVacant] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminTables()
      .then((data) => setTables(data.tables))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await addTable(parseInt(addNumber), parseInt(addCapacity));
      setAddNumber("");
      setAddCapacity("");
      setShowAdd(false);
      setMsg("Table added.");
      load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to add table");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTable) return;
    setMsg("");
    try {
      await updateTable(editTable._id, parseInt(editNumber), parseInt(editCapacity), editVacant);
      setEditTable(null);
      setMsg("Table updated.");
      load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to update table");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this table?")) return;
    setMsg("");
    try {
      await deleteTable(id);
      setMsg("Table deleted.");
      load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to delete table");
    }
  };

  const openEdit = (t: Table) => {
    setEditTable(t);
    setEditNumber(String(t.tableNumber));
    setEditCapacity(String(t.capacity));
    setEditVacant(t.isVacant);
  };

  const vacant = tables.filter((t) => t.isVacant).length;
  const occupied = tables.length - vacant;

  return (
    <AdminLayout>
      {msg && <div className={styles.successMsg}>{msg}</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* Live status */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🪑</div>
          <div className={styles.statValue}>{tables.length}</div>
          <div className={styles.statLabel}>Total Tables</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🟢</div>
          <div className={styles.statValue}>{vacant}</div>
          <div className={styles.statLabel}>Vacant</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>🔴</div>
          <div className={styles.statValue}>{occupied}</div>
          <div className={styles.statLabel}>Occupied</div>
        </div>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>All Tables</h2>
          <button
            className={`${styles.btnSmall} ${styles.btnPrimary}`}
            onClick={() => setShowAdd(true)}
          >
            + Add Table
          </button>
        </div>

        {loading ? (
          <div className={styles.empty}><p>Loading tables…</p></div>
        ) : tables.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🪑</div>
            <p>No tables configured yet.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Table #</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tables.map((t) => (
                <tr key={t._id}>
                  <td>{t.tableNumber}</td>
                  <td>{t.capacity} seats</td>
                  <td>
                    <span className={`${styles.badge} ${t.isVacant ? styles.badgeGreen : styles.badgeRed}`}>
                      {t.isVacant ? "Vacant" : "Occupied"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.btnRow}>
                      <button
                        className={`${styles.btnSmall} ${styles.btnEdit}`}
                        onClick={() => openEdit(t)}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.btnSmall} ${styles.btnDelete}`}
                        onClick={() => handleDelete(t._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className={styles.modalOverlay} onClick={() => setShowAdd(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Add Table</h3>
            <form onSubmit={handleAdd}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Table Number</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={addNumber}
                    onChange={(e) => setAddNumber(e.target.value)}
                    placeholder="e.g. 1"
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Capacity</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={addCapacity}
                    onChange={(e) => setAddCapacity(e.target.value)}
                    placeholder="e.g. 4"
                    required
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btnSmall} ${styles.btnPrimary}`}>
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTable && (
        <div className={styles.modalOverlay} onClick={() => setEditTable(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Edit Table #{editTable.tableNumber}</h3>
            <form onSubmit={handleEdit}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Table Number</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Capacity</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.formField} style={{ marginTop: "1rem" }}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formInput}
                  value={editVacant ? "true" : "false"}
                  onChange={(e) => setEditVacant(e.target.value === "true")}
                >
                  <option value="true">Vacant</option>
                  <option value="false">Occupied</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setEditTable(null)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btnSmall} ${styles.btnPrimary}`}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
