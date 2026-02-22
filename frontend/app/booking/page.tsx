"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import styles from "./page.module.css";

export default function BookingPage() {
  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              Reserve a <span className={styles.gold}>Table</span>
            </h1>
            <p className={styles.subtitle}>
              Select an available table and begin your dining experience.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className={styles.formWrap}>
              <div className={styles.formCard}>
                <BookingForm />
              </div>

              <div className={styles.info}>
                <div className={styles.infoCard}>
                  <h3>How It Works</h3>
                  <ol className={styles.steps}>
                    <li>
                      <span className={styles.stepNum}>1</span>
                      <div>
                        <strong>Book a Table</strong>
                        <p>Choose an available table and enter your name.</p>
                      </div>
                    </li>
                    <li>
                      <span className={styles.stepNum}>2</span>
                      <div>
                        <strong>Browse & Order</strong>
                        <p>
                          Explore our menu and add items to your cart.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span className={styles.stepNum}>3</span>
                      <div>
                        <strong>Pay & Enjoy</strong>
                        <p>
                          Complete payment from your table. Easy and seamless!
                        </p>
                      </div>
                    </li>
                  </ol>
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
