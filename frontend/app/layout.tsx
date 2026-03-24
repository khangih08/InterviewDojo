import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context"; // ✅ thêm dòng này

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InterviewDojo – Master Your Interview",
  description:
    "Practice real interview questions with AI feedback, track your progress, and land your dream job with InterviewDojo.",
  keywords: [
    "interview practice",
    "AI mock interview",
    "coding interview",
    "job preparation",
  ],
  openGraph: {
    title: "InterviewDojo – Master Your Interview",
    description: "AI-powered mock interviews to help you land your dream job.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-sky-100 text-foreground`}
      >
        <AuthProvider> {children}</AuthProvider>{" "}
      </body>
    </html>
  );
}
