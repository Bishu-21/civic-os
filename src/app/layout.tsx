import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://civicos.systems/"),
  title: "Delhi CM Grievance Dashboard | Govt. of NCT Delhi",
  description: "Official grievance dashboard for Delhi civic reporting, department routing, and resolution tracking.",
  keywords: ["Delhi CM Grievance Dashboard", "Govt. of NCT Delhi", "grievance redressal", "wards", "departments"],
  authors: [{ name: "CivicOS" }],
  openGraph: {
    title: "Delhi CM Grievance Dashboard | Govt. of NCT Delhi",
    description: "Official AI-assisted civic grievance workflow for Delhi.",
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
    description: "Official AI-assisted civic grievance workflow for Delhi.",
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
      <body className="antialiased overflow-x-hidden font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
