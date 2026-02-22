import styles from "./OrderCard.module.css";

interface OrderItem { item: string; quantity: number; price: number; totalPrice: number; }
interface Order { _id: string; tableNumber: number; customer: { name: string }; items: OrderItem[]; grandTotal: number; orderedAt: string; status: string; }

interface OrderCardProps {
  order: Order;
  index: number;
}

export default function OrderCard({ order, index }: OrderCardProps) {
  const date = new Date(order.orderedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const statusClass =
    order.status === "PLACED"
      ? styles.placed
      : order.status === "ACCEPTED"
      ? styles.accepted
      : order.status === "COMPLETED"
      ? styles.completed
      : styles.cancelled;

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className={styles.header}>
        <div>
          <span className={styles.orderId}>
            #{order._id.slice(-6).toUpperCase()}
          </span>
          <span className={styles.date}>{date}</span>
        </div>
        <span className={`${styles.badge} ${statusClass}`}>
          {order.status}
        </span>
      </div>

      <ul className={styles.items}>
        {order.items.map((item, i) => (
          <li key={i} className={styles.item}>
            <span>
              {item.item} <span className={styles.qty}>× {item.quantity}</span>
            </span>
            <span className={styles.price}>₹{item.totalPrice}</span>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <span className={styles.totalLabel}>Grand Total</span>
        <span className={styles.totalAmount}>₹{order.grandTotal}</span>
      </div>
    </div>
  );
}
