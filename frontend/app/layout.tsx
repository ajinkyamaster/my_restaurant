import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kitu's Kitchen — Fine Dining Restaurant",
  description:
    "Experience exquisite fine dining with a curated menu, elegant ambiance, and impeccable service at Kitu's Kitchen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
