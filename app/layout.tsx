import type { Metadata } from "next";

import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Faculty Bridge",

  description:
    "Modern faculty-student communication and scheduling platform.",

  keywords: [
    "Faculty Bridge",
    "Student Portal",
    "Faculty Management",
    "University Platform",
    "Realtime Chat",
    "Scheduling System",
  ],

  authors: [
    {
      name: "Aditya Patil",
    },
  ],

  creator: "Aditya Patil",

  openGraph: {
    title: "Faculty Bridge",

    description:
      "Realtime faculty-student communication and scheduling platform.",

    siteName: "Faculty Bridge",

    type: "website",
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}