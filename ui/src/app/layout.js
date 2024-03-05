// import { Inter } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner"

// const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "go.sazak.io - Ozan Sazak",
  description: "Go Package Index of Ozan Sazak",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <body className={inter.className}>{children}</body> */}
      <body className="dark">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
