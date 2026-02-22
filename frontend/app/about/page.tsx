"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <section className={styles.hero}>
          <div className={styles.heroOverlay} />
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Our <span className={styles.gold}>Story</span>
            </h1>
            <p className={styles.heroSubtitle}>
              A passion for culinary excellence, born from tradition and refined
              by innovation.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className={styles.grid}>
              <div className={styles.content}>
                <h2 className={styles.sectionTitle}>
                  About <span className={styles.gold}>Kitu&apos;s Kitchen</span>
                </h2>
                <p>
                  Founded with a deep love for culinary arts, Kitu&apos;s Kitchen is more
                  than a restaurant — it&apos;s a destination. Our chefs bring
                  decades of experience from kitchens around the world, blending
                  classic technique with modern creativity.
                </p>
                <p>
                  Every dish on our menu tells a story, crafted with locally
                  sourced, premium ingredients. From the first bite to the last,
                  we strive to create moments that linger long after the meal is
                  over.
                </p>
                <p>
                  Our dining room is designed to envelop you in warmth and
                  sophistication — a place where great food meets unforgettable
                  ambiance.
                </p>
              </div>

              <div className={styles.stats}>
                {STATS.map((stat, i) => (
                  <div key={i} className={styles.statCard}>
                    <span className={styles.statValue}>{stat.value}</span>
                    <span className={styles.statLabel}>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className={`section ${styles.valuesSection}`}>
          <div className="container">
            <h2 className="section-title">
              Our <span>Values</span>
            </h2>
            <div className={styles.valuesGrid}>
              {VALUES.map((val, i) => (
                <div key={i} className={styles.valueCard}>
                  <span className={styles.valueIcon}>{val.icon}</span>
                  <h3>{val.title}</h3>
                  <p>{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}

const STATS = [
  { value: "10+", label: "Years of Excellence" },
  { value: "50K+", label: "Happy Diners" },
  { value: "120+", label: "Signature Dishes" },
  { value: "15", label: "Award-Winning Chefs" },
];

const VALUES = [
  {
    icon: "🌿",
    title: "Fresh Ingredients",
    desc: "We source only the finest, locally grown produce and premium imports for every dish.",
  },
  {
    icon: "👨‍🍳",
    title: "Master Craftsmanship",
    desc: "Our chefs bring years of global experience, crafting each plate as a work of art.",
  },
  {
    icon: "💎",
    title: "Uncompromising Quality",
    desc: "From kitchen to table, every detail is held to the highest standard of excellence.",
  },
];
