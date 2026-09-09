import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Anton } from "next/font/google";
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/sonner"
import { Analytics } from "@vercel/analytics/next"
import { PwaServiceWorker } from "@/components/pwa-service-worker"
import { PwaInstallPrompt } from "@/components/pwa-install-prompt"

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

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

export const metadata: Metadata = {
  title: "Godware",
  description: "Church Accounting & Management System",
  applicationName: "Godware",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Godware",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/maskable-icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#1e1b4b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
          <Toaster />
          <ThemeToggle />
          <PwaServiceWorker />
          <PwaInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
