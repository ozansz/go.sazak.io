import "./globals.css";

import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/sonner"
import { sharedLongDesc, sharedTitle, twitterHandle } from "@/lib/constants";

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


export const metadata = {
  metadataBase: new URL('https://go.sazak.io'),
  title: sharedTitle,
  description: sharedLongDesc,
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: sharedTitle,
    description: sharedLongDesc,
    alt: sharedTitle,
    type: 'website',
    url: '/',
    siteName: sharedTitle,
    locale: 'en_IE',
    // image: ...
  },
  alternates: {
    canonical: '/'
  },
  twitter: {
    card: 'summary_large_image',
    site: twitterHandle,
    creator: twitterHandle,
  },
  other: {
    pinterest: 'nopin'
  }
}