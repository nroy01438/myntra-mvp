import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import DisclaimerBadge from "@/components/DisclaimerBadge";
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
  title: "Vastraloop — Wishlist Reset",
  description:
    "A product-management case study MVP: turning wishlist clutter into confident purchase decisions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-neutral-50 antialiased`}
      >
        <WishlistProvider>
          <Nav />
          <main className="pb-20">{children}</main>
          <DisclaimerBadge />
        </WishlistProvider>
      </body>
    </html>
  );
}
