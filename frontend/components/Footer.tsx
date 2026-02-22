import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.icon}>✦</span>
          <h3 className={styles.name}>Kitu&apos;s Kitchen</h3>
          <p className={styles.tagline}>
            An exquisite fine dining experience at Kitu&apos;s Kitchen, where every dish tells a story.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Navigate</h4>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/menu">Menu</Link></li>
            <li><Link href="/booking">Book a Table</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Hours */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Hours</h4>
          <ul className={styles.hours}>
            <li>
              <span>Mon – Fri</span>                                                                  
              <span>11 AM – 11 PM</span>
            </li>
            <li>
              <span>Saturday</span>
              <span>10 AM – 12 AM</span>
            </li>
            <li>
              <span>Sunday</span>
              <span>10 AM – 10 PM</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contact</h4>
          <ul>
            <li>42 Gourmet Avenue, Mumbai</li>
            <li>+91 98765 43210</li>
            <li>hello@lamaison.com</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p>© {new Date().getFullYear()} Kitu&apos;s Kitchen. All rights reserved.</p>
          <div className={styles.staffLinks}>
            <Link href="/admin/login" className={styles.staffLink}>Admin Login</Link>
            <span className={styles.staffDot}>·</span>
            <Link href="/manager/login" className={styles.staffLink}>Manager Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
