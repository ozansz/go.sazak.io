import "./globals.css";

import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
  title: "go.sazak.io",
  description: "Go Package Index of Ozan Sazak",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="dark h-screen">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
