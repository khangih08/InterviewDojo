import type { Metadata } from "next";
import { Roboto, Geist_Mono } from "next/font/google";
import { GlobalToaster } from "@/components/ui/global-toaster";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  subsets: ["latin", "vietnamese"],
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
    <html lang="en" className={`${roboto.variable} ${geistMono.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <GlobalToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
