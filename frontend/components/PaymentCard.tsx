import styles from "./PaymentCard.module.css";

interface OrderItem { item: string; quantity: number; price: number; totalPrice: number; }
interface Order { _id: string; tableNumber: number; customer: { name: string }; items: OrderItem[]; grandTotal: number; orderedAt: string; status: string; }

interface PaymentCardProps {
  order: Order;
  index: number;
}

export default function PaymentCard({ order, index }: PaymentCardProps) {
  const date = new Date(order.orderedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className={styles.header}>
        <div className={styles.txId}>
          <span className={styles.label}>Transaction</span>
          <span className={styles.value}>
            #{order._id.slice(-8).toUpperCase()}
          </span>
        </div>
        <span className={styles.badge}>PAID</span>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.label}>Amount</span>
          <span className={styles.amount}>₹{order.grandTotal}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Method</span>
          <span className={styles.methodVal}>Dine-in Payment</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Date</span>
          <span className={styles.dateVal}>{date}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.label}>Items</span>
          <span className={styles.itemsCount}>
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className={styles.itemsList}>
        {order.items.map((item, i) => (
          <span key={i} className={styles.itemChip}>
            {item.item} ×{item.quantity}
          </span>
        ))}
      </div>
    </div>
  );
}
