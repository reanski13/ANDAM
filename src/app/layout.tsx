import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MotionProvider from "@/components/motion/MotionProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cotcot Flood Alert - Liloan, Cebu",
  description:
    "Real-time flood monitoring and early warning system for Barangay Cotcot, Liloan, Cebu, Philippines",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#142a50",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
              try {
                var t = localStorage.getItem("cotcot-theme");
                if (t !== "light" && t !== "dark") {
                  t = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
                }
                document.documentElement.setAttribute("data-theme", t);
              } catch (e) {
                document.documentElement.setAttribute("data-theme", "dark");
              }
            })();`,
          }}
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full text-on-sky">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}