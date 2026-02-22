"use client";

import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import styles from "../page.module.css";

export default function QRBookingPage() {
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const table = Number(tableNumber);

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              Reserve <span className={styles.gold}>Table {table}</span>
            </h1>
            <p className={styles.subtitle}>
              Enter your name to begin your dining experience at Table {table}.
            </p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className={styles.formWrap}>
              <div className={styles.formCard}>
                <BookingForm prefilledTable={table} locked />
              </div>

              <div className={styles.info}>
                <div className={styles.infoCard}>
                  <h3>QR Table Booking</h3>
                  <ol className={styles.steps}>
                    <li>
                      <span className={styles.stepNum}>1</span>
                      <div>
                        <strong>Enter Your Name</strong>
                        <p>Your table is already selected via QR code.</p>
                      </div>
                    </li>
                    <li>
                      <span className={styles.stepNum}>2</span>
                      <div>
                        <strong>Browse & Order</strong>
                        <p>Explore our menu and add items to your cart.</p>
                      </div>
                    </li>
                    <li>
                      <span className={styles.stepNum}>3</span>
                      <div>
                        <strong>Pay & Enjoy</strong>
                        <p>Complete payment from your table. Easy and seamless!</p>
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
