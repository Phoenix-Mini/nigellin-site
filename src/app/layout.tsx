import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Nigel Lin — Life Archive",
  description:
    "A quiet, long-term archive of Nigel Lin's life — moments, reflections, and media that age well.",
  icons: {
    icon: [
      { url: "/favicon-NL.svg", type: "image/svg+xml" },
      { url: "/favicon-NL.png", type: "image/png", sizes: "230x230" },
    ],
    shortcut: "/favicon-NL.png",
    apple: "/favicon-NL.png",
  },
  openGraph: {
    title: "Nigel Lin — Life Archive",
    description:
      "A quiet interface for Nigel's life. Timeline, reflections, and media in one long-form archive.",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
