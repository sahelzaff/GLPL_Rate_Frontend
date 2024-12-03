'use client';
import localFont from "next/font/local";
import "./globals.css";
import ConnectionCheck from './components/ConnectionCheck';
import { SessionProvider } from "next-auth/react";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>GLPL Rate</title>
        <meta name="description" content="GLPL Rate Application" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-gray-50 min-h-screen`}>
        <SessionProvider refetchInterval={0}>
          {children}
          <ConnectionCheck />
        </SessionProvider>
      </body>
    </html>
  );
}
