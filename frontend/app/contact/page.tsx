"use client";

import { useState, type FormEvent } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import styles from "./page.module.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              Get in <span className={styles.gold}>Touch</span>
            </h1>
            <p className={styles.subtitle}>
              We&apos;d love to hear from you. Reach out for reservations,
              inquiries, or feedback.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className={styles.grid}>
              {/* Contact Form */}
              <div className={styles.formCard}>
                {submitted ? (
                  <div className={styles.successMsg}>
                    <span className={styles.successIcon}>✓</span>
                    <h3>Message Sent!</h3>
                    <p>
                      Thank you for reaching out. We&apos;ll get back to you
                      shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="btn btn-outline"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Your name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@email.com"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="What is this about?"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Message</label>
                      <textarea
                        className={`form-input ${styles.textarea}`}
                        placeholder="Tell us more…"
                        rows={5}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                      Send Message
                    </button>
                  </form>
                )}
              </div>

              {/* Contact Info */}
              <div className={styles.infoSection}>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>📍</span>
                  <h3>Location</h3>
                  <p>42 Gourmet Avenue</p>
                  <p>Bandra West, Mumbai 400050</p>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>📞</span>
                  <h3>Phone</h3>
                  <p>+91 98765 43210</p>
                  <p>Mon–Sun, 10 AM – 11 PM</p>
                </div>
                <div className={styles.infoCard}>
                  <span className={styles.infoIcon}>✉️</span>
                  <h3>Email</h3>
                  <p>hello@lamaison.com</p>
                  <p>reservations@lamaison.com</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
