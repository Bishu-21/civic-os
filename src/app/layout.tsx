import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://civicos.systems/"),
  title: "Delhi CM Grievance Dashboard | Govt. of NCT Delhi",
  description: "Official grievance dashboard for the Delhi CM Office and Govt. of NCT Delhi. Report, track, and resolve municipal grievances in real-time.",
  keywords: ["Delhi CM Grievance Dashboard", "Govt. of NCT Delhi", "Delhi districts", "wards", "departments", "grievance redressal"],
  authors: [{ name: "Govt. of NCT Delhi" }],
  openGraph: {
    title: "Delhi CM Grievance Dashboard | Govt. of NCT Delhi",
    description: "Official AI-Powered grievance dashboard for the Govt. of NCT Delhi.",
    url: "https://civicos.systems/",
    siteName: "Delhi CM Grievance Dashboard",
    locale: "en_IN",
    type: "website",
    images: [{
      url: "/favicon.ico",
      width: 32,
      height: 32,
      alt: "Delhi CM Grievance Dashboard Logo"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delhi CM Grievance Dashboard",
    description: "Official AI-Powered grievance dashboard for the Govt. of NCT Delhi.",
    images: ["/favicon.ico"],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  alternates: {
    canonical: "https://civic-os-five.vercel.app",
  },
};

import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased overflow-x-hidden">
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
