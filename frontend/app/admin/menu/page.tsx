"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  fetchAdminMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/utils/adminApi";
import styles from "../admin.module.css";

interface MenuItem {
  _id: string;
  name: string;
  price: number;
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // Add form
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");

  // Edit form
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminMenu()
      .then((data) => setItems(data.menuItems))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await addMenuItem(addName, parseFloat(addPrice));
      setAddName("");
      setAddPrice("");
      setShowAdd(false);
      setMsg("Menu item added successfully.");
      load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to add item");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setMsg("");
    try {
      await updateMenuItem(editItem._id, editName, parseFloat(editPrice));
      setEditItem(null);
      setMsg("Menu item updated.");
      load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    setMsg("");
    try {
      await deleteMenuItem(id);
      setMsg("Menu item deleted.");
      load();
    } catch (err: unknown) {
      setMsg(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setEditName(item.name);
    setEditPrice(String(item.price));
  };

  return (
    <AdminLayout>
      {msg && <div className={styles.successMsg}>{msg}</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Menu Items ({items.length})</h2>
          <button
            className={`${styles.btnSmall} ${styles.btnPrimary}`}
            onClick={() => setShowAdd(true)}
          >
            + Add Item
          </button>
        </div>

        {loading ? (
          <div className={styles.empty}><p>Loading menu…</p></div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🍽️</div>
            <p>No menu items yet.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item._id}>
                  <td>{i + 1}</td>
                  <td>{item.name}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <div className={styles.btnRow}>
                      <button
                        className={`${styles.btnSmall} ${styles.btnEdit}`}
                        onClick={() => openEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.btnSmall} ${styles.btnDelete}`}
                        onClick={() => handleDelete(item._id)}
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
            <h3 className={styles.modalTitle}>Add Menu Item</h3>
            <form onSubmit={handleAdd}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Name</label>
                  <input
                    className={styles.formInput}
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="Item name"
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Price (₹)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    step="0.01"
                    value={addPrice}
                    onChange={(e) => setAddPrice(e.target.value)}
                    placeholder="Price"
                    required
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowAdd(false)}>
                  Cancel
                </button>
                <button type="submit" className={`${styles.btnSmall} ${styles.btnPrimary}`}>
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className={styles.modalOverlay} onClick={() => setEditItem(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Edit Menu Item</h3>
            <form onSubmit={handleEdit}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Name</label>
                  <input
                    className={styles.formInput}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Price (₹)</label>
                  <input
                    className={styles.formInput}
                    type="number"
                    step="0.01"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setEditItem(null)}>
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
