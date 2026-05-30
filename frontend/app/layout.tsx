import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalToaster } from "@/components/ui/global-toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context"; // [THÊM 1]: Import AuthProvider
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* [THÊM 2]: Bọc AuthProvider quanh children */}
          <AuthProvider>
            {children}
            <GlobalToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}