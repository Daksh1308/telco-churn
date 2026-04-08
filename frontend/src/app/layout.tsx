import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Customer Churn Predictor",
  description: "Predict customer churn using machine learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}