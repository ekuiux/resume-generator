import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "ResumeBuilder — AI Resume Generator",
  description: "Create a professional resume in minutes with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body style={{ fontFamily: "var(--font-plus-jakarta), system-ui, sans-serif", margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
