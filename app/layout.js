import localFont from "next/font/local";
import "./globals.css";
import { WishlistProvider } from "@/lib/WishlistContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "myntra — Wishlist Reset",
  description:
    "Unaffiliated concept prototype for a product-management case study: turning wishlist clutter into confident purchase decisions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} overscroll-none antialiased`}
      >
        <WishlistProvider>{children}</WishlistProvider>
      </body>
    </html>
  );
}
