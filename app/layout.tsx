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
  title: "Resumetion — AI Resume Builder",
  description: "Create a professional, ATS-optimized resume in minutes with AI. Just fill in your info and get a polished PDF.",
  metadataBase: new URL("https://resumetion.com"),
  openGraph: {
    title: "Resumetion — AI Resume Builder",
    description: "Create a professional, ATS-optimized resume in minutes with AI.",
    url: "https://resumetion.com",
    siteName: "Resumetion",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Resumetion — AI Resume Builder",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumetion — AI Resume Builder",
    description: "Create a professional, ATS-optimized resume in minutes with AI.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
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
