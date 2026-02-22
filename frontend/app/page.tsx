"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* ── Hero Section ──────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroIcon}>✦</span>
          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.gold}>Kitu&apos;s Kitchen</span>
          </h1>
          <p className={styles.heroSubtitle}>
            An exquisite fine dining experience where every dish is crafted with
            passion, precision, and the finest ingredients.
          </p>
          <div className={styles.heroActions}>
            <Link href="/menu" className={`btn btn-primary ${styles.heroBtn}`}>
              Explore Menu
            </Link>
            <Link
              href="/booking"
              className={`btn btn-outline ${styles.heroBtn}`}
            >
              Reserve a Table
            </Link>
          </div>
        </div>
        <div className={styles.scrollHint}>
          <span>Scroll</span>
          <div className={styles.scrollLine} />
        </div>
      </section>

      {/* ── Features Section ──────────────────────────── */}
      <section className={`section ${styles.features}`}>
        <div className="container">
          <ScrollReveal>
            <h2 className="section-title">
              Why Choose <span>Kitu&apos;s Kitchen</span>?
            </h2>
          </ScrollReveal>
          <div className={styles.featureGrid}>
            {FEATURES.map((feat, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={styles.featureCard}>
                  <span className={styles.featureEmoji}>{feat.icon}</span>
                  <h3>{feat.title}</h3>
                  <p>{feat.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────── */}
      <section className={styles.cta}>
        <div className="container">
          <ScrollReveal>
            <div className={styles.ctaInner}>
            <h2>
              Ready for an <span className={styles.gold}>Unforgettable</span>{" "}
              Evening?
            </h2>
            <p>
              Book your table now and indulge in a culinary journey that will
              delight your senses.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/booking" className="btn btn-primary">
                Book a Table
              </Link>
              <Link href="/contact" className="btn btn-outline">
                Contact Us
              </Link>
            </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </>
  );
}

const FEATURES = [
  {
    icon: "🍽️",
    title: "Curated Menu",
    desc: "A seasonal menu crafted by award-winning chefs with locally sourced, premium ingredients.",
  },
  {
    icon: "🌙",
    title: "Elegant Ambiance",
    desc: "Immerse yourself in a sophisticated atmosphere designed for intimate dinners and celebrations.",
  },
  {
    icon: "⚡",
    title: "Seamless Ordering",
    desc: "Browse, order, and pay from your table with our modern digital ordering system.",
  },
  {
    icon: "🏆",
    title: "Premium Service",
    desc: "Attentive staff ensuring every detail of your dining experience is absolutely perfect.",
  },
];