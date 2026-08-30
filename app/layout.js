import { Assistant } from "next/font/google";
import "./globals.css";
import { WishlistProvider } from "@/lib/WishlistContext";

// Assistant is a clean, modern grotesque sans close to the family Myntra's
// real site uses — this project can't ship their actual licensed webfont,
// so this is the closest freely-licensed stand-in.
const assistant = Assistant({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-assistant",
});

export const metadata = {
  title: "myntra — Wishlist Reset",
  description:
    "Unaffiliated concept prototype for a product-management case study: turning wishlist clutter into confident purchase decisions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${assistant.variable} font-sans overscroll-none antialiased`}>
        <WishlistProvider>{children}</WishlistProvider>
      </body>
    </html>
  );
}
