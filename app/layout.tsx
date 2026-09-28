import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inkora — Mini Stationery Store",
  description:
    "Thoughtfully crafted stationery for your everyday ideas. Gel pens, notebooks, school and office essentials with Cash on Delivery nationwide.",
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
      <body className="min-h-full flex flex-col bg-[#faf9f5] text-stone-900 font-sans">
        <StoreProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
