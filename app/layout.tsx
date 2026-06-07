import type { Metadata } from "next";
import { Onest } from "next/font/google";
import { PHProvider } from "./components/PHProvider";
import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className={onest.variable}>
      <body style={{ fontFamily: "var(--font-onest), system-ui, sans-serif", margin: 0 }}>
        <PHProvider>{children}</PHProvider>
      </body>
    </html>
  );
}
